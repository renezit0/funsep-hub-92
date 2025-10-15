import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReportData {
  matricula: number
  dataInicio: string
  dataFim: string
  reportType: 'a_pagar' | 'pagos' | 'ir'
}

interface Beneficiary {
  matricula: number
  nome: string
  cpf: number
}

interface Procedure {
  matricula: number
  dep: string
  dtatend: string
  datavenc: string
  valorpago: number
  valorpart: number
  evento: string
  nome_beneficio?: string
  nome_dependente?: string | null
}

interface Benefit {
  codigo: string
  nome: string
}

interface Dependent {
  nrodep: number
  nome: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { matricula, dataInicio, dataFim, reportType }: ReportData = await req.json()

    console.log('Iniciando geração de relatório:', { matricula, dataInicio, dataFim, reportType })

    // 1. Buscar beneficiário
    const { data: beneficiary, error: beneficiaryError } = await supabase
      .from('cadben')
      .select('matricula, nome, cpf')
      .eq('matricula', matricula)
      .single()

    if (beneficiaryError || !beneficiary) {
      console.error('Beneficiário não encontrado:', beneficiaryError)
      return new Response(
        JSON.stringify({ error: 'Beneficiário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar tipo de relatório e executar lógica apropriada
    if (reportType === 'ir') {
      const anoExercicio = parseInt(dataInicio.split('-')[0]) // Ano selecionado na interface
      const anoCalendario = anoExercicio + 1 // Ano calendário (sempre ano+1)
      return await generateIRReport(supabase, beneficiary, matricula, anoExercicio, anoCalendario)
    }

    // 2. Buscar procedimentos (para relatórios a_pagar e pagos)
    const { data: procedimentos, error: procedimentosError } = await supabase
      .from('mgumrrapg')
      .select('matricula, dep, dtatend, datavenc, valorpago, valorpart, evento')
      .eq('matricula', matricula)
      .gte('datavenc', dataInicio)
      .lte('datavenc', dataFim)
      .order('dtatend')

    if (procedimentosError) {
      console.error('Erro ao buscar procedimentos:', procedimentosError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar procedimentos' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!procedimentos || procedimentos.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum procedimento encontrado para o período informado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Buscar benefícios para os eventos encontrados
    const eventosUnicos = [...new Set(procedimentos.map(p => p.evento))]
    console.log('Eventos únicos encontrados:', eventosUnicos.length)

    const { data: beneficios, error: beneficiosError } = await supabase
      .from('tabbeneficios')
      .select('codigo, nome')
      .in('codigo', eventosUnicos)

    if (beneficiosError) {
      console.error('Erro ao buscar benefícios:', beneficiosError)
    }

    console.log('Benefícios encontrados:', beneficios?.length || 0, 'de', eventosUnicos.length, 'eventos')

    // 4. Buscar dependentes
    const { data: dependentesInfo, error: dependentesError } = await supabase
      .from('caddep')
      .select('matricula, nrodep, nome')
      .eq('matricula', matricula)

    if (dependentesError) {
      console.error('Erro ao buscar dependentes:', dependentesError)
    }

    // 5. Criar mapeamentos otimizados
    const beneficiosMap = new Map<string, string>()
    if (beneficios) {
      beneficios.forEach((b: Benefit) => {
        if (b.codigo && b.nome) {
          beneficiosMap.set(b.codigo, b.nome)
        }
      })
    }

    const dependentesMap = new Map<string, string>()
    if (dependentesInfo) {
      dependentesInfo.forEach((d: Dependent) => {
        if (d.nrodep && d.nome) {
          dependentesMap.set(d.nrodep.toString(), d.nome)
        }
      })
    }

    console.log('Mapeamento criado - Benefícios:', beneficiosMap.size, 'Dependentes:', dependentesMap.size)

    // 6. Processar procedimentos com nomes
    const procedimentosComNomes = procedimentos.map((proc: Procedure) => {
      const nomeBeneficio = beneficiosMap.get(proc.evento) || `Código não catalogado: ${proc.evento}`
      const nomeDependente = proc.dep && proc.dep !== '0' && proc.dep !== '' 
        ? (dependentesMap.get(proc.dep) || `Dependente ${proc.dep}`)
        : null

      return {
        ...proc,
        nome_beneficio: nomeBeneficio,
        nome_dependente: nomeDependente
      }
    })

    // 7. Separar titular e dependentes
    const titular = procedimentosComNomes.filter(proc => 
      !proc.dep || proc.dep === '' || proc.dep === '0'
    )
    
    const dependentes = procedimentosComNomes.filter(proc => 
      proc.dep && proc.dep !== '' && proc.dep !== '0'
    )

    console.log('Processados:', titular.length, 'titular,', dependentes.length, 'dependentes')

    // 8. Calcular totais
    const totaisTitular = titular.reduce((acc, proc) => ({
      procedimento: acc.procedimento + (Number(proc.valorpago) || 0),
      participacao: acc.participacao + (Number(proc.valorpart) || 0),
      quantidade: acc.quantidade + 1
    }), { procedimento: 0, participacao: 0, quantidade: 0 })

    const totaisDependentes = dependentes.reduce((acc, proc) => ({
      procedimento: acc.procedimento + (Number(proc.valorpago) || 0),
      participacao: acc.participacao + (Number(proc.valorpart) || 0),
      quantidade: acc.quantidade + 1
    }), { procedimento: 0, participacao: 0, quantidade: 0 })

    const totaisGeral = {
      procedimento: totaisTitular.procedimento + totaisDependentes.procedimento,
      participacao: totaisTitular.participacao + totaisDependentes.participacao,
      quantidade: totaisTitular.quantidade + totaisDependentes.quantidade
    }

    // 9. Gerar HTML do relatório
    const htmlContent = generateReportHTML(
      beneficiary, 
      titular, 
      dependentes, 
      { titular: totaisTitular, dependentes: totaisDependentes, geral: totaisGeral },
      dataInicio, 
      dataFim
    )

    console.log('Relatório gerado com sucesso')

    return new Response(JSON.stringify({ 
      html: htmlContent,
      filename: `${beneficiary.nome.replace(/[^A-Z0-9]/gi, '_')}_${matricula}_${new Date().getFullYear()}.pdf`
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      }
    })

  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno ao gerar relatório', details: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function generateIRReport(supabase: any, beneficiary: any, matricula: number, anoExercicio: number, anoCalendario: number) {
  try {
    console.log('Gerando relatório IR para:', { matricula, anoExercicio, anoCalendario })
    
    // Estratégia: testar uma tabela por vez e usar apenas UMA fonte de dados
    let totalTitularMensalidade = 0
    let totalTitularGuia = 0
    let fonteDados = ''
    
    // PRIMEIRA TENTATIVA: Buscar na tabela IRPFD (mais comum)
    try {
      const { data: irTitularIRPFD, error: irTitularIRPFDError } = await supabase
        .from('irpfd')
      .select('*')
      .eq('matricula', matricula)
      .eq('ano', anoExercicio) // Buscar pelo ano do exercício
      
      console.log('IRPFD Titular - Dados encontrados:', irTitularIRPFD)
      
      if (!irTitularIRPFDError && irTitularIRPFD && irTitularIRPFD.length > 0) {
        // Usar dados do IRPFD
        totalTitularMensalidade = irTitularIRPFD.reduce((acc: number, item: any) => {
          const vlmen = Number(item.vlmen) || Number(item.ment) || 0
          console.log('IRPFD - Mensalidade item:', vlmen)
          return acc + vlmen
        }, 0)
        
        totalTitularGuia = irTitularIRPFD.reduce((acc: number, item: any) => {
          const vlguia = Number(item.vlguia) || 0
          console.log('IRPFD - Guia item:', vlguia)
          return acc + vlguia
        }, 0)
        
        fonteDados = 'IRPFD'
        console.log('Usando dados do IRPFD - Mensalidade:', totalTitularMensalidade, 'Guia:', totalTitularGuia)
      }
    } catch (err) {
      console.error('Erro na consulta IRPFD titular:', err)
    }
    
    // SEGUNDA TENTATIVA: Se não encontrou no IRPFD, tentar IRPFT
    if (totalTitularMensalidade === 0 && totalTitularGuia === 0) {
      try {
        const { data: irTitular, error: irTitularError } = await supabase
          .from('irpft')
          .select('*')
          .eq('matricula', matricula)
          .eq('ano', anoExercicio) // Buscar pelo ano do exercício
        
        console.log('IRPFT Titular - Dados encontrados:', irTitular)
        
        if (!irTitularError && irTitular && irTitular.length > 0) {
          totalTitularMensalidade = irTitular.reduce((acc: number, item: any) => {
            const vlmen = Number(item.vlmen) || Number(item.ment) || 0
            console.log('IRPFT - Mensalidade item:', vlmen)
            return acc + vlmen
          }, 0)
          
          totalTitularGuia = irTitular.reduce((acc: number, item: any) => {
            const vlguia = Number(item.vlguia) || Number(item.guiat) || 0
            console.log('IRPFT - Guia item:', vlguia)
            return acc + vlguia
          }, 0)
          
          fonteDados = 'IRPFT'
          console.log('Usando dados do IRPFT - Mensalidade:', totalTitularMensalidade, 'Guia:', totalTitularGuia)
        }
      } catch (err) {
        console.error('Erro na consulta IRPFT:', err)
      }
    }
    
    // 3. Buscar dependentes
    let dependentes: any[] = []
    try {
      const { data: dependentesData, error: dependentesError } = await supabase
        .from('caddep')
        .select('nrodep, nome, cpf')
        .eq('matricula', matricula)
      
      if (dependentesError) {
        console.error('Erro ao buscar dependentes:', dependentesError)
      } else {
        dependentes = dependentesData || []
        console.log('Dependentes encontrados:', dependentes.length)
      }
    } catch (err) {
      console.error('Erro na consulta dependentes:', err)
    }
    
    // 4. Buscar dados de IR dos dependentes (IRPFD) - apenas nrodep > 0
    let irDependentes: any[] = []
    try {
      const { data: irDependentesData, error: irDependentesError } = await supabase
        .from('irpfd')
        .select('*')
        .eq('matricula', matricula)
        .eq('ano', anoExercicio) // Buscar pelo ano do exercício
      
      if (irDependentesError) {
        console.error('Erro ao buscar IR dependentes:', irDependentesError)
      } else {
        irDependentes = irDependentesData || []
        console.log('IR Dependentes encontrado:', irDependentes)
      }
    } catch (err) {
      console.error('Erro na consulta IRPFD dependentes:', err)
    }
    
    console.log(`=== RESUMO IR ===`)
    console.log(`Fonte de dados: ${fonteDados}`)
    console.log(`Titular - Mensalidade: ${totalTitularMensalidade}, Guia: ${totalTitularGuia}`)
    console.log(`Dependentes: ${irDependentes.length} registros`)
    
    // Gerar HTML do relatório IR
    const htmlContent = generateIRReportHTML(
      beneficiary,
      { mensalidade: totalTitularMensalidade, guia: totalTitularGuia },
      dependentes,
      irDependentes,
      anoExercicio,
      anoCalendario
    )
    
    return new Response(JSON.stringify({ 
      html: htmlContent,
      filename: `IR_${beneficiary.nome.replace(/[^A-Z0-9]/gi, '_')}_${matricula}_${anoExercicio}.pdf`
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      }
    })
    
  } catch (error) {
    console.error('Erro geral ao gerar relatório IR:', error)
    return new Response(
      JSON.stringify({ error: 'Erro ao gerar relatório IR', details: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

function generateIRReportHTML(
  beneficiary: any,
  totalTitular: { mensalidade: number, guia: number },
  dependentes: any[],
  irDependentes: any[],
  anoExercicio: number,
  anoCalendario: number
): string {
  
  console.log('Gerando HTML IR com dados:', { 
    beneficiary: beneficiary?.nome, 
    totalTitular, 
    dependentesCount: dependentes.length, 
    irDependentesCount: irDependentes.length 
  })
  
  // Criar mapeamento de dependentes
  const dependentesMap = new Map<string, any>()
  dependentes.forEach(dep => {
    dependentesMap.set(dep.nrodep.toString(), dep)
  })
  
  // Processar dados de IR dos dependentes
  const dependentesComIR = irDependentes.map(ir => {
    const dependente = dependentesMap.get(ir.nrodep?.toString() || '')
    const vlmen = Number(ir.vlmen) || Number(ir.ment) || Number(ir.vlmensalidade) || 0
    const vlguia = Number(ir.vlguia) || Number(ir.vlparticipacao) || 0
    
    return {
      ...ir,
      nome: dependente?.nome || `Dependente ${ir.nrodep}`,
      cpf: dependente?.cpf || '',
      vlmen: vlmen,
      vlguia: vlguia
    }
  }).filter(dep => dep.vlmen > 0 || dep.vlguia > 0) // Filtrar apenas dependentes com valores
  
  // Calcular totais
  const totalTitularCompleto = totalTitular.mensalidade + totalTitular.guia
  const totalDependentes = dependentesComIR.reduce((acc, dep) => {
    return acc + dep.vlmen + dep.vlguia
  }, 0)
  const totalGeral = totalTitularCompleto + totalDependentes
  
  console.log('Totais IR calculados:', { totalTitularCompleto, totalDependentes, totalGeral })

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Declaração IR - ${beneficiary.matricula}</title>
    <style>
        @page {
            margin: 0.8cm 1.2cm;
            size: A4 portrait;
        }
        
        body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 0; 
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: #fff;
        }
        
        .header { 
            text-align: center; 
            margin-bottom: 20px;
            border-bottom: 2px solid #2c5aa0;
            padding: 15px 4px 10px 4px;
        }
        
        .logo { 
            margin-bottom: 10px;
            text-align: center;
        }
        
        .logo img {
            height: 80px;
            max-width: 300px;
            display: block;
            margin: 0 auto;
        }
        
        .title { 
            font-size: 18px;
            font-weight: bold; 
            margin: 10px 0;
            color: #2c5aa0;
        }
        
        .declaracao-text {
            text-align: justify;
            margin: 20px 0;
            line-height: 1.6;
            font-size: 12px;
        }
        
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0;
            font-size: 12px;
        }
        
        th, td { 
            border: 1px solid #000;
            padding: 8px;
            text-align: center; 
        }
        
        th { 
            background-color: #f0f0f0;
            font-weight: bold; 
            font-size: 11px;
        }
        
        .right { text-align: right !important; }
        .center { text-align: center !important; }
        .left { text-align: left !important; }
        
        .total-row { 
            background: #e8e8e8;
            font-weight: bold;
            font-size: 12px;
        }
        
        .footer { 
            margin-top: 40px;
            text-align: center; 
            font-size: 12px;
        }
        
        .signature {
            margin-top: 80px;
            text-align: center;
        }
        
        .signature-line {
            border-top: 1px solid #000;
            width: 300px;
            margin: 0 auto;
            padding-top: 5px;
        }
        
        .currency {
            font-family: 'Courier New', monospace;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">
            <img src="/lovable-uploads/e548bfa7-21ab-4b35-866a-211b0aaa1135.png" alt="Logo FUNSEP">
        </div>
        <div class="title">DECLARAÇÃO</div>
    </div>

    <div class="declaracao-text">
        DECLARAMOS, para os devidos fins que <strong>${beneficiary.nome.toUpperCase()}</strong>, 
        portador do CPF nº <strong>${formatCPF(beneficiary.cpf)}</strong>, 
        associado deste Funsep/Unimed, plano de saúde número de matrícula ${beneficiary.matricula}, no 
        exercício de ${anoExercicio}/Ano-Calendário ${anoCalendario}, pagou ao FUNSEP - CNPJ 20.601.112/0001-91, o valor de R$ 
        <strong class="currency">${formatCurrency(totalGeral)}</strong> (${formatCurrencyText(totalGeral)}), 
        assim discriminados:
    </div>

    <table>
        <thead>
            <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Mensalidade</th>
                <th>Participação em guia</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="left">${beneficiary.nome.toUpperCase()}</td>
                <td>${formatCPF(beneficiary.cpf)}</td>
                <td class="currency right">${formatCurrency(totalTitular.mensalidade)}</td>
                <td class="currency right">${formatCurrency(totalTitular.guia)}</td>
                <td class="currency right">${formatCurrency(totalTitularCompleto)}</td>
            </tr>
            ${dependentesComIR.map(dep => `
                <tr>
                    <td class="left">${dep.nome.toUpperCase()}</td>
                    <td>${formatCPF(dep.cpf)}</td>
                    <td class="currency right">${formatCurrency(dep.vlmen)}</td>
                    <td class="currency right">${formatCurrency(dep.vlguia)}</td>
                    <td class="currency right">${formatCurrency(dep.vlmen + dep.vlguia)}</td>
                </tr>
            `).join('')}
            <tr class="total-row">
                <td colspan="4" class="right"><strong>TOTAL --></strong></td>
                <td class="currency right"><strong>${formatCurrency(totalGeral)}</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        <p>Curitiba, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        
        <div class="signature">
            <div class="signature-line">
                <strong>Arinete Léa Spercoski Ribas</strong><br>
                Gerente Executiva
            </div>
        </div>
    </div>
</body>
</html>
  `
}

function generateReportHTML(
  beneficiary: Beneficiary, 
  titular: Procedure[], 
  dependentes: Procedure[],
  totais: any,
  dataInicio: string, 
  dataFim: string
): string {
  // Agrupar procedimentos por dependente
  const procedimentosPorDependente: { [key: string]: Procedure[] } = {};
  dependentes.forEach(proc => {
    const nomeDependente = proc.nome_dependente || `Dependente ${proc.dep}`;
    if (!procedimentosPorDependente[nomeDependente]) {
      procedimentosPorDependente[nomeDependente] = [];
    }
    procedimentosPorDependente[nomeDependente].push(proc);
  });

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório FUNSEP - ${beneficiary.matricula}</title>
    <style>
        @page {
            margin: 0.8cm 1.2cm;
            size: A4 portrait;
        }
        
        body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 0; 
            font-size: 8px;
            line-height: 1.2;
            color: #333;
            background: #fff;
        }
        
        .header { 
            text-align: center; 
            margin-bottom: 12px;
            border-bottom: 2px solid #2c5aa0;
            padding: 8px 4px 6px 4px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 3px;
            position: relative;
            z-index: 1;
        }
        
        .logo { 
            margin-bottom: 2px;
            text-align: center;
        }
        
        .logo img {
            height: 65px;
            max-width: 250px;
            display: block;
            margin: 0 auto;
        }
        
        .header .cnpj {
            font-size: 6px;
            color: #777;
            margin-top: 1px;
        }
        
        .title { 
            font-size: 12px;
            font-weight: bold; 
            margin: 4px 0 2px 0;
            color: #2c5aa0;
        }
        
        .subtitle {
            font-size: 9px;
            color: #666;
            margin-bottom: 2px;
        }
        
        .info-box {
            border: 1px solid #ddd;
            padding: 10px;
            margin: 8px 0 15px 0;
            border-radius: 3px;
            background-color: #f9f9f9;
            font-size: 10px;
            overflow: hidden;
            clear: both;
            position: relative;
            z-index: 2;
        }
        
        .info-row {
            display: block;
            margin-bottom: 4px;
            line-height: 1.4;
            clear: left;
        }
        
        .info-row:after {
            content: "";
            display: table;
            clear: both;
        }
        
        .info-label {
            font-weight: bold;
            color: #555;
        }

        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 6px 0;
            font-size: 10px;
            table-layout: fixed;
            clear: both;
        }
        
        th, td { 
            border: 1px solid #ccc;
            padding: 5px 8px;
            text-align: center; 
            vertical-align: top;
            word-wrap: break-word;
            overflow: hidden;
            line-height: 1.2;
        }
        
        th { 
            background-color: #e0eaf7;
            font-weight: bold; 
            text-align: center;
            color: #2c5aa0;
            text-transform: uppercase;
            font-size: 9px;
            line-height: 1.2;
            vertical-align: top;
            padding: 6px 8px;
        }
        
        .section-title { 
            font-size: 9px;
            font-weight: bold; 
            margin: 12px 0 6px 0;
            color: #2c5aa0;
            border-bottom: 1px solid #2c5aa0;
            padding: 3px 0 5px 0;
            page-break-after: avoid;
            break-after: avoid;
            clear: both;
            position: relative;
            z-index: 3;
        }
        
        .right { text-align: right !important; }
        .center { text-align: center !important; }
        .left { text-align: left !important; }
        
        .total-row { 
            background: #f0f5fa;
            font-weight: bold;
            color: #1565c0;
            font-size: 8px;
        }
        
        .total-geral { 
            background: #2c5aa0;
            color: white;
            font-weight: bold; 
            font-size: 9px;
        }
        
        .footer { 
            margin-top: 8px;
            text-align: center; 
            font-size: 8px;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
            padding-top: 4px;
            line-height: 1.2;
        }
        
        .currency {
            font-family: 'Courier New', monospace;
            font-weight: bold;
        }
        
        .no-data {
            text-align: center;
            color: #6c757d;
            font-style: italic;
            padding: 4px;
            background: #f8f9fa;
            border-radius: 3px;
            margin-bottom: 4px;
            font-size: 6px;
        }
        
        tr:nth-child(even) {
            background-color: #fcfdff;
        }
        
        tr { 
            page-break-inside: avoid;
            break-inside: avoid;
        }
        
        .col-titular-descricao { width: 38%; min-width: 200px; text-align: left; }
        .col-titular-data { width: 14%; text-align: center; }
        .col-titular-valor { width: 22%; text-align: right; }
        
        .total-geral-valor { 
            font-size: 11px !important; 
            font-weight: bold;
        }

        .highlight {
            font-size: 8px;
            line-height: 1.3;
            margin: 4px 0;
            padding: 4px 6px;
            background: #f8f9fa;
            border-left: 2px solid #2c5aa0;
        }

        .resumo-compacto {
            margin-top: 4px;
        }
        
        .resumo-compacto table {
            margin: 2px 0;
        }
        
        .resumo-compacto th,
        .resumo-compacto td {
            padding: 3px 4px;
            font-size: 8px;
        }

        @media print { 
            body { 
                margin: 0; 
                padding: 0;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            
            .header { 
                page-break-after: avoid;
                break-after: avoid;
            }
            
            .section-title { 
                page-break-after: avoid;
                break-after: avoid;
            }
            
            table { 
                page-break-inside: auto;
                break-inside: auto;
            }
            
            tr { 
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            * {
                font-size: inherit !important;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">
            <img src="/lovable-uploads/e548bfa7-21ab-4b35-866a-211b0aaa1135.png" alt="Logo FUNSEP">
            <div class="cnpj">CNPJ: 20.601.112/0001-91</div>
        </div>
        <div class="title">RELATÓRIO DE PROCEDIMENTOS A PAGAR</div>
        <div class="subtitle">Período: ${formatDate(dataInicio)} a ${formatDate(dataFim)}</div>
    </div>

    <div class="info-box">
        <div class="info-row">
            <span class="info-label">Matrícula:</span>
            <span>${beneficiary.matricula}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Nome:</span>
            <span>${beneficiary.nome.toUpperCase()}</span>
        </div>
        <div class="info-row">
            <span class="info-label">CPF:</span>
            <span>${formatCPF(beneficiary.cpf)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Gerado em:</span>
            <span>${formatDate(new Date().toISOString())}</span>
        </div>
    </div>

    ${titular.length > 0 ? `
    <div class="section-title">${beneficiary.nome.toUpperCase()} (TITULAR)</div>
    <table>
        <thead>
            <tr>
                <th class="col-titular-descricao">Descrição</th>
                <th class="col-titular-data">Dt. Atend.</th>
                <th class="col-titular-data">Dt. Venc.</th>
                <th class="col-titular-valor">Vlr. Proced.</th>
                <th class="col-titular-valor">Vlr. Partic.</th>
            </tr>
        </thead>
        <tbody>
            ${titular.map(proc => `
            <tr>
                <td class="left">${proc.nome_beneficio}</td>
                <td class="center">${formatDate(proc.dtatend)}</td>
                <td class="center">${formatDate(proc.datavenc)}</td>
                <td class="right currency">R$ ${formatCurrency(proc.valorpago)}</td>
                <td class="right currency">R$ ${formatCurrency(proc.valorpart)}</td>
            </tr>
            `).join('')}
            <tr class="total-row">
                <td colspan="3" class="center"><strong>TOTAL TITULAR (${totais.titular.quantidade})</strong></td>
                <td class="right currency"><strong>R$ ${formatCurrency(totais.titular.procedimento)}</strong></td>
                <td class="right currency"><strong>R$ ${formatCurrency(totais.titular.participacao)}</strong></td>
            </tr>
        </tbody>
    </table>
    ` : `
    <div class="section-title">${beneficiary.nome.toUpperCase()} (TITULAR)</div>
    <div class="no-data">Nenhum procedimento encontrado para o titular.</div>
    `}

    ${Object.keys(procedimentosPorDependente).length > 0 ? 
      Object.entries(procedimentosPorDependente).map(([nomeDependente, procs]) => {
        const totalProcedimento = procs.reduce((acc, proc) => acc + (Number(proc.valorpago) || 0), 0);
        const totalParticipacao = procs.reduce((acc, proc) => acc + (Number(proc.valorpart) || 0), 0);
        
        return `
        <div class="section-title">${nomeDependente.toUpperCase()} (DEPENDENTE)</div>
        <table>
            <thead>
                <tr>
                    <th class="col-titular-descricao">Descrição</th>
                    <th class="col-titular-data">Dt. Atend.</th>
                    <th class="col-titular-data">Dt. Venc.</th>
                    <th class="col-titular-valor">Vlr. Proced.</th>
                    <th class="col-titular-valor">Vlr. Partic.</th>
                </tr>
            </thead>
            <tbody>
                ${procs.map(proc => `
                <tr>
                    <td class="left">${proc.nome_beneficio}</td>
                    <td class="center">${formatDate(proc.dtatend)}</td>
                    <td class="center">${formatDate(proc.datavenc)}</td>
                    <td class="right currency">R$ ${formatCurrency(proc.valorpago)}</td>
                    <td class="right currency">R$ ${formatCurrency(proc.valorpart)}</td>
                </tr>
                `).join('')}
                <tr class="total-row">
                    <td colspan="3" class="center"><strong>TOTAL ${nomeDependente.toUpperCase()} (${procs.length})</strong></td>
                    <td class="right currency"><strong>R$ ${formatCurrency(totalProcedimento)}</strong></td>
                    <td class="right currency"><strong>R$ ${formatCurrency(totalParticipacao)}</strong></td>
                </tr>
            </tbody>
        </table>
        `;
      }).join('') 
    : `
    <div class="section-title">Dependentes</div>
    <div class="no-data">Nenhum procedimento encontrado para dependentes.</div>
    `}

    <div class="section-title resumo-compacto">Resumo</div>
    <table class="resumo-compacto">
        <thead>
            <tr>
                <th>Categoria</th>
                <th>Qtd.</th>
                <th>Vlr. Total</th>
                <th>Participação</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Titular</strong></td>
                <td class="center">${totais.titular.quantidade}</td>
                <td class="right currency">R$ ${formatCurrency(totais.titular.procedimento)}</td>
                <td class="right currency">R$ ${formatCurrency(totais.titular.participacao)}</td>
            </tr>
            <tr>
                <td><strong>Dependentes</strong></td>
                <td class="center">${totais.dependentes.quantidade}</td>
                <td class="right currency">R$ ${formatCurrency(totais.dependentes.procedimento)}</td>
                <td class="right currency">R$ ${formatCurrency(totais.dependentes.participacao)}</td>
            </tr>
            <tr class="total-geral">
                <td><strong>TOTAL</strong></td>
                <td class="center"><strong>${totais.geral.quantidade}</strong></td>
                <td class="right currency total-geral-valor"><strong>R$ ${formatCurrency(totais.geral.procedimento)}</strong></td>
                <td class="right currency total-geral-valor"><strong>R$ ${formatCurrency(totais.geral.participacao)}</strong></td>
            </tr>
        </tbody>
    </table>

    ${totais.geral.quantidade > 0 ? `
    <div class="highlight">
        <strong>Observações:</strong>
        Período: ${formatDate(dataInicio)} a ${formatDate(dataFim)}. 
        Valores conforme registros do sistema.
    </div>
    ` : ''}

    <div class="footer">
        <p><strong>FUNDO DE SAÚDE DOS SERVIDORES DO PODER JUDICIÁRIO</strong></p>
        <p>Gerado em ${formatDate(new Date().toISOString())} - Documento válido sem assinatura</p>
    </div>
</body>
</html>
  `
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

function formatCurrency(value: number): string {
  return (value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatCPF(cpf: any): string {
  const cpfStr = cpf.toString().padStart(11, '0')
  return cpfStr.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function formatCurrencyText(value: number): string {
  // Função simplificada para converter número em texto
  const integerPart = Math.floor(value)
  const decimalPart = Math.round((value - integerPart) * 100)
  
  if (integerPart === 0) {
    return `zero reais e ${decimalPart.toString().padStart(2, '0')} centavos`
  }
  
  const thousands = Math.floor(integerPart / 1000)
  const hundreds = integerPart % 1000
  
  let text = ''
  if (thousands > 0) {
    text += `${thousands} mil`
    if (hundreds > 0) {
      text += `, ${hundreds}`
    }
  } else {
    text = hundreds.toString()
  }
  
  text += ` reais e ${decimalPart.toString().padStart(2, '0')} centavos`
  return text
}
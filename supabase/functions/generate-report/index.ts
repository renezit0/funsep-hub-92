import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReportData {
  matricula: number
  dataInicio: string
  dataFim: string
  reportType: 'a_pagar' | 'pagos'
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
  nome_dependente?: string
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

    // 2. Buscar procedimentos
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
      JSON.stringify({ error: 'Erro interno ao gerar relatório', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

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
                <td>${proc.nome_beneficio}</td>
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
                    <td>${proc.nome_beneficio}</td>
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
                <td class="right currency"><strong>R$ ${formatCurrency(totais.geral.procedimento)}</strong></td>
                <td class="right currency"><strong>R$ ${formatCurrency(totais.geral.participacao)}</strong></td>
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

function formatCPF(cpf: number): string {
  const cpfStr = cpf.toString().padStart(11, '0')
  return cpfStr.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const forms = [
  { id: "exclusao-associado", title: "Exclusão de Associado" },
  { id: "exclusao-dependente", title: "Exclusão de Dependente" },
  { id: "inclusao-associado", title: "Inclusão de Associado" },
  { id: "inclusao-dependente", title: "Inclusão de Dependente" },
  { id: "inclusao-recem-nascido", title: "Inclusão de Recém-Nascido" },
  { id: "inscricao-pensionista", title: "Inscrição de Pensionista" },
  { id: "requerimento-21-anos", title: "Requerimento - 21 Anos" },
  { id: "requerimento-auxilio", title: "Requerimento - Auxílio Saúde" },
  { id: "requerimento-diversos", title: "Requerimento - Diversos" },
  { id: "requerimento-reembolso", title: "Requerimento - Reembolso" },
  { id: "termo-ciencia", title: "Termo de Ciência" },
  { id: "termo-compromisso", title: "Termo de Compromisso" },
  { id: "termo-opcoes", title: "Termo de Opção" },
];

export function ClassicFormsView() {
  const [activeForm, setActiveForm] = useState("exclusao-associado");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
      {/* Sidebar */}
      <aside className="bg-card rounded-lg border p-6 h-fit lg:sticky lg:top-6 print:hidden">
        <h2 className="text-lg font-semibold mb-4 text-primary border-b-2 border-primary/20 pb-3">
          Selecione o Requerimento
        </h2>
        <div className="space-y-1">
          {forms.map((form) => (
            <button
              key={form.id}
              onClick={() => setActiveForm(form.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-md transition-all text-sm flex items-center gap-2",
                "hover:bg-accent/50 hover:translate-x-1",
                activeForm === form.id && "bg-primary text-primary-foreground font-semibold"
              )}
            >
              <span className="font-bold">▸</span>
              {form.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Content */}
      <main className="bg-card rounded-lg border p-8 min-h-[500px]" id="printable-content">
        {activeForm === "exclusao-associado" && <ExclusaoAssociadoClassic onPrint={handlePrint} />}
        {activeForm === "exclusao-dependente" && <ExclusaoDependenteClassic onPrint={handlePrint} />}
        {activeForm === "inclusao-associado" && <InclusaoAssociadoClassic onPrint={handlePrint} />}
        {activeForm === "inclusao-dependente" && <InclusaoDependenteClassic onPrint={handlePrint} />}
        {activeForm === "inclusao-recem-nascido" && <InclusaoRecemNascidoClassic onPrint={handlePrint} />}
        {activeForm === "inscricao-pensionista" && <InscricaoPensionistaClassic onPrint={handlePrint} />}
        {activeForm === "requerimento-21-anos" && <Requerimento21AnosClassic onPrint={handlePrint} />}
        {activeForm === "requerimento-auxilio" && <RequerimentoAuxilioClassic onPrint={handlePrint} />}
        {activeForm === "requerimento-diversos" && <RequerimentoDiversosClassic onPrint={handlePrint} />}
        {activeForm === "requerimento-reembolso" && <RequerimentoReembolsoClassic onPrint={handlePrint} />}
        {activeForm === "termo-ciencia" && <TermoCienciaClassic onPrint={handlePrint} />}
        {activeForm === "termo-compromisso" && <TermoCompromissoClassic onPrint={handlePrint} />}
        {activeForm === "termo-opcoes" && <TermoOpcaoClassic onPrint={handlePrint} />}
      </main>
    </div>
  );
}

// Form Components
function ExclusaoAssociadoClassic({ onPrint }: { onPrint: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-center text-primary font-semibold text-lg">
        AOS ILUSTRÍSSIMOS DIRETORES DO FUNDO DE SAÚDE DOS SERVIDORES DO PODER JUDICIÁRIO DO PARANÁ
      </h2>

      <div className="text-right">
        <Input className="inline-block w-96" placeholder="Nome completo" />
      </div>

      <div className="space-y-2">
        <Label>E-mail:</Label>
        <Input type="email" placeholder="seu@email.com" />
      </div>

      <div className="space-y-2">
        <Label>Telefone:</Label>
        <Input type="tel" placeholder="(00) 00000-0000" />
      </div>

      <p className="leading-relaxed">
        Abaixo assinado(a), servidor(a) vinculado(a) ao Poder Judiciário do Estado do Paraná, venho, respeitosamente,{" "}
        <strong>REQUERER</strong> a minha <strong>EXCLUSÃO</strong> do quadro de associados do Funsep, juntando para tanto, carteira de sócio.
      </p>

      <p className="leading-relaxed">
        Autorizo o Funsep a cobrar através boleto bancário ou outro meio, os valores correspondentes a eventuais despesas de minha responsabilidade que não tenham sido apresentadas até a data do desligamento. Declaro, finalmente, ter ciência de que, em caso de retorno, terei que cumprir os prazos de carência estabelecidos pela Instrução Normativa nº 1/99.
      </p>

      <div className="my-8">
        <p><strong>Nestes Termos,</strong></p>
        <p><strong>Pede deferimento.</strong></p>
      </div>

      <div className="space-y-2">
        <Label>Data:</Label>
        <div className="flex gap-2 items-center">
          Em <Input className="inline-block w-16" placeholder="DD" maxLength={2} />
          de <Input className="inline-block w-32" placeholder="mês" />
          de <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>
      </div>

      <div className="my-10 text-center">
        <div className="border-t border-foreground w-72 mx-auto mb-2"></div>
        <p>Assinatura</p>
      </div>

      <div className="bg-warning/10 border-l-4 border-warning p-4 rounded">
        <strong className="text-warning-foreground">
          ATENÇÃO: TODOS OS CAMPOS DEVEM SER PREENCHIDOS, PARA ANDAMENTO DA SOLICITAÇÃO.
        </strong>
      </div>

      <div className="text-center mt-8 border-t pt-6 print:hidden">
        <Button onClick={onPrint} size="lg" className="px-8">
          Imprimir
        </Button>
      </div>
    </div>
  );
}

function ExclusaoDependenteClassic({ onPrint }: { onPrint: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-center text-primary font-semibold text-lg">
        AOS ILUSTRÍSSIMOS DIRETORES DO FUNDO DE SAÚDE DOS SERVIDORES DO PODER JUDICIÁRIO DO PARANÁ
      </h2>

      <div className="text-right">
        <Input className="inline-block w-96" placeholder="Nome completo" />
      </div>

      <div className="space-y-2">
        <Label>E-mail:</Label>
        <Input type="email" placeholder="seu@email.com" />
      </div>

      <div className="space-y-2">
        <Label>Telefone:</Label>
        <Input type="tel" placeholder="(00) 00000-0000" />
      </div>

      <p className="leading-relaxed">
        Abaixo assinado(a), servidor(a) vinculado(a) ao Poder Judiciário do Estado do Paraná, venho, respeitosamente, requerer a{" "}
        <strong>EXCLUSÃO</strong> de <Input className="inline-block w-96" placeholder="nome do dependente" />, meu(minha) dependente, do quadro de associados do Funsep, juntando, para tanto, carteira de beneficiário(a).
      </p>

      <p className="leading-relaxed">
        Autorizo o Funsep a cobrar através boleto bancário ou outro meio, os valores correspondentes a eventuais despesas de minha responsabilidade que não tenham sido apresentadas até a data do desligamento. Declaro, finalmente, ter ciência de que, em caso de retorno, o(a) dependente terá que cumprir os prazos de carência estabelecidos pela Instrução Normativa nº 1/99.
      </p>

      <div className="my-8">
        <p><strong>Nestes Termos,</strong></p>
        <p><strong>Pede deferimento.</strong></p>
      </div>

      <div className="space-y-2">
        <Label>Data:</Label>
        <div className="flex gap-2 items-center">
          Em <Input className="inline-block w-16" placeholder="DD" maxLength={2} />
          de <Input className="inline-block w-32" placeholder="mês" />
          de <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>
      </div>

      <div className="my-10 text-center">
        <div className="border-t border-foreground w-72 mx-auto mb-2"></div>
        <p>Assinatura</p>
      </div>

      <div className="bg-warning/10 border-l-4 border-warning p-4 rounded">
        <strong className="text-warning-foreground">
          ATENÇÃO: TODOS OS CAMPOS DEVEM SER PREENCHIDOS, PARA ANDAMENTO DA SOLICITAÇÃO.
        </strong>
      </div>

      <div className="text-center mt-8 border-t pt-6 print:hidden">
        <Button onClick={onPrint} size="lg" className="px-8">
          Imprimir
        </Button>
      </div>
    </div>
  );
}

function InclusaoAssociadoClassic({ onPrint }: { onPrint: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-center text-primary font-semibold text-lg">
        ILUSTRÍSSIMOS DIRETORES DO FUNDO DE SAÚDE DOS SERVIDORES DO PODER JUDICIÁRIO DO PARANÁ
      </h2>

      <div className="text-right">
        <Input className="inline-block w-96" placeholder="Nome completo" />
      </div>

      <div className="space-y-2">
        <Label>E-mail:</Label>
        <Input type="email" placeholder="seu@email.com" />
      </div>

      <p className="leading-relaxed text-justify">
        Abaixo assinado(a), servidor(a) vinculado(a) ao Poder Judiciário do Estado do Paraná, vem, respeitosamente,{" "}
        <strong>REQUERER</strong> a sua <strong>INSCRIÇÃO</strong> no quadro de associados do Funsep, manifestando, desde já, concordância com o desconto, em folha de pagamento, dos valores das mensalidades correspondentes do Plano II (Especial).
      </p>

      <div className="space-y-2">
        <Label>Tipo de acomodação para internamentos:</Label>
        <div className="flex gap-6">
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox />
            Apartamento
          </Label>
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox />
            Enfermaria
          </Label>
        </div>
      </div>

      <div className="my-8">
        <p><strong>N. Termos,</strong></p>
        <p><strong>P. deferimento.</strong></p>
      </div>

      <div className="space-y-2">
        <Label>Data:</Label>
        <div className="flex gap-2 items-center">
          Em <Input className="inline-block w-16" placeholder="DD" maxLength={2} />
          de <Input className="inline-block w-32" placeholder="mês" />
          de <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>
      </div>

      <div className="my-10 text-center">
        <div className="border-t border-foreground w-72 mx-auto mb-2"></div>
        <p>Assinatura</p>
      </div>

      <div className="bg-warning/10 border-l-4 border-warning p-4 rounded">
        <strong className="text-warning-foreground">
          ATENÇÃO: TODOS OS CAMPOS DEVEM SER PREENCHIDOS, PARA ANDAMENTO DA SOLICITAÇÃO.
        </strong>
      </div>

      <p className="font-semibold text-primary mt-8 pt-4 border-t">INFORMAÇÕES CADASTRAIS:</p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Nome completo:</Label>
          <Input />
        </div>

        <div className="space-y-2">
          <Label>Endereço:</Label>
          <Input />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Número:</Label>
            <Input />
          </div>
          <div className="space-y-2">
            <Label>Apto:</Label>
            <Input />
          </div>
          <div className="space-y-2">
            <Label>Bairro:</Label>
            <Input />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Telefone residencial:</Label>
            <Input />
          </div>
          <div className="space-y-2">
            <Label>Telefone comercial:</Label>
            <Input />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Cidade:</Label>
            <Input />
          </div>
          <div className="space-y-2">
            <Label>Estado:</Label>
            <Input />
          </div>
          <div className="space-y-2">
            <Label>CEP:</Label>
            <Input />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Data de Nascimento:</Label>
            <Input type="date" />
          </div>
          <div className="space-y-2">
            <Label>Estado Civil:</Label>
            <Input />
          </div>
          <div className="space-y-2">
            <Label>Sexo:</Label>
            <Input />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>CPF:</Label>
            <Input />
          </div>
          <div className="space-y-2">
            <Label>Identidade:</Label>
            <Input />
          </div>
        </div>
      </div>

      <div className="text-center mt-8 border-t pt-6 print:hidden">
        <Button onClick={onPrint} size="lg" className="px-8">
          Imprimir
        </Button>
      </div>
    </div>
  );
}

function InclusaoDependenteClassic({ onPrint }: { onPrint: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-center text-primary font-semibold text-lg">
        AOS ILUSTRÍSSIMOS DIRETORES DO FUNDO DE SAÚDE DOS SERVIDORES DO PODER JUDICIÁRIO DO PARANÁ
      </h2>

      <div className="text-right">
        <Input className="inline-block w-96" placeholder="Nome completo do titular" />
      </div>

      <div className="space-y-2">
        <Label>E-mail do titular:</Label>
        <Input type="email" placeholder="seu@email.com" />
      </div>

      <div className="space-y-2">
        <Label>Telefone:</Label>
        <Input type="tel" placeholder="(00) 00000-0000" />
      </div>

      <div className="space-y-2">
        <Label>Matrícula no Funsep:</Label>
        <Input className="w-52" />
      </div>

      <p className="leading-relaxed">
        Abaixo-assinado(a), matrículado(a) nesse Fundo, vem, respeitosamente, <strong>REQUERER</strong> a <strong>inclusão</strong> de{" "}
        <Input className="inline-block w-80" placeholder="nome do dependente" />, com CPF{" "}
        <Input className="inline-block w-40" placeholder="000.000.000-00" />, nome da mãe{" "}
        <Input className="inline-block w-72" placeholder="nome da mãe" />, como seu dependente, conforme comprova os documentos em anexo.
      </p>

      <p className="leading-relaxed">
        Declaro, outrossim estar ciente das disposições constantes do regulamento do FUNSEP, notadamente em relação aos prazos de carência.
      </p>

      <div className="space-y-2">
        <Label>Tipo de acomodação:</Label>
        <div className="flex gap-6">
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox />
            Apartamento
          </Label>
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox />
            Enfermaria
          </Label>
        </div>
      </div>

      <div className="my-8">
        <p><strong>Nestes Termos,</strong></p>
        <p><strong>Pede deferimento.</strong></p>
      </div>

      <div className="space-y-2">
        <Label>Data:</Label>
        <div className="flex gap-2 items-center">
          Em <Input className="inline-block w-16" placeholder="DD" maxLength={2} />
          de <Input className="inline-block w-32" placeholder="mês" />
          de <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>
      </div>

      <div className="my-10 text-center">
        <div className="border-t border-foreground w-72 mx-auto mb-2"></div>
        <p>Associado</p>
      </div>

      <div className="bg-warning/10 border-l-4 border-warning p-4 rounded">
        <strong className="text-warning-foreground">
          ATENÇÃO: TODOS OS CAMPOS DEVEM SER PREENCHIDOS, PARA ANDAMENTO DA SOLICITAÇÃO.
        </strong>
      </div>

      <div className="bg-accent/50 border-l-4 border-primary p-4 rounded space-y-2">
        <strong>Obs:</strong>
        <p>1. Não haverá em hipótese alguma devolução de valores pagos a título de mensalidade, nem de taxa de inscrição.</p>
        <p>2. Será cobrada na primeira mensalidade uma taxa de inscrição de R$ 30,00 (trinta reais) por pessoa.</p>
        <p>3. Para que seja efetuada a inscrição é necessário possuir margem consignável junto ao Departamento Econômico e Financeiro do TJ.</p>
      </div>

      <div className="text-center mt-8 border-t pt-6 print:hidden">
        <Button onClick={onPrint} size="lg" className="px-8">
          Imprimir
        </Button>
      </div>
    </div>
  );
}

function InclusaoRecemNascidoClassic({ onPrint }: { onPrint: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-center text-primary font-semibold text-lg">
        AO ILMO. SR. DIRETOR DO FUNDO DE SAÚDE DOS SERVIDORES DO PODER JUDICIÁRIO
      </h2>

      <div className="text-right">
        <Input className="inline-block w-96" placeholder="Nome completo do titular" />
      </div>

      <div className="space-y-2">
        <Label>E-mail:</Label>
        <Input type="email" placeholder="seu@email.com" />
      </div>

      <div className="space-y-2">
        <Label>Matrícula no Funsep:</Label>
        <Input className="w-52" />
      </div>

      <p className="leading-relaxed">
        Abaixo-assinado(a), matriculado(a) nesse Fundo de Saúde, vem, respeitosamente, requerer a inclusão de{" "}
        <Input className="inline-block w-80" placeholder="nome do recém-nascido" />, como seu(sua) dependente, conforme atestam os documentos em anexo.
      </p>

      <div className="space-y-2">
        <Label>Tipo de acomodação:</Label>
        <div className="flex gap-6">
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox />
            Apartamento
          </Label>
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox />
            Enfermaria
          </Label>
        </div>
      </div>

      <div className="bg-accent/50 border-l-4 border-primary p-4 rounded">
        <strong>Obs.:</strong> o(a) requerente declara ter ciência de que o prazo para a inscrição, no caso de que trata este pedido, é de 30 (trinta) dias contados da data do nascimento do(a) descendente, após o que vigorarão os prazos de carência previstos em contrato e no Regulamento do Funsep.
      </div>

      <div className="my-8">
        <p><strong>Nestes Termos,</strong></p>
        <p><strong>Pede deferimento.</strong></p>
      </div>

      <div className="space-y-2">
        <Label>Curitiba,</Label>
        <div className="flex gap-2 items-center">
          <Input className="inline-block w-16" placeholder="DD" maxLength={2} /> /
          <Input className="inline-block w-16" placeholder="MM" maxLength={2} /> /
          <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>
      </div>

      <div className="my-10 text-center">
        <div className="border-t border-foreground w-72 mx-auto mb-2"></div>
        <p>Associado</p>
      </div>

      <div className="bg-warning/10 border-l-4 border-warning p-4 rounded">
        <strong className="text-warning-foreground">
          ATENÇÃO: TODOS OS CAMPOS DEVEM SER PREENCHIDOS, PARA ANDAMENTO DA SOLICITAÇÃO.
        </strong>
      </div>

      <div className="bg-accent/50 border-l-4 border-primary p-4 rounded space-y-2">
        <strong>Documento necessário:</strong>
        <p>- Certidão de Nascimento (2ª via)</p>
        <p><strong>OBS:</strong> O documento deverá ser enviado através dos Correios.</p>
      </div>

      <div className="text-center mt-8 border-t pt-6 print:hidden">
        <Button onClick={onPrint} size="lg" className="px-8">
          Imprimir
        </Button>
      </div>
    </div>
  );
}

function InscricaoPensionistaClassic({ onPrint }: { onPrint: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-center text-primary font-semibold text-lg">
        AOS ILUSTRÍSSIMOS DIRETORES DO FUNDO DE SAÚDE DOS SERVIDORES DO PODER JUDICIÁRIO DO PARANÁ
      </h2>

      <div className="text-right">
        <Input className="inline-block w-96" placeholder="Nome completo" />
      </div>

      <div className="space-y-2">
        <Label>E-mail:</Label>
        <Input type="email" placeholder="seu@email.com" />
      </div>

      <p className="leading-relaxed">
        Abaixo assinado(a), vem, respeitosamente, <strong>REQUERER</strong> a sua <strong>inscrição</strong> como pensionista nesse Fundo de Saúde, tendo em vista o falecimento de{" "}
        <Input className="inline-block w-80" placeholder="nome do falecido" />, conforme cópia de certidão de óbito em anexo.
      </p>

      <p className="leading-relaxed">
        Declaro: <strong>a)</strong> que concorda em pagar através boleto bancário os valores correspondentes à mensalidade devida por força da inscrição, definidos em tabela variável por faixa etária e de acordo com o tipo de acomodação escolhido para internamentos - [ ] apartamento ou [ ] enfermaria; e <strong>b)</strong> que tem conhecimento dos prazos de carência estabelecidos na Instrução Normativa nº 1/99.
      </p>

      <div className="my-8">
        <p><strong>Nestes Termos,</strong></p>
        <p><strong>Pede deferimento.</strong></p>
      </div>

      <div className="space-y-2">
        <Label>Data:</Label>
        <div className="flex gap-2 items-center">
          Em <Input className="inline-block w-16" placeholder="DD" maxLength={2} />
          de <Input className="inline-block w-32" placeholder="mês" />
          de <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>
      </div>

      <div className="my-10 text-center">
        <div className="border-t border-foreground w-72 mx-auto mb-2"></div>
        <p>Assinatura</p>
      </div>

      <div className="bg-warning/10 border-l-4 border-warning p-4 rounded">
        <strong className="text-warning-foreground">
          ATENÇÃO: TODOS OS CAMPOS DEVEM SER PREENCHIDOS, PARA ANDAMENTO DA SOLICITAÇÃO.
        </strong>
      </div>

      <div className="bg-accent/50 border-l-4 border-primary p-4 rounded space-y-2">
        <strong>Obs:</strong>
        <p>1. Não haverá em hipótese alguma devolução de valores pagos a título de mensalidade, nem de taxa de inscrição.</p>
        <p>2. Será cobrada na primeira mensalidade uma taxa de inscrição de R$ 30,00 (trinta reais) por pessoa.</p>
      </div>

      <div className="text-center mt-8 border-t pt-6 print:hidden">
        <Button onClick={onPrint} size="lg" className="px-8">
          Imprimir
        </Button>
      </div>
    </div>
  );
}

function Requerimento21AnosClassic({ onPrint }: { onPrint: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-center text-primary font-semibold text-lg">
        À DIRETORIA DO FUNDO DE SAÚDE DOS SERVIDORES DO PODER JUDICIÁRIO
      </h2>

      <div className="space-y-2">
        <Label>Nome do Beneficiário:</Label>
        <Input />
      </div>

      <div className="space-y-2">
        <Label>E-mail:</Label>
        <Input type="email" placeholder="seu@email.com" />
      </div>

      <div className="space-y-2">
        <Label>Matrícula no Funsep:</Label>
        <Input className="w-52" />
      </div>

      <p className="leading-relaxed">
        Abaixo assinado(a), matriculado nesse Fundo, vem respeitosamente, REQUERER a Vs.Sªs, a PERMANÊNCIA do maior de 21 anos:{" "}
        <Input className="inline-block w-96" placeholder="nome do dependente" />, conforme comprova com os documentos em anexo.
      </p>

      <div className="my-8 text-center">
        <p><strong>Nestes Termos</strong></p>
        <p><strong>P. Deferimento</strong></p>
      </div>

      <p className="font-semibold text-primary pt-4 border-t">DECLARAÇÃO E TERMO DE COMPROMISSO</p>

      <p className="leading-relaxed">
        Declaro, para efeito de inscrição do beneficiário(a) no Fundo de Saúde (FUNSEP), meu dependente{" "}
        <Input className="inline-block w-72" placeholder="nome" />, nascido em{" "}
        <Input className="inline-block w-16" placeholder="DD" maxLength={2} /> /{" "}
        <Input className="inline-block w-16" placeholder="MM" maxLength={2} /> /{" "}
        <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />,
        é solteiro(a), não possui emprego fixo, com remuneração que lhe permita assumir suas despesas pessoais, e vive sob minha dependência econômica, conforme demonstram os documentos em anexo.
      </p>

      <p className="leading-relaxed">
        ASSUMO, neste ato, o compromisso formal de comunicar à Direção do Fundo toda e qualquer mudança na condição de dependência objeto deste termo, sujeitando-me desde logo, às consequências legais decorrentes de tal obrigação.
      </p>

      <div className="space-y-2">
        <Label>Curitiba,</Label>
        <div className="flex gap-2 items-center">
          <Input className="inline-block w-16" placeholder="DD" maxLength={2} /> /
          <Input className="inline-block w-16" placeholder="MM" maxLength={2} /> /
          <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>
      </div>

      <div className="my-10 text-center">
        <div className="border-t border-foreground w-72 mx-auto mb-2"></div>
        <p>Assinatura - RG nº</p>
      </div>

      <div className="bg-warning/10 border-l-4 border-warning p-4 rounded">
        <strong className="text-warning-foreground">
          ATENÇÃO: TODOS OS CAMPOS DEVEM SER PREENCHIDOS, PARA ANDAMENTO DA SOLICITAÇÃO.
        </strong>
      </div>

      <div className="bg-accent/50 border-l-4 border-primary p-4 rounded space-y-2">
        <strong>Documentos necessários:</strong>
        <p>· RG e CPF (cópia autenticada) do dependente;</p>
        <p>· Cópia da declaração do Imposto de Renda contendo os dependentes;</p>
        <p>· Declaração atualizada de matrícula no Ensino Superior regular.</p>
        <p><strong>OBS:</strong> Os documentos deverão ser enviados através dos Correios.</p>
      </div>

      <div className="text-center mt-8 border-t pt-6 print:hidden">
        <Button onClick={onPrint} size="lg" className="px-8">
          Imprimir
        </Button>
      </div>
    </div>
  );
}

function RequerimentoAuxilioClassic({ onPrint }: { onPrint: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-center text-primary font-semibold text-lg">
        À DIRETORIA DO FUNDO DE SAÚDE DOS SERVIDORES DO PODER JUDICIÁRIO
      </h2>

      <div className="space-y-2">
        <Label>Nome do Beneficiário:</Label>
        <Input />
      </div>

      <div className="space-y-2">
        <Label>E-mail:</Label>
        <Input type="email" placeholder="seu@email.com" />
      </div>

      <div className="space-y-2">
        <Label>Matrícula no Funsep:</Label>
        <Input className="w-52" />
      </div>

      <p className="leading-relaxed">
        Abaixo assinado(a), associado(a) deste FUNDO, vem respeitosamente, REQUERER DECLARAÇÃO para fins de comprovação do auxílio saúde, em meu nome e de meus dependentes.
      </p>

      <div className="my-8 text-center">
        <p><strong>Nestes Termos</strong></p>
        <p><strong>P. Deferimento</strong></p>
      </div>

      <div className="space-y-2">
        <Label>Curitiba,</Label>
        <div className="flex gap-2 items-center">
          <Input className="inline-block w-16" placeholder="DD" maxLength={2} /> de
          <Input className="inline-block w-32" placeholder="mês" /> de
          <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>
      </div>

      <div className="my-10 text-center">
        <div className="border-t border-foreground w-72 mx-auto mb-2"></div>
        <p>Assinatura</p>
      </div>

      <div className="bg-warning/10 border-l-4 border-warning p-4 rounded">
        <strong className="text-warning-foreground">
          ATENÇÃO: TODOS OS CAMPOS DEVEM SER PREENCHIDOS, PARA ANDAMENTO DA SOLICITAÇÃO.
        </strong>
      </div>

      <div className="bg-accent/50 border-l-4 border-primary p-4 rounded space-y-2">
        <p><strong>Obs:</strong> Anexar ao pedido de declaração:</p>
        <p>- Cópia de RG e CPF de todos os beneficiários incluídos no Plano</p>
      </div>

      <div className="space-y-2">
        <Label>Tel:</Label>
        <Input className="w-52" />
      </div>

      <div className="space-y-2">
        <Label>End:</Label>
        <Input />
      </div>

      <div className="text-center mt-8 border-t pt-6 print:hidden">
        <Button onClick={onPrint} size="lg" className="px-8">
          Imprimir
        </Button>
      </div>
    </div>
  );
}

function RequerimentoDiversosClassic({ onPrint }: { onPrint: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-center text-primary font-semibold text-lg">
        AOS ILUSTRÍSSIMOS DIRETORES DO FUNDO DE SAÚDE DOS SERVIDORES DO PODER JUDICIÁRIO DO PARANÁ
      </h2>

      <div className="text-right">
        <Input className="inline-block w-96" placeholder="Nome completo" />
      </div>

      <div className="space-y-2">
        <Label>E-mail:</Label>
        <Input type="email" placeholder="seu@email.com" />
      </div>

      <div className="space-y-2">
        <Label>Matrícula no Funsep:</Label>
        <Input className="w-52" />
      </div>

      <p className="leading-relaxed">
        Abaixo assinado, nesse Fundo de Saúde, vem respeitosamente requerer a Vs.Sªs:
      </p>

      <div className="space-y-2">
        <Label>Descreva o requerimento:</Label>
        <Textarea rows={7} placeholder="Descreva aqui o que você está solicitando..." />
      </div>

      <p className="leading-relaxed">
        Conforme comprova com os documentos em anexo.
      </p>

      <div className="my-8">
        <p><strong>Nestes Termos,</strong></p>
        <p><strong>Pede deferimento.</strong></p>
      </div>

      <div className="space-y-2">
        <Label>Curitiba,</Label>
        <div className="flex gap-2 items-center">
          <Input className="inline-block w-16" placeholder="DD" maxLength={2} /> /
          <Input className="inline-block w-16" placeholder="MM" maxLength={2} /> /
          <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>
      </div>

      <div className="my-10 text-center">
        <div className="border-t border-foreground w-72 mx-auto mb-2"></div>
        <p>Assinatura</p>
      </div>

      <div className="text-center mt-8 border-t pt-6 print:hidden">
        <Button onClick={onPrint} size="lg" className="px-8">
          Imprimir
        </Button>
      </div>
    </div>
  );
}

function RequerimentoReembolsoClassic({ onPrint }: { onPrint: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-center text-primary font-semibold text-lg">
        REQUERIMENTO PARA REEMBOLSO
      </h2>

      <p className="font-semibold text-primary pt-4 border-t">DADOS DO BENEFICIÁRIO TITULAR DO PLANO</p>

      <div className="space-y-2">
        <Label>Nome completo:</Label>
        <Input />
      </div>

      <div className="space-y-2">
        <Label>Nº Cartão Unimed:</Label>
        <Input className="w-52" />
      </div>

      <div className="space-y-2">
        <Label>E-mail contato:</Label>
        <Input type="email" />
      </div>

      <div className="space-y-2">
        <Label>Telefones para contato:</Label>
        <Input className="w-64" />
      </div>

      <p className="font-semibold text-primary pt-4 border-t">DADOS DO BENEFICIÁRIO QUE REALIZOU O EVENTO</p>

      <div className="space-y-2">
        <Label>Nome completo:</Label>
        <Input />
      </div>

      <div className="space-y-2">
        <Label>Nº Cartão Unimed:</Label>
        <Input className="w-52" />
      </div>

      <p className="font-semibold text-primary pt-4 border-t">MOTIVO DA SOLICITAÇÃO DE REEMBOLSO</p>

      <div className="flex flex-wrap gap-4">
        <Label className="flex items-center gap-2 font-normal">
          <Checkbox />
          Falta de rede credenciada
        </Label>
        <Label className="flex items-center gap-2 font-normal">
          <Checkbox />
          Médico/Prestador não credenciado
        </Label>
      </div>

      <div className="flex flex-wrap gap-4">
        <Label className="flex items-center gap-2 font-normal">
          <Checkbox />
          Urgência/Emergência
        </Label>
        <Label className="flex items-center gap-2 font-normal">
          <Checkbox />
          Outros: <Input className="inline-block w-48 ml-2" />
        </Label>
      </div>

      <div className="space-y-2">
        <Label>Registrou protocolo de informação?</Label>
        <div className="flex gap-6">
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox />
            Não
          </Label>
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox />
            Sim <Input className="inline-block w-40 ml-2" placeholder="Nº do protocolo" />
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Valor Solicitado: R$</Label>
        <Input className="w-52" />
      </div>

      <div className="space-y-2">
        <Label>Descrever o motivo da solicitação de reembolso:</Label>
        <Textarea rows={4} />
      </div>

      <p className="font-semibold text-primary pt-4 border-t">DADOS BANCÁRIOS</p>

      <div className="bg-accent/50 border-l-4 border-primary p-4 rounded">
        <p><strong>Observações:</strong> Nota fiscal deve possuir CNPJ e recibo deve possuir CPF do prestador. Informar a conta corrente do titular. Não é possível conta salário. As informações preenchidas abaixo são de inteira responsabilidade de quem o assina.</p>
      </div>

      <div className="space-y-2">
        <Label>Nome do titular da conta:</Label>
        <Input />
      </div>

      <div className="space-y-2">
        <Label>CPF/CNPJ do titular da conta:</Label>
        <Input className="w-52" />
      </div>

      <div className="space-y-2">
        <Label>Nome do Banco:</Label>
        <Input />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Agência (sem o dígito):</Label>
          <Input />
        </div>
        <div className="space-y-2">
          <Label>Número da Conta (com o dígito):</Label>
          <Input />
        </div>
      </div>

      <div className="flex gap-6">
        <Label className="flex items-center gap-2 font-normal">
          <Checkbox />
          Conta Corrente
        </Label>
        <Label className="flex items-center gap-2 font-normal">
          <Checkbox />
          Poupança
        </Label>
      </div>

      <p className="leading-relaxed font-semibold">
        *Declaro que as informações prestadas por mim nesse requerimento são verdadeiras e completas.
      </p>

      <div className="space-y-2">
        <Label>Data:</Label>
        <div className="flex gap-2 items-center">
          Em <Input className="inline-block w-16" placeholder="DD" maxLength={2} />
          de <Input className="inline-block w-32" placeholder="mês" />
          de <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>
      </div>

      <div className="my-10 text-center">
        <div className="border-t border-foreground w-72 mx-auto mb-2"></div>
        <p>Associado</p>
      </div>

      <div className="text-center mt-8 border-t pt-6 print:hidden">
        <Button onClick={onPrint} size="lg" className="px-8">
          Imprimir
        </Button>
      </div>
    </div>
  );
}

function TermoOpcaoClassic({ onPrint }: { onPrint: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-center text-primary font-semibold text-lg">
        TERMO DE OPÇÃO CONVÊNIO FUNSEP/UNIMED-CURITIBA
      </h2>

      <div className="text-right flex items-center justify-end gap-2">
        <Label>Eu,</Label>
        <Input className="inline-block w-96" placeholder="Nome completo" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Matrícula Funsep:</Label>
          <Input />
        </div>
        <div className="space-y-2">
          <Label>RG:</Label>
          <Input />
        </div>
        <div className="space-y-2">
          <Label>CPF:</Label>
          <Input />
        </div>
      </div>

      <div className="space-y-2">
        <Label>E-mail:</Label>
        <Input type="email" />
      </div>

      <div className="space-y-2">
        <Label>Telefone:</Label>
        <Input className="w-52" />
      </div>

      <p className="leading-relaxed">
        DECLARO estar ciente das normas que disciplinam a instituição assistencial e o funcionamento do convênio estabelecido entre o Funsep e a Unimed-Curitiba, OPTANDO pelo tipo de acomodação e faixa etária dos beneficiários, e CONCORDANDO em pagar os valores mensais das respectivas tabelas.
      </p>

      <div className="space-y-4">
        <p className="font-semibold text-primary pt-4 border-t">TÍTULAR:</p>
        <div className="flex gap-6">
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox />
            Apartamento
          </Label>
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox />
            Enfermaria
          </Label>
        </div>

        {[1, 2, 3, 4, 5].map((num) => (
          <div key={num} className="space-y-2">
            <p className="font-semibold text-primary pt-4 border-t">DEPENDENTE {num}:</p>
            <Input placeholder={`Nome completo do dependente ${num}`} />
            <div className="flex gap-6">
              <Label className="flex items-center gap-2 font-normal">
                <Checkbox />
                Apartamento
              </Label>
              <Label className="flex items-center gap-2 font-normal">
                <Checkbox />
                Enfermaria
              </Label>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Data:</Label>
        <div className="flex gap-2 items-center">
          Em <Input className="inline-block w-16" placeholder="DD" maxLength={2} /> /
          <Input className="inline-block w-32" placeholder="mês" /> /
          <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>
      </div>

      <div className="my-10 text-center">
        <div className="border-t border-foreground w-72 mx-auto mb-2"></div>
        <p>Titular</p>
      </div>

      <div className="bg-warning/10 border-l-4 border-warning p-4 rounded">
        <strong className="text-warning-foreground">
          ATENÇÃO: TODOS OS CAMPOS DEVEM SER PREENCHIDOS, PARA ANDAMENTO DA SOLICITAÇÃO.
        </strong>
      </div>

      <div className="text-center mt-8 border-t pt-6 print:hidden">
        <Button onClick={onPrint} size="lg" className="px-8">
          Imprimir
        </Button>
      </div>
    </div>
  );
}


function TermoCienciaClassic({ onPrint }: { onPrint: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-center text-primary font-semibold text-lg">
        TERMO DE CIÊNCIA
      </h2>

      <p className="leading-relaxed">
        EU, <Input className="inline-block w-96" placeholder="Nome completo" />,
        E-MAIL <Input className="inline-block w-64" type="email" placeholder="email" />,
        PORTADOR DO RG Nº <Input className="inline-block w-32" placeholder="0.000.000-0" />
        E INSCRITO NO CPF SOB Nº <Input className="inline-block w-36" placeholder="000.000.000-00" />,
        ASSOCIADO DESTE FUNSEP- FUNDO DE SAÚDE DOS SERVIDORES DO PODER JUDICIÁRIO – CNPJ 77.750.354/0001-88,
        ESTOU CIENTE QUE O PLANO DE SAÚDE QUE ADQUIRI JUNTO A ESTE FUNDO, É DE CUSTO OPERACIONAL,
        POSSIBILITANDO A UTILIZAÇÃO DA UNIMED-CURITIBA – PLANO DE COBERTURA NACIONAL,
        ATRAVÉS DE SUA REDE DE SERVIÇOS CREDENCIADOS PODENDO REALIZAR CONSULTAS, EXAMES,
        PROCEDIMENTOS, TRATAMENTO CLÍNICO, CIRÚRGICO OU PSIQUIÁTRICO.
      </p>

      <p className="leading-relaxed">
        DECLARO TER CONHECIMENTO QUE O REFERIDO CONTRATO ESTABELECIDO ENTRE AS PARTES ACIMA NOMINADAS,
        TORNA O FUNSEP O ÚNICO RESPONSÁVEL PELAS DESPESAS EFETUADAS POR SEUS ASSOCIADOS E EM CASO DE AÇÕES JUDICIAIS,
        O FUNDO É QUE ARCARÁ COM O ÔNUS QUE TAL SITUAÇÃO VENHA A REPRESENTAR.
      </p>

      <p className="leading-relaxed">
        EM RELAÇÃO AS NORMAS QUE DISCIPLINAM A UTILIZAÇÃO, DECLARO QUE ESTOU CIENTE, NOTADAMENTE DAS SEGUINTES:
      </p>

      <div className="bg-accent/50 border-l-4 border-primary p-4 rounded space-y-2 text-sm">
        <p><strong>- CONSULTAS –</strong> LIMITADAS A 2 (DUAS) CONSULTAS MÊS, POR INDIVIDUO INSCRITO, COM PARTICIPAÇÃO DE 25% E A PARTIR DA 3ª, DESCONTO DE 100% DO VALOR DE TABELA DA CONSULTA;</p>
        <p><strong>- EXAMES E PROCEDIMENTOS –</strong> COM PARTICIPAÇÃO DE 25% DOS VALORES DE TABELA, INCLUSIVE QUANDO NO INTERNAMENTO HOSPITALAR.</p>
        <p><strong>- FISIOTERAPIA –</strong> LIMITADOS A 10 SESSÕES NO MÊS, COM 25% DE PARTCIPAÇÃO (INCLUSIVE NO INTERNAMENTO HOSPITALAR).</p>
        <p><strong>- FONOAUDIOLOGIA –</strong> LIMITADOS A 4 SESSÕES NO MÊS COM 25% DE PARTICIPAÇÃO (INCLUSIVE NO INTERNAMENTO HOSPITALAR).</p>
        <p><strong>- ACUPUNTURA –</strong> LIMITADA A 4 SESSÕES NO MÊS COM 25% DE PARTICIPAÇÃO.</p>
        <p><strong>- EXAMES DE ALTO CUSTO –</strong> PARTICIPAÇÃO DE 25% DOS VALORES DE TABELA, INCLUSIVE QUANDO NO INTERNAMENTO HOSPITALAR.</p>
      </div>

      <p className="leading-relaxed">
        DECLARO FINALMENTE, QUE RECEBI A INSTRUÇÃO NORMATIVA Nº 1/99 QUE TRATA DO PRAZO CARENCIAL E O MATERIAL SOBRE O FUNSEP, COM AS INFORMAÇÕES SOBRE A FORMA DE FUNCIONAMENTO.
      </p>

      <div className="space-y-2">
        <Label>Data:</Label>
        <div className="flex gap-2 items-center">
          Em <Input className="inline-block w-16" placeholder="DD" maxLength={2} /> /
          <Input className="inline-block w-16" placeholder="MM" maxLength={2} /> /
          <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>
      </div>

      <div className="my-10 text-center">
        <div className="border-t border-foreground w-72 mx-auto mb-2"></div>
        <p>RG Nº</p>
      </div>

      <div className="text-center mt-8 border-t pt-6 print:hidden">
        <Button onClick={onPrint} size="lg" className="px-8">
          Imprimir
        </Button>
      </div>
    </div>
  );
}

function TermoCompromissoClassic({ onPrint }: { onPrint: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-center text-primary font-semibold text-lg">
        TERMO DE COMPROMISSO
      </h2>

      <div className="text-right">
        <Input className="inline-block w-96" placeholder="Nome completo" />
      </div>

      <div className="space-y-2">
        <Label>E-mail:</Label>
        <Input type="email" placeholder="seu@email.com" />
      </div>

      <p className="leading-relaxed">
        Associado(a) desse fundo de saúde, portador(a) do R.G nº{" "}
        <Input className="inline-block w-32" placeholder="0.000.000-0" />
        e inscrito(a) no CPF sob nº <Input className="inline-block w-36" placeholder="000.000.000-00" />,
        matrícula nº <Input className="inline-block w-32" placeholder="matrícula" />,
        ciente das disposições relativas aos prazos de carência que regem a instituição, se compromete, por este instrumento, a cumpri-los de forma fiel e de acordo com o que dispõe a Instrução Normativa nº 1/99, declarando, ainda, estar ciente de que, na hipótese de não cumprimento, sofrerá as penalidades previstas para os casos de utilização indevida, e AUTORIZANDO que se procedam aos descontos em folha de vencimentos dos valores decorrentes de eventual utilização irregular.
      </p>

      <div className="space-y-2">
        <Label>Data:</Label>
        <div className="flex gap-2 items-center">
          Em <Input className="inline-block w-16" placeholder="DD" maxLength={2} /> /
          <Input className="inline-block w-32" placeholder="mês" /> /
          <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>
      </div>

      <div className="my-10 text-center">
        <div className="border-t border-foreground w-72 mx-auto mb-2"></div>
        <p>Assinatura</p>
      </div>

      <div className="bg-warning/10 border-l-4 border-warning p-4 rounded">
        <strong className="text-warning-foreground">
          ATENÇÃO: TODOS OS CAMPOS DEVEM SER PREENCHIDOS, PARA ANDAMENTO DA SOLICITAÇÃO.
        </strong>
      </div>

      <p className="font-semibold text-primary pt-4 border-t">Data da entrega da carteira de identificação:</p>

      <div className="flex gap-2 items-center">
        <Input className="inline-block w-16" placeholder="DD" maxLength={2} /> /
        <Input className="inline-block w-16" placeholder="MM" maxLength={2} /> /
        <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
      </div>

      <p className="font-semibold text-primary pt-4 border-t">Prazos de carência</p>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="w-52">* exames:</Label>
          <Input className="inline-block w-16" placeholder="DD" maxLength={2} /> /
          <Input className="inline-block w-16" placeholder="MM" maxLength={2} /> /
          <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>

        <div className="flex items-center gap-2">
          <Label className="w-52">* radiologia:</Label>
          <Input className="inline-block w-16" placeholder="DD" maxLength={2} /> /
          <Input className="inline-block w-16" placeholder="MM" maxLength={2} /> /
          <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>

        <div className="flex items-center gap-2">
          <Label className="w-52">* alto custo/internamento:</Label>
          <Input className="inline-block w-16" placeholder="DD" maxLength={2} /> /
          <Input className="inline-block w-16" placeholder="MM" maxLength={2} /> /
          <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>

        <div className="flex items-center gap-2">
          <Label className="w-52">* obstetrícia:</Label>
          <Input className="inline-block w-16" placeholder="DD" maxLength={2} /> /
          <Input className="inline-block w-16" placeholder="MM" maxLength={2} /> /
          <Input className="inline-block w-24" placeholder="AAAA" maxLength={4} />
        </div>
      </div>

      <div className="text-center mt-8 border-t pt-6 print:hidden">
        <Button onClick={onPrint} size="lg" className="px-8">
          Imprimir
        </Button>
      </div>
    </div>
  );
}

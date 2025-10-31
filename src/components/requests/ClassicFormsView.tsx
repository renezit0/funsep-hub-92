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
      <main className="bg-card rounded-lg border p-8 min-h-[500px]">
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
  return <div className="text-center text-muted-foreground py-20">Formulário em construção...</div>;
}

function InclusaoRecemNascidoClassic({ onPrint }: { onPrint: () => void }) {
  return <div className="text-center text-muted-foreground py-20">Formulário em construção...</div>;
}

function InscricaoPensionistaClassic({ onPrint }: { onPrint: () => void }) {
  return <div className="text-center text-muted-foreground py-20">Formulário em construção...</div>;
}

function Requerimento21AnosClassic({ onPrint }: { onPrint: () => void }) {
  return <div className="text-center text-muted-foreground py-20">Formulário em construção...</div>;
}

function RequerimentoAuxilioClassic({ onPrint }: { onPrint: () => void }) {
  return <div className="text-center text-muted-foreground py-20">Formulário em construção...</div>;
}

function RequerimentoDiversosClassic({ onPrint }: { onPrint: () => void }) {
  return <div className="text-center text-muted-foreground py-20">Formulário em construção...</div>;
}

function RequerimentoReembolsoClassic({ onPrint }: { onPrint: () => void }) {
  return <div className="text-center text-muted-foreground py-20">Formulário em construção...</div>;
}

function TermoCienciaClassic({ onPrint }: { onPrint: () => void }) {
  return <div className="text-center text-muted-foreground py-20">Formulário em construção...</div>;
}

function TermoCompromissoClassic({ onPrint }: { onPrint: () => void }) {
  return <div className="text-center text-muted-foreground py-20">Formulário em construção...</div>;
}

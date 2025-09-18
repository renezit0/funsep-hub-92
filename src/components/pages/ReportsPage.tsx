import React, { useState, useEffect } from "react";
import { ChartBar, Download, FileText, Info, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function ReportsPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'a_pagar' | 'pagos' | 'ir'>('a_pagar');
  const [dateRange, setDateRange] = useState({
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dataFim: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });
  const { toast } = useToast();

  const openReportModal = (type: 'a_pagar' | 'pagos' | 'ir') => {
    setReportType(type);
    setReportModalOpen(true);
  };

  const generateReport = async () => {
    if (!session || !session.user || !session.user.sigla) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado ou sem matrícula.",
        variant: "destructive",
      });
      return;
    }

    const matricula = parseInt(session.user.sigla.replace('BEN-', ''));
    if (isNaN(matricula)) {
      toast({
        title: "Erro",
        description: "Matrícula do beneficiário inválida.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          matricula: matricula,
          dataInicio: dateRange.dataInicio,
          dataFim: dateRange.dataFim,
          reportType: reportType,
        },
      });

      if (error) {
        console.error('Erro ao chamar função de relatório:', error);
        throw error;
      }

      const { html, filename } = data;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '794px';
      tempDiv.style.maxWidth = '794px';
      tempDiv.style.backgroundColor = '#ffffff';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.4';
      tempDiv.style.padding = '0';
      tempDiv.style.margin = '0';
      tempDiv.style.boxSizing = 'border-box';
      tempDiv.style.overflow = 'visible';
      tempDiv.style.zIndex = '-1';
      document.body.appendChild(tempDiv);

      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(tempDiv, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        height: Math.max(1123, tempDiv.scrollHeight),
        windowWidth: 794,
        windowHeight: 1123,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('body > div') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.width = '794px';
            clonedElement.style.maxWidth = '794px';
          }
        }
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');

      const marginLeft = 15;
      const marginTop = 15;
      const marginRight = 15;
      const marginBottom = 15;

      const pageWidth = 210;
      const pageHeight = 297;
      const contentWidth = pageWidth - marginLeft - marginRight;
      const contentHeight = pageHeight - marginTop - marginBottom;

      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = marginTop;

      pdf.addImage(imgData, 'PNG', marginLeft, position, imgWidth, imgHeight);
      heightLeft -= contentHeight;

      while (heightLeft >= 0) {
        position = marginTop - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', marginLeft, position, imgWidth, imgHeight);
        heightLeft -= contentHeight;
      }

      pdf.save(filename);

      toast({
        title: "Relatório gerado com sucesso",
        description: "O relatório foi baixado automaticamente",
      });

      setReportModalOpen(false);
    } catch (error: any) {
      console.error('Erro completo ao gerar relatório:', error);

      if (error.message?.includes('não encontrado')) {
        toast({
          title: "Sem dados",
          description: "Nenhum procedimento encontrado para o período selecionado",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: `Erro ao gerar relatório: ${error.message || 'Erro desconhecido'}`, 
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ChartBar className="h-8 w-8" />
          Meus Relatórios
        </h1>
        <p className="text-muted-foreground">
          Acesse seus relatórios de procedimentos e imposto de renda.
        </p>
      </div>

      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Relatórios Disponíveis</p>
              <p className="text-sm text-muted-foreground">
                Gere seus relatórios de procedimentos a pagar, pagos e imposto de renda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gerar Relatórios</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => openReportModal('a_pagar')}
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            <FileText className="h-4 w-4" />
            Relatório a Pagar
          </Button>
          <Button
            onClick={() => openReportModal('pagos')}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Download className="h-4 w-4" />
            Relatório de Pagos
          </Button>
          <Button
            onClick={() => openReportModal('ir')}
            className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
          >
            <FileText className="h-4 w-4" />
            Relatório de IR
          </Button>
        </CardContent>
      </Card>

      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Período</DialogTitle>
            <DialogDescription>
              Selecione o período para gerar o relatório de {reportType === 'a_pagar' ? 'procedimentos a pagar' : reportType === 'pagos' ? 'procedimentos pagos' : 'Imposto de Renda'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início:</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dateRange.dataInicio}
                onChange={(e) => setDateRange({ ...dateRange, dataInicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim:</Label>
              <Input
                id="dataFim"
                type="date"
                value={dateRange.dataFim}
                onChange={(e) => setDateRange({ ...dateRange, dataFim: e.target.value })}
              />
            </div>
            <Button onClick={generateReport} className="w-full gap-2" disabled={loading}>
              {loading ? "Gerando..." : <><Download className="h-4 w-4" /> Gerar Relatório</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

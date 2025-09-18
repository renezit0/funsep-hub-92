import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, User, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import jsPDF from 'jspdf';

interface ReportData {
  matricula: number;
  nome: string;
  cpf: number | string;  
  situacao: number;
  [key: string]: any; // Para suportar outras propriedades das tabelas
}

export function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [reportType, setReportType] = useState<'personal' | 'family'>('personal');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const { session, isAuthenticated } = useAuth();

  const isBeneficiary = session?.user.cargo === 'BENEFICIÁRIO';
  const userMatricula = isBeneficiary ? session?.sigla.replace('BEN-', '') : null;

  useEffect(() => {
    if (isAuthenticated && isBeneficiary) {
      loadPersonalData();
    }
  }, [isAuthenticated, isBeneficiary]);

  const loadPersonalData = async () => {
    if (!userMatricula) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('cadben')
        .select('*')
        .eq('matricula', parseInt(userMatricula));

      if (error) throw error;
      setReportData(data || []);
    } catch (error) {
      console.error('Erro ao carregar dados pessoais:', error);
      toast.error('Erro ao carregar dados pessoais');
    } finally {
      setLoading(false);
    }
  };

  const loadFamilyData = async () => {
    if (!userMatricula) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('caddep')
        .select('*')
        .eq('matricula', parseInt(userMatricula));

      if (error) throw error;
      setReportData(data || []);
    } catch (error) {
      console.error('Erro ao carregar dados familiares:', error);
      toast.error('Erro ao carregar dados familiares');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!isAuthenticated || !isBeneficiary) {
      toast.error('Acesso restrito a beneficiários');
      return;
    }

    try {
      setLoading(true);
      
      if (reportType === 'personal') {
        await loadPersonalData();
      } else {
        await loadFamilyData();
      }

      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (reportData.length === 0) {
      toast.error('Gere um relatório primeiro');
      return;
    }

    const pdf = new jsPDF();
    
    // Cabeçalho
    pdf.setFontSize(20);
    pdf.text('FUNSEP - Relatório Pessoal', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Beneficiário: ${session?.user.nome}`, 20, 50);
    pdf.text(`Matrícula: ${userMatricula}`, 20, 60);
    pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 70);
    
    // Tipo do relatório
    const tipoRelatorio = reportType === 'personal' ? 'Dados Pessoais' : 'Dependentes';
    pdf.text(`Tipo: ${tipoRelatorio}`, 20, 80);
    
    // Dados
    let yPosition = 100;
    
    if (reportType === 'personal') {
      const data = reportData[0];
      if (data) {
        pdf.text(`Nome: ${data.nome || '-'}`, 20, yPosition);
        yPosition += 10;
        pdf.text(`CPF: ${data.cpf || '-'}`, 20, yPosition);
        yPosition += 10;
        pdf.text(`Situação: ${data.situacao === 1 ? 'Ativo' : 'Inativo'}`, 20, yPosition);
        yPosition += 10;
        pdf.text(`Email: ${data.email || '-'}`, 20, yPosition);
      }
    } else {
      pdf.text('Dependentes:', 20, yPosition);
      yPosition += 15;
      
      reportData.forEach((dep, index) => {
        pdf.text(`${index + 1}. ${dep.nome || '-'}`, 25, yPosition);
        yPosition += 8;
        pdf.text(`   CPF: ${dep.cpf || '-'}`, 25, yPosition);
        yPosition += 8;
        pdf.text(`   Situação: ${dep.situacao === 1 ? 'Ativo' : 'Inativo'}`, 25, yPosition);
        yPosition += 12;
      });
    }
    
    // Salvar PDF
    const fileName = `relatorio_${reportType}_${userMatricula}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    toast.success('PDF baixado com sucesso!');
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <UserCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Faça login para acessar seus relatórios pessoais
          </p>
        </div>
      </div>
    );
  }

  if (!isBeneficiary) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Acesso de Administrador</h2>
          <p className="text-muted-foreground">
            Esta seção é destinada a beneficiários. Administradores devem usar o painel administrativo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Meus Relatórios
        </h1>
        <p className="text-muted-foreground">
          Gere e baixe relatórios com seus dados pessoais e familiares
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações do Relatório */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={(value: 'personal' | 'family') => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Dados Pessoais</SelectItem>
                  <SelectItem value="family">Dependentes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={generateReport} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Gerando..." : "Gerar Relatório"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={downloadPDF}
                disabled={reportData.length === 0}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Visualização do Relatório */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {reportType === 'personal' ? 'Dados Pessoais' : 'Dependentes'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : reportData.length > 0 ? (
              <div className="space-y-4">
                {reportType === 'personal' ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Nome</Label>
                        <p className="text-sm text-muted-foreground">{reportData[0]?.nome || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">CPF</Label>
                        <p className="text-sm text-muted-foreground">{reportData[0]?.cpf || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Matrícula</Label>
                        <p className="text-sm text-muted-foreground">{reportData[0]?.matricula || '-'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Situação</Label>
                        <Badge variant={reportData[0]?.situacao === 1 ? 'default' : 'secondary'}>
                          {reportData[0]?.situacao === 1 ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reportData.map((dep, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{dep.nome || `Dependente ${index + 1}`}</h4>
                          <Badge variant={dep.situacao === 1 ? 'default' : 'secondary'}>
                            {dep.situacao === 1 ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>CPF: {dep.cpf || '-'}</div>
                          <div>Matrícula: {dep.matricula}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Clique em "Gerar Relatório" para visualizar seus dados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
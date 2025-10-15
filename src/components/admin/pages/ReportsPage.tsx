import React, { useState, useEffect } from "react";
import { ChartBar, Download, FileText, Info, Search, X } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Beneficiary {
  matricula: number;
  nome: string;
  cpf: number;
  empresa: number;
}

interface Company {
  codigo: number;
  nome: string;
}

interface ReportFilters {
  nome: string;
  cpf: string;
  matricula: string;
  empresa: string;
}

export function ReportsPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'a_pagar' | 'pagos' | 'ir'>('a_pagar');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() - 1);
  const [dateRange, setDateRange] = useState({
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dataFim: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState<ReportFilters>({
    nome: '',
    cpf: '',
    matricula: '',
    empresa: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCompanies();
    searchBeneficiaries();
  }, []);

  const loadCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('tabempresas')
        .select('codigo, nome')
        .order('nome');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de empresas",
        variant: "destructive",
      });
    }
  };

  const searchBeneficiaries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('cadben')
        .select('matricula, nome, cpf, empresa')
        .order('nome');

      if (filters.nome) {
        query = query.ilike('nome', `%${filters.nome}%`);
      }
      if (filters.cpf) {
        query = query.eq('cpf', parseInt(filters.cpf.replace(/\D/g, '')));
      }
      if (filters.matricula) {
        query = query.eq('matricula', parseInt(filters.matricula));
      }
      if (filters.empresa) {
        query = query.eq('empresa', parseInt(filters.empresa));
      }

      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      setBeneficiaries(data || []);
    } catch (error) {
      console.error('Erro ao buscar beneficiários:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar beneficiários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      nome: '',
      cpf: '',
      matricula: '',
      empresa: ''
    });
    searchBeneficiaries();
  };

  const formatCPF = (cpf: number): string => {
    const cpfStr = cpf.toString().padStart(11, '0');
    return cpfStr.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getCompanyName = (codigo: number) => {
    const company = companies.find(c => c.codigo === codigo);
    return company?.nome || 'N/A';
  };

  const openReportModal = (beneficiary: Beneficiary, type: 'a_pagar' | 'pagos' | 'ir') => {
    setSelectedBeneficiary(beneficiary);
    setReportType(type);
    if (type === 'ir') {
      // Sincronizar dateRange com selectedYear quando abrir modal de IR
      setDateRange({
        dataInicio: `${selectedYear}-01-01`,
        dataFim: `${selectedYear}-12-31`
      });
    }
    setReportModalOpen(true);
  };

  const generateReport = async () => {
    console.log('Função generateReport chamada');
    
    if (!selectedBeneficiary) {
      toast({
        title: "Erro",
        description: "Nenhum beneficiário selecionado",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Chamando função edge com dados:', {
        matricula: selectedBeneficiary.matricula,
        dataInicio: dateRange.dataInicio,
        dataFim: dateRange.dataFim,
        reportType: reportType,
      });

      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          matricula: selectedBeneficiary.matricula,
          dataInicio: dateRange.dataInicio,
          dataFim: dateRange.dataFim,
          reportType: reportType,
        },
      });

      if (error) {
        console.error('Erro ao chamar função de relatório:', error);
        throw error;
      }

      console.log('Resposta da função edge:', data);

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
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: `Erro ao gerar relatório: ${error.message || 'Erro desconhecido'}`,
          variant: "destructive"
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
          Relatórios por Associado
        </h1>
        <p className="text-muted-foreground">
          Busque associados e gere relatórios individuais de procedimentos.
        </p>
      </div>

      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Relatórios Administrativos</p>
              <p className="text-sm text-muted-foreground">
                Gere relatórios detalhados por associado, incluindo procedimentos a pagar, pagos e IR.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Busca de Associados */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Associados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                placeholder="Digite o nome..."
                value={filters.nome}
                onChange={(e) => setFilters({ ...filters, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={filters.cpf}
                onChange={(e) => setFilters({ ...filters, cpf: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                placeholder="Ex: 12345"
                value={filters.matricula}
                onChange={(e) => setFilters({ ...filters, matricula: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <select
                id="empresa"
                value={filters.empresa}
                onChange={(e) => setFilters({ ...filters, empresa: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Todas as empresas</option>
                {companies.map((company) => (
                  <option key={company.codigo} value={company.codigo}>
                    {company.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={searchBeneficiaries} disabled={loading} className="gap-2">
              <Search className="h-4 w-4" />
              {loading ? "Buscando..." : "Buscar"}
            </Button>
            <Button variant="outline" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Associados Encontrados ({beneficiaries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <ChartBar className="h-12 w-12 mx-auto mb-4 opacity-30 animate-pulse" />
                <p className="text-muted-foreground">Carregando associados...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Relatório A Pagar</TableHead>
                  <TableHead>Relatório Pagos</TableHead>
                  <TableHead>Auxílio Saúde</TableHead>
                  <TableHead>Imposto de Renda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beneficiaries.length > 0 ? (
                  beneficiaries.map((beneficiary) => (
                    <TableRow key={beneficiary.matricula}>
                      <TableCell className="font-medium">{beneficiary.matricula}</TableCell>
                      <TableCell>{beneficiary.nome}</TableCell>
                      <TableCell>{formatCPF(beneficiary.cpf)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {getCompanyName(beneficiary.empresa)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => openReportModal(beneficiary, 'a_pagar')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <FileText className="h-4 w-4" />
                          A Pagar
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => openReportModal(beneficiary, 'pagos')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Download className="h-4 w-4" />
                          Pagos
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Em breve</Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openReportModal(beneficiary, 'ir')}
                          className="bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                        >
                          <FileText className="h-4 w-4" />
                          IR
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <ChartBar className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      Nenhum associado encontrado.
                      <br />
                      <small>Verifique os filtros de pesquisa ou tente novamente.</small>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Período para Relatórios */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Período</DialogTitle>
            <DialogDescription>
              {reportType === 'ir' 
                ? 'Selecione o ano para gerar o relatório de Imposto de Renda.'
                : `Selecione o período para gerar o relatório de ${reportType === 'a_pagar' ? 'procedimentos a pagar' : 'procedimentos pagos'}.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {reportType === 'ir' ? (
              <div className="space-y-2">
                <Label htmlFor="ano">Ano:</Label>
                <select
                  id="ano"
                  value={selectedYear}
                  onChange={(e) => {
                    const ano = parseInt(e.target.value);
                    setSelectedYear(ano);
                    setDateRange({
                      dataInicio: `${ano}-01-01`,
                      dataFim: `${ano}-12-31`
                    });
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 1 - i).map(year => (
                    <option key={year} value={year}>{year + 1} (ano calendário {year})</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data Início:</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={dateRange.dataInicio}
                    onChange={(e) => setDateRange(prev => ({ ...prev, dataInicio: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFim">Data Fim:</Label>
                  <Input
                    id="dataFim"
                    type="date"
                    value={dateRange.dataFim}
                    onChange={(e) => setDateRange(prev => ({ ...prev, dataFim: e.target.value }))}
                  />
                </div>
              </>
            )}
            
            {reportType !== 'ir' && (
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">Informação:</p>
                      <ul className="text-blue-700 mt-1 space-y-1">
                        <li>• O relatório incluirá todos os procedimentos do período selecionado</li>
                        <li>• Máximo de 1 ano de diferença entre as datas</li>
                        <li>• O arquivo PDF será gerado automaticamente</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button onClick={generateReport} className="w-full gap-2" disabled={loading}>
              {loading ? "Gerando..." : <><Download className="h-4 w-4" /> Gerar Relatório</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
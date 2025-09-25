import React, { useState, useEffect } from "react";
import { ChartBar, Search, X, FileText, Download, Info, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Beneficiary {
  matricula: number;
  nome: string;
  cpf: number | string;
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
  const [filters, setFilters] = useState<ReportFilters>({
    nome: '',
    cpf: '',
    matricula: '',
    empresa: ''
  });
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [reportType, setReportType] = useState<'a_pagar' | 'pagos' | 'ir'>('a_pagar');
  const [dateRange, setDateRange] = useState({
    dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    dataFim: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
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
    }
  };

  const searchBeneficiaries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('cadben')
        .select('matricula, nome, cpf, empresa')
        .order('nome')
        .limit(100);

      if (filters.nome) {
        query = query.ilike('nome', `%${filters.nome}%`);
      }
      
      if (filters.cpf) {
        const numericCpf = filters.cpf.replace(/\D/g, '');
        if (numericCpf) {
          query = query.eq('cpf', parseInt(numericCpf));
        }
      }

      if (filters.matricula) {
        const numericMatricula = parseInt(filters.matricula);
        if (!isNaN(numericMatricula)) {
          query = query.eq('matricula', numericMatricula);
        }
      }

      if (filters.empresa) {
        const numericEmpresa = parseInt(filters.empresa);
        if (!isNaN(numericEmpresa)) {
          query = query.eq('empresa', numericEmpresa);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setBeneficiaries(data || []);
    } catch (error) {
      console.error('Erro ao buscar beneficiários:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar beneficiários",
        variant: "destructive"
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
    setTimeout(() => searchBeneficiaries(), 100);
  };

  const formatCPF = (cpf: string | number | null) => {
    if (!cpf) return 'N/A';
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
    setReportModalOpen(true);
  };

  const generateReport = async () => {
    console.log('Função generateReport chamada');
    
    if (!selectedBeneficiary) {
      console.log('Erro: Nenhum beneficiário selecionado');
      return;
    }

    console.log('Iniciando processo de geração de relatório...');
    setLoading(true);
    
    try {
      console.log('Iniciando geração de relatório:', {
        matricula: selectedBeneficiary.matricula,
        tipo: reportType,
        periodo: dateRange
      });

      // Chamar a Edge Function para gerar o relatório
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          matricula: selectedBeneficiary.matricula,
          dataInicio: dateRange.dataInicio,
          dataFim: dateRange.dataFim,
          reportType: reportType
        }
      });

      if (error) {
        console.error('Erro ao chamar função de relatório:', error);
        throw error;
      }

      // A função agora retorna HTML em vez de PDF
      const { html, filename } = data;
      
      // Criar elemento temporário para renderizar o HTML com melhor qualidade
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '794px'; // Largura A4 em pixels (210mm @ 96dpi)
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

      // Aguardar um pouco para garantir renderização completa
      await new Promise(resolve => setTimeout(resolve, 500));

      // Converter HTML para canvas com alta qualidade e proporção correta
      const canvas = await html2canvas(tempDiv, {
        scale: 2.5, // Escala otimizada para qualidade HD sem distorção
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794, // Largura fixa A4
        height: Math.max(1123, tempDiv.scrollHeight), // Altura mínima A4 ou altura do conteúdo
        windowWidth: 794,
        windowHeight: 1123,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
          // Garantir que o clone tenha as mesmas dimensões
          const clonedElement = clonedDoc.querySelector('body > div') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.width = '794px';
            clonedElement.style.maxWidth = '794px';
          }
        }
      });

      // Remover elemento temporário
      document.body.removeChild(tempDiv);

      // Criar PDF com margens adequadas
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Definir margens (em mm)
      const marginLeft = 15;
      const marginTop = 15;
      const marginRight = 15;
      const marginBottom = 15;
      
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const contentWidth = pageWidth - marginLeft - marginRight;
      const contentHeight = pageHeight - marginTop - marginBottom;
      
      // Calcular dimensões da imagem respeitando as margens
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = marginTop;

      // Adicionar primeira página
      pdf.addImage(imgData, 'PNG', marginLeft, position, imgWidth, imgHeight);
      heightLeft -= contentHeight;

      // Adicionar páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = marginTop - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', marginLeft, position, imgWidth, imgHeight);
        heightLeft -= contentHeight;
      }

      // Baixar PDF
      pdf.save(filename);

      toast({
        title: "Relatório gerado com sucesso",
        description: "O relatório foi baixado automaticamente",
      });

      setReportModalOpen(false);
    } catch (error) {
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
          Selecione um associado para gerar relatórios específicos
        </p>
      </div>

      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-primary" />
            <div>
              <p className="font-semibold">Relatórios Administrativos</p>
              <p className="text-sm text-muted-foreground">
                Selecione um associado para gerar relatórios de procedimentos, auxílio saúde e imposto de renda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros de Pesquisa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Pesquisa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Nome do associado..."
              value={filters.nome}
              onChange={(e) => setFilters(prev => ({ ...prev, nome: e.target.value }))}
            />
            <Input
              placeholder="CPF..."
              value={filters.cpf}
              onChange={(e) => setFilters(prev => ({ ...prev, cpf: e.target.value }))}
            />
            <Input
              placeholder="Matrícula..."
              value={filters.matricula}
              onChange={(e) => setFilters(prev => ({ ...prev, matricula: e.target.value }))}
            />
            <Select value={filters.empresa} onValueChange={(value) => setFilters(prev => ({ ...prev, empresa: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as empresas" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.codigo} value={company.codigo.toString()}>
                    {company.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={searchBeneficiaries} disabled={loading}>
                <Search className="h-4 w-4" />
                Pesquisar
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Beneficiários */}
      <Card>
        <CardHeader>
          <CardTitle>Associados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
              Selecione o período para gerar o relatório de {reportType === 'a_pagar' ? 'procedimentos a pagar' : 'procedimentos pagos'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReportModalOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  console.log('Botão Gerar Relatório clicado');
                  generateReport();
                }} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
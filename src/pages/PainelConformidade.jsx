import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertTriangle, CheckCircle, XCircle, User, ArrowLeft, FileSpreadsheet } from 'lucide-react'
import '../App.css'

export default function PainelConformidade({ balanceteData, metadata }) {
  const navigate = useNavigate()
  const [contas, setContas] = useState([])
  
  // Filtros individuais por coluna
  const [filterConta, setFilterConta] = useState('')
  const [filterDescricao, setFilterDescricao] = useState('')
  const [filterClasse, setFilterClasse] = useState('all')
  const [filterGrupo, setFilterGrupo] = useState('all')
  const [filterComparativo, setFilterComparativo] = useState('all')
  const [filterResponsavel, setFilterResponsavel] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Lista de responsáveis
  const responsaveis = ['DANIEL', 'RIOS', 'JEFFERSON', 'HUGO', 'RAFAEL', 'RENATO']

  // Inicializar dados - apenas contas ANALÍTICAS
  useEffect(() => {
    if (balanceteData && Array.isArray(balanceteData)) {
      const processedData = balanceteData
        .filter(conta => conta.CLASSE === 'ANALITICA')
        .map(conta => ({
          ...conta,
          responsavel: '',
          dataConciliacao: '',
          statusConciliacao: 'Pendente',
          id: conta.CONTA
        }))
      
      setContas(processedData)
    }
  }, [balanceteData])

  // Filtrar contas
  const filteredContas = useMemo(() => {
    return contas.filter(conta => {
      const matchesConta = conta.CONTA.toLowerCase().includes(filterConta.toLowerCase())
      const matchesDescricao = conta.DESCRICAO.toLowerCase().includes(filterDescricao.toLowerCase())
      const matchesClasse = filterClasse === 'all' || conta.CLASSE === filterClasse
      const matchesGrupo = filterGrupo === 'all' || conta.GRUPO === filterGrupo
      const matchesComparativo = filterComparativo === 'all' || conta.COMPARATIVO === filterComparativo
      const matchesResponsavel = filterResponsavel === 'all' || 
                                  (filterResponsavel === 'sem' && !conta.responsavel) ||
                                  conta.responsavel === filterResponsavel
      const matchesStatus = filterStatus === 'all' || conta.statusConciliacao === filterStatus
      
      return matchesConta && matchesDescricao && matchesClasse && matchesGrupo && 
             matchesComparativo && matchesResponsavel && matchesStatus
    })
  }, [contas, filterConta, filterDescricao, filterClasse, filterGrupo, filterComparativo, filterResponsavel, filterStatus])

  // Atualizar responsável
  const updateResponsavel = (contaId, responsavel) => {
    setContas(prev => prev.map(conta => 
      conta.id === contaId ? { ...conta, responsavel } : conta
    ))
  }

  // Atualizar data de conciliação
  const updateDataConciliacao = (contaId, data) => {
    setContas(prev => prev.map(conta => 
      conta.id === contaId ? { 
        ...conta, 
        dataConciliacao: data,
        statusConciliacao: data ? 'Conciliado' : 'Pendente'
      } : conta
    ))
  }

  // Formatar valores monetários
  const formatCurrency = (value) => {
    if (!value || value === '0,00') return 'R$ 0,00'
    
    const suffix = value.toString().match(/\s*([DC])\s*$/)?.[1] || ''
    const cleanValue = value.toString().replace(/\s*[DC]\s*$/, '')
    
    if (cleanValue.includes(',')) {
      return `R$ ${cleanValue} ${suffix}`
    }
    
    const number = parseFloat(cleanValue)
    if (isNaN(number)) return 'R$ 0,00'
    
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(number)
    
    return suffix ? `${formattedValue} ${suffix}` : formattedValue
  }

  // Estatísticas
  const totalContas = contas.length
  const contasSemResponsavel = contas.filter(conta => !conta.responsavel).length
  const contasPendentes = contas.filter(conta => conta.statusConciliacao === 'Pendente').length
  const contasConciliadas = contas.filter(conta => conta.statusConciliacao === 'Conciliado').length

  // Grupos únicos para filtro
  const gruposUnicos = useMemo(() => {
    return [...new Set(contas.map(conta => conta.GRUPO))].sort()
  }, [contas])

  const getMesNome = (mes) => {
    const meses = {
      '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março',
      '04': 'Abril', '05': 'Maio', '06': 'Junho',
      '07': 'Julho', '08': 'Agosto', '09': 'Setembro',
      '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
    }
    return meses[mes] || mes
  }

  const exportToExcel = async () => {
    try {
      // Importar dinamicamente a biblioteca xlsx
      const XLSX = await import('xlsx')
      
      // Preparar dados para exportação
      const dataToExport = filteredContas.map(conta => ({
        'Conta': conta.CONTA,
        'Descrição': conta.DESCRICAO,
        'Saldo Anterior': parseFloat(conta['SALDO ANTERIOR'] || 0),
        'Débito': parseFloat(conta.DEBITO || 0),
        'Crédito': parseFloat(conta.CREDITO || 0),
        'Saldo Atual': parseFloat(conta['SALDO ATUAL'] || 0),
        'Classe': conta.CLASSE,
        'Grupo': conta.GRUPO,
        'Comparativo': conta.COMPARATIVO,
        'Responsável': conta.responsavel,
        'Data Conciliação': conta.dataConciliacao,
        'Status': conta.statusConciliacao
      }))

      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(dataToExport)

      // Configurar larguras das colunas
      const colWidths = [
        { wch: 15 }, // Conta
        { wch: 40 }, // Descrição
        { wch: 15 }, // Saldo Anterior
        { wch: 15 }, // Débito
        { wch: 15 }, // Crédito
        { wch: 15 }, // Saldo Atual
        { wch: 12 }, // Classe
        { wch: 20 }, // Grupo
        { wch: 15 }, // Comparativo
        { wch: 15 }, // Responsável
        { wch: 18 }, // Data Conciliação
        { wch: 15 }  // Status
      ]
      ws['!cols'] = colWidths

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Balancete')

      // Gerar e baixar arquivo
      const fileName = `balancete_${metadata?.mes || 'XX'}_${metadata?.ano || 'XXXX'}.xlsx`
      XLSX.writeFile(wb, fileName)
      
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error)
      alert('Erro ao exportar arquivo. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Botão Voltar */}
        <Button
          variant="ghost"
          onClick={() => navigate('/consulta')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Consulta
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel de Conformidade Contábil
          </h1>
          <p className="text-gray-600">
            {metadata && `${getMesNome(metadata.mes)}/${metadata.ano} - `}
            Controle e acompanhamento das conciliações contábeis mensais - Contas Analíticas
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Contas</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalContas}</div>
              <p className="text-xs text-muted-foreground mt-1">Contas analíticas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Responsável</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{contasSemResponsavel}</div>
              <p className="text-xs text-muted-foreground mt-1">Aguardando atribuição</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{contasPendentes}</div>
              <p className="text-xs text-muted-foreground mt-1">Aguardando conciliação</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conciliadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{contasConciliadas}</div>
              <p className="text-xs text-muted-foreground mt-1">Conciliação finalizada</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela Principal */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Contas Contábeis Analíticas</CardTitle>
              <Button onClick={exportToExcel} variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto table-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">
                      <div className="space-y-2">
                        <div className="font-semibold">Conta</div>
                        <Input
                          placeholder="Filtrar..."
                          value={filterConta}
                          onChange={(e) => setFilterConta(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[300px]">
                      <div className="space-y-2">
                        <div className="font-semibold">Descrição</div>
                        <Input
                          placeholder="Filtrar..."
                          value={filterDescricao}
                          onChange={(e) => setFilterDescricao(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="text-right min-w-[150px]">
                      <div className="font-semibold">Saldo Anterior</div>
                    </TableHead>
                    <TableHead className="text-right min-w-[150px]">
                      <div className="font-semibold">Débito</div>
                    </TableHead>
                    <TableHead className="text-right min-w-[150px]">
                      <div className="font-semibold">Crédito</div>
                    </TableHead>
                    <TableHead className="text-right min-w-[150px]">
                      <div className="font-semibold">Saldo Atual</div>
                    </TableHead>
                    <TableHead className="min-w-[120px]">
                      <div className="space-y-2">
                        <div className="font-semibold">Classe</div>
                        <Select value={filterClasse} onValueChange={setFilterClasse}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Todas" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="SINTETICA">Sintética</SelectItem>
                            <SelectItem value="ANALITICA">Analítica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[150px]">
                      <div className="space-y-2">
                        <div className="font-semibold">Grupo</div>
                        <Select value={filterGrupo} onValueChange={setFilterGrupo}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {gruposUnicos.map(grupo => (
                              <SelectItem key={grupo} value={grupo}>{grupo}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[120px]">
                      <div className="space-y-2">
                        <div className="font-semibold">Comparativo</div>
                        <Select value={filterComparativo} onValueChange={setFilterComparativo}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="OK">OK</SelectItem>
                            <SelectItem value="ERRO">Erro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[200px]">
                      <div className="space-y-2">
                        <div className="font-semibold">Responsável</div>
                        <Select value={filterResponsavel} onValueChange={setFilterResponsavel}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="sem">Sem Responsável</SelectItem>
                            {responsaveis.map(resp => (
                              <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[160px]">
                      <div className="font-semibold">Data Conciliação</div>
                    </TableHead>
                    <TableHead className="min-w-[140px]">
                      <div className="space-y-2">
                        <div className="font-semibold">Status</div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="Pendente">Pendente</SelectItem>
                            <SelectItem value="Conciliado">Conciliado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContas.map((conta) => (
                    <TableRow key={conta.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">{conta.CONTA}</TableCell>
                      <TableCell className="text-sm" title={conta.DESCRICAO}>
                        {conta.DESCRICAO}
                      </TableCell>
                      <TableCell className="text-right currency-value text-sm">
                        {formatCurrency(conta['SALDO ANTERIOR'])}
                      </TableCell>
                      <TableCell className="text-right currency-value text-sm">
                        {formatCurrency(conta.DEBITO)}
                      </TableCell>
                      <TableCell className="text-right currency-value text-sm">
                        {formatCurrency(conta.CREDITO)}
                      </TableCell>
                      <TableCell className="text-right currency-value text-sm">
                        {formatCurrency(conta['SALDO ATUAL'])}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="text-xs">
                          {conta.CLASSE}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{conta.GRUPO}</TableCell>
                      <TableCell>
                        {conta.COMPARATIVO === 'OK' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select 
                            value={conta.responsavel} 
                            onValueChange={(value) => updateResponsavel(conta.id, value)}
                          >
                            <SelectTrigger 
                              className={`w-[160px] text-xs ${!conta.responsavel ? 'border-yellow-400 bg-yellow-50' : ''}`}
                            >
                              <SelectValue placeholder="Selecionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              {responsaveis.map(resp => (
                                <SelectItem key={resp} value={resp}>{resp}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {!conta.responsavel && (
                            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={conta.dataConciliacao}
                          onChange={(e) => updateDataConciliacao(conta.id, e.target.value)}
                          className="w-[140px] text-xs"
                        />
                      </TableCell>
                      <TableCell>
                        {conta.statusConciliacao === 'Conciliado' ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            Conciliado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredContas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma conta encontrada com os filtros aplicados.
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-600">
              Exibindo {filteredContas.length} de {totalContas} contas analíticas
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

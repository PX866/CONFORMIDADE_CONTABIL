import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ref as dbRef, get, set } from 'firebase/database'
import { database } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Upload, CheckCircle, FileJson, ArrowLeft, Edit } from 'lucide-react'

export default function AtualizarBalancete() {
  const [file, setFile] = useState(null)
  const [mes, setMes] = useState('')
  const [ano, setAno] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [balanceteExistente, setBalanceteExistente] = useState(null)
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()

  const meses = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ]

  const anos = []
  const anoAtual = new Date().getFullYear()
  for (let i = anoAtual; i >= anoAtual - 10; i--) {
    anos.push(i.toString())
  }

  useEffect(() => {
    const carregarBalancete = async () => {
      if (!currentUser || !id) return

      try {
        const balanceteRef = dbRef(database, `balancetes/${currentUser.uid}/${id}`)
        const snapshot = await get(balanceteRef)
        
        if (snapshot.exists()) {
          const data = snapshot.val()
          setBalanceteExistente(data)
          setMes(data.mes)
          setAno(data.ano)
        } else {
          setError('Balancete não encontrado')
        }
      } catch (error) {
        console.error('Erro ao carregar balancete:', error)
        setError('Erro ao carregar balancete')
      }
    }

    carregarBalancete()
  }, [currentUser, id])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/json') {
        setError('Por favor, selecione um arquivo JSON válido')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file || !mes || !ano || !balanceteExistente) {
      setError('Por favor, preencha todos os campos')
      return
    }

    try {
      setError('')
      setSuccess(false)
      setLoading(true)

      // Ler o arquivo JSON
      const fileContent = await file.text()
      const jsonData = JSON.parse(fileContent)

      // Validar se é um array
      if (!Array.isArray(jsonData)) {
        throw new Error('O arquivo JSON deve conter um array de contas')
      }

      // Criar mapa das contas existentes para preservar responsável, data e status
      const contasExistentesMap = new Map()
      if (balanceteExistente.contas) {
        balanceteExistente.contas.forEach(conta => {
          contasExistentesMap.set(conta.CONTA, {
            responsavel: conta.responsavel || '',
            dataConciliacao: conta.dataConciliacao || '',
            statusConciliacao: conta.statusConciliacao || 'Pendente'
          })
        })
      }

      // Filtrar apenas contas analíticas e processar dados
      const contasAnaliticas = jsonData
        .filter(conta => conta.CLASSE === 'ANALITICA')
        .map((conta, index) => {
          const contaExistente = contasExistentesMap.get(conta.CONTA)
          return {
            id: `${conta.CONTA}-${index}`,
            ...conta,
            // Preservar dados de conciliação se existirem
            responsavel: contaExistente?.responsavel || '',
            dataConciliacao: contaExistente?.dataConciliacao || '',
            statusConciliacao: contaExistente?.statusConciliacao || 'Pendente'
          }
        })

      // Atualizar balancete no Realtime Database
      const balanceteRef = dbRef(database, `balancetes/${currentUser.uid}/${id}`)
      await set(balanceteRef, {
        ...balanceteExistente, // Preservar dados existentes
        mes,
        ano,
        mesAno: id,
        fileName: file.name,
        uploadDate: balanceteExistente.uploadDate, // Manter data original
        updateDate: new Date().toISOString(), // Adicionar data de atualização
        totalContas: jsonData.length,
        contasAnaliticas: contasAnaliticas.length,
        // Atualizar os dados das contas
        contas: contasAnaliticas
      })

      setSuccess(true)
      setTimeout(() => {
        navigate('/consulta')
      }, 2000)

    } catch (error) {
      console.error('Erro ao atualizar balancete:', error)
      if (error.message.includes('JSON')) {
        setError('Arquivo JSON inválido. Verifique o formato.')
      } else {
        setError('Erro ao atualizar balancete. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!balanceteExistente) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Carregando balancete...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/consulta')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Edit className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Atualizar Balancete</CardTitle>
                <CardDescription>
                  Atualize o arquivo JSON mantendo responsáveis e status de conciliação
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">
                  Balancete atualizado com sucesso! Redirecionando...
                </p>
              </div>
            )}

            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-sm text-yellow-900 mb-2">
                Informações Preservadas
              </h4>
              <p className="text-xs text-yellow-800">
                Os dados de responsável, data de conciliação e status de conciliação serão mantidos para as contas existentes.
                Apenas os dados contábeis (saldos, débitos, créditos) serão atualizados.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="mes">Mês</Label>
                <Select value={mes} onValueChange={setMes} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <Select value={ano} onValueChange={setAno} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {anos.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Novo Arquivo JSON</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                  <input
                    id="file"
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <label
                    htmlFor="file"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <FileJson className="h-12 w-12 text-gray-400" />
                    {file ? (
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          Clique para selecionar o novo arquivo
                        </p>
                        <p className="text-gray-500">Apenas arquivos .json</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !file || !mes || !ano}
              >
                {loading ? (
                  'Atualizando...'
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Atualizar Balancete
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm text-blue-900 mb-2">
                Formato do arquivo JSON
              </h4>
              <p className="text-xs text-blue-800">
                O arquivo deve conter um array de objetos com as seguintes propriedades:
                CONTA, DESCRICAO, SALDO ANTERIOR, DEBITO, CREDITO, SALDO ATUAL, CLASSE, GRUPO, COMPARATIVO
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

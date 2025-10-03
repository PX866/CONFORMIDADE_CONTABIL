import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ref as dbRef, set } from 'firebase/database'
import { database } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Upload, CheckCircle, FileJson, ArrowLeft } from 'lucide-react'

export default function RegistroBalancete() {
  const [file, setFile] = useState(null)
  const [mes, setMes] = useState('')
  const [ano, setAno] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { currentUser } = useAuth()
  const navigate = useNavigate()

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
  for (let i = anoAtual; i <= anoAtual + 10; i++) {
    anos.push(i.toString())
  }

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

    if (!file || !mes || !ano) {
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

      // Criar referência única para o balancete
      const balanceteId = `${ano}-${mes}`

      // Filtrar apenas contas analíticas e processar dados
      const contasAnaliticas = jsonData
        .filter(conta => conta.CLASSE === 'ANALITICA')
        .map((conta, index) => ({
          id: `${conta.CONTA}-${index}`,
          ...conta,
          responsavel: '',
          dataConciliacao: '',
          statusConciliacao: 'Pendente'
        }))

      // Salvar TUDO no Realtime Database (metadados + dados das contas)
      const balanceteRef = dbRef(database, `balancetes/${currentUser.uid}/${balanceteId}`)
      await set(balanceteRef, {
        mes,
        ano,
        mesAno: balanceteId,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        totalContas: jsonData.length,
        contasAnaliticas: contasAnaliticas.length,
        // Salvar os dados das contas diretamente no banco
        contas: contasAnaliticas
      })

      setSuccess(true)
      setTimeout(() => {
        navigate('/consulta')
      }, 2000)

    } catch (error) {
      console.error('Erro ao salvar balancete:', error)
      if (error.message.includes('JSON')) {
        setError('Arquivo JSON inválido. Verifique o formato.')
      } else {
        setError('Erro ao salvar balancete. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
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
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Registro de Balancete</CardTitle>
                <CardDescription>
                  Faça upload do arquivo JSON do balancete contábil
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
                  Balancete registrado com sucesso! Redirecionando...
                </p>
              </div>
            )}

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
                <Label htmlFor="file">Arquivo JSON</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
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
                          Clique para selecionar o arquivo
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
                  'Fazendo upload...'
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Registrar Balancete
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

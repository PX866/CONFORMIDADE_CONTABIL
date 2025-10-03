import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ref as dbRef, get } from 'firebase/database'
import { database } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import PainelConformidade from './PainelConformidade'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default function Painel() {
  const { balanceteId } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [balanceteData, setBalanceteData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadBalancete = async () => {
      try {
        setLoading(true)
        setError('')

        // Buscar dados completos do balancete (metadados + contas)
        const balanceteRef = dbRef(database, `balancetes/${currentUser.uid}/${balanceteId}`)
        const snapshot = await get(balanceteRef)

        if (!snapshot.exists()) {
          setError('Balancete não encontrado')
          return
        }

        const balanceteCompleto = snapshot.val()

        // Verificar se tem dados de contas
        if (!balanceteCompleto.contas || !Array.isArray(balanceteCompleto.contas)) {
          setError('Balancete sem dados de contas')
          return
        }

        setBalanceteData({
          metadata: {
            mes: balanceteCompleto.mes,
            ano: balanceteCompleto.ano,
            fileName: balanceteCompleto.fileName,
            uploadDate: balanceteCompleto.uploadDate,
            totalContas: balanceteCompleto.totalContas,
            contasAnaliticas: balanceteCompleto.contasAnaliticas
          },
          data: balanceteCompleto.contas
        })

      } catch (error) {
        console.error('Erro ao carregar balancete:', error)
        setError('Erro ao carregar balancete. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }

    if (currentUser && balanceteId) {
      loadBalancete()
    }
  }, [currentUser, balanceteId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600">Carregando balancete...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">{error}</h3>
            <Button onClick={() => navigate('/consulta')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Consulta
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!balanceteData) {
    return null
  }

  return <PainelConformidade balanceteData={balanceteData.data} metadata={balanceteData.metadata} />
}

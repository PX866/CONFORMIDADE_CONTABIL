import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ref as dbRef, onValue, remove } from 'firebase/database'
import { database } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut, Plus, FileText, Calendar, TrendingUp, Trash2, Edit } from 'lucide-react'

export default function ConsultaBalancete() {
  const [balancetes, setBalancetes] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) return

    const balancetesRef = dbRef(database, `balancetes/${currentUser.uid}`)
    
    const unsubscribe = onValue(balancetesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const balancetesArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }))
        // Ordenar por ano e mês (mais recente primeiro)
        balancetesArray.sort((a, b) => {
          const dateA = new Date(a.ano, parseInt(a.mes) - 1)
          const dateB = new Date(b.ano, parseInt(b.mes) - 1)
          return dateB - dateA
        })
        setBalancetes(balancetesArray)
      } else {
        setBalancetes([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser])

  const handleDeleteBalancete = async (balanceteId) => {
    if (window.confirm("Tem certeza que deseja excluir este balancete? Esta ação não pode ser desfeita.")) {
      try {
        await remove(dbRef(database, `balancetes/${currentUser.uid}/${balanceteId}`));
        // A atualização do estado `balancetes` é tratada pelo `onValue` listener
        console.log(`Balancete ${balanceteId} excluído com sucesso.`);
      } catch (error) {
        console.error("Erro ao excluir balancete:", error);
        alert("Erro ao excluir balancete. Tente novamente.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const getMesNome = (mes) => {
    const meses = {
      '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março',
      '04': 'Abril', '05': 'Maio', '06': 'Junho',
      '07': 'Julho', '08': 'Agosto', '09': 'Setembro',
      '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
    }
    return meses[mes] || mes
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Painel de Conformidade Contábil
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {currentUser?.email}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Balancetes Registrados
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Selecione um balancete para visualizar o painel de conformidade
            </p>
          </div>
          <Button onClick={() => navigate('/registro')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Balancete
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Carregando balancetes...</p>
          </div>
        ) : balancetes.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum balancete registrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece registrando seu primeiro balancete contábil
                </p>
                <Button onClick={() => navigate('/registro')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Balancete
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {balancetes.map((balancete) => (
              <Card
                key={balancete.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/painel/${balancete.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {getMesNome(balancete.mes)} {balancete.ano}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {balancete.fileName}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total de Contas</span>
                      <Badge variant="secondary">{balancete.totalContas}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Contas Analíticas</span>
                      <Badge variant="default">{balancete.contasAnaliticas}</Badge>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500">
                        Registrado em {formatDate(balancete.uploadDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button className="flex-1" variant="outline" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/painel/${balancete.id}`);
                    }}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Visualizar Painel
                    </Button>
                    <div className="flex gap-1">
                      <Button variant="secondary" size="icon" onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/atualizar/${balancete.id}`);
                      }} title="Editar balancete">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBalancete(balancete.id);
                      }} title="Excluir balancete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

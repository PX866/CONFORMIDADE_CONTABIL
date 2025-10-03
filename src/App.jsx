import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ConsultaBalancete from './pages/ConsultaBalancete'
import RegistroBalancete from './pages/RegistroBalancete'
import AtualizarBalancete from './pages/AtualizarBalancete'
import Painel from './pages/Painel'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/consulta"
            element={
              <PrivateRoute>
                <ConsultaBalancete />
              </PrivateRoute>
            }
          />
          <Route
            path="/registro"
            element={
              <PrivateRoute>
                <RegistroBalancete />
              </PrivateRoute>
            }
          />
          <Route
            path="/atualizar/:id"
            element={
              <PrivateRoute>
                <AtualizarBalancete />
              </PrivateRoute>
            }
          />
          <Route
            path="/painel/:balanceteId"
            element={
              <PrivateRoute>
                <Painel />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App

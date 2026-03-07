import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import PlayerView from './pages/PlayerView'
import GMView from './pages/GMView'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/player" 
            element={
              <ProtectedRoute>
                <PlayerView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/gm" 
            element={
              <ProtectedRoute requireGm={true}>
                <GMView />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

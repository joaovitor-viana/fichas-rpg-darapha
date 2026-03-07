import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import PlayerView from './pages/PlayerView'
import GMView from './pages/GMView'
import JoinCampaign from './pages/JoinCampaign'
import Demo from './pages/Demo'
import { useAuth } from './context/AuthContext'
import { Navigate } from 'react-router-dom'

function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/demo" element={<Demo />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/character/:id" 
          element={
            <ProtectedRoute>
              <PlayerView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/campaign/:id" 
          element={
            <ProtectedRoute>
              <GMView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/join/:id" 
          element={
            <ProtectedRoute>
              <JoinCampaign />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  )
}

export default App

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './layout/Layout'
import Home from './pages/Home'
import HowItWorks from './pages/HowItWorks'
import About from './pages/About'
import Safety from './pages/Safety'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
)

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return <Spinner />
  if (!isLoggedIn) return <Navigate to="/register" replace />
  return children
}

const AuthRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return <Spinner />
  if (isLoggedIn) return <Navigate to="/" replace />
  return children
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login"           element={<AuthRoute><LoginPage /></AuthRoute>} />
    <Route path="/register"        element={<AuthRoute><RegisterPage /></AuthRoute>} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password"  element={<ResetPasswordPage />} />

    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route path="/"             element={<Home />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/about"        element={<About />} />
      <Route path="/safety"       element={<Safety />} />
      <Route path="/profile"      element={<ProfilePage />} />
    </Route>

    <Route path="*" element={<Navigate to="/register" replace />} />
  </Routes>
)

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  </ThemeProvider>
)

export default App
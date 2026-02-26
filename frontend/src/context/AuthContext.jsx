import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'
const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('dermassist_token'))
  const [loading, setLoading] = useState(true)

  // On mount — verify token and load user profile
  useEffect(() => {
    const savedToken = localStorage.getItem('dermassist_token')
    if (!savedToken) {
      setLoading(false)
      return
    }
    axios.get(`${API}/user/me`, {
      headers: { Authorization: `Bearer ${savedToken}` }
    })
      .then(res => {
        setUser(res.data)
        setToken(savedToken)
      })
      .catch(() => {
        localStorage.removeItem('dermassist_token')
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async (data) => {
    const res = await axios.post(`${API}/auth/register`, data)
    const newToken = res.data.access_token

    // Fetch full profile after registering
    const profileRes = await axios.get(`${API}/user/me`, {
      headers: { Authorization: `Bearer ${newToken}` }
    })

    localStorage.setItem('dermassist_token', newToken)
    setToken(newToken)
    setUser(profileRes.data)
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (username, password) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)

    const res = await axios.post(`${API}/auth/login`, formData)
    const newToken = res.data.access_token

    // Fetch full profile after login
    const profileRes = await axios.get(`${API}/user/me`, {
      headers: { Authorization: `Bearer ${newToken}` }
    })

    localStorage.setItem('dermassist_token', newToken)
    setToken(newToken)
    setUser(profileRes.data)
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('dermassist_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isLoggedIn: !!token && !!user,
      register,
      login,
      logout,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export default AuthContext
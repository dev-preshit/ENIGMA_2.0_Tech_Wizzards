import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, Activity, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const LoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm]                 = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [focused, setFocused]           = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden
                    bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50
                    dark:bg-none dark:bg-[#060d1f]">

      {/* ── Animated background blobs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 dark:opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20 dark:opacity-10"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }}
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-10 dark:opacity-5"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">

        {/* ── Logo ── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl shadow-2xl mb-5 relative"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
          >
            <Activity className="w-10 h-10 text-white" />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', filter: 'blur(8px)' }}
            />
          </motion.div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-gray-500 dark:text-blue-300/60 mt-2 font-medium">
            Sign in to your DermAssist AI account
          </p>
        </motion.div>

        {/* ── Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="rounded-3xl p-8 shadow-2xl border
                     bg-white/80 backdrop-blur-xl border-white/60
                     dark:bg-[#0d1f3c]/80 dark:border-[#1a3260]/80 dark:backdrop-blur-xl"
          style={{ boxShadow: '0 24px 64px rgba(59,130,246,0.12)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex items-center gap-3 p-4 rounded-2xl text-sm font-medium
                           bg-red-50 border border-red-200 text-red-700
                           dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-blue-200/80 mb-2">
                Username or Email
              </label>
              <motion.div
                animate={{ scale: focused === 'username' ? 1.01 : 1 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200
                  ${focused === 'username' ? 'text-blue-500' : 'text-gray-400 dark:text-blue-300/40'}`}
                />
                <input
                  type="text" name="username" value={form.username}
                  onChange={handleChange}
                  onFocus={() => setFocused('username')}
                  onBlur={() => setFocused('')}
                  placeholder="Enter your username or email"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border text-sm font-medium outline-none transition-all duration-200
                             bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                             focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                             dark:bg-[#070e1c] dark:border-[#1a3260] dark:text-[#e8f0ff] dark:placeholder-[#2d4a78]
                             dark:focus:bg-[#0d1f3c] dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                />
              </motion.div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-blue-200/80">
                  Password
                </label>
                <Link to="/forgot-password"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <motion.div
                animate={{ scale: focused === 'password' ? 1.01 : 1 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200
                  ${focused === 'password' ? 'text-blue-500' : 'text-gray-400 dark:text-blue-300/40'}`}
                />
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl border text-sm font-medium outline-none transition-all duration-200
                             bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400
                             focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                             dark:bg-[#070e1c] dark:border-[#1a3260] dark:text-[#e8f0ff] dark:placeholder-[#2d4a78]
                             dark:focus:bg-[#0d1f3c] dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-blue-300/40 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </motion.div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl
                         text-white font-bold text-sm tracking-wide
                         disabled:opacity-70 disabled:cursor-not-allowed
                         transition-all duration-200 mt-2 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                       boxShadow: '0 8px 24px rgba(59,130,246,0.35)' }}
            >
              <motion.div
                animate={{ x: loading ? 0 : ['100%', '-100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 opacity-20"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
              />
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Signing in...</>
                : <><Sparkles className="w-4 h-4" /> Sign In</>
              }
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-[#1a3260]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-[#0d1f3c] text-gray-400 dark:text-[#2d4a78] font-medium">
                Don't have an account?
              </span>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Link to="/register"
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-2xl
                         border-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-500/60
                         font-bold text-sm hover:bg-blue-50 dark:hover:bg-blue-500/10
                         transition-all duration-200"
            >
              Create Free Account
            </Link>
          </motion.div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-6 mt-6 flex-wrap"
        >
          {[
            { icon: '🔒', text: 'Secure Login' },
            { icon: '🏥', text: 'Medical Grade' },
            { icon: '⚡', text: 'Instant Access' },
          ].map(b => (
            <div key={b.text} className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-[#2d4a78] font-medium">
              <span>{b.icon}</span>{b.text}
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  )
}

export default LoginPage
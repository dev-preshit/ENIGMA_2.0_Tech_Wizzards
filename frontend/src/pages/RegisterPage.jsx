import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle, Loader2, Activity, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say']

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains a number',     pass: /\d/.test(password) },
    { label: 'Contains uppercase',    pass: /[A-Z]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-emerald-500']
  const labels = ['Weak', 'Fair', 'Strong']

  if (!password) return null

  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : 'bg-gray-200 dark:bg-[#1a3260]'}`}
            />
          ))}
        </div>
        {score > 0 && (
          <span className={`text-xs font-bold ${score === 3 ? 'text-emerald-500' : score === 2 ? 'text-amber-500' : 'text-red-400'}`}>
            {labels[score - 1]}
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1">
        {checks.map((c, i) => (
          <div key={i} className={`flex items-center gap-1 text-[10px] font-medium ${c.pass ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-[#2d4a78]'}`}>
            <CheckCircle className={`w-3 h-3 flex-shrink-0 ${c.pass ? 'text-emerald-500' : 'text-gray-300 dark:text-[#1a3260]'}`} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  )
}

const InputField = ({ label, required, icon: Icon, error, success, children, hint }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 dark:text-blue-200/80 mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
      {hint && <span className="text-gray-400 dark:text-[#2d4a78] font-normal ml-1">{hint}</span>}
    </label>
    <div className={`relative rounded-2xl border transition-all duration-200
      ${error   ? 'border-red-400 ring-4 ring-red-500/10 bg-red-50 dark:bg-red-900/10'
      : success ? 'border-emerald-400 ring-4 ring-emerald-500/10 bg-emerald-50 dark:bg-emerald-900/10'
      : 'border-gray-200 dark:border-[#1a3260]'}`}
    >
      {children}
    </div>
  </div>
)

const RegisterPage = () => {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState({
    full_name: '', username: '', email: '',
    password: '', confirm_password: '',
    phone_number: '', gender: '', date_of_birth: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await register({
        full_name:    form.full_name,
        username:     form.username,
        email:        form.email,
        password:     form.password,
        phone_number: form.phone_number    || null,
        gender:       form.gender          || null,
        date_of_birth: form.date_of_birth  || null,
      })
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full py-3 pr-4 text-sm font-medium outline-none transition-all duration-200 rounded-2xl
    bg-transparent text-gray-900 placeholder-gray-400
    dark:text-[#e8f0ff] dark:placeholder-[#2d4a78]`

  const pwMatch = form.confirm_password && form.password === form.confirm_password
  const pwMismatch = form.confirm_password && form.password !== form.confirm_password

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 py-12 overflow-hidden
                    bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50
                    dark:bg-none dark:bg-[#060d1f]">

      {/* ── Animated blobs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 dark:opacity-8"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }}
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 dark:opacity-8"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
        />
      </div>

      <div className="w-full max-w-lg relative z-10">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="text-center mb-7"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: -5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl shadow-2xl mb-4 relative"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
          >
            <Activity className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Create your account
          </h1>
          <p className="text-gray-500 dark:text-blue-300/60 mt-1.5 font-medium">
            Join DermAssist AI — free skin screening, anytime
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="rounded-3xl p-8 shadow-2xl border
                     bg-white/80 backdrop-blur-xl border-white/60
                     dark:bg-[#0d1f3c]/80 dark:border-[#1a3260]/80"
          style={{ boxShadow: '0 24px 64px rgba(59,130,246,0.12)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex items-center gap-3 p-4 rounded-2xl text-sm font-medium
                           bg-red-50 border border-red-200 text-red-700
                           dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </motion.div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-blue-200/80 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className={`relative rounded-2xl border transition-all duration-200
                ${focused === 'full_name'
                  ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white dark:bg-[#0d1f3c]'
                  : 'border-gray-200 dark:border-[#1a3260] bg-gray-50 dark:bg-[#070e1c]'}`}
              >
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors
                  ${focused === 'full_name' ? 'text-blue-500' : 'text-gray-400 dark:text-[#2d4a78]'}`}
                />
                <input type="text" name="full_name" value={form.full_name} onChange={handleChange}
                  onFocus={() => setFocused('full_name')} onBlur={() => setFocused('')}
                  placeholder="Kartik Pavan"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            {/* Username + Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-blue-200/80 mb-1.5">
                  Username <span className="text-red-400">*</span>
                </label>
                <div className={`relative rounded-2xl border transition-all duration-200
                  ${focused === 'username'
                    ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white dark:bg-[#0d1f3c]'
                    : 'border-gray-200 dark:border-[#1a3260] bg-gray-50 dark:bg-[#070e1c]'}`}
                >
                  <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold transition-colors
                    ${focused === 'username' ? 'text-blue-500' : 'text-gray-400 dark:text-[#2d4a78]'}`}>@</span>
                  <input type="text" name="username" value={form.username} onChange={handleChange}
                    onFocus={() => setFocused('username')} onBlur={() => setFocused('')}
                    placeholder="kartik"
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-blue-200/80 mb-1.5">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all duration-200
                             bg-gray-50 border-gray-200 text-gray-700
                             focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                             dark:bg-[#070e1c] dark:border-[#1a3260] dark:text-[#e8f0ff]
                             dark:focus:bg-[#0d1f3c] dark:focus:border-blue-500"
                >
                  <option value="">Select...</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-blue-200/80 mb-1.5">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className={`relative rounded-2xl border transition-all duration-200
                ${focused === 'email'
                  ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white dark:bg-[#0d1f3c]'
                  : 'border-gray-200 dark:border-[#1a3260] bg-gray-50 dark:bg-[#070e1c]'}`}
              >
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors
                  ${focused === 'email' ? 'text-blue-500' : 'text-gray-400 dark:text-[#2d4a78]'}`}
                />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                  placeholder="you@example.com"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            {/* DOB + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-blue-200/80 mb-1.5">
                  Date of Birth <span className="text-red-400">*</span>
                </label>
                <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-2xl border text-sm font-medium outline-none transition-all duration-200
                             bg-gray-50 border-gray-200 text-gray-700
                             focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                             dark:bg-[#070e1c] dark:border-[#1a3260] dark:text-[#e8f0ff]
                             dark:focus:bg-[#0d1f3c] dark:focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-blue-200/80 mb-1.5">
                  Phone <span className="text-gray-400 dark:text-[#2d4a78] font-normal">(optional)</span>
                </label>
                <div className={`relative rounded-2xl border transition-all duration-200
                  ${focused === 'phone'
                    ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white dark:bg-[#0d1f3c]'
                    : 'border-gray-200 dark:border-[#1a3260] bg-gray-50 dark:bg-[#070e1c]'}`}
                >
                  <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors
                    ${focused === 'phone' ? 'text-blue-500' : 'text-gray-400 dark:text-[#2d4a78]'}`}
                  />
                  <input type="tel" name="phone_number" value={form.phone_number} onChange={handleChange}
                    onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                    placeholder="+91 98765..."
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-blue-200/80 mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className={`relative rounded-2xl border transition-all duration-200
                ${focused === 'password'
                  ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white dark:bg-[#0d1f3c]'
                  : 'border-gray-200 dark:border-[#1a3260] bg-gray-50 dark:bg-[#070e1c]'}`}
              >
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors
                  ${focused === 'password' ? 'text-blue-500' : 'text-gray-400 dark:text-[#2d4a78]'}`}
                />
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                  placeholder="Create a strong password"
                  className={`${inputClass} pl-11 pr-11`}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#2d4a78] hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-blue-200/80 mb-1.5">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className={`relative rounded-2xl border transition-all duration-200
                ${pwMismatch ? 'border-red-400 ring-4 ring-red-500/10 bg-red-50 dark:bg-red-900/10'
                : pwMatch    ? 'border-emerald-400 ring-4 ring-emerald-500/10 bg-emerald-50 dark:bg-emerald-900/10'
                : focused === 'confirm' ? 'border-blue-500 ring-4 ring-blue-500/10 bg-white dark:bg-[#0d1f3c]'
                : 'border-gray-200 dark:border-[#1a3260] bg-gray-50 dark:bg-[#070e1c]'}`}
              >
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#2d4a78]" />
                <input type={showConfirm ? 'text' : 'password'} name="confirm_password"
                  value={form.confirm_password} onChange={handleChange}
                  onFocus={() => setFocused('confirm')} onBlur={() => setFocused('')}
                  placeholder="Repeat your password"
                  className={`${inputClass} pl-11 pr-11`}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#2d4a78] hover:text-blue-500 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pwMismatch && <p className="text-xs text-red-500 mt-1.5 font-medium">Passwords do not match</p>}
              {pwMatch    && <p className="text-xs text-emerald-500 mt-1.5 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Passwords match!</p>}
            </div>

            {/* Submit */}
            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl
                         text-white font-bold text-sm tracking-wide mt-2
                         disabled:opacity-70 disabled:cursor-not-allowed
                         transition-all duration-200 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                       boxShadow: '0 8px 24px rgba(59,130,246,0.35)' }}
            >
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating account...</>
                : <><Sparkles className="w-4 h-4" /> Create Account</>
              }
            </motion.button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-[#1a3260]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-[#0d1f3c] text-gray-400 dark:text-[#2d4a78] font-medium">
                Already have an account?
              </span>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Link to="/login"
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-2xl
                         border-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-500/60
                         font-bold text-sm hover:bg-blue-50 dark:hover:bg-blue-500/10
                         transition-all duration-200"
            >
              Sign In Instead
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-6 mt-5 flex-wrap"
        >
          {[
            { icon: '🔒', text: 'Data Encrypted' },
            { icon: '🏥', text: 'HIPAA-aligned' },
            { icon: '🆓', text: 'Always Free' },
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

export default RegisterPage
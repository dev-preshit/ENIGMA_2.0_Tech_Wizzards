import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, Calendar, Shield, Clock,
  Activity, AlertTriangle, CheckCircle, TrendingUp,
  Eye, ChevronRight, Scan, Edit3, Save, X, Check, Download
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = 'http://localhost:8000'

const RISK_STYLES = {
  'High Risk':     { badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/25 dark:text-red-400 dark:border-red-800/50',     bar: 'bg-red-500',     dot: 'bg-red-500' },
  'Moderate Risk': { badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/25 dark:text-amber-400 dark:border-amber-800/50', bar: 'bg-amber-400', dot: 'bg-amber-400' },
  'Low Risk':      { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/25 dark:text-emerald-400 dark:border-emerald-800/50', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
}

const NAME_MAP = {
  mel: 'Melanoma', bcc: 'Basal Cell Carcinoma', akiec: 'Actinic Keratosis',
  bkl: 'Benign Keratosis', df: 'Dermatofibroma', vasc: 'Vascular Lesion', nv: 'Melanocytic Nevi',
}

// ── Animated stat ring ────────────────────────────────────────────────────────
const StatRing = ({ value, max, color, size = 80 }) => {
  const r    = size / 2 - 6
  const circ = 2 * Math.PI * r
  const pct  = max > 0 ? Math.min(value / max, 1) : 0
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        className="stroke-gray-100 dark:stroke-[#1a3260]" strokeWidth="6" />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="6" strokeLinecap="round"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - pct * circ }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
        strokeDasharray={circ}
        style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
      />
    </svg>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, ringColor, max, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="rounded-2xl p-5 border flex items-center gap-4 relative overflow-hidden
               bg-white border-blue-50 shadow-sm hover:shadow-md transition-all duration-300
               dark:bg-[#0d1f3c] dark:border-[#1a3260] dark:hover:border-[#2d5aaa]"
  >
    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10"
      style={{ background: ringColor }} />
    <div className="relative">
      <StatRing value={value} max={max || Math.max(value, 1)} color={ringColor} size={64} />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="w-5 h-5" style={{ color: ringColor }} />
      </div>
    </div>
    <div>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.6 }}
        className="text-2xl font-black text-gray-900 dark:text-[#e8f0ff]"
      >
        {value}
      </motion.p>
      <p className="text-sm text-gray-500 dark:text-[#6b8fc2] font-medium">{label}</p>
    </div>
  </motion.div>
)

// ── Scan History Card ─────────────────────────────────────────────────────────
const ScanCard = ({ scan, index, token }) => {
  const risk  = scan.risk_level || 'Low Risk'
  const style = RISK_STYLES[risk] || RISK_STYLES['Low Risk']
  const name  = NAME_MAP[scan.predicted_label] || scan.predicted_label
  const conf  = scan.confidence_score ? Math.round(scan.confidence_score * 100) : 0
  const date  = scan.created_at
    ? new Date(scan.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : 'Unknown date'

  const [downloading, setDownloading] = useState(false)

  const handleDownload = async (e) => {
    e.stopPropagation()
    setDownloading(true)
    try {
      const res = await fetch(`${API}/user/scans/${scan.id}/report`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `DermAssist_Report_Scan${scan.id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to download report. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ x: 4, transition: { duration: 0.15 } }}
      className="rounded-2xl border p-4 flex items-center gap-4 cursor-pointer
                 bg-white border-gray-100 shadow-sm hover:shadow-md
                 dark:bg-[#0d1f3c] dark:border-[#1a3260] dark:hover:border-[#2d5aaa]
                 transition-all duration-200 group"
    >
      {/* Risk bar */}
      <div className={`w-1.5 h-12 rounded-full flex-shrink-0 ${style.dot}`} />

      {/* Thumbnail */}
      {scan.image_url ? (
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-[#112248]">
          <img src={`${API}${scan.image_url}`} alt="scan"
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none' }}
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center
                        bg-gray-100 dark:bg-[#112248]">
          <Scan className="w-5 h-5 text-gray-400 dark:text-[#2d4a78]" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-gray-900 dark:text-[#e8f0ff] text-sm">{name}</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${style.badge}`}>
            {risk}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <Clock className="w-3 h-3 text-gray-400 dark:text-[#2d4a78]" />
          <span className="text-xs text-gray-500 dark:text-[#6b8fc2]">{date}</span>
        </div>
      </div>

      {/* Confidence */}
      <div className="text-right flex-shrink-0">
        <p className="text-lg font-black text-gray-800 dark:text-[#e8f0ff]">{conf}%</p>
        <div className="w-16 h-1.5 bg-gray-100 dark:bg-[#1a3260] rounded-full mt-1 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${conf}%` }}
            transition={{ delay: index * 0.06 + 0.3, duration: 0.6, ease: 'easeOut' }}
            className={`h-full rounded-full ${style.dot}`}
          />
        </div>
        <p className="text-[9px] text-gray-400 dark:text-[#2d4a78] mt-0.5">confidence</p>
      </div>

      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-[#1a3260] group-hover:text-blue-400 transition-colors flex-shrink-0" />

      {/* Download PDF */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        title="Download PDF Report"
        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
                   bg-blue-50 dark:bg-[#112248] hover:bg-blue-100 dark:hover:bg-[#1a3260]
                   text-blue-500 dark:text-blue-400 transition-colors disabled:opacity-50"
      >
        {downloading
          ? <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          : <Download className="w-3.5 h-3.5" />
        }
      </button>
    </motion.div>
  )
}

// ── Info Row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="flex items-center gap-4 p-4 rounded-2xl
               bg-gray-50 dark:bg-[#070e1c]
               border border-gray-100 dark:border-[#1a3260]
               hover:border-blue-200 dark:hover:border-[#2d5aaa]
               transition-all duration-200 group"
  >
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                    bg-blue-50 dark:bg-[#112248] group-hover:bg-blue-100 dark:group-hover:bg-[#1a3260]
                    transition-colors duration-200">
      <Icon className="w-4 h-4 text-blue-500 dark:text-blue-400" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] text-gray-400 dark:text-[#2d4a78] font-bold uppercase tracking-widest">
        {label}
      </p>
      <p className="text-gray-800 dark:text-[#e8f0ff] font-semibold text-sm truncate mt-0.5">
        {value || '—'}
      </p>
    </div>
  </motion.div>
)

// ── Edit Profile Modal ────────────────────────────────────────────────────────
const EditProfileModal = ({ user, token, onClose, onSaved }) => {
  const [form, setForm]       = useState({
    full_name:    user?.full_name    || '',
    phone_number: user?.phone_number || '',
    gender:       user?.gender       || '',
  })
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (!form.full_name.trim()) { setError('Full name is required.'); return }
    setSaving(true); setError('')
    try {
      await axios.put(`${API}/auth/profile`, form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSuccess(true)
      setTimeout(() => {
        onSaved(form)
        onClose()
      }, 800)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200
    bg-gray-50 dark:bg-[#070e1c] border-gray-200 dark:border-[#1a3260]
    text-gray-900 dark:text-[#e8f0ff] placeholder-gray-400 dark:placeholder-[#2d4a78]
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border shadow-2xl
                   bg-white dark:bg-[#0d1f3c] border-blue-50 dark:border-[#1a3260]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-[#1a3260]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-[#e8f0ff]">Edit Profile</h3>
              <p className="text-xs text-gray-400 dark:text-[#2d4a78]">Update your personal details</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center
                       bg-gray-100 dark:bg-[#112248] hover:bg-gray-200 dark:hover:bg-[#1a3260]
                       text-gray-500 dark:text-[#6b8fc2] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                         text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2"
            >
              <X className="w-4 h-4 flex-shrink-0" /> {error}
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800
                         text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2"
            >
              <Check className="w-4 h-4 flex-shrink-0" /> Profile updated successfully!
            </motion.div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-[#6b8fc2] uppercase tracking-widest mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#2d4a78]" />
              <input type="text" value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="Your full name"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-[#6b8fc2] uppercase tracking-widest mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#2d4a78]" />
              <input type="tel" value={form.phone_number}
                onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))}
                placeholder="+91 00000 00000"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-[#6b8fc2] uppercase tracking-widest mb-2">
              Gender
            </label>
            <div className="flex gap-2">
              {['Male', 'Female', 'Other', 'N/A'].map(g => (
                <button key={g} type="button"
                  onClick={() => setForm(f => ({ ...f, gender: f.gender === g ? '' : g }))}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                    form.gender === g
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-gray-50 dark:bg-[#070e1c] text-gray-600 dark:text-[#6b8fc2] border-gray-200 dark:border-[#1a3260] hover:border-blue-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-[#2d4a78] text-center pt-1">
            📧 Email, username and date of birth cannot be changed
          </p>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-[#1a3260]
                       text-gray-600 dark:text-[#6b8fc2] font-bold text-sm
                       hover:bg-gray-50 dark:hover:bg-[#112248] transition-colors"
          >
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || success}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white
                       flex items-center justify-center gap-2 transition-all duration-200
                       disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : success ? (
              <><Check className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Profile Page ─────────────────────────────────────────────────────────
const ProfilePage = () => {
  const { user, token, setUser } = useAuth()
  const [scans,          setScans]          = useState([])
  const [loadingScans,   setLoadingScans]   = useState(true)
  const [activeTab,      setActiveTab]      = useState('profile')
  const [showEditModal,  setShowEditModal]  = useState(false)

  useEffect(() => {
    if (token) {
      axios.get(`${API}/user/scans`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setScans(res.data))
        .catch(() => setScans([]))
        .finally(() => setLoadingScans(false))
    }
  }, [token])

  const total    = scans.length
  const highRisk = scans.filter(s => s.risk_level === 'High Risk').length
  const safe     = total - highRisk

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  const handleProfileSaved = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }))
  }

  const tabs = [
    { id: 'profile', label: '👤 Profile' },
    { id: 'history', label: '🕐 Scan History' },
  ]

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/50
                    dark:bg-none dark:bg-[#060d1f]">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* ── Header card ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl p-6 border relative overflow-hidden
                     bg-white border-blue-50 shadow-lg
                     dark:bg-[#0d1f3c] dark:border-[#1a3260]"
          style={{ boxShadow: '0 8px 40px rgba(59,130,246,0.1)' }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 opacity-5 dark:opacity-10"
            style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', transform: 'translate(30%, -30%)' }}
          />

          <div className="flex items-center gap-5 relative">
            {/* Avatar */}
            <motion.div whileHover={{ scale: 1.05 }} className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-xl"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                {getInitials(user?.full_name)}
              </div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', filter: 'blur(8px)' }}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white dark:border-[#0d1f3c]" />
            </motion.div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-gray-900 dark:text-[#e8f0ff] truncate">
                {user?.full_name}
              </h1>
              <p className="text-gray-500 dark:text-[#6b8fc2] font-medium">@{user?.username}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                                 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  <Shield className="w-3 h-3" /> {user?.role || 'user'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                                 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                                 bg-gray-100 text-gray-600 dark:bg-[#112248] dark:text-[#6b8fc2]">
                  <TrendingUp className="w-3 h-3" /> {total} scan{total !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Edit Profile button */}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowEditModal(true)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl
                         text-sm font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:block">Edit Profile</span>
            </motion.button>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Activity}      label="Total Scans"        value={total}    max={total} ringColor="#3b82f6" delay={0.1} />
          <StatCard icon={AlertTriangle} label="High Risk Findings" value={highRisk} max={total} ringColor="#ef4444" delay={0.2} />
          <StatCard icon={CheckCircle}   label="Safe Results"       value={safe}     max={total} ringColor="#10b981" delay={0.3} />
        </div>

        {/* ── Tabs ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex gap-1 p-1 rounded-2xl w-fit
                     bg-gray-100 dark:bg-[#0d1f3c] border border-transparent dark:border-[#1a3260]"
        >
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#112248] text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-[#6b8fc2] hover:text-gray-700 dark:hover:text-[#a8c0e8]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* ── Tab Content ── */}
        <AnimatePresence mode="wait">

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}
              className="rounded-3xl p-6 border shadow-sm
                         bg-white border-blue-50
                         dark:bg-[#0d1f3c] dark:border-[#1a3260]"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-gray-900 dark:text-[#e8f0ff] flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" /> Personal Information
                </h2>
                <button onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                             text-blue-600 dark:text-blue-400
                             bg-blue-50 dark:bg-blue-900/20
                             border border-blue-200 dark:border-blue-800
                             hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow icon={User}     label="Full Name"     value={user?.full_name}               delay={0.05} />
                <InfoRow icon={Mail}     label="Email"         value={user?.email}                   delay={0.10} />
                <InfoRow icon={User}     label="Username"      value={`@${user?.username || '—'}`}   delay={0.15} />
                <InfoRow icon={Calendar} label="Date of Birth" value={user?.date_of_birth}           delay={0.20} />
                <InfoRow icon={Phone}    label="Phone"         value={user?.phone_number}            delay={0.25} />
                <InfoRow icon={User}     label="Gender"        value={user?.gender}                  delay={0.30} />
              </div>
            </motion.div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-gray-900 dark:text-[#e8f0ff] flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-500" /> Scan History
                </h2>
                <span className="text-sm text-gray-400 dark:text-[#2d4a78] font-medium bg-gray-100 dark:bg-[#112248] px-3 py-1 rounded-full">
                  {total} scan{total !== 1 ? 's' : ''}
                </span>
              </div>

              {loadingScans ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-400 dark:text-[#2d4a78] text-sm font-medium">Loading your scans...</p>
                </div>
              ) : scans.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl border p-14 text-center
                             bg-white border-gray-100 shadow-sm
                             dark:bg-[#0d1f3c] dark:border-[#1a3260]"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Activity className="w-14 h-14 text-gray-200 dark:text-[#1a3260] mx-auto mb-4" />
                  </motion.div>
                  <p className="text-gray-600 dark:text-[#6b8fc2] font-bold text-lg">No scans yet</p>
                  <p className="text-gray-400 dark:text-[#2d4a78] text-sm mt-1.5 font-medium">
                    Upload a skin image on the home page to get started
                  </p>
                </motion.div>
              ) : (
                scans.map((scan, i) => (
                  <ScanCard key={scan.id} scan={scan} index={i} token={token} />
                ))
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <EditProfileModal
            user={user}
            token={token}
            onClose={() => setShowEditModal(false)}
            onSaved={handleProfileSaved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfilePage
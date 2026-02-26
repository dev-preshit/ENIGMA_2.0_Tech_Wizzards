import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { ArrowRight, Upload, X, Sparkles, Shield, Zap, Brain, Download } from 'lucide-react'
import UploadCard from '../components/UploadCard'
import ProcessingLoader from '../components/ProcessingLoader'
import ResultCard from '../components/ResultCard'
import ExplainableAI from '../components/ExplainableAI'
import RecommendationPanel from '../components/RecommendationPanel'
import { useAuth } from '../context/AuthContext'

const LESION_CLASSES = [
  { code:'mel',   name:'Melanoma',             short:'MEL',  risk:'High',     riskColor:'#ef4444', bg:'#fef2f2', darkBg:'rgba(239,68,68,0.12)', border:'#fecaca', icon:'🔴', desc:'Most dangerous form of skin cancer. Arises from pigment-producing melanocytes.' },
  { code:'bcc',   name:'Basal Cell Carcinoma', short:'BCC',  risk:'High',     riskColor:'#ef4444', bg:'#fef2f2', darkBg:'rgba(239,68,68,0.12)', border:'#fecaca', icon:'🟥', desc:'Most common skin cancer. Rarely spreads but requires prompt treatment.' },
  { code:'akiec', name:'Actinic Keratosis',    short:'AK',   risk:'High',     riskColor:'#ef4444', bg:'#fef2f2', darkBg:'rgba(239,68,68,0.12)', border:'#fecaca', icon:'⚠️', desc:'Precancerous lesion caused by UV damage. Can evolve into squamous cell carcinoma.' },
  { code:'bkl',   name:'Benign Keratosis',     short:'BKL',  risk:'Moderate', riskColor:'#f59e0b', bg:'#fffbeb', darkBg:'rgba(245,158,11,0.12)', border:'#fde68a', icon:'🟡', desc:'Non-cancerous skin growth. Includes seborrheic keratoses and solar lentigines.' },
  { code:'df',    name:'Dermatofibroma',        short:'DF',   risk:'Moderate', riskColor:'#f59e0b', bg:'#fffbeb', darkBg:'rgba(245,158,11,0.12)', border:'#fde68a', icon:'🟠', desc:'Benign fibrous nodule in the skin. Generally harmless and rarely needs treatment.' },
  { code:'vasc',  name:'Vascular Lesion',       short:'VASC', risk:'Moderate', riskColor:'#f59e0b', bg:'#fffbeb', darkBg:'rgba(245,158,11,0.12)', border:'#fde68a', icon:'🫀', desc:'Includes cherry angiomas and hemangiomas. Generally benign but should be monitored.' },
  { code:'nv',    name:'Melanocytic Nevi',       short:'NV',   risk:'Low',      riskColor:'#10b981', bg:'#f0fdf4', darkBg:'rgba(16,185,129,0.12)', border:'#bbf7d0', icon:'🟢', desc:'Common moles. Benign but should be monitored for changes in size, shape, or color.' },
]

// ── Download image + result as PNG ─────────────────────────────────────────────
const downloadReport = async (selectedImage, result) => {
  if (!selectedImage || !result) return

  const canvas  = document.createElement('canvas')
  const W = 900, H = 560
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // ── Background ──
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, '#0a1628')
  grad.addColorStop(0.5, '#0d1f3c')
  grad.addColorStop(1, '#0a1628')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // ── Subtle dot grid ──
  ctx.fillStyle = 'rgba(59,130,246,0.06)'
  for (let x = 0; x < W; x += 32)
    for (let y = 0; y < H; y += 32)
      { ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill() }

  // ── Left panel: scan image ──
  await new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      // Image frame
      ctx.save()
      roundRect(ctx, 30, 30, 340, 340, 16)
      ctx.fillStyle = '#112248'
      ctx.fill()
      ctx.strokeStyle = '#1e3a6e'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.clip()
      // Draw image centered in frame
      const scale = Math.min(340 / img.width, 340 / img.height)
      const iw = img.width * scale, ih = img.height * scale
      const ix = 30 + (340 - iw) / 2, iy = 30 + (340 - ih) / 2
      ctx.drawImage(img, ix, iy, iw, ih)
      ctx.restore()
      resolve()
    }
    img.onerror = resolve
    img.src = URL.createObjectURL(selectedImage)
  })

  // ── Image label ──
  ctx.fillStyle = '#6b8fc2'
  ctx.font = '12px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('SCAN IMAGE', 200, 395)

  // ── Right panel ──
  const rx = 400

  // Header
  ctx.fillStyle = 'rgba(59,130,246,0.15)'
  roundRect(ctx, rx, 30, W - rx - 30, 60, 12)
  ctx.fill()
  ctx.strokeStyle = 'rgba(59,130,246,0.3)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = '#60a5fa'
  ctx.font = 'bold 11px Inter, system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('DERMASSIST AI  •  ANALYSIS REPORT', rx + 16, 55)

  // Diagnosis name
  ctx.fillStyle = '#e8f0ff'
  ctx.font = 'bold 26px Inter, system-ui, sans-serif'
  ctx.fillText(result.diagnosis_name || result.diagnosis, rx, 130)

  // Risk badge
  const riskColors = {
    'High Risk':     { bg: 'rgba(239,68,68,0.2)',   border: '#ef4444', text: '#f87171' },
    'Moderate Risk': { bg: 'rgba(245,158,11,0.2)',  border: '#f59e0b', text: '#fbbf24' },
    'Low Risk':      { bg: 'rgba(16,185,129,0.2)',  border: '#10b981', text: '#34d399' },
  }
  const rc = riskColors[result.risk_level] || riskColors['Low Risk']
  const riskText = result.risk_level || 'Low Risk'
  const badgeW = ctx.measureText(riskText).width + 24

  ctx.fillStyle = rc.bg
  roundRect(ctx, rx, 145, badgeW, 28, 8)
  ctx.fill()
  ctx.strokeStyle = rc.border
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.fillStyle = rc.text
  ctx.font = 'bold 12px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(riskText, rx + badgeW / 2, 164)

  // Confidence
  ctx.textAlign = 'left'
  ctx.fillStyle = '#6b8fc2'
  ctx.font = '13px Inter, system-ui, sans-serif'
  ctx.fillText('CONFIDENCE SCORE', rx, 215)

  const conf = Math.round((result.confidence || 0) * 100)
  ctx.fillStyle = '#e8f0ff'
  ctx.font = 'bold 40px Inter, system-ui, sans-serif'
  ctx.fillText(`${conf}%`, rx, 260)

  // Confidence bar bg
  ctx.fillStyle = '#1a3260'
  roundRect(ctx, rx, 270, W - rx - 30, 8, 4)
  ctx.fill()
  // Confidence bar fill
  const barW = ((W - rx - 30) * conf) / 100
  const barGrad = ctx.createLinearGradient(rx, 0, rx + barW, 0)
  barGrad.addColorStop(0, '#3b82f6')
  barGrad.addColorStop(1, '#06b6d4')
  ctx.fillStyle = barGrad
  roundRect(ctx, rx, 270, barW, 8, 4)
  ctx.fill()

  // All scores
  ctx.fillStyle = '#6b8fc2'
  ctx.font = '12px Inter, system-ui, sans-serif'
  ctx.fillText('ALL CLASS SCORES', rx, 310)

  const classes   = Object.entries(result.all_scores || {}).sort((a, b) => b[1] - a[1])
  const scoreMaxW = W - rx - 30
  classes.slice(0, 4).forEach(([cls, score], i) => {
    const y = 325 + i * 36
    ctx.fillStyle = '#a8c0e8'
    ctx.font = '11px Inter, system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(cls.toUpperCase(), rx, y + 14)

    ctx.fillStyle = '#112248'
    roundRect(ctx, rx + 60, y + 2, scoreMaxW - 90, 16, 4)
    ctx.fill()

    const sw = (scoreMaxW - 90) * score
    ctx.fillStyle = i === 0 ? '#3b82f6' : '#1a3260'
    roundRect(ctx, rx + 60, y + 2, sw, 16, 4)
    ctx.fill()

    ctx.fillStyle = '#6b8fc2'
    ctx.font = '10px Inter, system-ui, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(`${Math.round(score * 100)}%`, W - 30, y + 14)
  })

  // Footer
  ctx.fillStyle = '#1a3260'
  ctx.fillRect(0, H - 44, W, 44)
  ctx.fillStyle = '#2d4a78'
  ctx.font = '11px Inter, system-ui, sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('DermAssist AI  •  Not a substitute for professional medical advice', 24, H - 17)
  ctx.textAlign = 'right'
  ctx.fillText(new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }), W - 24, H - 17)

  // ── Download ──
  const link = document.createElement('a')
  link.download = `dermassist-report-${result.diagnosis}-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png', 1.0)
  link.click()
}

// Helper: rounded rect path
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ── Radial Overlay ─────────────────────────────────────────────────────────────
const RadialOverlay = ({ onClose }) => {
  const [hovered, setHovered] = useState(null)
  const SIZE = 500, C = SIZE / 2, R = 185, NS = 80, NH = NS / 2

  const nodes = LESION_CLASSES.map((cls, i) => {
    const deg = -90 + (i * 360) / 7
    const rad = (deg * Math.PI) / 180
    return { ...cls, cx: C + R * Math.cos(rad), cy: C + R * Math.sin(rad) }
  })

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999, backgroundColor: 'rgba(6,13,31,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ position: 'relative', width: SIZE, height: SIZE }}
      >
        <svg width={SIZE} height={SIZE} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          <motion.circle cx={C} cy={C} r={R} fill="none" stroke="rgba(147,197,253,0.4)"
            strokeWidth="1.5" strokeDasharray="8 5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          />
          {nodes.map((n, i) => (
            <motion.line key={n.code} x1={C} y1={C} x2={n.cx} y2={n.cy}
              stroke={n.riskColor} strokeWidth="1.5"
              strokeOpacity={hovered === i ? 0.8 : 0.2} strokeDasharray="5 4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
            />
          ))}
        </svg>

        <motion.button onClick={onClose} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
          style={{ position: 'absolute', top: C - 48, left: C - 48, width: 96, height: 96, borderRadius: '50%', zIndex: 10 }}
        >
          <div className="w-full h-full rounded-full bg-blue-600 flex flex-col items-center justify-center"
            style={{ boxShadow: '0 0 0 12px rgba(59,130,246,0.15), 0 0 0 24px rgba(59,130,246,0.07), 0 8px 32px rgba(59,130,246,0.5)' }}
          >
            <p className="text-white font-black text-2xl leading-none">7</p>
            <p className="text-blue-200 text-[9px] font-bold tracking-widest mt-1">CLASSES</p>
          </div>
        </motion.button>

        {nodes.map((n, i) => (
          <motion.div key={n.code}
            style={{ position: 'absolute', top: C - NH, left: C - NH, width: NS, height: NS, cursor: 'pointer', zIndex: 5 }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{ x: n.cx - C, y: n.cy - C, opacity: 1, scale: hovered === i ? 1.18 : 1 }}
            transition={{ x: { delay: 0.12 + i * 0.07, duration: 0.55, type: 'spring', stiffness: 200, damping: 18 },
              y: { delay: 0.12 + i * 0.07, duration: 0.55, type: 'spring', stiffness: 200, damping: 18 },
              opacity: { delay: 0.12 + i * 0.07, duration: 0.3 }, scale: { duration: 0.2 }
            }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
          >
            <div className="w-full h-full rounded-full flex flex-col items-center justify-center select-none"
              style={{ background: n.darkBg, border: `3px solid ${hovered === i ? n.riskColor : n.riskColor + '50'}`,
                boxShadow: hovered === i ? `0 0 0 6px ${n.riskColor}25, 0 8px 28px ${n.riskColor}40` : '0 4px 16px rgba(0,0,0,0.3)',
                transition: 'all 0.15s'
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{n.icon}</span>
              <span className="text-[10px] font-black mt-1 tracking-wide" style={{ color: n.riskColor }}>{n.short}</span>
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {hovered !== null && (
            <motion.div key={LESION_CLASSES[hovered].code}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              style={{ position: 'absolute', bottom: -130, left: '50%', transform: 'translateX(-50%)', width: 320, zIndex: 20, pointerEvents: 'none' }}
            >
              <div className="rounded-2xl p-4 shadow-2xl border-2"
                style={{ background: LESION_CLASSES[hovered].darkBg, borderColor: LESION_CLASSES[hovered].riskColor, backdropFilter: 'blur(12px)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span style={{ fontSize: 28 }}>{LESION_CLASSES[hovered].icon}</span>
                  <div className="flex-1">
                    <p className="font-black text-white text-sm">{LESION_CLASSES[hovered].name}</p>
                    <p className="text-[10px] text-white/50 font-mono tracking-widest">{LESION_CLASSES[hovered].code.toUpperCase()}</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: LESION_CLASSES[hovered].riskColor + '25', color: LESION_CLASSES[hovered].riskColor }}
                  >{LESION_CLASSES[hovered].risk} Risk</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{LESION_CLASSES[hovered].desc}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button onClick={onClose} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          style={{ position: 'absolute', top: -16, right: -16, zIndex: 20 }}
        >
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl">
            <X className="w-5 h-5 text-white" />
          </div>
        </motion.button>

        <div style={{ position: 'absolute', bottom: -56, left: 0, right: 0 }} className="text-center">
          <p className="text-white/50 text-xs font-medium">
            Hover to learn · Click center or press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Esc</kbd> to close
          </p>
        </div>
        <div style={{ position: 'absolute', top: -48, left: 0, right: 0 }} className="flex items-center justify-center gap-5">
          <p className="text-white font-bold text-sm">7 Lesion Classes</p>
          {[{ label: 'High (3)', color: '#ef4444' }, { label: 'Moderate (3)', color: '#f59e0b' }, { label: 'Low (1)', color: '#10b981' }].map(r => (
            <div key={r.label} className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
              <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />{r.label}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Dataset Ring ───────────────────────────────────────────────────────────────
const DatasetRing = () => {
  const [count, setCount]       = useState(0)
  const [progress, setProgress] = useState(0)
  const inViewRef = useRef(false)
  const ref       = useRef(null)
  const target    = 10015

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !inViewRef.current) {
        inViewRef.current = true
        let start = 0
        const step = 16, increment = target / (1800 / step)
        const timer = setInterval(() => {
          start += increment
          if (start >= target) { setCount(target); setProgress(100); clearInterval(timer) }
          else { setCount(Math.floor(start)); setProgress((start / target) * 100) }
        }, step)
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const r = 44, circ = 2 * Math.PI * r, dash = (progress / 100) * circ

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" className="stroke-blue-100 dark:stroke-[#1a3260]" strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="8"
            strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.05s linear', filter: 'drop-shadow(0 0 6px #3b82f6)' }}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-blue-600 dark:text-blue-400 leading-none font-mono">{count.toLocaleString()}</span>
          <span className="text-[10px] text-blue-400 dark:text-blue-500 font-semibold mt-0.5 tracking-wide">IMAGES</span>
        </div>
      </div>
      <p className="mt-3 text-base font-bold text-gray-800 dark:text-[#e8f0ff]">Training Dataset</p>
      <div className="mt-1 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse inline-block" />
        <span className="text-xs text-gray-500 dark:text-[#6b8fc2] font-medium">ISIC 2018 Benchmark</span>
      </div>
      <div className="mt-3 flex items-end gap-1" style={{ height: 32 }}>
        {[65,45,38,30,25,20,18].map((h, i) => (
          <motion.div key={i}
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
            transition={{ delay: 0.5 + i * 0.08, duration: 0.4, ease: 'easeOut' }}
            style={{ height: `${h}%`, width: 10, background: i < 3 ? '#ef4444' : i < 6 ? '#f59e0b' : '#10b981',
              opacity: 0.8, transformOrigin: 'bottom', borderRadius: '2px 2px 0 0' }}
          />
        ))}
      </div>
      <p className="text-[10px] text-gray-400 dark:text-[#2d4a78] mt-1">Risk distribution across classes</p>
    </div>
  )
}

// ── Lesion Types ───────────────────────────────────────────────────────────────
const LesionTypesCard = ({ onOpen }) => (
  <div className="flex flex-col items-center">
    <motion.button onClick={onOpen} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="focus:outline-none relative">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', width: 88, height: 88, top: -4, left: -4,
          border: '2px dashed #93c5fd', borderRadius: '50%', opacity: 0.7, pointerEvents: 'none' }}
      />
      {[0,1,2,3,4,5,6].map(i => {
        const a = (i / 7) * 2 * Math.PI
        const colors = ['#ef4444','#ef4444','#ef4444','#f59e0b','#f59e0b','#f59e0b','#10b981']
        return (
          <motion.div key={i}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ delay: i * 0.3, duration: 2, repeat: Infinity }}
            style={{ position: 'absolute', width: 7, height: 7, borderRadius: '50%', background: colors[i],
              top: `${50 + 44 * Math.sin(a)}%`, left: `${50 + 44 * Math.cos(a)}%`,
              transform: 'translate(-50%,-50%)', boxShadow: `0 0 6px ${colors[i]}`, pointerEvents: 'none' }}
          />
        )
      })}
      <div className="w-20 h-20 rounded-full bg-blue-600 flex flex-col items-center justify-center"
        style={{ boxShadow: '0 0 0 12px rgba(59,130,246,0.12), 0 8px 24px rgba(59,130,246,0.4)' }}
      >
        <p className="text-white font-black text-2xl leading-none">7</p>
        <p className="text-blue-200 text-[9px] font-bold tracking-widest mt-0.5">CLASS</p>
      </div>
    </motion.button>
    <div className="text-center mt-3">
      <p className="text-base font-bold text-gray-800 dark:text-[#e8f0ff]">Lesion Types</p>
      <p className="text-xs text-gray-400 dark:text-[#6b8fc2] mt-0.5">Click to explore in circle</p>
    </div>
    <div className="mt-4 flex flex-col gap-1.5 w-full">
      {[
        { label: 'High Risk',     count: 3, color: '#ef4444', bg: '#fef2f2' },
        { label: 'Moderate Risk', count: 3, color: '#f59e0b', bg: '#fffbeb' },
        { label: 'Low Risk',      count: 1, color: '#10b981', bg: '#f0fdf4' },
      ].map(r => (
        <div key={r.label} className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: r.bg, color: r.color }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />{r.label}
          </div>
          <span className="font-black">{r.count} types</span>
        </div>
      ))}
    </div>
  </div>
)

// ── Scan Pulse ─────────────────────────────────────────────────────────────────
const ScanPulse = () => (
  <div className="flex flex-col items-center">
    <div className="relative w-32 h-32">
      {[32,48,60].map((r, i) => (
        <motion.div key={i}
          animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
          className="absolute rounded-full border border-blue-200 dark:border-blue-800"
          style={{ width: r * 2, height: r * 2, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
        />
      ))}
      <motion.div className="absolute inset-0"
        animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
      >
        <div style={{ position: 'absolute', width: '50%', height: 2, top: '50%', left: '50%',
          transformOrigin: '0% 50%', background: 'linear-gradient(to right, transparent, #3b82f6)',
          filter: 'drop-shadow(0 0 4px #3b82f6)' }} />
      </motion.div>
      <motion.div className="absolute rounded-full bg-cyan-400"
        style={{ width: 6, height: 6, top: '28%', left: '68%' }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.6, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
      />
      <motion.div className="absolute rounded-full bg-green-400"
        style={{ width: 5, height: 5, top: '60%', left: '35%' }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 1.1 }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
          className="w-3 h-3 rounded-full bg-blue-500" style={{ boxShadow: '0 0 12px #3b82f6' }}
        />
      </div>
    </div>
    <p className="mt-3 text-base font-bold text-gray-800 dark:text-[#e8f0ff]">AI Detection Speed</p>
    <div className="mt-1 flex items-baseline gap-1">
      <span className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">&lt;2</span>
      <span className="text-sm text-blue-500 dark:text-blue-400 font-semibold">seconds</span>
    </div>
    <div className="mt-2 grid grid-cols-3 gap-2 w-full text-center">
      {[
        { label: 'Preprocess', val: '0.3s', color: '#60a5fa' },
        { label: 'Inference',  val: '1.2s', color: '#34d399' },
        { label: 'Report',     val: '0.2s', color: '#a78bfa' },
      ].map(s => (
        <div key={s.label}>
          <div className="text-[11px] font-bold" style={{ color: s.color }}>{s.val}</div>
          <div className="text-[9px] text-gray-400 dark:text-[#2d4a78] mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  </div>
)

const ABCDE = [
  { letter: 'A', title: 'Asymmetry',  description: 'One half of the mole does not match the other half', color: '#3b82f6' },
  { letter: 'B', title: 'Border',     description: 'Edges are irregular, ragged, notched, or blurred', color: '#8b5cf6' },
  { letter: 'C', title: 'Color',      description: 'Color is not uniform — shades of brown, black, pink, red, white, or blue', color: '#6366f1' },
  { letter: 'D', title: 'Diameter',   description: 'The spot is larger than 6mm (about the size of a pencil eraser)', color: '#06b6d4' },
  { letter: 'E', title: 'Evolving',   description: 'The mole is changing in size, shape, or color over time', color: '#10b981' },
]

// ── Main Home ──────────────────────────────────────────────────────────────────
const Home = () => {
  const { token }   = useAuth()
  const [selectedImage, setSelectedImage] = useState(null)
  const [isAnalyzing,   setIsAnalyzing]   = useState(false)
  const [result,        setResult]        = useState(null)
  const [error,         setError]         = useState(null)
  const [showOverlay,   setShowOverlay]   = useState(false)
  const [downloading,   setDownloading]   = useState(false)

  const handleAnalyze = async () => {
    if (!selectedImage) { setError('Please select an image first'); return }
    setIsAnalyzing(true); setError(null); setResult(null)
    const formData = new FormData()
    formData.append('file', selectedImage)
    try {
      const res = await axios.post('http://127.0.0.1:8000/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })
      setTimeout(() => { setResult(res.data); setIsAnalyzing(false) }, 4800)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze. Please ensure the backend is running.')
      setIsAnalyzing(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    await downloadReport(selectedImage, result)
    setDownloading(false)
  }

  const scrollToUpload = () => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a1628]">

      <AnimatePresence>
        {showOverlay && <RadialOverlay onClose={() => setShowOverlay(false)} />}
      </AnimatePresence>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:hidden" />
        <div className="absolute inset-0 hidden dark:block"
          style={{ background: 'linear-gradient(135deg, #060d1f 0%, #0a1628 40%, #0d1f3c 70%, #0a1628 100%)' }}
        />
        <div className="absolute inset-0 opacity-40 dark:opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(59,130,246,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }}
        />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', transform: 'translate(30%, 30%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6
                         bg-blue-100 text-blue-700 border border-blue-200
                         dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered Skin Cancer Detection
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              Detect Skin Cancer{' '}
              <span style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Early
              </span>
              <span className="block text-blue-600 dark:text-blue-400 mt-2">Using AI Technology</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-[#7a9cc8] max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
              Advanced artificial intelligence analyzes smartphone images of skin lesions
              to provide instant risk assessment. Early detection can save lives.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button onClick={scrollToUpload}
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                className="px-8 py-4 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 8px 32px rgba(59,130,246,0.35)' }}
              >
                <Upload className="w-5 h-5" /> Upload Image Now
              </motion.button>
              <motion.a href="/how-it-works"
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 border-2
                           bg-white text-blue-600 border-blue-600
                           dark:bg-transparent dark:text-blue-400 dark:border-blue-500/60
                           hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors duration-200"
              >
                Learn More <ArrowRight className="w-5 h-5" />
              </motion.a>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-8 mt-10 flex-wrap"
            >
              {[
                { icon: Shield, text: 'HIPAA-aligned Privacy' },
                { icon: Zap,    text: 'Instant Results' },
                { icon: Brain,  text: '7 Cancer Classes' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#4a6a9a] font-medium">
                  <Icon className="w-4 h-4 text-blue-400" /> {text}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { comp: <DatasetRing />, badge: null, extra: '' },
              { comp: <LesionTypesCard onOpen={() => setShowOverlay(true)} />, badge: 'Interactive', extra: 'border-2 dark:border-blue-800/50' },
              { comp: <ScanPulse />, badge: null, extra: '' },
            ].map(({ comp, badge, extra }, i) => (
              <motion.div key={i} whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`rounded-2xl p-7 flex flex-col items-center relative shadow-lg border border-blue-50
                            bg-white dark:bg-[#0d1f3c] dark:border-[#1a3260] hover:shadow-xl transition-all duration-300 ${extra}`}
              >
                {badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow tracking-widest uppercase">
                      {badge}
                    </span>
                  </div>
                )}
                {comp}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Upload Section ── */}
      <section id="upload-section" className="py-16 bg-white dark:bg-[#0a1628]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 dark:text-[#e8f0ff]">Upload Your Skin Image</h2>
            <p className="text-gray-500 dark:text-[#6b8fc2] mt-2 font-medium">Upload a clear photo of the lesion for instant AI analysis</p>
          </motion.div>

          <UploadCard
            onImageSelect={(file) => { setSelectedImage(file); setResult(null); setError(null) }}
            isLoading={isAnalyzing}
          />

          {selectedImage && !isAnalyzing && !result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-6">
              <motion.button onClick={handleAnalyze}
                whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                className="px-12 py-4 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center gap-2 mx-auto"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', boxShadow: '0 8px 32px rgba(59,130,246,0.35)' }}
              >
                <Brain className="w-5 h-5" /> Analyze Image with AI
              </motion.button>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-6 p-4 rounded-2xl text-sm font-medium border
                         bg-red-50 border-red-200 text-red-700
                         dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Processing ── */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="py-8 bg-gray-50 dark:bg-[#070e1c]"
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"><ProcessingLoader /></div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Results ── */}
      <AnimatePresence>
        {result && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="py-16 bg-gray-50 dark:bg-[#070e1c]"
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

              {/* ── Download Button ── */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
              >
                <motion.button
                  onClick={handleDownload}
                  disabled={downloading}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg
                             text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                    boxShadow: '0 6px 24px rgba(59,130,246,0.35)'
                  }}
                >
                  {downloading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Report
                    </>
                  )}
                </motion.button>
              </motion.div>

              <ResultCard result={result} />
              <ExplainableAI diagnosis={result.diagnosis} allScores={result.all_scores} />
              <RecommendationPanel riskLevel={result.risk_level} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── ABCDE ── */}
      <section className="py-16 bg-white dark:bg-[#0a1628]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }} className="text-center mb-12"
          >
            <h2 className="text-4xl font-black text-gray-900 dark:text-[#e8f0ff] mb-4">The ABCDE Rule of Melanoma</h2>
            <p className="text-lg text-gray-600 dark:text-[#6b8fc2] max-w-3xl mx-auto font-medium">
              Learn the warning signs that may indicate melanoma, the most serious type of skin cancer
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            {ABCDE.map((item, index) => (
              <motion.div key={item.letter}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="rounded-2xl p-6 text-center cursor-default border
                           bg-white shadow-md hover:shadow-xl transition-all duration-300
                           dark:bg-[#0d1f3c] dark:border-[#1a3260] dark:hover:border-[#2d5aaa]"
              >
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-md"
                  style={{ background: item.color + '18', border: `2px solid ${item.color}40` }}
                >
                  <span className="text-3xl font-black" style={{ color: item.color }}>{item.letter}</span>
                </motion.div>
                <h3 className="text-lg font-black text-gray-900 dark:text-[#e8f0ff] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-[#6b8fc2] leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 p-6 rounded-2xl border
                       bg-blue-50 border-blue-200 dark:bg-blue-900/15 dark:border-blue-800/40"
          >
            <p className="text-center text-gray-700 dark:text-[#a8c0e8] font-medium">
              <strong className="text-gray-900 dark:text-[#e8f0ff]">Important:</strong> If you notice any of these warning signs,
              or if a mole looks different from others, consult a dermatologist immediately. Early detection
              significantly improves treatment outcomes.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
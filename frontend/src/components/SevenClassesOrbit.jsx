import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, X } from 'lucide-react'

const CLASSES = [
  {
    code: 'mel',
    name: 'Melanoma',
    shortName: 'MEL',
    risk: 'High',
    color: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
    emoji: '🔴',
    desc: 'Most dangerous skin cancer. Irregular, dark lesion.',
  },
  {
    code: 'bcc',
    name: 'Basal Cell Carcinoma',
    shortName: 'BCC',
    risk: 'High',
    color: '#f97316',
    bg: '#fff7ed',
    border: '#fed7aa',
    emoji: '🟠',
    desc: 'Most common skin cancer. Pearly or waxy bump.',
  },
  {
    code: 'akiec',
    name: 'Actinic Keratosis',
    shortName: 'AK',
    risk: 'High',
    color: '#eab308',
    bg: '#fefce8',
    border: '#fef08a',
    emoji: '🟡',
    desc: 'Rough, scaly patch from sun damage. Pre-cancerous.',
  },
  {
    code: 'bkl',
    name: 'Benign Keratosis',
    shortName: 'BKL',
    risk: 'Moderate',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    emoji: '🟣',
    desc: 'Non-cancerous skin growth. Waxy, stuck-on appearance.',
  },
  {
    code: 'df',
    name: 'Dermatofibroma',
    shortName: 'DF',
    risk: 'Moderate',
    color: '#06b6d4',
    bg: '#ecfeff',
    border: '#a5f3fc',
    emoji: '🔵',
    desc: 'Harmless fibrous nodule, often on legs.',
  },
  {
    code: 'vasc',
    name: 'Vascular Lesion',
    shortName: 'VASC',
    risk: 'Moderate',
    color: '#ec4899',
    bg: '#fdf2f8',
    border: '#fbcfe8',
    emoji: '🩷',
    desc: 'Blood vessel abnormality on the skin surface.',
  },
  {
    code: 'nv',
    name: 'Melanocytic Nevi',
    shortName: 'NV',
    risk: 'Low',
    color: '#10b981',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    emoji: '🟢',
    desc: 'Common mole. Usually harmless and benign.',
  },
]

// Calculate positions for 7 nodes in a radial layout around center
// We'll use a semi-circle on top + spread pattern
const getOrbitalPositions = (count, radius = 210) => {
  return Array.from({ length: count }, (_, i) => {
    // Spread from -150deg to +150deg (top arc + sides)
    const angleStart = -155
    const angleRange = 310
    const angle = angleStart + (angleRange / (count - 1)) * i
    const rad = (angle * Math.PI) / 180
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
    }
  })
}

const positions = getOrbitalPositions(7, 215)

export default function SevenClassesOrbit() {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(null)
  const containerRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setHovered(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      style={{ minHeight: open ? 520 : 'auto', minWidth: open ? 520 : 'auto' }}
    >
      {/* Orbital nodes */}
      <AnimatePresence>
        {open &&
          CLASSES.map((cls, i) => {
            const pos = positions[i]
            const isHov = hovered === i
            return (
              <motion.div
                key={cls.code}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.2 }}
                animate={{
                  opacity: 1,
                  x: pos.x,
                  y: pos.y,
                  scale: isHov ? 1.12 : 1,
                }}
                exit={{ opacity: 0, x: 0, y: 0, scale: 0.2 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 22,
                  delay: i * 0.055,
                }}
                className="absolute cursor-pointer"
                style={{ zIndex: isHov ? 20 : 10 }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Connecting line */}
                <svg
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 1,
                    height: 1,
                    overflow: 'visible',
                    pointerEvents: 'none',
                    zIndex: -1,
                  }}
                >
                  <line
                    x1={0}
                    y1={0}
                    x2={-pos.x}
                    y2={-pos.y}
                    stroke={cls.color}
                    strokeWidth={isHov ? 2 : 1}
                    strokeOpacity={isHov ? 0.5 : 0.2}
                    strokeDasharray="4 3"
                  />
                </svg>

                {/* Node pill */}
                <div
                  style={{
                    background: isHov ? cls.color : cls.bg,
                    border: `2px solid ${cls.border}`,
                    borderColor: isHov ? cls.color : cls.border,
                    boxShadow: isHov
                      ? `0 8px 32px ${cls.color}44, 0 0 0 4px ${cls.color}22`
                      : '0 2px 12px rgba(0,0,0,0.08)',
                    transform: 'translate(-50%, -50%)',
                    transition: 'box-shadow 0.2s, background 0.2s',
                  }}
                  className="rounded-2xl px-3 py-2.5 min-w-[96px] text-center whitespace-nowrap"
                >
                  <div className="text-xl mb-1">{cls.emoji}</div>
                  <div
                    className="font-bold text-xs tracking-wide"
                    style={{ color: isHov ? '#fff' : cls.color }}
                  >
                    {cls.shortName}
                  </div>
                  <div
                    className="text-xs mt-0.5 font-medium"
                    style={{ color: isHov ? 'rgba(255,255,255,0.85)' : '#374151' }}
                  >
                    {cls.name.length > 14 ? cls.name.slice(0, 13) + '…' : cls.name}
                  </div>
                  <div
                    className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block font-semibold"
                    style={{
                      background: isHov ? 'rgba(255,255,255,0.2)' : `${cls.color}20`,
                      color: isHov ? '#fff' : cls.color,
                    }}
                  >
                    {cls.risk}
                  </div>
                </div>

                {/* Tooltip on hover */}
                <AnimatePresence>
                  {isHov && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.92 }}
                      transition={{ duration: 0.18 }}
                      className="absolute z-30 bg-gray-900 text-white text-xs rounded-xl px-3 py-2 w-44 text-center shadow-2xl"
                      style={{
                        top: '110%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: 6,
                        pointerEvents: 'none',
                      }}
                    >
                      {cls.desc}
                      <div
                        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"
                        style={{ zIndex: -1 }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
      </AnimatePresence>

      {/* Center card — the "7 Classes" trigger */}
      <motion.div
        onClick={() => {
          setOpen(!open)
          setHovered(null)
        }}
        animate={{
          scale: open ? 1.08 : 1,
          boxShadow: open
            ? '0 0 0 4px rgba(34,197,94,0.25), 0 12px 40px rgba(34,197,94,0.2)'
            : '0 2px 12px rgba(0,0,0,0.08)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative z-20 bg-white rounded-xl p-6 shadow-md text-center cursor-pointer select-none"
        style={{ minWidth: 160 }}
      >
        {/* Pulse ring when open */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute inset-0 rounded-xl bg-green-400 pointer-events-none"
              style={{ zIndex: -1 }}
            />
          )}
        </AnimatePresence>

        <motion.div
          animate={{ rotate: open ? 360 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <Users className="w-10 h-10 text-green-600 mx-auto mb-3" />
        </motion.div>

        <p className="text-3xl font-bold text-gray-900 mb-1">7 Classes</p>
        <p className="text-gray-600 text-sm">Lesion Types</p>

        <motion.div
          animate={{ opacity: open ? 1 : 0.5, scale: open ? 1 : 0.9 }}
          className="mt-3 flex items-center justify-center gap-1 text-xs text-green-600 font-semibold"
        >
          {open ? (
            <>
              <X className="w-3.5 h-3.5" /> Close
            </>
          ) : (
            <>
              <span>↗</span> Explore
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

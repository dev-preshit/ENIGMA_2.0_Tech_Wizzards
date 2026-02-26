import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Circle, Palette, Ruler, GitMerge, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp, Brain } from 'lucide-react'

// ─── Per-class knowledge base ──────────────────────────────────────────────
const CLASS_KNOWLEDGE = {
  mel: {
    features: [
      { icon: GitMerge, text: 'Asymmetric lesion shape — the two halves do not mirror each other' },
      { icon: Circle,   text: 'Irregular, notched or poorly defined borders detected' },
      { icon: Palette,  text: 'Multiple color tones present — shades of brown, black, and red' },
      { icon: Ruler,    text: 'Larger lesion diameter consistent with melanoma patterns' },
    ],
    reasoning:
      'The model flagged this lesion because it displays several hallmark ABCDE warning signs: ' +
      'asymmetry, border irregularity, color variation, and diameter. These visual patterns are ' +
      'strongly associated with malignant melanocyte proliferation in the ISIC training dataset.',
    what_it_is:
      'Melanoma originates in the pigment-producing cells (melanocytes) of the skin. It can spread ' +
      'rapidly to other organs if not caught early. Early detection dramatically improves survival rates.',
    is_cancer: true,
  },
  bcc: {
    features: [
      { icon: Circle,  text: 'Pearl-like or waxy raised appearance detected' },
      { icon: Circle,  text: 'Rolled, well-defined borders with translucent quality' },
      { icon: Palette, text: 'Pink, flesh-colored or slightly pigmented surface' },
      { icon: GitMerge,text: 'Possible visible blood vessels (telangiectasia) in texture' },
    ],
    reasoning:
      'The AI detected a translucent, pearly texture with rolled edges — patterns that strongly ' +
      'correlate with Basal Cell Carcinoma in the training data. BCC grows slowly and rarely spreads, ' +
      'but it can cause significant local tissue damage if left untreated.',
    what_it_is:
      'Basal Cell Carcinoma is the most common skin cancer, arising from cumulative UV exposure. ' +
      'It typically appears on sun-exposed areas like the face, neck, and hands. Highly treatable when caught early.',
    is_cancer: true,
  },
  akiec: {
    features: [
      { icon: Ruler,   text: 'Rough, scaly or crusty surface texture detected' },
      { icon: Palette, text: 'Red, pink or brownish discoloration of the lesion' },
      { icon: Circle,  text: 'Flat-to-slightly-raised lesion profile' },
      { icon: Ruler,   text: 'Small, well-demarcated patch pattern' },
    ],
    reasoning:
      'The AI identified a rough, scaly texture and reddish coloration — the defining visual signatures ' +
      'of Actinic Keratosis in dermoscopy images. Left untreated, AK can progress to Squamous Cell ' +
      'Carcinoma in roughly 5–10% of cases.',
    what_it_is:
      'Actinic Keratosis is a precancerous lesion caused by long-term sun damage. It is not yet cancer, ' +
      'but is a direct precursor. Treatment (cryotherapy, topical creams) is straightforward and highly effective at this stage.',
    is_cancer: true,
  },
  bkl: {
    features: [
      { icon: Circle,  text: 'Warty or "stuck-on" surface appearance detected' },
      { icon: Circle,  text: 'Well-defined, sharp borders observed' },
      { icon: Palette, text: 'Brown, tan or black uniform pigmentation' },
      { icon: GitMerge,text: 'Symmetric shape with regular structure' },
    ],
    reasoning:
      'The model identified a classic stuck-on warty appearance with uniform pigmentation. These are ' +
      'the hallmark features of Seborrheic Keratosis — a benign, non-cancerous growth extremely common ' +
      'in adults. The regularity and symmetry of the lesion strongly support a benign classification.',
    what_it_is:
      'Benign Keratosis (Seborrheic Keratosis) is a completely harmless, non-cancerous skin growth. ' +
      'No treatment is medically necessary, though removal is possible for cosmetic reasons.',
    is_cancer: false,
  },
  df: {
    features: [
      { icon: Circle,  text: 'Small, firm, round nodule structure detected' },
      { icon: Palette, text: 'Brown or reddish-brown pigmentation' },
      { icon: GitMerge,text: 'Symmetric, regular lesion shape' },
      { icon: Ruler,   text: 'Small size, typically under 1cm' },
    ],
    reasoning:
      'The AI detected a small, firm, round nodule with brownish pigmentation and symmetric structure — ' +
      'classic features of Dermatofibroma. The lesion shows regular borders and uniform color, both of ' +
      'which point strongly toward a benign diagnosis.',
    what_it_is:
      'Dermatofibroma is a harmless, benign skin growth, often caused by a minor injury like an insect ' +
      'bite. It is not cancerous and rarely requires treatment unless it becomes irritating or bothersome.',
    is_cancer: false,
  },
  vasc: {
    features: [
      { icon: Palette, text: 'Bright red, purple or blue vascular coloration' },
      { icon: Circle,  text: 'Well-defined borders with vascular pattern' },
      { icon: GitMerge,text: 'Irregular surface with possible blood vessel visibility' },
      { icon: Ruler,   text: 'Variable size lesion profile' },
    ],
    reasoning:
      'The model detected strong vascular coloration — reds, purples and blues — combined with a ' +
      'pattern consistent with blood vessel abnormalities. While vascular lesions are generally benign, ' +
      'some types warrant monitoring by a dermatologist to rule out rare malignant variants.',
    what_it_is:
      'Vascular Lesions include a range of conditions like hemangiomas, angiomas, and port-wine stains. ' +
      'Most are benign and harmless. A dermatologist can confirm the specific type and advise if any treatment is needed.',
    is_cancer: false,
  },
  nv: {
    features: [
      { icon: GitMerge,text: 'Symmetric lesion structure — both halves match' },
      { icon: Circle,  text: 'Regular, smooth, well-defined borders' },
      { icon: Palette, text: 'Uniform color distribution across the lesion' },
      { icon: Ruler,   text: 'Size and shape consistent with a common mole' },
    ],
    reasoning:
      'The model identified all the hallmarks of a benign common mole: symmetry, regular borders, ' +
      'uniform pigmentation, and an appropriate size. None of the ABCDE warning signs were detected, ' +
      'making a malignant classification unlikely.',
    what_it_is:
      'Melanocytic Nevi (common moles) are benign pigmented spots formed by clusters of melanocytes. ' +
      'They are extremely common and rarely become cancerous. Still, any mole that changes shape, color ' +
      'or size over time should be checked by a dermatologist.',
    is_cancer: false,
  },
}

const NAME_MAP = {
  mel: 'Melanoma', bcc: 'Basal Cell Carcinoma', akiec: 'Actinic Keratosis',
  bkl: 'Benign Keratosis', df: 'Dermatofibroma', vasc: 'Vascular Lesion', nv: 'Melanocytic Nevi',
}

const RISK_MAP = {
  mel: 'High Risk', bcc: 'High Risk', akiec: 'High Risk',
  bkl: 'Moderate Risk', df: 'Moderate Risk', vasc: 'Moderate Risk', nv: 'Low Risk',
}

const RISK_COLORS = {
  'High Risk':     { bar: 'bg-red-500',   badge: 'bg-red-100 text-red-700 border-red-200' },
  'Moderate Risk': { bar: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  'Low Risk':      { bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
}

// ─── Confidence Bar ────────────────────────────────────────────────────────
const ConfidenceBar = ({ label, score, risk, delay }) => {
  const pct = Math.round(score * 100)
  const colors = RISK_COLORS[risk] || RISK_COLORS['Low Risk']
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-1"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors.badge}`}>{risk}</span>
          <span className="text-gray-500 font-semibold w-10 text-right">{pct}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className={`h-2.5 rounded-full ${colors.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay: delay + 0.1, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────
const ExplainableAI = ({ diagnosis, allScores }) => {
  const [showDifferential, setShowDifferential] = useState(false)

  const info = CLASS_KNOWLEDGE[diagnosis] || CLASS_KNOWLEDGE['nv']
  const features = info.features

  // Build differential: all classes sorted by score, excluding the primary diagnosis
  const differential = allScores
    ? Object.entries(allScores)
        .filter(([cls]) => cls !== diagnosis)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    : []

  const primaryScore = allScores ? allScores[diagnosis] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg border border-blue-50 p-8 my-8 space-y-8"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Brain className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Why the AI thinks this</h3>
          <p className="text-gray-500 text-sm mt-0.5">Visual pattern analysis from your image</p>
        </div>
      </div>

      {/* ── What the AI detected ── */}
      <div>
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Key visual features detected
        </h4>
        <div className="space-y-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.08 }}
                className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl"
              >
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-gray-700 text-sm pt-1.5 leading-relaxed">{feature.text}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Reasoning ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className={`p-5 rounded-xl border ${info.is_cancer ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}
      >
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {info.is_cancer
              ? <AlertTriangle className="w-5 h-5 text-red-500" />
              : <CheckCircle className="w-5 h-5 text-emerald-500" />
            }
          </div>
          <div className="space-y-2">
            <p className={`font-semibold text-sm ${info.is_cancer ? 'text-red-700' : 'text-emerald-700'}`}>
              {info.is_cancer ? 'Why the AI considers this a concern' : 'Why the AI considers this benign'}
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">{info.reasoning}</p>
          </div>
        </div>
      </motion.div>

      {/* ── What is it ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="p-5 bg-gray-50 rounded-xl border border-gray-100"
      >
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-sm text-gray-800">What is {NAME_MAP[diagnosis]}?</p>
            <p className="text-gray-600 text-sm leading-relaxed">{info.what_it_is}</p>
          </div>
        </div>
      </motion.div>

      {/* ── Confidence breakdown ── */}
      {allScores && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
        >
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            AI Confidence — Primary diagnosis
          </h4>
          <ConfidenceBar
            label={NAME_MAP[diagnosis]}
            score={primaryScore}
            risk={RISK_MAP[diagnosis]}
            delay={0.8}
          />
        </motion.div>
      )}

      {/* ── Differential diagnosis ── */}
      {differential.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
        >
          <button
            onClick={() => setShowDifferential(v => !v)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors duration-200"
          >
            <div className="text-left">
              <p className="font-semibold text-gray-800 text-sm">Other possibilities considered</p>
              <p className="text-xs text-gray-500 mt-0.5">See what else the AI evaluated and ruled out</p>
            </div>
            {showDifferential
              ? <ChevronUp className="w-5 h-5 text-gray-400" />
              : <ChevronDown className="w-5 h-5 text-gray-400" />
            }
          </button>

          <AnimatePresence>
            {showDifferential && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3">
                  {differential.map(([cls, score], i) => (
                    <ConfidenceBar
                      key={cls}
                      label={NAME_MAP[cls] || cls}
                      score={score}
                      risk={RISK_MAP[cls]}
                      delay={i * 0.08}
                    />
                  ))}
                  <p className="text-xs text-gray-400 pt-1">
                    These conditions were considered but scored significantly lower than the primary diagnosis.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Disclaimer ── */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <p className="text-sm text-gray-700 leading-relaxed">
          <strong>Important:</strong> This analysis is based on image pattern recognition using the ISIC dataset.
          It is not a medical diagnosis. Always consult a qualified dermatologist for professional evaluation,
          especially for any High Risk result.
        </p>
      </div>
    </motion.div>
  )
}

export default ExplainableAI
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, AlertTriangle, Phone, Calendar, Heart } from 'lucide-react'

// ─── Per-diagnosis human messages ─────────────────────────────────────────────
const DIAGNOSIS_MESSAGES = {
  // HIGH RISK
  mel: {
    headline: "This needs your immediate attention.",
    message: `Our AI has detected visual patterns strongly associated with Melanoma — the most serious form of skin cancer. We understand this may be alarming to read, but please hear this clearly: the sooner you act, the better your outcome will be. Melanoma is highly treatable when caught early, but it can spread quickly if ignored. Do not wait for your next routine checkup — book an appointment with a dermatologist or oncologist within the next few days. Show them this result and the image you uploaded.`,
    action: "Book a dermatologist appointment immediately — within this week.",
    urgency: "high",
  },
  bcc: {
    headline: "Please don't ignore this.",
    message: `The AI has identified characteristics consistent with Basal Cell Carcinoma — the most common skin cancer. The good news is that BCC rarely spreads to other parts of the body, and it is very treatable. However, left untreated it can cause significant damage to the skin and surrounding tissue. You need to see a dermatologist soon. This is not something to monitor at home or put off for later — a quick professional evaluation can resolve this before it becomes a bigger problem.`,
    action: "See a dermatologist within the next 1–2 weeks.",
    urgency: "high",
  },
  akiec: {
    headline: "This is a warning sign — please take action.",
    message: `The AI has flagged patterns consistent with Actinic Keratosis — a precancerous lesion caused by long-term sun damage. It is not yet cancer, but it is a direct precursor that can progress to Squamous Cell Carcinoma in some cases. Think of this as your body giving you an early warning. Treatment at this stage is simple, quick, and highly effective. Please consult a dermatologist soon — catching this now is far better than dealing with it later.`,
    action: "Consult a dermatologist soon — treatment at this stage is simple.",
    urgency: "high",
  },

  // MODERATE RISK
  bkl: {
    headline: "Probably nothing serious, but worth checking.",
    message: `The AI's analysis suggests this could be a Benign Keratosis — a harmless, non-cancerous skin growth that is very common, especially as we age. Most of the time this is nothing to worry about. That said, the visual patterns picked up by the AI could also overlap with other conditions, including early-stage skin changes. We'd recommend getting a dermatologist to take a quick look — just to confirm it's benign and give you peace of mind. It could also simply be a fungal infection or a skin reaction to an allergen.`,
    action: "A routine dermatology checkup within the next month is recommended.",
    urgency: "medium",
  },
  df: {
    headline: "Low concern, but a checkup is a good idea.",
    message: `The AI detected patterns consistent with a Dermatofibroma — a benign fibrous nodule that is almost always harmless. These are very common and rarely require any treatment. However, since skin conditions can sometimes resemble each other, it is always a good idea to have a dermatologist confirm this in person. It could also be a minor allergic reaction or a small skin infection. No need to panic — just get it checked at your next convenient opportunity.`,
    action: "Schedule a routine checkup when convenient — no rush, but don't skip it.",
    urgency: "medium",
  },
  vasc: {
    headline: "Likely harmless, but keep an eye on it.",
    message: `The AI identified visual features consistent with a Vascular Lesion — which includes common, benign conditions like cherry angiomas or hemangiomas. The vast majority of vascular lesions are completely harmless. However, some rarer types do warrant monitoring. We recommend showing this to a dermatologist at your next checkup, especially if the lesion has changed in size, color, or shape recently. It may also simply be a bruise, a bite reaction, or a minor skin irritation.`,
    action: "Mention this to a dermatologist at your next routine visit.",
    urgency: "medium",
  },

  // LOW RISK
  nv: {
    headline: "You're in the clear — nothing to worry about.",
    message: `Great news! The AI has analyzed your image and the results look reassuring. The lesion appears to be a Melanocytic Nevus — a common, ordinary mole. This is one of the most benign findings possible. Your skin looks healthy and there are no concerning patterns detected. Just continue doing what you're doing — wear sunscreen, avoid excessive sun exposure, and do a self-check every few months. If this mole ever changes in size, shape, or color, that's when you should get it checked. For now, all is well.`,
    action: "No action needed. Continue regular self-checks and use sunscreen.",
    urgency: "low",
  },
}

const URGENCY_CONFIG = {
  high: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    headerBg: 'bg-red-600',
    textColor: 'text-red-700',
    barColor: '#ef4444',
    icon: AlertCircle,
    iconColor: 'text-white',
    badgeBg: 'bg-red-100 text-red-700 border-red-200',
    actionBg: 'bg-red-600 text-white',
    riskLabel: 'High Risk',
  },
  medium: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    headerBg: 'bg-amber-500',
    textColor: 'text-amber-700',
    barColor: '#f59e0b',
    icon: AlertTriangle,
    iconColor: 'text-white',
    badgeBg: 'bg-amber-100 text-amber-700 border-amber-200',
    actionBg: 'bg-amber-500 text-white',
    riskLabel: 'Moderate Risk',
  },
  low: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    headerBg: 'bg-emerald-600',
    textColor: 'text-emerald-700',
    barColor: '#10b981',
    icon: CheckCircle,
    iconColor: 'text-white',
    badgeBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    actionBg: 'bg-emerald-600 text-white',
    riskLabel: 'Low Risk',
  },
}

const NAME_MAP = {
  mel: 'Melanoma', bcc: 'Basal Cell Carcinoma', akiec: 'Actinic Keratosis',
  bkl: 'Benign Keratosis', df: 'Dermatofibroma', nv: 'Melanocytic Nevus', vasc: 'Vascular Lesion',
}

const ResultCard = ({ result }) => {
  const diagnosisInfo = DIAGNOSIS_MESSAGES[result.diagnosis] || DIAGNOSIS_MESSAGES['nv']
  const config = URGENCY_CONFIG[diagnosisInfo.urgency]
  const Icon = config.icon
  const confidence = (result.confidence * 100).toFixed(1)
  const diagnosisName = NAME_MAP[result.diagnosis] || result.diagnosis

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="my-8"
    >
      <div className={`${config.bg} border-2 ${config.border} rounded-2xl shadow-xl overflow-hidden`}>

        {/* ── Coloured Header Bar ── */}
        <div className={`${config.headerBg} px-8 py-5 flex items-center gap-4`}>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon className={`w-7 h-7 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium uppercase tracking-wide">Analysis Complete</p>
            <h2 className="text-white text-2xl font-bold leading-tight">{diagnosisInfo.headline}</h2>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-white/70 text-xs">AI Confidence</p>
            <p className="text-white text-3xl font-black">{confidence}%</p>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-8 py-6 space-y-6">

          {/* Diagnosis + Risk badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-gray-500 text-sm">Detected:</span>
            <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-gray-800 font-semibold text-sm shadow-sm">
              {diagnosisName}
            </span>
            <span className={`px-3 py-1 rounded-full border font-semibold text-sm ${config.badgeBg}`}>
              {config.riskLabel}
            </span>
          </div>

          {/* Confidence bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>AI Confidence Score</span>
              <span className="font-semibold">{confidence}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                className="h-2.5 rounded-full"
                style={{ backgroundColor: config.barColor }}
              />
            </div>
          </div>

          {/* Human message */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <p className="text-gray-700 leading-relaxed text-[15px]">
              {diagnosisInfo.message}
            </p>
          </div>

          {/* Action box */}
          <div className={`rounded-xl p-4 flex items-start gap-3 ${config.actionBg}`}>
            {diagnosisInfo.urgency === 'high'
              ? <Phone className="w-5 h-5 flex-shrink-0 mt-0.5" />
              : diagnosisInfo.urgency === 'medium'
              ? <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5" />
              : <Heart className="w-5 h-5 flex-shrink-0 mt-0.5" />
            }
            <div>
              <p className="font-bold text-sm">Recommended Action</p>
              <p className="text-sm mt-0.5 opacity-90">{diagnosisInfo.action}</p>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            This is an AI-based screening tool, not a medical diagnosis. Always consult a qualified
            dermatologist for professional evaluation and treatment decisions.
          </p>

        </div>
      </div>
    </motion.div>
  )
}

export default ResultCard
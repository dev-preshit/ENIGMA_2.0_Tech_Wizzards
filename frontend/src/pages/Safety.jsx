import { motion } from 'framer-motion'
import { Shield, AlertTriangle, FileText, Users, CheckCircle, XCircle } from 'lucide-react'

const Safety = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-12 h-12 text-yellow-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Medical Disclaimer & Responsible Use
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Important information about the limitations and proper use of DermAssist AI
          </p>
        </motion.div>

        {/* Critical Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-yellow-50 border-3 border-yellow-400 rounded-2xl p-8 mb-8"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-12 h-12 text-yellow-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Critical Disclaimer</h2>
              <div className="space-y-3 text-gray-800 text-lg">
                <p className="font-semibold">
                  DermAssist AI is a screening tool only and does NOT provide medical diagnosis.
                </p>
                <p>
                  This application is designed to assist in early detection and risk assessment of 
                  skin lesions. It is NOT a substitute for professional medical examination, diagnosis, 
                  or treatment by a qualified healthcare provider.
                </p>
                <p className="font-semibold text-red-700">
                  Always consult a board-certified dermatologist for proper evaluation, diagnosis, 
                  and treatment of any skin condition.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* What This Tool IS */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">What This Tool IS</h2>
          </div>
          
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="text-gray-700">
                <strong>A screening assistance tool</strong> that helps identify skin lesions that may 
                warrant professional medical evaluation
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="text-gray-700">
                <strong>An educational resource</strong> to increase awareness about skin cancer warning 
                signs and the importance of early detection
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="text-gray-700">
                <strong>A triage tool</strong> to help determine the urgency of seeking dermatological 
                consultation based on AI-detected risk factors
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <p className="text-gray-700">
                <strong>A complement to medical care</strong> that may help facilitate earlier detection 
                and discussion with healthcare providers
              </p>
            </li>
          </ul>
        </motion.section>

        {/* What This Tool IS NOT */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-7 h-7 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">What This Tool IS NOT</h2>
          </div>
          
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-red-600 text-sm">✗</span>
              </div>
              <p className="text-gray-700">
                <strong>NOT a medical diagnosis</strong> - Only qualified healthcare professionals can 
                diagnose skin cancer through clinical examination and biopsy
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-red-600 text-sm">✗</span>
              </div>
              <p className="text-gray-700">
                <strong>NOT a replacement for dermatologist visits</strong> - Regular skin examinations 
                by medical professionals remain essential
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-red-600 text-sm">✗</span>
              </div>
              <p className="text-gray-700">
                <strong>NOT 100% accurate</strong> - AI models can produce false positives and false 
                negatives. Clinical judgment is irreplaceable
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-red-600 text-sm">✗</span>
              </div>
              <p className="text-gray-700">
                <strong>NOT FDA approved</strong> - This tool has not been evaluated or approved by 
                regulatory authorities for clinical diagnostic use
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-red-600 text-sm">✗</span>
              </div>
              <p className="text-gray-700">
                <strong>NOT a treatment recommendation</strong> - Never attempt self-treatment based 
                on AI screening results
              </p>
            </li>
          </ul>
        </motion.section>

        {/* Accuracy and Limitations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Accuracy Depends On Image Quality</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p>
              The accuracy and reliability of DermAssist AI results are significantly influenced by:
            </p>
            
            <div className="bg-blue-50 rounded-xl p-6 space-y-3">
              <h4 className="font-bold text-gray-900">Image Quality Requirements:</h4>
              <ul className="space-y-2 ml-4">
                <li>• Good lighting conditions (avoid shadows and glare)</li>
                <li>• Clear focus on the lesion</li>
                <li>• Minimal background interference</li>
                <li>• Appropriate distance (lesion should fill frame without being too close)</li>
                <li>• No obstructions like hair, clothing, or jewelry</li>
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 space-y-3">
              <h4 className="font-bold text-gray-900">Known Limitations:</h4>
              <ul className="space-y-2 ml-4">
                <li>• May perform less accurately on darker skin tones (dataset bias)</li>
                <li>• Cannot detect very early-stage or subtle changes</li>
                <li>• Cannot analyze lesions in difficult-to-photograph locations</li>
                <li>• Cannot account for patient medical history or family history</li>
                <li>• Cannot evaluate symptoms like itching, bleeding, or pain</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* When to Seek Immediate Care */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-red-50 border-2 border-red-300 rounded-2xl p-8 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-700" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Seek Immediate Medical Attention If:</h2>
          </div>
          
          <ul className="space-y-3 text-gray-800 text-lg">
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold mt-1">•</span>
              <p>A lesion is bleeding, oozing, or won't heal</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold mt-1">•</span>
              <p>A mole has changed rapidly in size, shape, or color</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold mt-1">•</span>
              <p>A lesion is painful, itchy, or tender</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold mt-1">•</span>
              <p>You have a personal or family history of melanoma</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-red-600 font-bold mt-1">•</span>
              <p>The AI indicates high risk - regardless of your personal assessment</p>
            </li>
          </ul>

          <p className="mt-6 font-bold text-red-900 text-lg">
            Do not delay seeking professional medical care while waiting for screening results or 
            based on low-risk AI assessments.
          </p>
        </motion.section>

        {/* Professional Responsibility */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-7 h-7 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Responsibility</h2>
          </div>
          
          <div className="space-y-4 text-gray-700 text-lg">
            <p>By using DermAssist AI, you acknowledge and agree that:</p>
            
            <ul className="space-y-3 ml-4">
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">1.</span>
                <p>
                  You understand this tool provides screening assistance only, not medical diagnosis
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">2.</span>
                <p>
                  You will consult a qualified healthcare professional for any concerning lesions
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">3.</span>
                <p>
                  You will not use this tool as a substitute for professional medical advice
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">4.</span>
                <p>
                  You understand the limitations and potential inaccuracies of AI-based screening
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">5.</span>
                <p>
                  You take full responsibility for your healthcare decisions
                </p>
              </li>
            </ul>
          </div>
        </motion.section>

        {/* Data Privacy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gray-100 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Privacy & Security</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              • Images are processed locally and are not stored on our servers
            </p>
            <p>
              • We do not collect or retain any personal health information
            </p>
            <p>
              • Analysis results are displayed only in your browser session
            </p>
            <p>
              • We recommend not uploading images that contain identifying information
            </p>
          </div>
        </motion.section>

        {/* Final Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8 text-center bg-gray-900 text-white rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold mb-4">Remember</h3>
          <p className="text-lg">
            When in doubt, always seek professional medical evaluation. Early detection through 
            professional examination remains the gold standard for skin cancer diagnosis.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Safety

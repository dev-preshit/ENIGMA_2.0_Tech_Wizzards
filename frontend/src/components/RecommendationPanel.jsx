import { motion } from 'framer-motion'
import { Calendar, AlertCircle, PhoneCall, CheckCircle } from 'lucide-react'

const RecommendationPanel = ({ riskLevel }) => {
  const getRecommendation = (risk) => {
    if (risk.includes('Low')) {
      return {
        icon: CheckCircle,
        color: 'green',
        title: 'Low Risk - Continue Monitoring',
        recommendations: [
          'Perform monthly self-examinations',
          'Take photos to track any changes over time',
          'Schedule routine dermatology check-up annually',
          'Use sun protection (SPF 30+) daily',
          'Watch for any changes in size, color, or shape',
        ],
        urgency: 'No immediate action required',
        bgColor: 'bg-medical-lightGreen',
        borderColor: 'border-medical-green',
      }
    } else if (risk.includes('Moderate')) {
      return {
        icon: Calendar,
        color: 'yellow',
        title: 'Moderate Risk - Dermatologist Consultation Recommended',
        recommendations: [
          'Schedule appointment with dermatologist within 30 days',
          'Bring this screening result to your appointment',
          'Document any recent changes in the lesion',
          'Avoid sun exposure to the affected area',
          'Do not attempt self-treatment',
        ],
        urgency: 'Consult within 30 days',
        bgColor: 'bg-medical-lightYellow',
        borderColor: 'border-medical-yellow',
      }
    } else {
      return {
        icon: PhoneCall,
        color: 'red',
        title: 'High Risk - Immediate Medical Attention Required',
        recommendations: [
          'Contact a dermatologist immediately',
          'Request urgent appointment (within 7 days)',
          'Consider seeking care at a skin cancer clinic',
          'Bring this screening result and original image',
          'Document all symptoms and recent changes',
        ],
        urgency: 'URGENT - Seek immediate care',
        bgColor: 'bg-medical-lightRed',
        borderColor: 'border-medical-red',
      }
    }
  }

  const recommendation = getRecommendation(riskLevel)
  const Icon = recommendation.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="my-8"
    >
      <div className={`${recommendation.bgColor} border-2 ${recommendation.borderColor} rounded-2xl shadow-lg p-8`}>
        <div className="flex items-center space-x-4 mb-6">
          <div className={`w-14 h-14 bg-white rounded-full flex items-center justify-center`}>
            <Icon className={`w-8 h-8 text-${recommendation.color}-600`} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{recommendation.title}</h3>
            <p className={`text-sm font-medium text-${recommendation.color}-700 mt-1`}>
              {recommendation.urgency}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 mb-3">Recommended Actions:</h4>
          {recommendation.recommendations.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-start space-x-3"
            >
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-gray-700">{index + 1}</span>
              </div>
              <p className="text-gray-700">{item}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">
              <strong>Important:</strong> This screening tool is not a substitute for professional 
              medical diagnosis. Only a qualified dermatologist can provide definitive diagnosis 
              through clinical examination and biopsy if necessary.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default RecommendationPanel

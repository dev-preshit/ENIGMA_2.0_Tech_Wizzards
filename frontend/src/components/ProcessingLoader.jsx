import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Image, Scissors, Eye, Shield } from 'lucide-react'

const ProcessingLoader = () => {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { icon: Image, label: 'Preparing Image', color: 'text-blue-600' },
    { icon: Scissors, label: 'Lesion Segmentation', color: 'text-purple-600' },
    { icon: Eye, label: 'Pattern Analysis', color: 'text-indigo-600' },
    { icon: Shield, label: 'Risk Classification', color: 'text-green-600' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl shadow-lg p-8 my-8"
    >
      <div className="text-center mb-8">
        <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-gray-900">Analyzing Image</h3>
        <p className="text-sm text-gray-500 mt-2">Please wait while our AI processes your image</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = index === currentStep
          const isCompleted = index < currentStep

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isActive ? 'bg-blue-100' : 'bg-white'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? step.color : 'text-gray-400'}`} />
              </div>
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    isActive ? 'text-gray-900' : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </p>
              </div>
              {isActive && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-5 h-5 text-blue-600" />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="mt-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-blue-600 h-2 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default ProcessingLoader

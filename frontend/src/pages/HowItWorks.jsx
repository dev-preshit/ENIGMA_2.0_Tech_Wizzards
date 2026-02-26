import { motion } from 'framer-motion'
import { Camera, Image, Brain, BarChart3, FileText } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      icon: Camera,
      title: 'Capture Image',
      description: 'Take a clear, well-lit photo of the skin lesion using your smartphone camera. Ensure good lighting and focus on the area of concern.',
      technical: 'Image Requirements: JPEG/PNG format, minimum 128x128 pixels',
      color: 'blue',
    },
    {
      icon: Image,
      title: 'AI Preprocessing',
      description: 'The image is automatically resized, normalized, and enhanced to match our training dataset specifications for optimal analysis.',
      technical: 'Resized to 128x128, RGB color space, normalized to [0,1] range',
      color: 'purple',
    },
    {
      icon: Brain,
      title: 'Deep Learning Analysis',
      description: 'Our Convolutional Neural Network analyzes patterns, textures, colors, and morphological features using advanced computer vision techniques.',
      technical: 'CNN architecture trained on ISIC dataset with transfer learning',
      color: 'indigo',
    },
    {
      icon: BarChart3,
      title: 'Risk Classification',
      description: 'The AI model classifies the lesion into one of seven categories and calculates risk level based on medical classification standards.',
      technical: '7-class output: Melanoma, BCC, Actinic Keratosis, Benign Keratosis, Dermatofibroma, Nevus, Vascular',
      color: 'cyan',
    },
    {
      icon: FileText,
      title: 'Guidance Output',
      description: 'You receive a comprehensive report with risk assessment, confidence score, explainable AI features, and personalized medical recommendations.',
      technical: 'JSON output with diagnosis, confidence score, and risk categorization',
      color: 'green',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">How It Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Understanding the AI-powered screening process from image capture to medical guidance
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className={`w-20 h-20 bg-${step.color}-100 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-10 h-10 text-${step.color}-600`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-4 py-1 bg-${step.color}-100 text-${step.color}-700 rounded-full text-sm font-semibold`}>
                        Step {index + 1}
                      </span>
                      <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
                    </div>
                    <p className="text-gray-700 text-lg mb-4">{step.description}</p>
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-300">
                      <p className="text-sm text-gray-600">
                        <strong>Technical Detail:</strong> {step.technical}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Technology Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-10"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Technology Behind DermAssist AI
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">CNN Architecture</h3>
              <p className="text-gray-700">
                Our deep learning model uses Convolutional Neural Networks (CNN) specifically designed 
                for medical image classification. The architecture includes multiple convolutional layers, 
                pooling layers, and fully connected layers optimized for skin lesion pattern recognition.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Image Segmentation</h3>
              <p className="text-gray-700">
                Advanced preprocessing techniques isolate the lesion from surrounding skin, 
                remove artifacts like hair, and enhance relevant features to improve classification accuracy. 
                This ensures the AI focuses on the most important diagnostic features.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Feature Extraction</h3>
              <p className="text-gray-700">
                The model automatically extracts hundreds of features including color distribution, 
                texture patterns, border irregularity, and asymmetry measurements. These features 
                mirror the criteria dermatologists use for clinical evaluation.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-3">ISIC Dataset Training</h3>
              <p className="text-gray-700">
                Trained on the International Skin Imaging Collaboration (ISIC) dataset containing 
                over 10,000 expertly annotated dermoscopic images. This ensures the model has learned 
                from diverse real-world clinical cases.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Model Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Classification Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-red-50 rounded-xl border-2 border-red-200">
              <h4 className="font-bold text-red-700 mb-2">High Risk</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Melanoma (MEL)</li>
                <li>• Basal Cell Carcinoma (BCC)</li>
                <li>• Actinic Keratosis (AKIEC)</li>
              </ul>
            </div>
            <div className="text-center p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <h4 className="font-bold text-yellow-700 mb-2">Moderate Risk</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Benign Keratosis (BKL)</li>
                <li>• Dermatofibroma (DF)</li>
                <li>• Vascular Lesion (VASC)</li>
              </ul>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl border-2 border-green-200">
              <h4 className="font-bold text-green-700 mb-2">Low Risk</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Melanocytic Nevus (NV)</li>
                <li>• Common mole</li>
                <li>• Typically benign</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default HowItWorks

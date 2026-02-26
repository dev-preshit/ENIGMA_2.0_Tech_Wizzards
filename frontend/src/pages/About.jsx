import { motion } from 'framer-motion'
import { AlertCircle, Target, Heart, TrendingUp, Globe, Stethoscope } from 'lucide-react'

const About = () => {
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
          <h1 className="text-5xl font-bold text-gray-900 mb-4">About DermAssist AI</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Democratizing early skin cancer detection through accessible AI technology
          </p>
        </motion.div>

        {/* Problem Statement */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-10 mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">The Problem</h2>
          </div>
          
          <div className="space-y-4 text-gray-700 text-lg">
            <p>
              Skin cancer is one of the most common cancers worldwide, with over 5 million cases 
              diagnosed annually in the United States alone. When detected early, skin cancer has 
              a cure rate exceeding 99%. However, late detection significantly reduces survival rates.
            </p>
            <p>
              The challenge is particularly acute in rural and underserved communities where access 
              to dermatologists is limited. Many patients face:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Long wait times for specialist appointments (often 2-3 months)</li>
              <li>Geographic barriers requiring extensive travel</li>
              <li>High costs of dermatological consultations</li>
              <li>Limited awareness of early warning signs</li>
              <li>Lack of regular skin cancer screening programs</li>
            </ul>
            <p>
              By the time many patients seek medical attention, their condition has progressed 
              to more advanced stages, reducing treatment effectiveness and increasing healthcare costs.
            </p>
          </div>
        </motion.section>

        {/* Our Solution */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-10 mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Our Solution</h2>
          </div>
          
          <div className="space-y-4 text-gray-700 text-lg">
            <p>
              DermAssist AI bridges the gap between patients and healthcare by providing instant, 
              AI-powered skin lesion screening using nothing more than a smartphone camera. Our solution:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-bold text-gray-900 mb-3 text-xl">Instant Screening</h3>
                <p>Get preliminary risk assessment in seconds, enabling rapid decision-making 
                about whether to seek immediate medical attention.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-bold text-gray-900 mb-3 text-xl">Accessible Technology</h3>
                <p>No specialized equipment needed. Works with any smartphone camera, making 
                screening accessible to anyone with internet access.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-bold text-gray-900 mb-3 text-xl">Evidence-Based AI</h3>
                <p>Trained on 10,000+ dermatologist-verified images from the ISIC dataset, 
                ensuring clinical relevance and accuracy.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-bold text-gray-900 mb-3 text-xl">Actionable Guidance</h3>
                <p>Clear recommendations on next steps based on risk level, from monitoring 
                to urgent medical consultation.</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Social Impact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-10 mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Social Impact</h2>
          </div>
          
          <div className="space-y-6 text-gray-700 text-lg">
            <p>
              Our mission extends beyond technology. We're committed to improving health equity 
              and reducing preventable deaths from skin cancer.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <Globe className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Rural Healthcare</h3>
                <p className="text-sm">Bringing specialist-level screening to remote and 
                underserved communities worldwide.</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Early Detection</h3>
                <p className="text-sm">Increasing early detection rates through accessible, 
                regular self-screening capabilities.</p>
              </div>
              <div className="text-center p-6 bg-cyan-50 rounded-xl">
                <Stethoscope className="w-12 h-12 text-cyan-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Healthcare Support</h3>
                <p className="text-sm">Assisting healthcare providers with triage and 
                prioritization of urgent cases.</p>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mt-6">
              <h4 className="font-bold text-green-900 mb-3 text-xl">Real-World Impact</h4>
              <ul className="space-y-2 text-gray-700">
                <li>• Reducing wait times by helping patients identify urgent cases</li>
                <li>• Lowering healthcare costs through early intervention</li>
                <li>• Increasing skin cancer awareness and screening frequency</li>
                <li>• Providing peace of mind for individuals monitoring existing moles</li>
                <li>• Supporting dermatologists with preliminary risk stratification</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Future Vision */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-10"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Future Vision</h2>
          </div>
          
          <div className="space-y-4 text-gray-700 text-lg">
            <p>
              We envision a future where skin cancer screening is as routine as checking your 
              blood pressure. Our roadmap includes:
            </p>
            
            <div className="space-y-4 mt-6">
              <div className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-md">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="font-bold text-blue-600">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Telemedicine Integration</h4>
                  <p>Direct connection to board-certified dermatologists for virtual consultations 
                  based on screening results.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-md">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="font-bold text-purple-600">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Longitudinal Monitoring</h4>
                  <p>Track changes in lesions over time with AI-powered comparison and change detection.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-md">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="font-bold text-indigo-600">3</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Mobile Application</h4>
                  <p>Native iOS and Android apps with offline capabilities and secure health record storage.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-md">
                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="font-bold text-cyan-600">4</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Clinical Validation Studies</h4>
                  <p>Partnering with medical institutions for FDA approval and clinical trial validation.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 text-center bg-blue-600 text-white rounded-2xl p-10"
        >
          <h3 className="text-3xl font-bold mb-4">Join Our Mission</h3>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            Together, we can make early skin cancer detection accessible to everyone, 
            regardless of location or economic status.
          </p>
          <a
            href="/"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-colors duration-200 font-semibold text-lg"
          >
            Try DermAssist AI Now
          </a>
        </motion.div>
      </div>
    </div>
  )
}

export default About

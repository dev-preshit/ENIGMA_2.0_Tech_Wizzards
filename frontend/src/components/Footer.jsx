import { Activity, Shield } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-6 h-6 text-blue-400" />
              <span className="text-white font-bold text-lg">DermAssist AI</span>
            </div>
            <p className="text-sm text-gray-400">
              AI-powered skin cancer screening using smartphone images. 
              Early detection saves lives.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Technology</h3>
            <ul className="space-y-2 text-sm">
              <li>• CNN-based Deep Learning Model</li>
              <li>• Trained on ISIC Dataset (10,000+ images)</li>
              <li>• TensorFlow Lite Optimization</li>
              <li>• 7-Class Lesion Classification</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Medical Disclaimer</h3>
            <div className="flex items-start space-x-2">
              <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400">
                This tool provides screening assistance only and does not replace 
                professional medical diagnosis. Always consult a board-certified 
                dermatologist for proper evaluation.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2026 DermAssist AI. For educational and screening purposes. Not FDA approved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

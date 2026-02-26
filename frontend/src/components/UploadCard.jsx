import { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, Image as ImageIcon, X, Camera, SwitchCamera, ZoomIn, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Mode tab definitions ─────────────────────────────────────────────────────
const MODES = [
  { id: 'upload', label: 'Upload File', icon: Upload },
  { id: 'camera', label: 'Use Camera', icon: Camera },
]

const UploadCard = ({ onImageSelect, isLoading }) => {
  // ── Shared state ────────────────────────────────────────────────────────────
  const [mode, setMode]         = useState('upload')   // 'upload' | 'camera'
  const [preview, setPreview]   = useState(null)        // base64 preview string
  const [isDragging, setIsDragging] = useState(false)

  // ── File upload refs ────────────────────────────────────────────────────────
  const fileInputRef = useRef(null)

  // ── Camera state ────────────────────────────────────────────────────────────
  const videoRef        = useRef(null)
  const canvasRef       = useRef(null)
  const streamRef       = useRef(null)                  // holds active MediaStream
  const [cameraActive, setCameraActive]     = useState(false)
  const [cameraError, setCameraError]       = useState(null)
  const [facingMode, setFacingMode]         = useState('environment') // 'user' | 'environment'
  const [flashActive, setFlashActive]       = useState(false)
  const [capturing, setCapturing]           = useState(false)

  // ── Stop camera stream helper ────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  // ── Start camera stream ──────────────────────────────────────────────────────
  const startCamera = useCallback(async (facing = facingMode) => {
    setCameraError(null)
    stopCamera()

    try {
      const constraints = {
        video: {
          facingMode: facing,
          width:  { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      // Attach to video element once it's mounted
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
    } catch (err) {
      let msg = 'Camera access denied.'
      if (err.name === 'NotFoundError')      msg = 'No camera found on this device.'
      if (err.name === 'NotAllowedError')    msg = 'Camera permission was denied. Please allow access in your browser settings.'
      if (err.name === 'NotReadableError')   msg = 'Camera is already in use by another app.'
      if (err.name === 'OverconstrainedError') msg = 'Camera does not support the required settings.'
      setCameraError(msg)
      setCameraActive(false)
    }
  }, [facingMode, stopCamera])

  // ── Auto-start camera when switching to camera mode ──────────────────────────
  useEffect(() => {
    if (mode === 'camera' && !preview) {
      startCamera()
    }
    return () => {
      if (mode !== 'camera') stopCamera()
    }
  }, [mode]) // eslint-disable-line

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  // ── Flip camera (mobile) ─────────────────────────────────────────────────────
  const flipCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    startCamera(next)
  }

  // ── Capture snapshot from video ──────────────────────────────────────────────
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setCapturing(true)
    setFlashActive(true)

    // Brief flash effect
    await new Promise(r => setTimeout(r, 120))
    setFlashActive(false)

    const video  = videoRef.current
    const canvas = canvasRef.current
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')

    // Mirror the image if using front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert canvas → File object (same shape as file upload)
    canvas.toBlob((blob) => {
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const dataURL = canvas.toDataURL('image/jpeg', 0.92)
      setPreview(dataURL)
      onImageSelect(file)
      stopCamera()
      setCapturing(false)
    }, 'image/jpeg', 0.92)
  }

  // ── Handle file selection (upload mode) ──────────────────────────────────────
  const handleFileChange = (file) => {
    if (!file) return
    if (!['image/jpeg', 'image/png'].includes(file.type)) return
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)
    onImageSelect(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileChange(e.dataTransfer.files[0])
  }

  // ── Clear everything and reset ────────────────────────────────────────────────
  const clearAll = () => {
    setPreview(null)
    onImageSelect(null)
    setCameraError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (mode === 'camera') startCamera()
  }

  // ── Switch mode ───────────────────────────────────────────────────────────────
  const handleModeSwitch = (newMode) => {
    if (newMode === mode) return
    setPreview(null)
    onImageSelect(null)
    setCameraError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (newMode !== 'camera') stopCamera()
    setMode(newMode)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-8 pt-8 pb-0">
        <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center">
          Scan Your Skin Lesion
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Upload an existing photo or capture one live with your camera
        </p>

        {/* ── Mode tabs ──────────────────────────────────────────────────────── */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleModeSwitch(id)}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                mode === id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content area ───────────────────────────────────────────────────── */}
      <div className="px-8 pb-8">
        <AnimatePresence mode="wait">

          {/* ── PREVIEW (shared between both modes after capture/select) ──── */}
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="relative rounded-xl overflow-hidden bg-black">
                <img
                  src={preview}
                  alt="Captured preview"
                  className="w-full h-80 object-cover"
                />
                {/* Overlay controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <button
                  onClick={clearAll}
                  disabled={isLoading}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white text-xs font-medium drop-shadow">
                    {mode === 'camera' ? 'Photo captured' : 'File selected'} — ready for analysis
                  </span>
                </div>
              </div>

              {/* Retake / Change button */}
              <button
                onClick={clearAll}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                {mode === 'camera' ? 'Retake Photo' : 'Choose Different Image'}
              </button>
            </motion.div>

          ) : mode === 'upload' ? (

            /* ── UPLOAD MODE ─────────────────────────────────────────────── */
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => !isLoading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <motion.div
                  animate={{ y: isDragging ? -4 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Upload className={`w-14 h-14 mx-auto mb-4 transition-colors duration-200 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                  <p className="text-lg font-semibold text-gray-700 mb-1">
                    {isDragging ? 'Drop it here!' : 'Drag & drop your image'}
                  </p>
                  <p className="text-sm text-gray-500 mb-5">or click anywhere to browse</p>
                  <span className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200">
                    Choose File
                  </span>
                  <p className="text-xs text-gray-400 mt-4">JPEG or PNG · Max 10 MB</p>
                </motion.div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="hidden"
              />
            </motion.div>

          ) : (

            /* ── CAMERA MODE ─────────────────────────────────────────────── */
            <motion.div
              key="camera"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Camera error state */}
              {cameraError ? (
                <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center space-y-3">
                  <Camera className="w-12 h-12 mx-auto text-red-400" />
                  <p className="text-sm font-semibold text-red-700">{cameraError}</p>
                  <p className="text-xs text-red-500">
                    Make sure you tap "Allow" when your browser asks for camera permission.
                  </p>
                  <button
                    onClick={() => startCamera()}
                    className="mt-2 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>

              ) : (
                /* Live camera viewfinder */
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                  {/* Video feed */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                  />

                  {/* Flash overlay */}
                  <AnimatePresence>
                    {flashActive && (
                      <motion.div
                        initial={{ opacity: 0.9 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="absolute inset-0 bg-white"
                      />
                    )}
                  </AnimatePresence>

                  {/* Scanning grid overlay */}
                  {cameraActive && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Corner brackets */}
                      {[
                        'top-4 left-4 border-t-2 border-l-2',
                        'top-4 right-4 border-t-2 border-r-2',
                        'bottom-4 left-4 border-b-2 border-l-2',
                        'bottom-4 right-4 border-b-2 border-r-2',
                      ].map((cls, i) => (
                        <div key={i} className={`absolute w-6 h-6 border-blue-400 rounded-sm ${cls}`} />
                      ))}
                      {/* Scan line */}
                      <motion.div
                        className="absolute left-4 right-4 h-px bg-blue-400/60"
                        style={{ boxShadow: '0 0 8px 2px rgba(96,165,250,0.5)' }}
                        animate={{ top: ['20%', '80%', '20%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                  )}

                  {/* Loading spinner while camera initialises */}
                  {!cameraActive && !cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full"
                      />
                      <p className="text-white/70 text-xs">Starting camera…</p>
                    </div>
                  )}

                  {/* Flip camera button (top-right) */}
                  {cameraActive && (
                    <button
                      onClick={flipCamera}
                      className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-sm text-white rounded-full hover:bg-black/60 transition-colors duration-200"
                      title="Flip camera"
                    >
                      <SwitchCamera className="w-5 h-5" />
                    </button>
                  )}

                  {/* Camera label */}
                  {cameraActive && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-white text-[10px] font-medium tracking-wide uppercase">
                        {facingMode === 'user' ? 'Front Cam' : 'Rear Cam'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Capture button */}
              {!cameraError && (
                <div className="flex items-center justify-center gap-4">
                  {/* Capture shutter */}
                  <motion.button
                    onClick={capturePhoto}
                    disabled={!cameraActive || capturing || isLoading}
                    whileTap={{ scale: 0.93 }}
                    className={`relative w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-200 ${
                      cameraActive && !capturing
                        ? 'border-blue-500 bg-white hover:bg-blue-50 cursor-pointer shadow-lg shadow-blue-200'
                        : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                    }`}
                  >
                    {capturing ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full transition-colors duration-200 ${
                        cameraActive ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </motion.button>
                </div>
              )}

              {/* Tip */}
              <p className="text-center text-xs text-gray-400">
                💡 Tip: Hold your device steady, ensure good lighting, and keep the lesion centred in the frame
              </p>

              {/* Hidden canvas for snapshot processing */}
              <canvas ref={canvasRef} className="hidden" />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Bottom info bar ─────────────────────────────────────────────────── */}
      {!preview && (
        <div className="px-8 pb-6">
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-100">
            {[
              { icon: '🔒', text: 'Private & secure' },
              { icon: '⚡', text: 'Results in seconds' },
              { icon: '📱', text: 'Works on all devices' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5 text-xs text-gray-400">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default UploadCard
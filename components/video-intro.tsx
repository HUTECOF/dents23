"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Play, SkipForward } from "lucide-react"

interface VideoIntroProps {
  onVideoEnd: () => void
  onSkip: () => void
  title?: string
}

export default function VideoIntro({ onVideoEnd, onSkip, title = "Dent's 23" }: VideoIntroProps) {
  const [showVideo, setShowVideo] = useState(true)
  const [canSkip, setCanSkip] = useState(false)

  useEffect(() => {
    // Allow skipping after 2 seconds
    const timer = setTimeout(() => {
      setCanSkip(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleVideoEnded = () => {
    setShowVideo(false)
    setTimeout(onVideoEnd, 300) // Small delay for smooth transition
  }

  const handleSkip = () => {
    if (canSkip) {
      setShowVideo(false)
      setTimeout(onSkip, 300)
    }
  }

  if (!showVideo) return null

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >
      <div className="relative w-full h-full max-w-5xl max-h-screen">
        {/* Video Background */}
        <video
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnded}
          className="w-full h-full object-contain"
        >
          <source src="/CORTINILLA INICIO DENTS 23.mp4" type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>

        {/* Skip Button */}
        {canSkip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-8 right-8 flex gap-4"
          >
            <Button
              onClick={handleSkip}
              variant="outline"
              size="lg"
              className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              Saltar Video
            </Button>
          </motion.div>
        )}

        {/* Loading indicator while video loads */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
            />
            <p className="text-lg font-medium">Cargando {title}...</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

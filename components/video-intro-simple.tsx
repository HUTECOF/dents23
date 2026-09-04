"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface VideoIntroProps {
  onVideoEnd: () => void
  onSkip: () => void
  title?: string
}

export default function VideoIntro({ onVideoEnd, onSkip, title = "Dent's 23" }: VideoIntroProps) {
  const [showVideo, setShowVideo] = useState(true)

  const handleVideoEnded = () => {
    setShowVideo(false)
    setTimeout(onVideoEnd, 300)
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
      </div>
    </motion.div>
  )
}

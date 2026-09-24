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

  const handleSkip = () => {
    setShowVideo(false)
    setTimeout(onSkip, 300)
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
          onError={handleSkip}
          className="w-full h-full object-contain"
        >
          <source src="/CORTINILLA INICIO DENTS 23.mp4" type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>
        <button
          type="button"
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-full border border-white/25 bg-black/45 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md transition hover:border-cyan-300/60 hover:bg-cyan-950/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:right-6 sm:top-6"
          aria-label="Omitir video de introducción"
        >
          Omitir intro
        </button>
      </div>
    </motion.div>
  )
}

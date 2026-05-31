import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { Bot } from 'lucide-react'

const Loading = () => {

  const navigate    = useNavigate()
  const { fetchUser } = useAppContext()

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUser()
      navigate('/')
    }, 8000)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 dark:bg-[#0D0B12] bg-[#F5F0FF]">

      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Bot avatar with ripple */}
      <div className="relative flex items-center justify-center">
        {/* Ripple rings */}
        <div className="absolute w-32 h-32 rounded-full border border-violet-500/20 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute w-24 h-24 rounded-full border border-violet-500/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.4s' }} />

        {/* Glow */}
        <div className="absolute w-20 h-20 rounded-full bg-violet-500/20 animate-pulseGlow" />

        {/* Icon */}
        <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/40 animate-float">
          <Bot size={34} className="text-white" />
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-2 z-10">
        <h2 className="text-2xl font-bold gradient-text">QuickGPT</h2>
        <p className="text-sm dark:text-slate-400 text-slate-500">Getting everything ready…</p>
      </div>

      {/* Loading dots */}
      <div className="flex items-center gap-2 z-10">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}

export default Loading
import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Bot, Eye, EyeOff, Sparkles } from 'lucide-react'

const Login = () => {

  const [state,    setState]    = useState('login')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)

  const { token, setToken } = useAppContext()
  const URL      = import.meta.env.VITE_SERVER_URL
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const url     = state === 'login' ? `${URL}/api/user/login` : `${URL}/api/user/register`
    const payload = state === 'login' ? { email, password } : { name, email, password }
    try {
      const res  = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      })
      const data = await res.json()
      if (res.ok) {
        setToken(data.token)
        localStorage.setItem('token', data.token)
        navigate('/')
      } else {
        toast.error(data.message || 'Something went wrong')
        console.error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong')
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-fadeInUp">
        {/* Card */}
        <div className="dark:bg-white/6 bg-white/80 backdrop-blur-2xl border border-violet-500/20 rounded-3xl p-8 shadow-2xl shadow-violet-500/10">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-pulseGlow scale-150" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/30 animate-float">
                <Bot size={28} className="text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold dark:text-white text-slate-800">
              {state === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-sm dark:text-slate-400 text-slate-500 mt-1">
              {state === 'login'
                ? 'Sign in to continue to QuickGPT'
                : 'Join QuickGPT and start chatting'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name (register only) */}
            {state === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium dark:text-slate-400 text-slate-500 uppercase tracking-wider">
                  Name
                </label>
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-violet-500/15 dark:bg-white/5 bg-black/4 focus-within:border-violet-500/50 focus-within:dark:bg-violet-500/5 transition-all">
                  <User size={15} className="text-violet-400 shrink-0" />
                  <input
                    onChange={e => setName(e.target.value)}
                    value={name}
                    placeholder="Your full name"
                    className="text-sm w-full outline-none bg-transparent dark:text-slate-200 text-slate-700 dark:placeholder:text-slate-600 placeholder:text-slate-400"
                    type="text"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium dark:text-slate-400 text-slate-500 uppercase tracking-wider">
                Email
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-violet-500/15 dark:bg-white/5 bg-black/4 focus-within:border-violet-500/50 focus-within:dark:bg-violet-500/5 transition-all">
                <Mail size={15} className="text-violet-400 shrink-0" />
                <input
                  onChange={e => setEmail(e.target.value)}
                  value={email}
                  placeholder="you@example.com"
                  className="text-sm w-full outline-none bg-transparent dark:text-slate-200 text-slate-700 dark:placeholder:text-slate-600 placeholder:text-slate-400"
                  type="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium dark:text-slate-400 text-slate-500 uppercase tracking-wider">
                Password
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-violet-500/15 dark:bg-white/5 bg-black/4 focus-within:border-violet-500/50 focus-within:dark:bg-violet-500/5 transition-all">
                <Lock size={15} className="text-violet-400 shrink-0" />
                <input
                  onChange={e => setPassword(e.target.value)}
                  value={password}
                  placeholder="••••••••"
                  className="text-sm w-full outline-none bg-transparent dark:text-slate-200 text-slate-700 dark:placeholder:text-slate-600 placeholder:text-slate-400"
                  type={showPass ? 'text' : 'password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="dark:text-slate-500 text-slate-400 hover:text-violet-400 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Toggle state */}
            <p className="text-xs dark:text-slate-400 text-slate-500 text-center">
              {state === 'register' ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => setState(state === 'login' ? 'register' : 'login')}
                className="text-violet-500 hover:text-violet-400 font-medium transition-colors"
              >
                {state === 'register' ? 'Sign in' : 'Sign up'}
              </button>
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="gradient-btn flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white font-medium text-sm mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={15} />
                  {state === 'register' ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login

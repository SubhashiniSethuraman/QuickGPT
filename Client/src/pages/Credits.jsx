import React, { useState } from 'react'
import Loading from './Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'
import { Gem, Check, Zap, Star, Crown } from 'lucide-react'

const PLAN_ICONS = {
  basic:    { Icon: Zap,   color: 'from-blue-500 to-cyan-400'     },
  pro:      { Icon: Star,  color: 'from-violet-500 to-purple-400' },
  premium:  { Icon: Crown, color: 'from-amber-500 to-orange-400'  },
}

const Credits = () => {

  const [plans,   setPlans]   = useState([])
  const [loading, setLoading] = useState(true)
  const URL = import.meta.env.VITE_SERVER_URL
  const { token } = useAppContext()

  const fetchPlans = async () => {
    try {
      const res  = await fetch(`${URL}/api/credit/plan`, {
        method:  'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) setPlans(data.plans)
      else { toast.error(data.message || 'Failed to fetch plans'); console.error(data.message) }
    } catch (error) {
      toast.error(error.message || 'Something went wrong')
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // const purchasePlan = async (planId) => {
  //   try {
  //     const res = await fetch(`${URL}/api/credit/purchase`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Authorization": `Bearer ${token}`
  //     },
  //     body: planId}
  //   )
  //   const data = await res.json()

  //   if(res.ok) {
  //     window.location.href = data.url;
  //   }
  //   else {
  //     toast.error(data.message)
  //   }
  //   }
  //   catch (error) {
  //     toast.error(error.message)
  //   }
  // }

  const purchasePlan = async (planId) => {
    const toastId = toast.loading('Loading…')
    try {
      const res  = await fetch(`${URL}/api/credit/purchase`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ planId })
      })
      const data = await res.json()
      toast.dismiss(toastId)
      if (res.ok) {
        toast.success('Redirecting to payment…')
        window.location.href = data.url
      } else {
        toast.error(data.message || 'Something went wrong')
        console.error(data.message)
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error(error.message || 'Something went wrong')
      console.error(error.message)
    }
  }

  useState(() => { fetchPlans() }, [])

  if (loading) return <Loading />

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-12">
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-60 bg-violet-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeInUp">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 mb-4 shadow-xl shadow-violet-500/25">
            <Gem size={26} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold dark:text-white text-slate-800 mb-2">
            Choose your <span className="gradient-text">plan</span>
          </h1>
          <p className="dark:text-slate-400 text-slate-500 text-sm max-w-md mx-auto">
            Purchase credits to unlock text chat, image generation, and voice conversations.
          </p>
        </div>

        {/* Plans grid */}
        <div className="flex flex-wrap justify-center gap-6">
          {plans.map((plan, i) => {
            const isPro     = plan._id === 'pro'
            const iconInfo  = PLAN_ICONS[plan._id] || PLAN_ICONS.basic
            const { Icon, color } = iconInfo

            return (
              <div
                key={plan._id}
                className={`
                  relative flex flex-col w-full max-w-72 rounded-2xl p-6
                  border transition-all duration-300 animate-fadeInUp
                  hover:-translate-y-1 hover:shadow-2xl
                  ${isPro
                    ? 'dark:bg-violet-500/10 bg-violet-50 border-violet-500/40 hover:shadow-violet-500/20 dark:hover:shadow-violet-500/15'
                    : 'dark:bg-white/5 bg-white/80 border-violet-500/15 hover:border-violet-500/30 dark:hover:shadow-black/30 hover:shadow-black/10'}
                `}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Popular badge */}
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-btn text-white text-xs font-semibold shadow-lg shadow-violet-500/30">
                    Most Popular
                  </div>
                )}

                {/* Plan icon */}
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${color} mb-4 shadow-lg`}>
                  <Icon size={20} className="text-white" />
                </div>

                {/* Name */}
                <h2 className="text-lg font-bold dark:text-white text-slate-800 mb-1">{plan.name}</h2>

                {/* Price */}
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-extrabold gradient-text">${plan.price}</span>
                </div>
                <p className="text-xs dark:text-slate-400 text-slate-500 mb-5">
                  {plan.credits} credits included
                </p>

                {/* Features */}
                <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm dark:text-slate-300 text-slate-600">
                      <div className="w-4 h-4 rounded-full bg-violet-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={10} className="text-violet-500" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => purchasePlan(plan._id)}
                  className={`
                    w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                    ${isPro
                      ? 'gradient-btn text-white'
                      : 'border border-violet-500/30 dark:text-violet-300 text-violet-600 dark:hover:bg-violet-500/10 hover:bg-violet-50 hover:border-violet-500/50'}
                  `}
                >
                  Get Started
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Credits
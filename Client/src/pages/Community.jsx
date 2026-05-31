import React, { useEffect, useState } from 'react'
import Loading from './Loading'
import { useAppContext } from '../context/AppContext'
import { ImageIcon, User, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

const Community = () => {

  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  const { token } = useAppContext()
  const URL = import.meta.env.VITE_SERVER_URL

  const fetchImages = async () => {
    try {
      const res  = await fetch(`${URL}/api/user/published-images`, {
        method:  'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setImages(data.images)
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

  useEffect(() => { fetchImages() }, [])

  if (loading) return <Loading />

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-10">
      {/* Background orb */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-80 h-80 bg-pink-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-fadeInUp">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
            <ImageIcon size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold dark:text-white text-slate-800">Community Gallery</h1>
            <p className="text-sm dark:text-slate-400 text-slate-500">
              {images.length > 0 ? `${images.length} AI-generated images` : 'AI-generated images shared by the community'}
            </p>
          </div>
        </div>

        {/* Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((item, i) => (
              <a
                key={item.imageUrl}
                href={item.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block rounded-2xl overflow-hidden border border-violet-500/15 hover:border-violet-500/35 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
              >
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <User size={11} className="text-white" />
                      </div>
                      <span className="text-xs text-white font-medium truncate max-w-24">
                        {item.userName}
                      </span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <ExternalLink size={11} className="text-white" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 gap-5 animate-fadeIn">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-pink-500/15 animate-pulseGlow scale-150" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-xl shadow-pink-500/25">
                <ImageIcon size={34} className="text-white" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold dark:text-white text-slate-800 mb-1">No images yet</h3>
              <p className="text-sm dark:text-slate-400 text-slate-500">
                Be the first to generate and publish an image to the community!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Community
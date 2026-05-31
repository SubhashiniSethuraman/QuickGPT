import React, { useState } from 'react'
import SideBar from './components/SideBar'
import { Routes, Route, useLocation } from 'react-router-dom'
import ChatBox from './components/ChatBox'
import Credits from './pages/Credits'
import Community from './pages/Community'
import { assets } from './assets/assets'
import './assets/prism.css'
import Loading from './pages/Loading'
import { useAppContext } from './context/AppContext'
import Login from './pages/Login'
import { Toaster } from 'react-hot-toast'
import { Menu, User } from 'lucide-react'

const App = () => {

  const { user, loadingUser, theme } = useAppContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()

  if (pathname === '/loading' || loadingUser)
    return <Loading />

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(20, 12, 35, 0.95)',
            color: '#F5F3FF',
            border: '1px solid rgba(168,85,247,0.3)',
            backdropFilter: 'blur(16px)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#A855F7', secondary: '#F5F3FF' } },
          error:   { iconTheme: { primary: '#F87171', secondary: '#F5F3FF' } },
        }}
      />

      <div className="app-bg dark:text-white text-slate-800 flex flex-col h-screen w-screen overflow-hidden">
        {/* Sticky Mobile Header */}
        {user && pathname !== '/login' && (
          <header className="md:hidden flex items-center justify-between px-4 py-3 dark:bg-[#0D0B12]/80 bg-white/70 backdrop-blur-md border-b border-violet-500/10 shrink-0 z-30">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-1.5 rounded-lg hover:bg-violet-500/10 text-violet-400 cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <img
              src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
              alt="QuickGPT"
              className="h-6 object-contain"
            />
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-md">
              <User size={13} className="text-white" />
            </div>
          </header>
        )}

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {user && (
            <SideBar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
          )}

          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/"         element={user ? <ChatBox /> : <Login />} />
            <Route path="/credits"  element={user ? <Credits />  : <Login />} />
            <Route path="/community" element={user ? <Community /> : <Login />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

export default App
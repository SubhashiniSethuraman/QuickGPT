import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import {
  Plus, Search, ImageIcon, Gem, Moon, Sun,
  LogOut, X, Trash2, MessageSquare, User
} from 'lucide-react'
import moment from 'moment'
import toast from 'react-hot-toast'

const SideBar = ({ isMenuOpen, setIsMenuOpen }) => {

  const {
    user, setUser, chats, setChats, selectedChat,
    setSelectedChat, theme, setTheme, navigate,
    createNewChat, fetchUsersChats, setToken, token
  } = useAppContext()

  const [search, setSearch] = useState('')
  const URL = import.meta.env.VITE_SERVER_URL

  const logOut = () => {
    localStorage.removeItem('token')
    setToken(null)
    toast.success('Logged out successfully')
  }

  const deleteChat = async (e, chatId) => {
    try {
      e.stopPropagation()
      const confirm = window.confirm('Are you sure you want to delete this chat?')
      if (!confirm) return null
      const res = await fetch(`${URL}/api/chat/deleteChat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ chatId })
      })
      const data = await res.json()
      if (res.ok) {
        setChats(prev => prev.filter(chat => chat._id !== chatId))
        await fetchUsersChats()
        return data.message
      } else {
        throw new Error(data.message || 'Failed to delete chat')
      }
    } catch (error) {
      console.error(error.message)
      throw error
    }
  }

  const handleDeleteChat = async (e, chatId) => {
    const toastId = toast.loading('Deleting...')
    try {
      const message = await deleteChat(e, chatId)
      if (message) {
        toast.success(message || 'Chat deleted successfully', { id: toastId })
      } else {
        toast.dismiss(toastId)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message || 'Something went wrong', { id: toastId })
    }
  }

  const filteredChats = chats.filter(chat =>
    chat.messages[0]
      ? chat.messages[0]?.content.toLowerCase().includes(search.toLowerCase())
      : chat.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      {/* Backdrop for mobile */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <aside
        className={`
          flex flex-col h-screen w-72 min-w-72 p-5 z-20
          border-r border-violet-500/10
          dark:bg-[#0D0B12]/80 bg-white/70
          backdrop-blur-2xl
          transition-transform duration-300 ease-in-out
          max-md:fixed max-md:left-0 max-md:top-0
          ${!isMenuOpen ? 'max-md:-translate-x-full' : 'max-md:translate-x-0'}
        `}
      >
        {/* Close button (mobile) */}
        <button
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-4 right-4 md:hidden p-1.5 rounded-lg hover:bg-violet-500/10 text-violet-400 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Logo */}
        <div className="mb-6">
          <img
            src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
            alt="QuickGPT"
            className="w-full max-w-44"
          />
        </div>

        {/* New Chat Button */}
        <button
          onClick={createNewChat}
          className="gradient-btn flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-sm font-medium cursor-pointer"
        >
          <Plus size={16} />
          New Chat
        </button>

        {/* Search */}
        <div className="flex items-center gap-2 mt-4 px-3 py-2.5 rounded-xl border border-violet-500/15 dark:bg-white/5 bg-black/5 focus-within:border-violet-500/40 transition-colors">
          <Search size={14} className="text-violet-400 shrink-0" />
          <input
            onChange={e => setSearch(e.target.value)}
            value={search}
            type="text"
            placeholder="Search conversations..."
            className="text-xs w-full outline-none bg-transparent dark:placeholder:text-slate-500 placeholder:text-slate-400 dark:text-slate-200 text-slate-700"
          />
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-1 pr-1">
          {filteredChats.length > 0 && (
            <p className="text-xs font-medium dark:text-slate-500 text-slate-400 uppercase tracking-wider mb-2 px-1">
              Recent
            </p>
          )}

          {filteredChats.map(chat => (
            <div
              key={chat._id}
              onClick={() => { navigate('/'); setSelectedChat(chat); setIsMenuOpen(false) }}
              className={`
                group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer
                transition-all duration-200
                ${selectedChat?._id === chat._id
                  ? 'dark:bg-violet-500/15 bg-violet-100 border border-violet-500/25'
                  : 'dark:hover:bg-white/5 hover:bg-black/5 border border-transparent'}
              `}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <MessageSquare
                  size={13}
                  className={`shrink-0 ${selectedChat?._id === chat._id ? 'text-violet-400' : 'dark:text-slate-500 text-slate-400'}`}
                />
                <p className="text-xs truncate dark:text-slate-300 text-slate-600">
                  {chat.messages.length > 0
                    ? chat.messages[0].content.slice(0, 30)
                    : chat.name}
                </p>
              </div>
              <button
                onClick={e => handleDeleteChat(e, chat._id)}
                className="shrink-0 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-500/15 text-red-400 transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}

          {filteredChats.length === 0 && search && (
            <p className="text-xs text-center dark:text-slate-600 text-slate-400 mt-6">
              No chats found
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px dark:bg-white/8 bg-black/8 my-3" />

        {/* Community Images */}
        <button
          onClick={() => { navigate('/community'); setIsMenuOpen(false) }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer dark:hover:bg-white/5 hover:bg-black/5 border border-transparent hover:border-violet-500/15 transition-all group w-full"
        >
          <div className="p-1.5 rounded-lg dark:bg-pink-500/10 bg-pink-100 group-hover:scale-110 transition-transform">
            <ImageIcon size={14} className="text-pink-400" />
          </div>
          <span className="text-sm dark:text-slate-300 text-slate-600">Community Images</span>
        </button>

        {/* Credits */}
        <button
          onClick={() => { navigate('/credits'); setIsMenuOpen(false) }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer dark:hover:bg-white/5 hover:bg-black/5 border border-transparent hover:border-violet-500/15 transition-all group w-full mt-1"
        >
          <div className="p-1.5 rounded-lg dark:bg-violet-500/10 bg-violet-100 group-hover:scale-110 transition-transform">
            <Gem size={14} className="text-violet-400" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm dark:text-slate-300 text-slate-600">Credits</span>
            <span className="text-xs dark:text-violet-400 text-violet-600 font-medium">{user?.credits ?? 0} remaining</span>
          </div>
        </button>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between px-3 py-2.5 mt-1 rounded-xl dark:bg-white/3 bg-black/3 border border-violet-500/10">
          <div className="flex items-center gap-2.5">
            {theme === 'dark'
              ? <Moon size={15} className="text-violet-400" />
              : <Sun  size={15} className="text-amber-400" />
            }
            <span className="text-sm dark:text-slate-300 text-slate-600">
              {theme === 'dark' ? 'Dark' : 'Light'} Mode
            </span>
          </div>
          {/* Toggle pill */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`
              relative w-9 h-5 rounded-full transition-all duration-300 cursor-pointer shrink-0
              ${theme === 'dark' ? 'bg-violet-600' : 'bg-slate-300 dark:bg-zinc-700'}
            `}
          >
            <span
              className={`
                absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md
                transition-transform duration-300
                ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}
              `}
            />
          </button>
        </div>

        {/* User Account */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl dark:bg-white/3 bg-black/3 border border-violet-500/10 group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shrink-0">
            <User size={13} className="text-white" />
          </div>
          <p className="flex-1 text-sm dark:text-slate-300 text-slate-600 truncate">
            {user ? user.name : 'Login your account'}
          </p>
          {user && (
            <button
              onClick={logOut}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 text-red-400 transition-all"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

export default SideBar
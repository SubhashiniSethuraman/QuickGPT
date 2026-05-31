import React, { useEffect, useState, useRef } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'
import moment from 'moment'
import {
  Type, ImageIcon, Mic, MicOff, Paperclip,
  SendHorizonal, Square, X, Bot, Sparkles, Trash2
} from 'lucide-react'

const MODES = [
  { id: 'text',  label: 'Text',  Icon: Type      },
  { id: 'image', label: 'Image', Icon: ImageIcon  },
  { id: 'voice', label: 'Voice', Icon: Mic        },
]

const ChatBox = () => {

  const [editingMessage, setEditingMessage] = useState(null)
  const [editingText, setEditingText]       = useState('')

  function formatDateSeparator (timestamp) {
    const date = moment(timestamp);

    if (date.isSame(moment(), "day")) {
      return "Today";
    }

    if (date.isSame(moment().subtract(1, "day"), "day")) {
      return "Yesterday";
    }

    if (date.isSame(moment(), "year")) {
      return date.format("DD MMMM");
    }

    return date.format("DD MMMM YYYY");
  };

  const containerRef = useRef(null)

  const {
    selectedChat, setSelectedChat,
    chats, setChats,
    theme, user, token, setUser
  } = useAppContext()

  const [messages,       setMessages]       = useState([])
  const [loading,        setLoading]        = useState(false)
  const [prompt,         setPrompt]         = useState('')
  const [mode,           setMode]           = useState('text')
  const [isPublished,    setIsPublished]    = useState(false)
  const [isRecording,    setIsRecording]    = useState(false)
  const [selectedImage,  setSelectedImage]  = useState(null)
  const [showModeDropdown, setShowModeDropdown] = useState(false)

  const SERVER_URL       = import.meta.env.VITE_SERVER_URL
  const mediaRecorderRef = useRef(null)
  const audioChunksRef   = useRef([])
  const textareaRef      = useRef(null)

  /* ── Voice Recording ───────────────────────────────── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current   = []
      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      mediaRecorder.start()
      setIsRecording(true)
    } catch {
      toast.error('Microphone permission denied')
    }
  }

  const stopRecording = async () => {
    try {
      if (!mediaRecorderRef.current) return
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false)
        setLoading(true)
        let currentChatId = selectedChat?._id
        if (!currentChatId) {
          const createRes  = await fetch(`${SERVER_URL}/api/chat/createChat`, {
            method: 'POST', headers: { Authorization: `Bearer ${token}` }
          })
          const createData = await createRes.json()
          if (!createRes.ok) throw new Error(createData.message)
          currentChatId = createData.chat._id
          setSelectedChat(createData.chat)
          setChats(prev => [createData.chat, ...prev])
        }
        const audioBlob   = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const arrayBuffer = await audioBlob.arrayBuffer()
        const res  = await fetch(`${SERVER_URL}/api/message/voice`, {
          method:  'POST',
          headers: { 'Content-Type': 'audio/webm', Authorization: `Bearer ${token}`, chatid: currentChatId },
          body:    arrayBuffer
        })
        const data = await res.json()
        if (res.ok) {
          const audioUrl = URL.createObjectURL(audioBlob)
          setMessages(prev => [...prev, {
            role: 'user', content: data.transcript,
            audio: audioUrl, timestamp: Date.now(), isImage: false, isVoice: true
          }])
          setMessages(prev => [...prev, data.reply])
          setUser(prev => ({ ...prev, credits: prev.credits - 3 }))
        } else {
          toast.error(data.message || 'Something went wrong')
          console.error(data.message)
        }
        setLoading(false)
      }
    } catch (error) {
      setLoading(false)
      toast.error(error.message || 'Something went wrong')
      console.error(error.message)
    }
  }

  /* ── Edit Message ──────────────────────────────────── */
  const handleSaveEdit = async (message) => {
    try {
      setLoading(true)
      const editIndex = messages.findIndex(msg => msg.timestamp === message.timestamp)
      if (editIndex === -1) return
      const updatedMessages = messages.slice(0, editIndex)
      setMessages(updatedMessages)
      const editedUserMessage = { ...message, content: editingText }
      setMessages(prev => [...prev, editedUserMessage])
      const formData = new FormData()
      formData.append('chatId', selectedChat._id)
      formData.append('prompt', editingText)
      const res  = await fetch(`${SERVER_URL}/api/message/text`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(prev => [...prev, data.reply])
        setEditingMessage(null)
        setEditingText('')
      } else {
        toast.error(data.message || 'Something went wrong')
        console.error(data.message)
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  /* ── Submit ────────────────────────────────────────── */
  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!user)            return toast.error('Login to send message')
      if (mode === 'voice') return

      let currentChatId = selectedChat?._id
      if (!currentChatId) {
        const createRes  = await fetch(`${SERVER_URL}/api/chat/createChat`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }
        })
        const createData = await createRes.json()
        if (!createRes.ok) throw new Error(createData.message)
        currentChatId = createData.chat._id
        setSelectedChat(createData.chat)
        setChats(prev => [createData.chat, ...prev])
      }

      setLoading(true)
      const promptCopy = prompt
      setPrompt('')

      if (editingMessage) {
        const editIndex = messages.findIndex(msg => msg.timestamp === editingMessage.timestamp)
        if (editIndex !== -1) setMessages(prev => prev.slice(0, editIndex))
      }

      setMessages(prev => [...prev, {
        role: 'user', content: prompt,
        image: selectedImage ? URL.createObjectURL(selectedImage) : null,
        timestamp: Date.now(), isImage: false
      }])

      const formData = new FormData()
      formData.append('chatId',  currentChatId)
      formData.append('prompt',  prompt)
      if (selectedImage) formData.append('image', selectedImage)

      const res  = await fetch(`${SERVER_URL}/api/message/${mode}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
      })
      const data = await res.json()

      if (res.ok) {
        setMessages(prev => [...prev, data.reply])
        setSelectedImage(null)
        setEditingMessage(null)
        setEditingText('')
        setUser(prev => ({
          ...prev,
          credits: mode === 'image' ? prev.credits - 2
                 : mode === 'voice' ? prev.credits - 3
                 : prev.credits - 1
        }))
      } else {
        toast.error(data.message || 'Something went wrong')
        console.error(data.message)
        setPrompt(promptCopy)
      }
    } catch (error) {
      console.error(error.message)
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  /* ── Auto-resize textarea ──────────────────────────── */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px'
    }
  }, [prompt])

  useEffect(() => {
    setPrompt('')
    setSelectedImage(null)
    setIsPublished(false)
    setMode('text')
    setMessages(selectedChat ? selectedChat.messages : [])
  }, [selectedChat])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  /* ── Suggestion chips (empty state) ───────────────── */
  const suggestions = [
    'Explain quantum computing',
    'Write a poem about the ocean',
    'Generate a mountain landscape',
    'Help me debug my code',
  ]

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">

      {/* Messages area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 md:px-10 xl:px-20 2xl:px-40 py-6"
      >
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-6 animate-fadeIn">

            {/* Bot avatar with glow */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-pulseGlow scale-150" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl animate-float">
                <Bot size={36} className="text-white" />
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                <span className="gradient-text">How can I help</span>
                <span className="dark:text-white text-slate-800"> you today?</span>
              </h1>
              <p className="dark:text-slate-400 text-slate-500 text-sm">
                Chat, generate images, or talk — all in one place.
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg mt-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(s)}
                  className="text-left px-4 py-3 rounded-xl text-sm dark:bg-white/5 bg-white/60 border border-violet-500/15 dark:text-slate-300 text-slate-600 dark:hover:bg-violet-500/10 hover:bg-violet-50 hover:border-violet-400/30 transition-all duration-200 flex items-center gap-2"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <Sparkles size={13} className="text-violet-400 shrink-0" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((message, index) => {
          const currentDate  = moment(message.timestamp).format('YYYY-MM-DD')
          const previousDate = index > 0 ? moment(messages[index - 1].timestamp).format('YYYY-MM-DD') : null
          const showDate     = currentDate !== previousDate

          return (
            <div key={index} className="msg-enter" style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s` }}>
              {showDate && (
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px dark:bg-white/8 bg-black/8" />
                  <span className="text-xs px-3 py-1 rounded-full dark:bg-white/8 bg-black/6 dark:text-slate-400 text-slate-500 font-medium">
                    {formatDateSeparator(message.timestamp)}
                  </span>
                  <div className="flex-1 h-px dark:bg-white/8 bg-black/8" />
                </div>
              )}
              <Message
                message={message}
                editingMessage={editingMessage}
                editingText={editingText}
                setEditingText={setEditingText}
                onEdit={msg => { setEditingMessage(msg); setEditingText(msg.content) }}
                onSaveEdit={handleSaveEdit}
              />
            </div>
          )
        })}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-center gap-3 my-4 animate-fadeIn">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm dark:bg-white/8 bg-white/80 border border-violet-500/15">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="px-4 md:px-10 xl:px-20 2xl:px-40 pb-5 pt-2 shrink-0">

        {/* Publish toggle (image mode) */}
        {mode === 'image' && (
          <div className="flex items-center justify-center gap-3 mb-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs dark:text-slate-400 text-slate-500">Publish to Community</span>
              <button
                type="button"
                onClick={() => setIsPublished(p => !p)}
                className={`relative w-9 h-5 rounded-full transition-all duration-300 shrink-0 ${isPublished ? 'bg-violet-600' : 'dark:bg-white/15 bg-black/15'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${isPublished ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </label>
          </div>
        )}

        <div className="w-full max-w-3xl mx-auto">
          {/* Input form */}
          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-3 px-4 py-3 rounded-2xl dark:bg-white/6 bg-white/70 border border-violet-500/20 dark:border-violet-500/15 shadow-xl dark:shadow-black/20 backdrop-blur-xl w-full max-w-3xl mx-auto relative"
          >
            {/* Selected image preview inside the form container */}
            {selectedImage && (
              <div className="flex items-center gap-2.5 border-b border-violet-500/10 dark:border-white/5 pb-2.5 w-full animate-fadeIn">
                <div className="relative group w-12 h-12 rounded-xl overflow-hidden border border-violet-500/25 shadow-sm shrink-0">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-xs font-semibold dark:text-slate-200 text-slate-700 truncate max-w-44">
                    {selectedImage.name}
                  </span>
                  <span className="text-[10px] dark:text-slate-500 text-slate-400">
                    {(selectedImage.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            )}

            {/* Input & controls row */}
            <div className="flex items-end gap-3 w-full relative">
              {/* Mode Selector Dropup Button */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModeDropdown(prev => !prev)}
                  className="flex items-center gap-1.5 p-2 rounded-xl dark:hover:bg-white/8 hover:bg-black/6 dark:text-slate-300 text-slate-600 transition-all cursor-pointer select-none shrink-0"
                  title="Choose active model mode"
                >
                  {React.createElement(MODES.find(m => m.id === mode)?.Icon || Type, { size: 16, className: "text-violet-400" })}
                  <span className="text-xs font-semibold hidden sm:inline capitalize">{mode}</span>
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${showModeDropdown ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropup overlay */}
                {showModeDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowModeDropdown(false)} />
                    <div className="absolute bottom-full mb-3 left-0 w-56 z-50 rounded-2xl border border-violet-500/20 dark:bg-[#151022] bg-white shadow-2xl p-2 animate-fadeInUp flex flex-col gap-1">
                      <p className="text-[10px] font-semibold tracking-wider uppercase dark:text-slate-500 text-slate-400 px-3 py-1.5 border-b border-violet-500/10">
                        Select Mode
                      </p>
                      {MODES.map(({ id, label, Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => { setMode(id); setShowModeDropdown(false) }}
                          className={`
                            w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer
                            ${mode === id
                              ? 'dark:bg-violet-500/15 bg-violet-50 text-violet-400 border border-violet-500/20'
                              : 'dark:text-slate-300 text-slate-600 dark:hover:bg-white/5 hover:bg-black/5 border border-transparent'}
                          `}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon size={14} className={mode === id ? 'text-violet-400' : 'text-slate-400'} />
                            <span className="text-xs font-semibold">{label}</span>
                          </div>
                          {mode === id && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {mode === 'voice' ? (
                /* Voice mode UI */
                <div className="flex-1 flex items-center gap-3 py-1.5 min-w-0">
                  {isRecording ? (
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-end gap-0.5 h-6 shrink-0">
                        <div className="wave-bar" />
                        <div className="wave-bar" />
                        <div className="wave-bar" />
                        <div className="wave-bar" />
                        <div className="wave-bar" />
                      </div>
                      <span className="text-sm dark:text-slate-300 text-slate-600 animate-pulse truncate">Listening…</span>
                    </div>
                  ) : (
                    <span className="text-sm dark:text-slate-500 text-slate-400 truncate">Click the mic to start speaking</span>
                  )}
                </div>
              ) : (
                /* Text / Image textarea */
                <textarea
                  ref={textareaRef}
                  onChange={e => setPrompt(e.target.value)}
                  value={prompt}
                  placeholder={mode === 'image' ? 'Describe the image you want to generate…' : 'Ask me anything…'}
                  rows={1}
                  className="flex-1 w-full text-sm outline-none bg-transparent resize-none dark:text-slate-200 text-slate-700 dark:placeholder:text-slate-600 placeholder:text-slate-400 leading-relaxed py-1"
                  style={{ maxHeight: '128px' }}
                  required
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      onSubmit(e)
                    }
                  }}
                />
              )}

              {/* Right action buttons */}
              <div className="flex items-center gap-1.5 shrink-0 py-0.5">
                {/* Clear recording */}
                {mode === 'voice' && isRecording && (
                  <button
                    type="button"
                    onClick={() => { setIsRecording(false); setPrompt('') }}
                    className="p-2 rounded-xl dark:hover:bg-red-500/15 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                {/* File upload (text mode) */}
                {mode === 'text' && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      id="imageUpload"
                      hidden
                      onChange={e => setSelectedImage(e.target.files[0])}
                    />
                    <label
                      htmlFor="imageUpload"
                      className="p-2 rounded-xl dark:hover:bg-white/8 hover:bg-black/6 dark:text-slate-400 text-slate-500 cursor-pointer transition-all shrink-0"
                      title="Attach image"
                    >
                      <Paperclip size={16} />
                    </label>
                  </>
                )}

                {/* Mic button (voice mode) */}
                {mode === 'voice' && (
                  <button
                    type="button"
                    onClick={() => isRecording ? stopRecording() : startRecording()}
                    className={`
                      p-2 rounded-xl transition-all duration-300 cursor-pointer shrink-0
                      ${isRecording
                        ? 'bg-red-500/20 text-red-400 shadow-[0_0_16px_rgba(239,68,68,0.3)] scale-110'
                        : 'dark:hover:bg-white/8 hover:bg-black/6 text-violet-400'}
                    `}
                  >
                    {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                )}

                {/* Send / Stop button */}
                <button
                  type="submit"
                  disabled={loading || (mode === 'voice' && isRecording)}
                  className={`
                    p-2 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0
                    ${loading
                      ? 'dark:bg-white/8 bg-black/6 text-slate-400 cursor-not-allowed'
                      : 'gradient-btn text-white shadow-lg shadow-violet-500/25'}
                  `}
                >
                  {loading
                    ? <Square size={16} className="fill-current" />
                    : <SendHorizonal size={16} />
                  }
                </button>
              </div>
            </div>
          </form>

          <p className="text-center text-xs dark:text-slate-600 text-slate-400 mt-2">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatBox
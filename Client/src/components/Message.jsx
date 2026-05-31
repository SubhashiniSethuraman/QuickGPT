import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import moment from 'moment'
import Markdown from 'react-markdown'
import Prism from 'prismjs'
import toast from 'react-hot-toast'
import { Copy, Download, Edit, Bot, User, Check, X } from 'lucide-react'

const Message = ({
  message,
  onEdit,
  editingMessage,
  editingText,
  setEditingText,
  onSaveEdit
}) => {

  const [showTranscript, setShowTranscript] = useState(false)
  const [copied,         setCopied]         = useState(false)

  function formatTime(timestamp) {
    return moment(timestamp).format('hh:mm A')
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload(url) {

    //The browser needs something like: user clicking a link to actually begin downloading.
    //<a href="image.png" download>
    // So JavaScript is simply creating and clicking that link automatically.

    const link = document.createElement("a");
    link.href = url;
    link.download = "image.png";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  }

function handleEdit(message) {
  onEdit(message);
  }

  useEffect(() => {
    Prism.highlightAll()
  }, [message.content])

  const isUser = message.role === 'user'
  const isEditing = editingMessage?.timestamp === message.timestamp

  /* ── USER bubble ──────────────────────────────────── */
  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-2.5 my-3">
        <div className="flex flex-col items-end gap-1 max-w-[78%]">

          {/* Bubble */}
          <div className="relative group px-4 py-3 rounded-2xl rounded-br-sm bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20">

            {/* Image attachment */}
            {message.image && (
              <img
                src={message.image}
                alt=""
                className="max-w-xs rounded-xl mb-2 border border-white/20"
              />
            )}

            {/* Voice message */}
            {message.isVoice ? (
              <div className="flex flex-col gap-2">
                <audio
                  controls
                  preload="auto"
                  src={message.audio}
                  className="max-w-xs h-8 rounded-md"
                />
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="text-xs text-violet-200 hover:text-white transition-colors text-left"
                >
                  {showTranscript ? 'Hide transcript ↑' : 'View transcript ↓'}
                </button>
                {showTranscript && (
                  <p className="text-sm text-violet-100 italic">{message.content}</p>
                )}
              </div>
            ) : isEditing ? (
              /* Edit mode */
              <div className="flex flex-col gap-2 min-w-48">
                <textarea
                  value={editingText}
                  onChange={e => setEditingText(e.target.value)}
                  rows={3}
                  className="text-sm text-white bg-white/10 border border-white/25 rounded-xl p-2 outline-none resize-none placeholder:text-violet-200 w-full"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onSaveEdit(message)}
                    className="flex items-center gap-1.5 text-xs bg-white text-violet-700 font-medium px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors"
                  >
                    <Check size={12} /> Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed">{message.content}</p>
            )}

            {/* Action row */}
            <div className="flex items-center justify-between mt-1.5 gap-3">
              <span className="text-[10px] text-violet-200/70">{formatTime(message.timestamp)}</span>
              {!message.isVoice && !message.image && !isEditing && (
                <button
                  onClick={() => onEdit(message)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/15 text-violet-200 hover:text-white transition-all"
                  title="Edit"
                >
                  <Edit size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center shrink-0 shadow-md">
          <User size={14} className="text-white" />
        </div>
      </div>
    )
  }

  /* ── AI bubble ────────────────────────────────────── */
  return (
    <div className="flex items-end gap-2.5 my-3">
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-violet-500/30">
        <Bot size={14} className="text-white" />
      </div>

      <div className="flex flex-col items-start gap-1 max-w-[78%]">
        <div className="relative group px-4 py-3 rounded-2xl rounded-tl-sm dark:bg-white/8 bg-white/80 border border-violet-500/15 shadow-sm">

          {/* Image response */}
          {message.isImage ? (
            <img
              src={message.content}
              alt=""
              className="w-full max-w-md rounded-xl border border-violet-500/20"
            />
          ) : (
            <div className="text-sm dark:text-slate-200 text-slate-700 reset-tw leading-relaxed">
              <Markdown>{message.content}</Markdown>
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center justify-between mt-2 gap-3">
            <span className="text-[10px] dark:text-slate-500 text-slate-400">{formatTime(message.timestamp)}</span>
            {message.isImage ? (
              <button
                onClick={() => handleDownload(message.content)}
                className="flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 px-2 py-1 rounded-lg dark:bg-white/8 bg-black/6 dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-800 transition-all"
                title="Download"
              >
                <Download size={12} />
              </button>
            ) : (
              <button
                onClick={() => handleCopy(message.content)}
                className="flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 px-2 py-1 rounded-lg dark:bg-white/8 bg-black/6 dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-800 transition-all"
                title="Copy"
              >
                {copied ? <Check size={12} className="text-violet-400" /> : <Copy size={12} />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Message
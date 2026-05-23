import React, { useEffect } from 'react'
import { assets } from '../assets/assets'
import moment from 'moment'
import Markdown from 'react-markdown'
import Prism from 'prismjs'
import toast from 'react-hot-toast'
import { Copy, Download, Edit } from 'lucide-react'

const Message = ({ message }) => {

  function formatTime(timestamp) {
    return moment(timestamp).format("hh:mm A");
  }

  function handleCopy(text) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
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

  function handleEdit(prompt) {

  }

  useEffect(() => {
    Prism.highlightAll()
  }, [message.content])

  return (
    <div>
      {message.role === "user" ? (
        <div className='flex items-start justify-end my-4 gap-2'>
          <div className='flex flex-col gap-2 p-2 px-4 bg-slate-50 dark:bg-[#57317C]/30
          border border-[#80609F]/30 rounded-md max-w-2xl'>
            {message.image && (
    <img
      src={message.image}
      alt=""
      className='max-w-xs rounded-lg mb-2'
    />
  )}

            <p className='text-sm dark:text-primary'>{message.content}</p>
            <div className='flex items-center justify-between mt-0'>
              <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>{formatTime(message.timestamp)}</span>
              <button onClick={() => handleEdit(message.content)}><Edit size={14} /></button>
            </div>
          </div>
          <img src={assets.user_icon} alt="" className='w-8 rounded-full' />
        </div>
      )
        :
        (
          <div className='inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-primary/20
        dark:bg-[#57317C]/30 border bordr-[#80609F]/30 rounded-md my-4'>
            {message.isImage ? (
              <img src={message.content} alt="" className='w-full max-w-md mt-2 rounded-md' />
            ) : (
              //message.content (Markdown text)-> Markdown component-> Converted to HTML (ul, li, h1, p)-> 
              // .reset-tw removes Tailwind overrides -> Browser default styles apply-> Bullets + spacing + neat formatting
              //for code and pre -> use prims css file (hardcoded in assets folder) and prismjs (installed)
              <div>
                <div className='text-sm dark:text-primary reset-tw'><Markdown>{message.content}</Markdown></div>
              </div>
            )}
            <div className='flex items-center justify-between mt-0'>
              <span className='text-xs text-gray-400 dark:text-[#B1A6C0]'>{formatTime(message.timestamp)}</span>
              {message.isImage ? (
                <button
                  onClick={() => handleDownload(message.content)}
                  className='flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-800 dark:text-[#B1A6C0] dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-[#80609F]/20 cursor-pointer'
                  title="Download image"
                >
                  <Download size={14} />
                </button>
              ) : (
                <button
                  onClick={() => handleCopy(message.content)}
                  className='flex items-center justify-center p-1.5 text-gray-400 hover:text-gray-800 dark:text-[#B1A6C0] dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-[#80609F]/20 cursor-pointer'
                  title="Copy to clipboard"
                >
                  <Copy size={14} />
                </button>
              )}
            </div>
          </div>
        )}
    </div>
  )
}

export default Message
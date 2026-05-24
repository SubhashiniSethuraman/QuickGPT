import React, { useEffect, useState, useRef } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'
import moment from 'moment'

const ChatBox = () => {

  const [editingMessage, setEditingMessage] = useState(null);
const [editingText, setEditingText] = useState("");

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

  const {selectedChat,
  setSelectedChat,
  chats,
  setChats,
  theme,
  user,
  token,
  setUser } = useAppContext()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const [prompt, setPrompt] = useState("")
  const [mode, setMode] = useState("text")
  const [isPublished, setIsPublished] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null);

  const SERVER_URL = import.meta.env.VITE_SERVER_URL;

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {

  try {

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true
      });

    const mediaRecorder =
      new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;

    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {

      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.start();

    setIsRecording(true);

  } catch (error) {

    toast.error("Microphone permission denied");
  }
};

const stopRecording = async () => {

  try {

    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.onstop = async () => {

      setIsRecording(false);

      setLoading(true);

      let currentChatId = selectedChat?._id;

if (!currentChatId) {

  const createRes = await fetch(
    `${SERVER_URL}/api/chat/createChat`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }
  );

  const createData = await createRes.json();

  if (!createRes.ok) {
    throw new Error(createData.message);
  }

  currentChatId = createData.chat._id;

  setSelectedChat(createData.chat);

  setChats(prev => [
    createData.chat,
    ...prev
  ]);
}

      // Create audio blob
      const audioBlob = new Blob(
        audioChunksRef.current,
        {
          type: "audio/webm"
        }
      );

      // Convert to array buffer
      const arrayBuffer =
        await audioBlob.arrayBuffer();

      const res = await fetch(
        `${SERVER_URL }/api/message/voice`,
        {
          method: "POST",

          headers: {
            "Content-Type": "audio/webm",
            "Authorization": `Bearer ${token}`,
            "chatid": currentChatId
          },

          body: arrayBuffer
        }
      );

      const data = await res.json();

      if (res.ok) {

        const audioUrl = URL.createObjectURL(audioBlob);
        // user voice transcript
        setMessages(prev => [
          ...prev,
          {
            role: "user",
            content: data.transcript,
            audio: audioUrl,
            timestamp: Date.now(),
            isImage: false,
            isVoice: true
          }
        ]);

        // assistant reply
        setMessages(prev => [
          ...prev,
          data.reply
        ]);

        // deduct credits
        setUser(prev => ({
          ...prev,
          credits: prev.credits - 3
        }));

      } else {

        toast.error("Something went wrong");
        console.error(data.message)
      }

      setLoading(false);
    };

  } catch (error) {

    setLoading(false);

    toast.error("Something went wrong");
    console.error(error.message);
  }
};


const handleSaveEdit = async (message) => {

  try {

    setLoading(true);

    const editIndex = messages.findIndex(
      msg =>
        msg.timestamp === message.timestamp
    );

    if (editIndex === -1) return;

    // remove old user + assistant msgs
    const updatedMessages =
      messages.slice(0, editIndex);

    setMessages(updatedMessages);

    // add edited user msg
    const editedUserMessage = {
      ...message,
      content: editingText
    };

    setMessages(prev => [
      ...prev,
      editedUserMessage
    ]);

    const formData = new FormData();

    formData.append(
      "chatId",
      selectedChat._id
    );

    formData.append(
      "prompt",
      editingText
    );

    const res = await fetch(
      `${SERVER_URL}/api/message/text`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    );

    const data = await res.json();

    if (res.ok) {

      setMessages(prev => [
        ...prev,
        data.reply
      ]);

      setEditingMessage(null);
      setEditingText("");

    } else {

      toast.error("Something went wrong");
      console.error(data.message);
    }

  } catch (error) {

    toast.error("Something went wrong");
    console.error(error);

  } finally {

    setLoading(false);
  }
};


  const onSubmit = async (e) => {
    e.preventDefault();

    try {

      if (!user) {
        return toast.error("Login to send message");
      }

      if (mode === "voice") return;

      let currentChatId = selectedChat?._id;

if (!currentChatId) {

  const createRes = await fetch(
    `${SERVER_URL}/api/chat/createChat`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }
  );

  const createData = await createRes.json();

  if (!createRes.ok) {
    throw new Error(createData.message);
  }

  currentChatId = createData.chat._id;

  setSelectedChat(createData.chat);

  setChats(prev => [
    createData.chat,
    ...prev
  ]);
}

      setLoading(true);

      const promptCopy = prompt;

      setPrompt("");

      // Add user message instantly
      // setMessages(prev => [
      //   ...prev,
      //   {
      //     role: "user",
      //     content: prompt,
      //     timestamp: Date.now(),
      //     isImage: false
      //   }
      // ]);

      if (editingMessage) {

  const editIndex = messages.findIndex(
    msg =>
      msg.timestamp === editingMessage.timestamp
  );

  if (editIndex !== -1) {

    // remove old user msg + assistant msg
    setMessages(prev =>
      prev.slice(0, editIndex)
    );
  }
}

      setMessages(prev => [
  ...prev,
  {
    role: "user",
    content: prompt,
    image: selectedImage
      ? URL.createObjectURL(selectedImage)
      : null,
    timestamp: Date.now(),
    isImage: false
  }
]);

      // const res = await fetch(`${URL}/api/message/${mode}`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Authorization": `Bearer ${token}`
      //   },
      //   body: JSON.stringify({
      //     chatId: selectedChat._id,
      //     prompt,
      //     isPublished
      //   })
      // });

      const formData = new FormData();

formData.append("chatId", currentChatId);

formData.append("prompt", prompt);

if (selectedImage) {
  formData.append("image", selectedImage);
}

const res = await fetch(`${SERVER_URL }/api/message/${mode}`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`
  },
  body: formData
});
      const data = await res.json();

      if (res.ok) {

        setMessages(prev => [...prev, data.reply]);
        setSelectedImage(null);
        setEditingMessage(null);
setEditingText("");
        // decrease credits
        setUser(prev => ({
          ...prev,
          credits:
            mode === "image"
              ? prev.credits - 2
              : mode === "voice"
                ? prev.credits - 3
                : prev.credits - 1
        }));

      } else {

        toast.error("Something went wrong");
        console.error(data.message)
        // restore prompt if failed
        setPrompt(promptCopy);
      }

    } catch (error) {

      console.error(error.message)
      toast.error("Something went wrong");

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    setPrompt("");

  setSelectedImage(null);
  setIsPublished(false);
  setMode("text");
    if (selectedChat) {
      setMessages(selectedChat.messages)
    } else {

    setMessages([]);
  }
  }, [selectedChat])

  //while clicking the chat in sidebar, it smoothly moves to last message of that particular chat
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  return (
    <div className='flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30
    max-md:mt-14 2xl:pr-40'>

      {/* Chat Messages */}
      <div ref={containerRef} className='flex-1 mb-5 overflow-y-scroll'>
        {messages.length === 0 && (
          <div className='h-full flex flex-col items-center justify-center fap-2 text-primary'>
            <img src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark} alt=""
              className='w-full max-w-56 sm:max-w-68' />
            <p className='mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white'>Ask me anything</p>
          </div>
        )}

        {/* {messages.map((message, index) => <Message key={index} message={message} />)} */}

        {messages.map((message, index) => {

          const currentDate = moment(message.timestamp).format("YYYY-MM-DD");
 
           const previousDate =
             index > 0
               ? moment(messages[index - 1].timestamp).format("YYYY-MM-DD")
               : null;
 
           const showDateSeparator = currentDate !== previousDate;

          return (
            <div key={index}>

              {/* Date Separator */}
              {showDateSeparator && (
                <div className="text-center my-4 text-xs text-gray-500">
                   {formatDateSeparator(message.timestamp)}
                 </div>
              )}

              {/* Existing Component */}
              {/* <Message message={message} /> */}
              {/* <Message
  message={message}
  onEdit={(msg) => {
    setEditingMessage(msg);
    setEditingText(msg.content);
    setPrompt(msg.content);
  }}
/> */}

<Message
  message={message}
  editingMessage={editingMessage}
  editingText={editingText}
  setEditingText={setEditingText}
  onEdit={(msg) => {
    setEditingMessage(msg);
    setEditingText(msg.content);
  }}
  onSaveEdit={handleSaveEdit}
/>

            </div>
          );
        })}

        {
          loading &&
          //here loader is classname which is used in index.css
          <div className='loader flex items-center gap-1.5'>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'>
            </div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'>
            </div>
            <div className='w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce'>
            </div>
          </div>
        }
      </div>

      {mode === 'image' && (
        <label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto'>
          <p className='text-xs'>Publish Generated Image to Community</p>
          <input type='checkbox' className='cursor-pointer' checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
        </label>
      )}

     {selectedImage && (
  <div className='max-w-2xl mx-auto mb-3 relative w-fit'>

    <img
      src={URL.createObjectURL(selectedImage)}
      alt=""
      className='w-20 h-20 object-cover rounded-xl border border-gray-300 dark:border-[#80609F]/30'
    />

    <button
      type='button'
      onClick={() => setSelectedImage(null)}
      className='absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 text-xs flex items-center justify-center'
    >
      ✕
    </button>

  </div>
)}

      {/* Prompt Input Box */}
      <form onSubmit={onSubmit} className='bg-primary/20 dark:bg-[#583C79]/30 border border-primary
      dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex
      gap-4 items-center'>
        <select onChange={(e) => setMode(e.target.value)} value={mode} className='text-sm pl-3 pr-2 outline-none'>
          <option className='dark:bg-purple-900' value="text">Text</option>
          <option className='dark:bg-purple-900' value="image">Image</option>
          <option className='dark:bg-purple-900' value="voice">Voice</option>
        </select>

        {mode === "voice" ? (
          <div className='flex-1 flex items-center gap-2 px-2'>
            {isRecording ? (
              <div className='flex items-center gap-2'>
                <div className='flex gap-0.5 items-center h-4'>
                  <div className='w-1 bg-primary dark:bg-white rounded-full animate-bounce [animation-duration:0.8s] h-3'></div>
                  <div className='w-1 bg-primary dark:bg-white rounded-full animate-bounce [animation-duration:1s] h-5'></div>
                  <div className='w-1 bg-primary dark:bg-white rounded-full animate-bounce [animation-duration:1.2s] h-4'></div>
                  <div className='w-1 bg-primary dark:bg-white rounded-full animate-bounce [animation-duration:0.9s] h-2'></div>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-300 animate-pulse'>Listening...</p>
              </div>
            ) : (
              <p className='text-sm text-gray-400'>Click mic to speak</p>
            )}
          </div>
        ) : (
          // <input onChange={(e) => setPrompt(e.target.value)} value={prompt} type='text' placeholder='Type your prompt here...' className='flex-1 w-full text-sm outline-none bg-transparent' required />
          <textarea
  onChange={(e) => setPrompt(e.target.value)}
  value={prompt}
  placeholder='Type your prompt here...'
  rows={1}
  className='flex-1 w-full text-sm outline-none bg-transparent resize-none max-h-32'
  required
  onKeyDown={(e) => {

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }

  }}
/>
        )}

        <div className='flex items-center gap-2'>
          {mode === "voice" && (isRecording || prompt) && (
            <button type='button' onClick={() => { setIsRecording(false); setPrompt("") }} className='p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all group flex items-center justify-center'>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-red-500 transition-colors"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
            </button>
          )}

          {mode === "voice" && (
            <button type='button' onClick={() => {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}} className='flex items-center justify-center'>
              <div className={`p-2 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500/20 text-red-500 scale-110 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-primary hover:bg-primary/10'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
              </div>
            </button>
          )}

          {mode === "text" && (
  <>
    <input
      type="file"
      accept="image/*"
      id="imageUpload"
      hidden
      onChange={(e) =>
        setSelectedImage(e.target.files[0])
      }
    />

    <label
      htmlFor="imageUpload"
      className='cursor-pointer text-xl'
    >
      📎
    </label>
  </>
)}

          <button type='submit' disabled={loading || (mode === 'voice' && isRecording)} className='flex items-center justify-center'>
            <img src={loading ? assets.stop_icon : assets.send_icon} className='w-8 cursor-pointer' alt="send" />
          </button>
        </div>
      </form>

      <p className='text-xs text-gray-400 text-center mt-2'>
  Press Enter to send • Shift + Enter for new line
</p>
    </div>
  )
}

export default ChatBox
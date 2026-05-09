import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dummyChats, dummyUserData } from "../assets/assets";
import toast from "react-hot-toast";

const AppContext = createContext()

export const AppContextProvider = ({ children }) => {

    const navigate = useNavigate()
    const [user, setUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [loadingUser, setLoadingUser] = useState(true);

    const [token, setToken] = useState(localStorage.getItem("token") || null);

    const URL = import.meta.env.VITE_SERVER_URL;

    const fetchUser = async () => {
        try{
            const res = await fetch(`${URL}/api/user/getUser`, {
                method: "GET",
                headers: {
                    "Content-type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })

            if(!res.ok) throw new Error("Request Failed !")

            const data = await res.json();
            if(res.status === 200) {
                setUser(data.user)
                toast.success("User Loaded Successfully")
            } else if (res.status === 401) {
                toast.error("Unauthorized Login")
            } else if (res.status === 404) {
                toast.error("User not found")
            } else if (res.status === 500) {
                toast.error("Server Error")
            } else {
                toast.error(data.message || "Something went wrong");
            }
        }
        catch (error) {
            toast.error(error.message);
        }
        finally {
            setLoadingUser(false)
        }
    }

    const createNewChat = async () => {
        try {
            if(!user) return toast("Login to create a new chat")
            navigate('/')
            
            const res = await fetch(`${URL}/api/chat/createChat`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })

            const data = await res.json();

            if(res.status !== 200) {
                toast.error(data.message)
            }
            
            toast.success("Chat created Successfully")
            await fetchUsersChats()
        }
        catch (error) {
            toast.error(error.message)
        }
    }

    const fetchUsersChats = async () => {
        try{
            const res = await fetch(`${URL}/api/chat/getChats`, {
                method: "GET",
                headers: {
                    "Content-type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })

            const data = await res.json();

            if(res.status === 200) {
                setChats(data.chats)
                if(data.chats.length === 0) {
                    await createNewChat();
                    return;
                } else {
                    setSelectedChat(data.chats[0]);
                }
            } else {
                toast.error(data.message)
            }
        }
        catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=> {
        if(theme === 'dark') {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme)
    }, [theme])

    useEffect(()=>{
        if(user) {
            fetchUsersChats()
        }
        else {
            setChats([])
            setSelectedChat(null)
        }
    }, [user])

    useEffect(()=>{
        if(token){
            fetchUser();
        } else {
            setUser(null);
            setLoadingUser(false);
        }   
    },[token])

    const value = {
        navigate, user, setUser, chats, setChats, selectedChat, 
        setSelectedChat, theme, setTheme, fetchUser, createNewChat, 
        loadingUser, setLoadingUser, fetchUsersChats, token, setToken
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = ()=> useContext(AppContext)
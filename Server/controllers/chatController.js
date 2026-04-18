import { getDB } from "../configs/db.js";
import { chatCreateSchema } from "../models/chatModel.js";
import { ObjectId } from "mongodb";

//Create Chat in DB
export const createChat = async (req, res) => {
    try {
        const db = getDB();

        const userId = req.user._id.toString();

        //On clicking New Chat, these are default data stored in db
        //After starting chat, this document is updated
        //So there will be no data send through body. So default values
        const chatData = {
            userId,
            userName: req.user.name,
            name: "New Chat",
            messages: [],
        }

        const { error, value } = chatCreateSchema.validate(chatData);
        if(error) {
            return res.status(400).json({ message: error.message });
        }
        
        const result = await db.collection("chats").insertOne({
            ...value,
            userId: new ObjectId(value.userId),
            createdAt: new Date(),
            updatedAt: new Date()
        })

        res.json(result);
    }
    catch(error) {
        res.status(500).json({ message: error.message });
    }
}

//Get Chat from DB
export const getChats = async (req, res) => {
    try{
        const db = getDB();

        const userId = req.user._id;
        const chats = await db.collection("chats").find({userId}).sort({updatedAt: -1}).toArray();

        return res.json({ success: true, chats})
    }
    catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

//Delete Chat from DB
export const deleteChat = async (req, res) => {
    try{
        const db = getDB();

        const userId = req.user._id;
        const {chatId} = req.body;

        await db.collection("chats").deleteOne({_id: new ObjectId(chatId), userId})

        return res.json({ success: true, message: "Chat Deleted"})
    }
    catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}
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
        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        const result = await db.collection("chats").insertOne({
            ...value,
            userId: new ObjectId(value.userId),
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return res.status(200).json({ success: true, result });
    }
    catch (error) {
        console.error("Create chat error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

//Get Chat from DB
export const getChats = async (req, res) => {
    try {
        const db = getDB();

        const userId = req.user._id;
        const chats = await db.collection("chats").find({ userId }).sort({ updatedAt: -1 }).toArray();

        return res.status(200).json({ success: true, chats })
    }
    catch (error) {
        console.error("Get chats error:", error);
        return res.status(500).json({ success: false, message: error.message })
    }
}

//Delete Chat from DB
export const deleteChat = async (req, res) => {
    try {
        const db = getDB();

        const userId = req.user._id;
        const { chatId } = req.body;

        if (!chatId) {
            return res.status(400).json({ success: false, message: "Missing chatId" });
        }

        if (!ObjectId.isValid(chatId)) {
            return res.status(400).json({ success: false, message: "Invalid chatId format" });
        }

        const result = await db.collection("chats").deleteOne({ _id: new ObjectId(chatId), userId })

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Chat not found or unauthorized" });
        }

        return res.status(200).json({ success: true, message: "Chat Deleted" })
    }
    catch (error) {
        console.error("Delete chat error:", error);
        return res.status(500).json({ success: false, message: error.message })
    }
}

import { getDB } from "../configs/db.js";
import { userRegisterSchema, userLoginSchema } from "../models/userModel.js";
import { comparePassword, hashPassword } from "../services/Utils/hash.js";
import jwt from 'jsonwebtoken'

//Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

//Register User
export const registerUser = async (req, res) => {
    const db = getDB();

    try {
        const { error, value } = userRegisterSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        const { name, email, password } = value;

        const userExists = await db.collection("users").findOne({ email })

        if (userExists) {
            return res.status(409).json({ success: false, message: "User already exists" })
        }

        const hashedPassword = await hashPassword(password);
        const user = await db.collection("users").insertOne({ name, email, password: hashedPassword, credits: 20 });

        const token = generateToken(user.insertedId)

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, no token"
            });
        }

        return res.status(201).json({
            success: true,
            token,
            message: "User registered successfully"
        });

    } catch (error) {
        console.error("Register user error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//Login User
export const loginUser = async (req, res) => {
    const db = getDB();

    let isMatch;

    try {

        const { error, value } = userLoginSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        const { email, password } = value;

        const user = await db.collection("users").findOne({ email });

        if (user) {
            isMatch = await comparePassword(password, user.password)
        }

        if (isMatch) {
            const token = generateToken(user._id);
            return res.status(200).json({
                success: true,
                token,
                message: "User logged in successfully"
            })
        }

        return res.status(400).json({
            success: false,
            message: "Invalid email or password"
        })

    } catch (error) {
        console.error("Login user error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//Get User
export const getUser = async (req, res) => {
    try {
        const user = req.user;
        return res.status(200).json({ success: true, user })
    } catch (error) {
        console.error("Get user error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

//Get Published Images
export const getPublishedImages = async (req, res) => {
    try {
        const db = getDB();

        const publishedImageMessages = await db.collection("chats").aggregate([
            { $unwind: "$messages" },
            {
                $match: {
                    "messages.isImage": true,
                    "messages.isPublished": true
                }
            },
            {
                $project: {
                    _id: 0,
                    imageUrl: "$messages.content",
                    userName: "$userName"
                }
            }
        ]).toArray();

        return res.status(200).json({ success: true, images: publishedImageMessages.reverse() })
    }
    catch (error) {
        console.error("Get published images error:", error);
        return res.status(500).json({ success: false, message: error.message })
    }
}
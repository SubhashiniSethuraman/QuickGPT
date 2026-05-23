import express from 'express';
import { protect } from "../middlewares/auth.js";
import { imageMessageController, textMessageController, voiceMessageController } from '../controllers/messageController.js';
import upload from '../middlewares/upload.js';

const messageRouter = express.Router()

// messageRouter.post('/text', protect, textMessageController)
messageRouter.post('/text', protect, upload.single("image"), textMessageController)
messageRouter.post('/image', protect, imageMessageController)
messageRouter.post('/voice', protect, express.raw({ type: 'audio/webm', limit: '10mb' }), voiceMessageController)

export default messageRouter
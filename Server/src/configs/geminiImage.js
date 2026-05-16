import { GoogleGenAI } from "@google/genai";

const geminiImage = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export default geminiImage;
import axios from "axios";
import { getDB } from "../configs/db.js";
import { ObjectId } from "mongodb";
import imagekit from "../configs/imageKit.js";
import openai from "../configs/openAI.js"

//Text Message Generation
export const textMessageController = async (req, res) => {
    try {
        const db = getDB();

        const userId = req.user._id;

        //Check Credits
        if(req.user.credits < 2) {
            return res.json({ success: false, message: "You don't have enough credits to use this feature"})
        }

        const { chatId, prompt } = req.body;

        const chat = await db.collection("chats").findOne({userId, _id: new ObjectId(chatId)})

        if(!chat) {
            return res.status(404).json({success: false, message: "Chat not found"})
        }

        const userMessage = {
            role: "user", 
            content: prompt, 
            timestamp: Date.now(), 
            isImage: false
        }
        
        await db.collection("chats").updateOne(
            {_id: new ObjectId(chatId), userId },
            { $push: {messages: userMessage },
              $set: {updatedAt: new Date()}
            }
        );

        //Gemini integration
        const {choices} = await openai.chat.completions.create({
            model: "gemini-3-flash-preview",
            reasoning_effort: "low",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        //console.log(response.choices[0].message);
        //actually it was const response= so that response.choices[0].message, 
        // now we only extract {choices} and choices[0].message
        const reply = {...choices[0].message.content, timestamp: Date.now(), isImage: false}
        
        await db.collection("chats").updateOne(
            { _id: new ObjectId(chatId), userId },
            { $push: { messages: reply },
              $set: { updatedAt: new Date() }
            }
        );

        await db.collection("users").updateOne(
            { _id: userId },
            { $inc: { credits: -1 } }
        );
        
        return res.json({success: true, reply})

    } catch(error) {
        res.status(500).json({success: false, message: error.message})
    }
}

//Image Generation
export const imageMessageController = async (req, res) => {
    try {
        const db = getDB();

        const userId = req.user._id;

        //Check credits
        if(req.user.credits < 2) {
            return res.json({ success: false, message: "You don't have enough credits to use this feature"})
        }

        const { prompt, chatId, isPublished } = req.body;
        const chat = await db.collection("chats").findOne({userId, _id: new ObjectId(chatId)})

        if(!chat) {
            return res.status(404).json({success: false, message: "Chat not found"})
        }

        const userMessage = {
            role: "user", 
            content: prompt, 
            timestamp: Date.now(), 
            isImage: true
        }
        
        await db.collection("chats").updateOne(
            {_id: new ObjectId(chatId), userId },
            { $push: {messages: userMessage },
              $set: {updatedAt: new Date()}
            }
        );

        //url be like ikmedia.imagekit.io/prompt/filename.jpg
        //so encode the prompt and alter base url 

        //Converts spaces/special chars into URL-safe text.
        const encodedPrompt = encodeURIComponent(prompt)

        //Construct ImageKit AI generation URL
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

        //Trigger generation by fetching from ImageKit
        //Our server requests the generated image file. ImageKit returns raw image bytes.
        const aiImageResponse = await axios.get(generatedImageUrl, { responseType: "arraybuffer" })

        //Convert to Base64 image. Binary image into uploadable string.
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString('base64')}`;

        //Upload to ImageKit Media Library
        //Why Upload Again If Already Generated?
        //Generated URL may be temporary/dynamic. Uploading gives: permanent hosted URL
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "quickgpt"
        })

        const reply = {
            role: 'assistant',
            content: uploadResponse.url,
            timestamp: Date.now(), 
            isImage: true,
            isPublished
        }

        await db.collection("chats").updateOne(
            { _id: new ObjectId(chatId), userId },
            { $push: { messages: reply },
              $set: { updateAt: new Date() }
            }
        );

        await db.collection("users").updateOne(
            { _id: userId },
            { $inc: { credits: -2 } }
        );

        return res.json({success: true, reply})

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

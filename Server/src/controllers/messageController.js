// //Text Message Generation with Gemini with Open AI as intermediator
// export const textMessageController = async (req, res) => {
//     try {
//         const db = getDB();

//         const userId = req.user._id;

//         const { chatId, prompt } = req.body;

//         // Validation: Check if required fields are present
//         if (!chatId || !prompt) {
//             return res.status(400).json({ success: false, message: "Missing chatId or prompt" });
//         }

//         // Validation: Check if chatId is valid ObjectId
//         if (!ObjectId.isValid(chatId)) {
//             return res.status(400).json({ success: false, message: "Invalid chatId format" });
//         }

//         //Check Credits
//         if(req.user.credits < 1) {
//             return res.status(403).json({ success: false, message: "You don't have enough credits to use this feature"})
//         }

//         const chat = await db.collection("chats").findOne({userId, _id: new ObjectId(chatId)})

//         if(!chat) {
//             return res.status(404).json({success: false, message: "Chat not found"})
//         }

//         const userMessage = {
//             role: "user", 
//             content: prompt, 
//             timestamp: Date.now(), 
//             isImage: false
//         }

//         await db.collection("chats").updateOne(
//             {_id: new ObjectId(chatId), userId },
//             { $push: {messages: userMessage },
//               $set: {updatedAt: new Date()}
//             }
//         );

//         //Gemini integration
//         const {choices} = await openai.chat.completions.create({
//             model: "gemini-3-flash-preview",
//             reasoning_effort: "low",
//             messages: [
//                 {
//                     role: "user",
//                     content: prompt,
//                 },
//             ],
//         });

//         //console.log(response.choices[0].message);
//         //actually it was const response= so that response.choices[0].message, 
//         // now we only extract {choices} and choices[0].message
//         // const reply = {...choices[0].message.content, timestamp: Date.now(), isImage: false}

//         const reply = {
//             role: "assistant",
//             content: choices[0].message.content,
//             timestamp: Date.now(),
//             isImage: false
//         }

//         await db.collection("chats").updateOne(
//             { _id: new ObjectId(chatId), userId },
//             { $push: { messages: reply },
//               $set: { updatedAt: new Date() }
//             }
//         );

//         await db.collection("users").updateOne(
//             { _id: userId },
//             { $inc: { credits: -1 } }
//         );

//         return res.status(200).json({success: true, reply})

//     } catch(error) {
//         console.error("Text message controller error:", error);
//         return res.status(500).json({success: false, message: error.message})
//     }
// }

// //Image Generation with ImageKit
// export const imageMessageController = async (req, res) => {
//     try {
//         const db = getDB();

//         const userId = req.user._id;

//         //Check credits
//         if(req.user.credits < 2) {
//             return res.json({ success: false, message: "You don't have enough credits to use this feature"})
//         }

//         const { prompt, chatId, isPublished } = req.body;
//         const chat = await db.collection("chats").findOne({userId, _id: new ObjectId(chatId)})

//         if(!chat) {
//             return res.status(404).json({success: false, message: "Chat not found"})
//         }

//         const userMessage = {
//             role: "user", 
//             content: prompt, 
//             timestamp: Date.now(), 
//             isImage: true
//         }

//         await db.collection("chats").updateOne(
//             {_id: new ObjectId(chatId), userId },
//             { $push: {messages: userMessage },
//               $set: {updatedAt: new Date()}
//             }
//         );

//         //url be like ikmedia.imagekit.io/prompt/filename.jpg
//         //so encode the prompt and alter base url 

//         // //Converts spaces/special chars into URL-safe text.
//         // const encodedPrompt = encodeURIComponent(prompt)

//         // //Construct ImageKit AI generation URL
//         // const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

//         // //Trigger generation by fetching from ImageKit
//         // //Our server requests the generated image file. ImageKit returns raw image bytes.
//         // const aiImageResponse = await axios.get(generatedImageUrl, { responseType: "arraybuffer" })

//         const encodedPrompt = encodeURIComponent(prompt);

//         const generatedImageUrl =
//         `${process.env.IMAGEKIT_URL_ENDPOINT}/tr:e-genai-prompt-${encodedPrompt}`;

//         // const aiImageResponse = await axios.get(generatedImageUrl, {
//         //     responseType: "arraybuffer"
//         // });

//         // //Convert to Base64 image. Binary image into uploadable string.
//         // const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString('base64')}`;

//         const aiImageResponse = await fetch(generatedImageUrl);

//         if (!aiImageResponse.ok) {
//             throw new Error("Failed to generate image");
//         }

//         const arrayBuffer = await aiImageResponse.arrayBuffer();

//         const base64Image =
//         `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;


//         //Upload to ImageKit Media Library
//         //Why Upload Again If Already Generated?
//         //Generated URL may be temporary/dynamic. Uploading gives: permanent hosted URL
//         const uploadResponse = await imagekit.upload({
//             file: base64Image,
//             fileName: `${Date.now()}.png`,
//             folder: "quickgpt"
//         })

//         const reply = {
//             role: 'assistant',
//             content: uploadResponse.url,
//             timestamp: Date.now(), 
//             isImage: true,
//             isPublished
//         }

//         await db.collection("chats").updateOne(
//             { _id: new ObjectId(chatId), userId },
//             { $push: { messages: reply },
//               $set: { updatedAt: new Date() }
//             }
//         );

//         await db.collection("users").updateOne(
//             { _id: userId },
//             { $inc: { credits: -2 } }
//         );

//         return res.json({success: true, reply})

//     } catch (error) {
//         res.status(500).json({success: false, message: error.message})
//     }
// }

// //Image Generation with Imagekit
// export const imageMessageController = async (req, res) => {
//     try {

//         const db = getDB();

//         const userId = req.user._id;

//         // Get request data
//         const { prompt, chatId, isPublished } = req.body;

//         // Validation: Check if required fields are present
//         if (!chatId || !prompt) {
//             return res.status(400).json({ success: false, message: "Missing chatId or prompt" });
//         }

//         // Validation: Check if chatId is valid ObjectId
//         if (!ObjectId.isValid(chatId)) {
//             return res.status(400).json({ success: false, message: "Invalid chatId format" });
//         }

//         // Check credits
//         if (req.user.credits < 2) {
//             return res.status(403).json({
//                 success: false,
//                 message: "You don't have enough credits to use this feature"
//             });
//         }

//         // Find chat
//         const chat = await db.collection("chats").findOne({
//             userId,
//             _id: new ObjectId(chatId)
//         });

//         if (!chat) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Chat not found"
//             });
//         }

//         // Save user prompt message
//         const userMessage = {
//             role: "user",
//             content: prompt,
//             timestamp: Date.now(),
//             isImage: false
//         };

//         await db.collection("chats").updateOne(
//             {
//                 _id: new ObjectId(chatId),
//                 userId
//             },
//             {
//                 $push: { messages: userMessage },
//                 $set: { updatedAt: new Date() }
//             }
//         );

//         // Encode prompt for URL
//         const encodedPrompt = encodeURIComponent(prompt);

//         // ImageKit AI image generation URL
//         const generatedImageUrl =
//             `${process.env.IMAGEKIT_URL_ENDPOINT}/tr:q-genimage,prompt-${encodedPrompt}`;

//         // Generate image using fetch
//         const aiImageResponse = await fetch(generatedImageUrl);

//         if (!aiImageResponse.ok) {
//             const errorText = await aiImageResponse.text();
//             console.error("Image generation service error:", errorText);
//             throw new Error("Failed to generate image");
//         }

//         // Convert image response into array buffer
//         const arrayBuffer = await aiImageResponse.arrayBuffer();

//         // Convert image buffer into base64
//         const base64Image =
//             `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;

//         // Upload generated image permanently to ImageKit
//         const uploadResponse = await imagekit.upload({
//             file: base64Image,
//             fileName: `${Date.now()}.png`,
//             folder: "/quickgpt"
//         });

//         // Assistant reply object
//         const reply = {
//             role: "assistant",
//             content: uploadResponse.url,
//             timestamp: Date.now(),
//             isImage: true,
//             isPublished
//         };

//         // Save assistant reply into chat
//         await db.collection("chats").updateOne(
//             {
//                 _id: new ObjectId(chatId),
//                 userId
//             },
//             {
//                 $push: { messages: reply },
//                 $set: { updatedAt: new Date() }
//             }
//         );

//         // Deduct credits
//         await db.collection("users").updateOne(
//             { _id: userId },
//             { $inc: { credits: -2 } }
//         );

//         // Send response
//         return res.status(200).json({
//             success: true,
//             reply
//         });

//     } catch (error) {
//         console.error("Image message controller error:", error);
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };


// //Image Generation with Gemini with Open AI as intermediator
// export const imageMessageController = async (req, res) => {
//     try {

//         const db = getDB();

//         const userId = req.user._id;

//         // Get request data
//         const { prompt, chatId, isPublished } = req.body;

//         // Validation: Check if required fields are present
//         if (!chatId || !prompt) {
//             return res.status(400).json({ success: false, message: "Missing chatId or prompt" });
//         }

//         // Validation: Check if chatId is valid ObjectId
//         if (!ObjectId.isValid(chatId)) {
//             return res.status(400).json({ success: false, message: "Invalid chatId format" });
//         }

//         // Check credits
//         if (req.user.credits < 2) {
//             return res.status(403).json({
//                 success: false,
//                 message: "You don't have enough credits to use this feature"
//             });
//         }

//         // Find chat
//         const chat = await db.collection("chats").findOne({
//             userId,
//             _id: new ObjectId(chatId)
//         });

//         if (!chat) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Chat not found"
//             });
//         }

//         // Save user prompt message
//         const userMessage = {
//             role: "user",
//             content: prompt,
//             timestamp: Date.now(),
//             isImage: false
//         };

//         await db.collection("chats").updateOne(
//             {
//                 _id: new ObjectId(chatId),
//                 userId
//             },
//             {
//                 $push: { messages: userMessage },
//                 $set: { updatedAt: new Date() }
//             }
//         );

//       // Generate image using Gemini 2 Flash Preview
//         const response = await openai.responses.create({
//             model: "gemini-3.1-flash-image-preview",
//             input: prompt,
//             modalities: ["TEXT", "IMAGE"]
//         });

//         // Find generated image
//         const imagePart = response.output
//             ?.flatMap(item => item.content || [])
//             ?.find(part => part.type === "output_image");

//         if (!imagePart?.image_base64) {
//             return res.status(500).json({
//                 success: false,
//                 message: "Failed to generate image"
//             });
//         }

//         // Convert base64 into browser-displayable image URL
//         const imageUrl = `data:image/png;base64,${imagePart.image_base64}`;

//         // Assistant reply
//         const reply = {
//             role: "assistant",
//             content: imageUrl,
//             timestamp: Date.now(),
//             isImage: true,
//             isPublished
//         };

//         // Save assistant reply into chat
//         await db.collection("chats").updateOne(
//             {
//                 _id: new ObjectId(chatId),
//                 userId
//             },
//             {
//                 $push: { messages: reply },
//                 $set: { updatedAt: new Date() }
//             }
//         );

//         // Deduct credits
//         await db.collection("users").updateOne(
//             { _id: userId },
//             { $inc: { credits: -2 } }
//         );

//         // Send response
//         return res.status(200).json({
//             success: true,
//             reply
//         });

//     } catch (error) {
//         console.error("Image message controller error:", error);
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };


// //Image Generation with Gemini straightforward (npm install google/genai)
// export const imageMessageController = async (req, res) => {
//     try {

//         const db = getDB();

//         const userId = req.user._id;

//         const { prompt, chatId, isPublished } = req.body;

//         // Validation
//         if (!chatId || !prompt) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Missing chatId or prompt"
//             });
//         }

//         // Validate MongoDB ObjectId
//         if (!ObjectId.isValid(chatId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid chatId format"
//             });
//         }

//         // Check credits
//         if (req.user.credits < 2) {
//             return res.status(403).json({
//                 success: false,
//                 message: "You don't have enough credits"
//             });
//         }

//         // Find chat
//         const chat = await db.collection("chats").findOne({
//             _id: new ObjectId(chatId),
//             userId
//         });

//         if (!chat) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Chat not found"
//             });
//         }

//         // Save user prompt
//         const userMessage = {
//             role: "user",
//             content: prompt,
//             timestamp: Date.now(),
//             isImage: false
//         };

//         await db.collection("chats").updateOne(
//             {
//                 _id: new ObjectId(chatId),
//                 userId
//             },
//             {
//                 $push: { messages: userMessage },
//                 $set: { updatedAt: new Date() }
//             }
//         );

//         // Generate image using Gemini
//         const response = await geminiImage.models.generateContent({
//             model: "gemini-2.5-flash-image",
//             contents: prompt
//         });

//         // Extract image data
//         const parts =
//             response.candidates?.[0]?.content?.parts || [];

//         const imagePart = parts.find(
//             part => part.inlineData?.mimeType?.startsWith("image/")
//         );

//         // If no image returned
//         if (!imagePart?.inlineData?.data) {

//             console.log(JSON.stringify(response, null, 2));

//             throw new Error("No image returned from Gemini");
//         }

//         // Convert base64 image
//         const base64Image =
//             `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

//         // Upload to ImageKit
//         const uploadResponse = await imagekit.upload({
//             file: base64Image,
//             fileName: `${Date.now()}.png`,
//             folder: "/quickgpt"
//         });

//         // Assistant reply
//         const reply = {
//             role: "assistant",
//             content: uploadResponse.url,
//             timestamp: Date.now(),
//             isImage: true,
//             isPublished
//         };

//         // Save assistant reply
//         await db.collection("chats").updateOne(
//             {
//                 _id: new ObjectId(chatId),
//                 userId
//             },
//             {
//                 $push: { messages: reply },
//                 $set: { updatedAt: new Date() }
//             }
//         );

//         // Deduct credits
//         await db.collection("users").updateOne(
//             { _id: userId },
//             { $inc: { credits: -2 } }
//         );

//         // Success response
//         return res.status(200).json({
//             success: true,
//             reply
//         });

//     } catch (error) {

//         console.error("Image generation error:", error);

//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };


// // Image Generation with Gemini with Imagekit as intermediator
// export const imageMessageController = async (req, res) => {

//     try {

//         const db = getDB();

//         const userId = req.user._id;

//         const { prompt, chatId, isPublished } = req.body;

//         // Validation
//         if (!chatId || !prompt) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Missing chatId or prompt"
//             });
//         }

//         // Validate ObjectId
//         if (!ObjectId.isValid(chatId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid chatId format"
//             });
//         }

//         // Check credits
//         if (req.user.credits < 2) {
//             return res.status(403).json({
//                 success: false,
//                 message: "You don't have enough credits"
//             });
//         }

//         // Find chat
//         const chat = await db.collection("chats").findOne({
//             _id: new ObjectId(chatId),
//             userId
//         });

//         if (!chat) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Chat not found"
//             });
//         }

//         // User message
//         const userMessage = {
//             role: "user",
//             content: prompt,
//             timestamp: Date.now(),
//             isImage: false
//         };

//         // Save user message
//         await db.collection("chats").updateOne(
//             {
//                 _id: new ObjectId(chatId),
//                 userId
//             },
//             {
//                 $push: { messages: userMessage },
//                 $set: { updatedAt: new Date() }
//             }
//         );

//         // Generate image using Gemini
//         const response = await geminiImage.models.generateContent({
//             model: "gemini-2.5-flash-image",
//             contents: prompt
//         });

//         // Extract image
//         const parts =
//             response.candidates?.[0]?.content?.parts || [];

//         const imagePart = parts.find(
//             part => part.inlineData?.mimeType?.startsWith("image/")
//         );

//         // Check image exists
//         if (!imagePart?.inlineData?.data) {

//             console.log(JSON.stringify(response, null, 2));

//             throw new Error("No image returned from Gemini");
//         }

//         // Convert image to base64
//         const base64Image =
//             `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

//         // Upload to ImageKit
//         const uploadResponse = await imagekit.upload({
//             file: base64Image,
//             fileName: `${Date.now()}.png`,
//             folder: "/quickgpt"
//         });

//         // Assistant reply
//         const reply = {
//             role: "assistant",
//             content: uploadResponse.url,
//             timestamp: Date.now(),
//             isImage: true,
//             isPublished
//         };

//         // Save assistant reply
//         await db.collection("chats").updateOne(
//             {
//                 _id: new ObjectId(chatId),
//                 userId
//             },
//             {
//                 $push: { messages: reply },
//                 $set: { updatedAt: new Date() }
//             }
//         );

//         // Deduct credits
//         await db.collection("users").updateOne(
//             { _id: userId },
//             { $inc: { credits: -2 } }
//         );

//         // Response
//         return res.status(200).json({
//             success: true,
//             reply
//         });

//     } catch (error) {

//         console.error("Image generation error:", error);

//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };


import { getDB } from "../configs/db.js";
import { ObjectId } from "mongodb";
import geminiImage from "../configs/geminiImage.js";
import huggingface from "../configs/huggingFace.js";
import { POLLINATION_BASE_URL } from "../configs/pollinationAI.js";
import sarvamClient from "../configs/sarvamAI.js";
import fs from "fs";

// Text Message Generation with Gemini straightforward (npm install google/genai)
export const textMessageController = async (req, res) => {

    try {

        const db = getDB();

        const userId = req.user._id;

        const { chatId, prompt } = req.body;

        const image = req.file;

        // Validation
        if (!chatId || (!prompt && !image)) {
            return res.status(400).json({
                success: false,
                message: "Prompt or image required"
            });
        }

        // Validate ObjectId
        if (!ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chatId format"
            });
        }

        // Check credits
        if (req.user.credits < 1) {
            return res.status(403).json({
                success: false,
                message: "You don't have enough credits"
            });
        }

        // Find chat
        const chat = await db.collection("chats").findOne({
            _id: new ObjectId(chatId),
            userId
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        // =========================
        // IMAGE PATH
        // =========================

        let imagePath = null;

        if (image) {

            imagePath =
                `${req.protocol}://${req.get("host")}/uploads/${image.filename}`;
        }

        // User message
        const userMessage = {
            role: "user",
            content: prompt,
            image: imagePath,
            timestamp: Date.now(),
            isImage: false
        };

        // Save user message
        await db.collection("chats").updateOne(
            {
                _id: new ObjectId(chatId),
                userId
            },
            {
                $push: { messages: userMessage },
                $set: { updatedAt: new Date() }
            }
        );

                // =========================
        // GEMINI CONTENTS
        // =========================

        let contents = [];

        // prompt
        if (prompt) {

            contents.push({
                text: prompt
            });
        }

        // image
        if (image) {

            const imageBase64 =
                fs.readFileSync(image.path, {
                    encoding: "base64"
                });

            contents.push({
                inlineData: {
                    mimeType: image.mimetype,
                    data: imageBase64
                }
            });
        }

        // only image uploaded
        if (!prompt && image) {

            contents.unshift({
                text: "Describe this image in detail"
            });
        }

        // Generate text using Gemini
        const response = await geminiImage.models.generateContent({
            model: "gemini-3-flash-preview",
            contents
        });

        const text =
            response.candidates?.[0]?.content?.parts?.[0]?.text;

        // Assistant reply
        const reply = {
            role: "assistant",
            content: text || "No response generated",
            timestamp: Date.now(),
            isImage: false
        };

        // Save assistant reply
        await db.collection("chats").updateOne(
            {
                _id: new ObjectId(chatId),
                userId
            },
            {
                $push: { messages: reply },
                $set: { updatedAt: new Date() }
            }
        );

        // Deduct credits
        await db.collection("users").updateOne(
            { _id: userId },
            { $inc: { credits: -1 } }
        );

        // Response
        return res.status(200).json({
            success: true,
            reply
        });

    } catch (error) {

        console.error("Text generation error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// // Image Generation with Hugging Face straightforward (npm install huggingface/inference)
// export const imageMessageController = async (req, res) => {

//     try {

//         const db = getDB();

//         const userId = req.user._id;

//         const { prompt, chatId, isPublished } = req.body;

//         // Validation
//         if (!chatId || !prompt) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Missing chatId or prompt"
//             });
//         }

//         // Validate ObjectId
//         if (!ObjectId.isValid(chatId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid chatId format"
//             });
//         }

//         // Check credits
//         if (req.user.credits < 2) {
//             return res.status(403).json({
//                 success: false,
//                 message: "You don't have enough credits"
//             });
//         }

//         // Find chat
//         const chat = await db.collection("chats").findOne({
//             _id: new ObjectId(chatId),
//             userId
//         });

//         if (!chat) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Chat not found"
//             });
//         }

//         // User message
//         const userMessage = {
//             role: "user",
//             content: prompt,
//             timestamp: Date.now(),
//             isImage: false
//         };

//         // Save user message
//         await db.collection("chats").updateOne(
//             {
//                 _id: new ObjectId(chatId),
//                 userId
//             },
//             {
//                 $push: { messages: userMessage },
//                 $set: { updatedAt: new Date() }
//             }
//         );

//         // Generate image using Hugging Face
//         const imageBlob = await huggingface.textToImage({
//             // model: "black-forest-labs/FLUX.1-dev",
//             model: "black-forest-labs/FLUX.1-schnell",
//             inputs: prompt,
//             parameters: {
//                 num_inference_steps: 25
//             }
//         });

//         // Convert blob to buffer
//         const arrayBuffer = await imageBlob.arrayBuffer();

//         const base64Image =
//             `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;

//         // Assistant reply
//         const reply = {
//             role: "assistant",
//             content: base64Image,
//             timestamp: Date.now(),
//             isImage: true,
//             isPublished
//         };

//         // Save assistant reply
//         await db.collection("chats").updateOne(
//             {
//                 _id: new ObjectId(chatId),
//                 userId
//             },
//             {
//                 $push: { messages: reply },
//                 $set: { updatedAt: new Date() }
//             }
//         );

//         // Deduct credits
//         await db.collection("users").updateOne(
//             { _id: userId },
//             { $inc: { credits: -2 } }
//         );

//         // Response
//         return res.status(200).json({
//             success: true,
//             reply
//         });

//     } catch (error) {

//         console.error("Image generation error:", error);

//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };


export const imageMessageController = async (req, res) => {

    try {

        const db = getDB();

        const userId = req.user._id;

        const {
            prompt,
            chatId,
            isPublished = false
        } = req.body;

        // Validation
        if (!prompt?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Prompt is required"
            });
        }

        if (!chatId || !ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chatId"
            });
        }

        // Credits check
        if (req.user.credits < 2) {
            return res.status(403).json({
                success: false,
                message: "Not enough credits"
            });
        }

        // Find chat
        const chat = await db.collection("chats").findOne({
            _id: new ObjectId(chatId),
            userId
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        // User message
        const userMessage = {
            role: "user",
            content: prompt.trim(),
            timestamp: Date.now(),
            isImage: false
        };

        // Save user message
        await db.collection("chats").updateOne(
            {
                _id: new ObjectId(chatId)
            },
            {
                $push: {
                    messages: userMessage
                },
                $set: {
                    updatedAt: new Date()
                }
            }
        );

        // Generate image
        const encodedPrompt = encodeURIComponent(prompt.trim());

        const imageUrl =
            `${POLLINATION_BASE_URL}/${encodedPrompt}`;

        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error("Failed to generate image");
        }

        // Convert image to base64
        const arrayBuffer = await response.arrayBuffer();

        const base64Image =
            `data:image/png;base64,${Buffer
                .from(arrayBuffer)
                .toString("base64")}`;

        // Assistant message
        const assistantMessage = {
            role: "assistant",
            content: base64Image,
            timestamp: Date.now(),
            isImage: true,
            isPublished
        };

        // Save assistant message
        await db.collection("chats").updateOne(
            {
                _id: new ObjectId(chatId)
            },
            {
                $push: {
                    messages: assistantMessage
                },
                $set: {
                    updatedAt: new Date()
                }
            }
        );

        // Deduct credits
        await db.collection("users").updateOne(
            {
                _id: userId
            },
            {
                $inc: {
                    credits: -2
                }
            }
        );

        return res.status(200).json({
            success: true,
            reply: assistantMessage
        });

    } catch (error) {

        console.error("Image generation error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};


export const voiceMessageController = async (req, res) => {

    try {

        const db = getDB();

        const userId = req.user._id;

        const chatId = req.headers.chatid;

        const audioBuffer = req.body;

        // Validation
        if (!chatId || !audioBuffer) {
            return res.status(400).json({
                success: false,
                message: "Missing chatId or audio"
            });
        }

        // Validate ObjectId
        if (!ObjectId.isValid(chatId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid chatId format"
            });
        }

        // Check credits
        if (req.user.credits < 3) {
            return res.status(403).json({
                success: false,
                message: "You don't have enough credits"
            });
        }

        // Find chat
        const chat = await db.collection("chats").findOne({
            _id: new ObjectId(chatId),
            userId
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        // =========================
        // SARVAM SPEECH TO TEXT
        // =========================

        const transcriptionResponse =
            await sarvamClient.speechToText.transcribe({
                file: audioBuffer,
                model: "saarika:v2.5",
                language_code: "unknown"
            });

        const transcript =
            transcriptionResponse?.transcript || "";

        if (!transcript) {
            return res.status(400).json({
                success: false,
                message: "Could not transcribe audio"
            });
        }

        // =========================
        // SAVE USER MESSAGE
        // =========================

        const userMessage = {
            role: "user",
            content: transcript,
            timestamp: Date.now(),
            isImage: false,
            isVoice: true
        };

        await db.collection("chats").updateOne(
            {
                _id: new ObjectId(chatId),
                userId
            },
            {
                $push: { messages: userMessage },
                $set: { updatedAt: new Date() }
            }
        );

        // =========================
        // GEMINI RESPONSE
        // =========================

        const response =
            await geminiImage.models.generateContent({
                // model: "gemini-3-flash-preview",
                model: "gemini-2.5-flash",
                contents: transcript
            });

        const text =
            response.candidates?.[0]?.content?.parts?.[0]?.text
            || "No response generated";

        // =========================
        // SAVE ASSISTANT MESSAGE
        // =========================

        const reply = {
            role: "assistant",
            content: text,
            timestamp: Date.now(),
            isImage: false
        };

        await db.collection("chats").updateOne(
            {
                _id: new ObjectId(chatId),
                userId
            },
            {
                $push: { messages: reply },
                $set: { updatedAt: new Date() }
            }
        );

        // Deduct credits
        await db.collection("users").updateOne(
            { _id: userId },
            { $inc: { credits: -1 } }
        );

        // Final response
        return res.status(200).json({
            success: true,
            transcript,
            reply
        });

    } catch (error) {

        console.error("Voice message error:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
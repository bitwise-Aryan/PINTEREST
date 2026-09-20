// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// async function main(prompt) {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.0-flash",
//     contents: prompt,
//   });
//   return response.text
//   console.log(response.text);
// }

// export default main;

// config/gemini.js

import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    return new GoogleGenAI({ apiKey });
};

// --- UPDATED: Now accepts two arguments: prompt and length ---
async function main(prompt, length = 'long') {
    const ai = getGeminiClient();
    
    // 1. Determine the generation parameters based on length
    let systemInstruction = "";
    let maxTokens = 0;

    if (length === 'short') {
        systemInstruction = "You are a concise blog post writer. Generate a short, to-the-point description in 1-2 paragraphs. Keep the output under 100 words.";
        maxTokens = 100; // Use a low max token count for a brief response (100 tokens ≈ 60-80 words)
    } else { // 'long' or default
        systemInstruction = "You are a detailed blog post writer. Generate comprehensive blog content for the given topic in several paragraphs.";
        maxTokens = 900; // Use a higher token count for a detailed response
    }
    
    // The user's input combined with the original prompt instruction
    const fullPrompt = prompt + ' Generate a blog content for this topic in simple text format';
    
    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: fullPrompt,
        // 2. Pass the system instruction and maxTokens to the configuration
        config: {
            systemInstruction: systemInstruction,
            maxOutputTokens: maxTokens, 
        }
    });

    return response.text
    // console.log(response.text);
}

export const analyzeImageForTags = async (base64Image, mimeType) => {
    const ai = getGeminiClient();
    const prompt = "Analyze this image and return a list of 15 comma-separated keywords that best describe it (e.g. man, suit, outdoors, portrait, lighting, color, emotion, setting). Return ONLY the comma-separated keywords.";
    
    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                }
            }
        ]
    });
    
    const text = response.text || "";
    return text.split(',').map(tag => tag.trim().toLowerCase());
};

export default main;
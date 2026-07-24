const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Google Generative AI SDK with the API Key
// We use gemini-3.6-flash for fast, robust AI features.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

const generateAIResponse = async (prompt, systemInstruction = '') => {
  try {
    const fullPrompt = systemInstruction ? `${systemInstruction}\n\nUser Query: ${prompt}` : prompt;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw new Error('Failed to generate AI response');
  }
};

const generateJSONResponse = async (prompt, systemInstruction = '') => {
  try {
    const fullPrompt = systemInstruction 
      ? `${systemInstruction}\n\nCRITICAL: You must return ONLY valid, parseable JSON without any markdown formatting like \`\`\`json.\n\nUser Query: ${prompt}` 
      : `${prompt}\n\nCRITICAL: You must return ONLY valid, parseable JSON without any markdown formatting.`;
      
    const result = await model.generateContent(fullPrompt);
    let text = await result.response.text();
    
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini AI JSON Error:', error);
    throw new Error('Failed to parse AI JSON response');
  }
};

module.exports = {
  generateAIResponse,
  generateJSONResponse
};

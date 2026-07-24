const { generateAIResponse, generateJSONResponse } = require('../utils/ai');
const axios = require('axios');

const chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;
    
    let conversationContext = "You are the TripWise AI Travel Assistant. Be helpful, enthusiastic, and concise. You are capable of providing: travel recommendations, trip planning, budget planning, destination comparison, hotel recommendations, package recommendations, weather advice, packing suggestions, FAQs, local travel tips, and general travel assistance.\n\n";
    if (history && history.length > 0) {
      conversationContext += "Conversation History:\n";
      history.forEach(msg => {
        conversationContext += `${msg.role === 'user' ? 'User' : 'TripWise'}: ${msg.content}\n`;
      });
      conversationContext += "\nNew ";
    }

    const responseText = await generateAIResponse(message, conversationContext);
    
    res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: 'AI Chatbot is currently unavailable.' });
  }
};

const planTrip = async (req, res) => {
  try {
    const { destination, days, travelers, budget, interests } = req.body;
    
    const prompt = `Plan a detailed ${days}-day trip to ${destination} for ${travelers} travelers with a budget of ${budget}. Their interests include: ${interests}.`;
    
    const systemInstruction = `You are a master AI Trip Planner. Generate a detailed, highly structured itinerary for the requested destination.
Output exactly this JSON format:
{
  "title": "Trip Title",
  "summary": "Brief summary of the trip",
  "totalEstimatedCost": 0,
  "budgetBreakdown": { "accommodation": 0, "food": 0, "transport": 0, "activities": 0 },
  "weatherSummary": "Brief weather advice for the season",
  "packingList": ["Item 1", "Item 2", "Item 3"],
  "hotels": [
    { "name": "Hotel Name", "pricePerNight": 0, "rating": 4.5, "description": "Short description" }
  ],
  "transportRecommendations": ["Flight advice", "Local transport advice"],
  "days": [
    {
      "day": 1,
      "theme": "Arrival & Exploration",
      "schedule": [
        { "time": "Morning", "activity": "Activity description", "location": "Location name" },
        { "time": "Afternoon", "activity": "Activity description", "location": "Location name" },
        { "time": "Evening", "activity": "Dinner description", "location": "Restaurant name" }
      ]
    }
  ]
}`;

    const tripPlan = await generateJSONResponse(prompt, systemInstruction);
    // TripItinerary.tsx expects response.data.itinerary
    res.status(200).json({ itinerary: tripPlan });
  } catch (error) {
    console.error('AI Plan Trip Error:', error);
    res.status(500).json({ message: 'Failed to generate trip plan.' });
  }
};

const smartSearch = async (req, res) => {
  try {
    const { query } = req.body;
    
    const prompt = `User search query: "${query}"`;
    const systemInstruction = `You are an NLP search engine. Extract travel parameters from the user's natural language query.
Output exactly this JSON format:
{
  "intent": "destination | package | hotel | flight",
  "budget": { "max": 0 },
  "durationDays": 0,
  "travelMonth": "Month Name",
  "vibe": ["romantic", "adventure", "family", "solo"],
  "destination": "Extracted city/country",
  "origin": "Extracted starting point"
}`;

    const searchParams = await generateJSONResponse(prompt, systemInstruction);
    res.status(200).json(searchParams);
  } catch (error) {
    console.error('AI Search Error:', error);
    res.status(500).json({ message: 'Failed to process natural language search.' });
  }
};

const compareDestinations = async (req, res) => {
  try {
    const { destA, destB } = req.body;
    const prompt = `Compare ${destA} vs ${destB}.`;
    
    const systemInstruction = `Compare these two travel destinations comprehensively.
Output exactly this JSON format:
{
  "winner": "Which one is generally better or 'Tie'",
  "comparison": [
    { "category": "Weather", "destA": "Details", "destB": "Details" },
    { "category": "Budget", "destA": "Details", "destB": "Details" },
    { "category": "Best Season", "destA": "Details", "destB": "Details" },
    { "category": "Crowd Level", "destA": "Details", "destB": "Details" }
  ],
  "prosConsA": { "pros": [], "cons": [] },
  "prosConsB": { "pros": [], "cons": [] }
}`;

    const comparison = await generateJSONResponse(prompt, systemInstruction);
    res.status(200).json(comparison);
  } catch (error) {
    console.error('AI Compare Error:', error);
    res.status(500).json({ message: 'Failed to generate comparison.' });
  }
};

const estimateBudget = async (req, res) => {
  try {
    const { destination, days, travelers, travelStyle } = req.body;
    
    const prompt = `Estimate the budget for ${travelers} travelers staying ${days} days in ${destination} with a ${travelStyle} style.`;
    
    const systemInstruction = `Provide a realistic travel budget breakdown in INR.
Output exactly this JSON format:
{
  "currency": "INR",
  "totalEstimated": 0,
  "breakdown": {
    "accommodation": 0,
    "foodAndDining": 0,
    "localTransport": 0,
    "activities": 0,
    "miscellaneous": 0
  },
  "savingTips": ["Tip 1", "Tip 2"]
}`;

    const budget = await generateJSONResponse(prompt, systemInstruction);
    res.status(200).json(budget);
  } catch (error) {
    console.error('AI Budget Error:', error);
    res.status(500).json({ message: 'Failed to estimate budget.' });
  }
};

const packingAssistant = async (req, res) => {
  try {
    const { destination, days, month } = req.body;
    
    const prompt = `Generate a packing list for a ${days}-day trip to ${destination} in ${month}.`;
    
    const systemInstruction = `Provide a smart packing checklist based on the destination's typical weather for the given month.
Output exactly this JSON format:
{
  "weatherExpectation": "Brief description of expected weather",
  "categories": [
    {
      "name": "Clothing",
      "items": ["Item 1", "Item 2"]
    },
    {
      "name": "Essentials & Documents",
      "items": ["Item 1", "Item 2"]
    }
  ]
}`;

    const packingList = await generateJSONResponse(prompt, systemInstruction);
    res.status(200).json(packingList);
  } catch (error) {
    console.error('AI Packing Error:', error);
    res.status(500).json({ message: 'Failed to generate packing list.' });
  }
};

const travelTips = async (req, res) => {
  try {
    const { destination } = req.body;
    
    const prompt = `Provide essential travel tips for visiting ${destination}.`;
    
    const systemInstruction = `Provide highly practical and cultural travel tips for the destination.
Output exactly this JSON format:
{
  "localCustoms": ["Custom 1"],
  "safetyTips": ["Tip 1"],
  "transportAdvice": "Advice on getting around",
  "emergencyInfo": "Useful numbers or info",
  "currencyAdvice": "Info on cash vs cards"
}`;

    const tips = await generateJSONResponse(prompt, systemInstruction);
    res.status(200).json(tips);
  } catch (error) {
    console.error('AI Tips Error:', error);
    res.status(500).json({ message: 'Failed to generate travel tips.' });
  }
};

module.exports = {
  chatWithAI,
  planTrip,
  smartSearch,
  compareDestinations,
  estimateBudget,
  packingAssistant,
  travelTips
};

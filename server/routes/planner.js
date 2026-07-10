const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const { generateFallbackItinerary } = require('../utils/itineraryBuilder');

// POST /api/planner/generate
router.post('/generate', protect, async (req, res) => {
  const { destination, dates, travelers, budget, interests, days } = req.body;

  if (!destination || !days) {
    return res.status(400).json({ message: 'Destination and number of days are required.' });
  }

  try {
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_KEY || GEMINI_KEY.includes('your_gemini_api_key')) {
      // Use intelligent fallback engine
      const itinerary = generateFallbackItinerary(destination, days);
      return res.json({ itinerary });
    }

    // Call real Gemini API
    const systemPrompt = `You are an expert AI Travel Planner. Generate a JSON response for a trip to ${destination}.
Requirements:
- Duration: ${days} days
- Travelers: ${travelers}
- Budget Level: ${budget}
- Interests: ${interests.join(', ')}

Return strictly in the following JSON format:
{
  "budgetBreakdown": { "transport": number, "hotel": number, "food": number, "activities": number },
  "packingList": ["item1", "item2", "item3", "item4", "item5"],
  "days": [
    {
      "day": 1,
      "theme": "Theme of the day",
      "morning": "Morning activity description",
      "afternoon": "Afternoon activity description",
      "evening": "Evening activity description",
      "locations": [
        { "name": "Name of primary morning attraction", "lat": 15.5523, "lng": 73.7517 },
        { "name": "Name of primary afternoon attraction", "lat": 15.6023, "lng": 73.8017 },
        { "name": "Name of primary evening attraction", "lat": 15.6523, "lng": 73.8517 }
      ]
    }
  ]
}
Note: Ensure lat/lng are accurate decimal degrees for ${destination}. Do not include any markdown formatting like \`\`\`json. Return raw JSON.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
          generationConfig: { maxOutputTokens: 2048, temperature: 0.7 }
        })
      }
    );

    const data = await response.json();
    let replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up potential markdown formatting
    replyText = replyText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const itinerary = JSON.parse(replyText);

      // Safety net: Gemini can occasionally under/over-generate days.
      // Never let a mismatched day count reach the user — repair it here.
      if (!Array.isArray(itinerary.days)) {
        return res.json({ itinerary: generateFallbackItinerary(destination, days) });
      }
      if (itinerary.days.length > days) {
        itinerary.days = itinerary.days.slice(0, days);
      } else if (itinerary.days.length < days) {
        const lastDay = itinerary.days.length;
        for (let i = lastDay + 1; i <= days; i++) {
          itinerary.days.push(buildDay(i, destination));
        }
      }
      itinerary.days = itinerary.days.map((d, i) => ({ ...d, day: i + 1 }));

      res.json({ itinerary });
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON:', replyText);
      res.json({ itinerary: generateFallbackItinerary(destination, days) });
    }

  } catch (err) {
    console.error('Planner Error:', err);
    res.status(500).json({ message: 'Planner service error' });
  }
});

module.exports = router;

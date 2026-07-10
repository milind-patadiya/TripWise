const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// AI travel knowledge base for fallback (when no Gemini key is configured)
const DESTINATION_KNOWLEDGE = {
  goa: { reply: '**Goa** is India\'s beach paradise! 🏖️\n\n**Best time**: November to February (dry, pleasant weather)\n\n**Must-visit places:**\n• Baga Beach — Water sports & nightlife\n• Dudhsagar Falls — Stunning four-tiered waterfall\n• Fort Aguada — 17th-century Portuguese fort\n• Old Goa Churches — UNESCO World Heritage Site\n\n**Budget estimate:** ₹2,500–5,000/day\n\n**Getting there:** Fly to Dabolim Airport (GOX), or train to Margao/Thivim stations.\n\n**Food to try:** Fish curry rice, Bebinca, Feni, Prawn Balchão' },
  manali: { reply: '**Manali** is a stunning Himalayan retreat! 🏔️\n\n**Best time**: October to June (avoid monsoon July–September)\n\n**Must-visit places:**\n• Rohtang Pass — Snow activities & panoramic views\n• Solang Valley — Paragliding, skiing, zorbing\n• Hadimba Temple — Ancient cedar wood temple\n• Old Manali — Cafés, hippie culture\n\n**Budget estimate:** ₹2,000–6,000/day\n\n**Getting there:** Fly to Bhuntar Airport, or bus from Delhi (12 hours).\n\n**Food to try:** Siddu, Trout fish, Tibetan momos, Dham' },
  jaipur: { reply: '**Jaipur** — The Pink City! 🏰\n\n**Best time**: October to March (cool and pleasant)\n\n**Must-visit places:**\n• Amber Fort — Majestic hilltop fort with elephant rides\n• Hawa Mahal — Iconic Palace of Winds with 953 windows\n• City Palace — Royal museum & architecture\n• Nahargarh Fort — Best sunset views of the city\n\n**Budget estimate:** ₹1,800–4,000/day\n\n**Getting there:** Fly to Jaipur International Airport, or train from Delhi (4.5 hours).\n\n**Food to try:** Dal Baati Churma, Ghewar, Pyaaz Kachori, Laal Maas' },
  udaipur: { reply: '**Udaipur** — Venice of the East! 🏛️\n\n**Best time**: September to March\n\n**Must-visit places:**\n• City Palace — Largest palace complex in Rajasthan\n• Lake Pichola — Scenic boat rides at sunset\n• Jagdish Temple — 17th-century Vishnu temple\n• Saheliyon ki Bari — Garden of Maidens\n\n**Budget estimate:** ₹2,000–5,000/day\n\n**Getting there:** Fly to Maharana Pratap Airport, or train from Jaipur/Delhi.\n\n**Food to try:** Daal Baati, Gatte ki Sabzi, Mawa Kachori' },
  kerala: { reply: '**Kerala** — God\'s Own Country! 🌴\n\n**Best time**: September to March\n\n**Must-visit places:**\n• Alleppey Backwaters — Houseboat cruises\n• Munnar — Rolling tea gardens at 1600m\n• Kumarakom — Bird sanctuary & lake resort\n• Fort Kochi — Colonial heritage & Chinese fishing nets\n\n**Budget estimate:** ₹2,200–6,000/day\n\n**Getting there:** Fly to Kochi or Trivandrum airport.\n\n**Food to try:** Appam & stew, Kerala fish curry, Puttu & kadala, Parotta' },
  agra: { reply: '**Agra** — Home of the Taj Mahal! 🕌\n\n**Best time**: October to March\n\n**Must-visit places:**\n• Taj Mahal — One of the Seven Wonders of the World\n• Agra Fort — UNESCO World Heritage Mughal fortress\n• Fatehpur Sikri — Abandoned Mughal capital\n• Mehtab Bagh — Moonlight Garden with Taj views\n\n**Budget estimate:** ₹1,500–3,500/day\n\n**Getting there:** Train from Delhi (2 hours by Gatimaan Express).\n\n**Food to try:** Petha, Mughlai cuisine, Bedai with Jalebi' },
  ladakh: { reply: '**Ladakh** — Land of High Passes! 🏔️\n\n**Best time**: June to September\n\n**Must-visit places:**\n• Pangong Lake — Color-changing high-altitude lake\n• Nubra Valley — Sand dunes & double-humped camels\n• Thiksey Monastery — Mini Potala Palace\n• Khardung La — One of the world\'s highest motorable passes\n\n**Budget estimate:** ₹3,000–7,000/day\n\n**Getting there:** Fly to Leh Kushok Bakula Rimpochee Airport.\n\n**Important:** Acclimatize for 1-2 days upon arrival. Carry warm clothing even in summer.' },
  varanasi: { reply: '**Varanasi** — Spiritual Capital of India! 🙏\n\n**Best time**: October to March\n\n**Must-visit places:**\n• Dashashwamedh Ghat — Evening Ganga Aarti ceremony\n• Kashi Vishwanath Temple — One of 12 Jyotirlingas\n• Sarnath — Where Buddha gave his first sermon\n• Assi Ghat — Morning yoga and boat rides\n\n**Budget estimate:** ₹1,200–3,000/day\n\n**Getting there:** Fly to Varanasi Airport, or train from Delhi/Mumbai.\n\n**Food to try:** Banarasi paan, Kachori-Sabzi, Thandai, Malaiyo' },
  rishikesh: { reply: '**Rishikesh** — Yoga Capital of the World! 🧘\n\n**Best time**: September to June\n\n**Must-visit places:**\n• Laxman Jhula — Iconic suspension bridge\n• Triveni Ghat — Evening aarti on the Ganges\n• Beatles Ashram — Abandoned ashram with graffiti art\n• Rajaji National Park — Wildlife safari\n\n**Adventure activities:** White water rafting (₹600–2,000), bungee jumping (₹3,550), cliff jumping, kayaking.\n\n**Budget estimate:** ₹1,500–4,000/day' },
  shimla: { reply: '**Shimla** — Queen of Hill Stations! ❄️\n\n**Best time**: March to June (summer), December to February (snowfall)\n\n**Must-visit places:**\n• Mall Road — Shopping, dining & colonial architecture\n• Kufri — Skiing & horse riding\n• Jakhoo Temple — Hanuman temple with panoramic views\n• The Ridge — Open space with mountain views\n\n**Budget estimate:** ₹1,800–4,500/day\n\n**Getting there:** Toy train from Kalka (5 hours), or bus from Delhi (8 hours).' },
  darjeeling: { reply: '**Darjeeling** — Queen of the Hills! 🍵\n\n**Best time**: March to May, September to November\n\n**Must-visit places:**\n• Tiger Hill — Sunrise view of Kanchenjunga\n• Darjeeling Himalayan Railway — UNESCO Heritage Toy Train\n• Happy Valley Tea Estate — Tea tasting tours\n• Batasia Loop — Scenic railway loop with war memorial\n\n**Budget estimate:** ₹1,800–4,000/day\n\n**Food to try:** Momos, Thukpa, Darjeeling tea, Churpee' },
};

// POST /api/ai/chat
router.post('/chat', protect, async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message) return res.status(400).json({ message: 'Message is required' });

  try {
    const GEMINI_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_KEY || GEMINI_KEY.includes('your_')) {
      // Intelligent fallback
      const lower = message.toLowerCase();
      let reply = '';

      // Check against knowledge base
      for (const [key, data] of Object.entries(DESTINATION_KNOWLEDGE)) {
        if (lower.includes(key)) {
          reply = data.reply;
          break;
        }
      }

      if (!reply) {
        if (lower.includes('packing') || lower.includes('pack')) {
          reply = '**Essential Packing Checklist** 🎒\n\n**Documents:**\n• Aadhar/Passport, tickets, hotel confirmations\n• Travel insurance documents\n\n**Clothing:**\n• 3-4 comfortable outfits\n• Light jacket / rain gear\n• Comfortable walking shoes\n\n**Electronics:**\n• Phone charger & power bank\n• Camera & memory cards\n• Universal adapter\n\n**Health & Hygiene:**\n• Sunscreen (SPF 50+)\n• Insect repellent\n• Basic medicines (paracetamol, Digene, band-aids)\n• Hand sanitizer & masks\n\n**Misc:**\n• Reusable water bottle\n• Snacks for travel\n• Travel pillow & eye mask';
        } else if (lower.includes('budget') || lower.includes('cheap') || lower.includes('save')) {
          reply = '**Smart Budget Travel Tips** 💰\n\n**Booking:**\n• Book flights 3-4 weeks in advance\n• Use TripWise\'s AI planner for optimized budgets\n• Travel on weekdays to avoid weekend surcharges\n\n**Accommodation:**\n• Hostels & homestays save 40-60% vs hotels\n• Book directly for best rates\n\n**Food:**\n• Eat at local dhabas & street food stalls\n• Carry snacks to avoid overpriced tourist spots\n\n**Transport:**\n• Use public transport (buses, metro, shared autos)\n• Rent a bike/scooter in smaller cities\n\n**Budget ranges (per day in India):**\n• Backpacker: ₹1,000–2,000\n• Moderate: ₹2,500–5,000\n• Luxury: ₹8,000–15,000+';
        } else if (lower.includes('itinerary') || lower.includes('plan') || lower.includes('trip')) {
          reply = 'I can help you plan a complete trip! 🗺️\n\nTo create the best itinerary, I need a few details:\n\n1. **Destination** — Where do you want to go?\n2. **Duration** — How many days?\n3. **Budget** — Budget, Moderate, or Luxury?\n4. **Interests** — Adventure, Culture, Nature, Food, Shopping?\n\nOr try our **AI Trip Planner** at `/planner/setup` for a complete day-by-day itinerary with budget breakdown!\n\nYou can also ask me about specific destinations like Goa, Manali, Jaipur, Kerala, Ladakh, etc.';
        } else {
          reply = 'Hello! I\'m your **TripWise AI Travel Assistant** 🌍\n\nI can help you with:\n\n• 📍 **Destination guides** — Ask about any Indian destination\n• 📅 **Trip planning** — Best times, duration, itineraries\n• 💰 **Budget tips** — Save money while traveling\n• 🎒 **Packing lists** — What to carry\n• 🍽️ **Food recommendations** — Local cuisine to try\n• 🏨 **Hotel suggestions** — Budget to luxury stays\n\n**Try asking:**\n• "Tell me about Goa"\n• "Plan a 5-day trip to Kerala"\n• "Budget tips for Ladakh"\n• "What to pack for a mountain trip?"\n\n💡 *Note: I am running in Offline Knowledge Base mode. For dynamic responses, add a Gemini API Key.*';
        }
      }

      return res.json({ reply, mode: 'fallback' });
    }

    // Real Gemini API call
    const systemPrompt = `You are TripWise AI, a professional travel planning assistant for Indian travelers. You provide helpful, accurate, concise travel advice. Include prices in INR when relevant. Format responses with markdown for clarity. Keep responses focused, practical, and highly accurate. If you are asked about something outside of travel, politely decline.`;

    const chatHistory = history.map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [
            ...chatHistory,
            { role: 'user', parts: [{ text: message }] }
          ],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      
      // Attempt smart fallback if Gemini fails (e.g. rate limit)
      return res.json({ reply: 'Sorry, I am currently experiencing high demand. Please try again in a few moments or refer to our destination guides! 🌍', mode: 'fallback' });
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!reply) {
      return res.json({ reply: 'I could not generate a response. Please try again.', mode: 'fallback' });
    }

    res.json({ reply, mode: 'gemini' });
  } catch (err) {
    console.error('AI Error:', err);
    res.status(500).json({ message: 'AI service error' });
  }
});

// GET /api/ai/status — check if Gemini is configured
router.get('/status', (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  const configured = !!key && !key.includes('your_');
  res.json({ 
    configured,
    mode: configured ? 'gemini' : 'fallback',
    message: configured ? 'Gemini AI is active' : 'Running in smart fallback mode. Add GEMINI_API_KEY to .env for real AI.'
  });
});

module.exports = router;

const MOCK_ITINERARIES = {
  goa: {
    budgetBreakdown: { transport: 15000, hotel: 20000, food: 10000, activities: 5000 },
    packingList: ['Sunscreen', 'Swimwear', 'Light Cotton Clothes', 'Sunglasses', 'Flip Flops'],
    days: [
      {
        day: 1,
        theme: 'Arrival & North Goa Beaches',
        morning: 'Arrive at GOX Airport. Check into your hotel in Baga. Head out for a traditional Goan breakfast at Infantaria.',
        afternoon: 'Relax at Baga Beach. Try water sports like parasailing or jet skiing.',
        evening: 'Enjoy the vibrant nightlife at Tito\'s Lane or a sunset dinner at Britto\'s.',
        locations: [{ name: 'Baga Beach', lat: 15.5523, lng: 73.7517 }]
      },
      {
        day: 2,
        theme: 'Forts & Culture',
        morning: 'Rent a scooter and drive to Aguada Fort. Enjoy panoramic views of the Arabian Sea.',
        afternoon: 'Visit the Basilica of Bom Jesus and Se Cathedral in Old Goa.',
        evening: 'Take a Mandovi River cruise with traditional Goan music and dancing.',
        locations: [{ name: 'Aguada Fort', lat: 15.4989, lng: 73.7661 }, { name: 'Basilica of Bom Jesus', lat: 15.5009, lng: 73.9116 }]
      },
      {
        day: 3,
        theme: 'South Goa Serenity',
        morning: 'Drive down to Palolem Beach in South Goa for a much quieter, pristine experience.',
        afternoon: 'Take a boat ride to Butterfly Beach for dolphin spotting.',
        evening: 'Dinner at a quiet beach shack in Agonda.',
        locations: [{ name: 'Palolem Beach', lat: 15.0100, lng: 74.0232 }]
      }
    ]
  },
  manali: {
    budgetBreakdown: { transport: 8000, hotel: 15000, food: 7000, activities: 10000 },
    packingList: ['Heavy Jackets', 'Thermal Wear', 'Trekking Shoes', 'Gloves', 'Moisturizer'],
    days: [
      {
        day: 1,
        theme: 'Arrival & Local Sightseeing',
        morning: 'Arrive in Manali. Check into your hotel. Visit the ancient Hadimba Temple surrounded by cedar forests.',
        afternoon: 'Explore the Manali Club House and take a stroll in the Van Vihar National Park.',
        evening: 'Walk around Mall Road. Shop for local woolens and try some local street food.'
      },
      {
        day: 2,
        theme: 'Snow Adventure at Rohtang Pass',
        morning: 'Early morning drive to Rohtang Pass (subject to permits). Enjoy snow activities.',
        afternoon: 'Stop by Solang Valley on the way back for paragliding or zorbing.',
        evening: 'Relax with a hot cup of tea and dinner at a cozy cafe in Old Manali.'
      }
    ]
  },
  jaipur: {
    budgetBreakdown: { transport: 6000, hotel: 12000, food: 8000, activities: 4000 },
    packingList: ['Cotton Clothes', 'Comfortable Footwear', 'Sunglasses', 'Hat', 'Camera'],
    days: [
      {
        day: 1,
        theme: 'Pink City Heritage',
        morning: 'Arrive in Jaipur and check into your hotel. Visit the iconic Hawa Mahal.',
        afternoon: 'Explore the majestic City Palace and Jantar Mantar.',
        evening: 'Shop for traditional handicrafts and jewelry at Johari Bazaar. Dinner at Chokhi Dhani.'
      },
      {
        day: 2,
        theme: 'Forts and Palaces',
        morning: 'Early morning visit to Amber Fort. Enjoy an elephant ride or jeep safari.',
        afternoon: 'Visit the Jaigarh and Nahargarh Forts for panoramic views of the city.',
        evening: 'Relax at Jal Mahal (Water Palace) and enjoy the scenic sunset.'
      }
    ]
  },
  udaipur: {
    budgetBreakdown: { transport: 5000, hotel: 15000, food: 7000, activities: 3000 },
    packingList: ['Light Clothing', 'Walking Shoes', 'Evening Wear', 'Sunscreen', 'Scarf'],
    days: [
      {
        day: 1,
        theme: 'City of Lakes',
        morning: 'Arrive in Udaipur. Visit the grand City Palace complex.',
        afternoon: 'Explore the Vintage Car Museum and Jagdish Temple.',
        evening: 'Take a mesmerizing sunset boat ride on Lake Pichola.'
      },
      {
        day: 2,
        theme: 'Gardens and Monsoons',
        morning: 'Visit Saheliyon ki Bari (Garden of the Maidens).',
        afternoon: 'Excursion to the Monsoon Palace (Sajjangarh) for stunning views.',
        evening: 'Dinner at a rooftop restaurant overlooking the lake.'
      }
    ]
  },
  kerala: {
    budgetBreakdown: { transport: 10000, hotel: 18000, food: 9000, activities: 6000 },
    packingList: ['Umbrella/Raincoat', 'Light Cottons', 'Mosquito Repellent', 'Trekking Shoes', 'Swimwear'],
    days: [
      {
        day: 1,
        theme: 'Munnar Tea Gardens',
        morning: 'Arrive in Kochi and drive to Munnar. Check into a tea estate resort.',
        afternoon: 'Visit the Tea Museum and stroll through the lush green plantations.',
        evening: 'Enjoy a serene sunset at Echo Point.'
      },
      {
        day: 2,
        theme: 'Alleppey Backwaters',
        morning: 'Drive down to Alleppey. Board a traditional houseboat.',
        afternoon: 'Cruise through the tranquil backwaters, enjoying authentic Kerala cuisine on board.',
        evening: 'Overnight stay on the houseboat under the starry sky.'
      }
    ]
  },
  maldives: {
    budgetBreakdown: { transport: 10000, hotel: 30000, food: 15000, activities: 15000 },
    packingList: ['Swimwear', 'Sunscreen', 'Flip Flops', 'Snorkeling Gear', 'Light Clothing'],
    days: [
      {
        day: 1,
        theme: 'Arrival & Relaxation',
        morning: 'Arrive at Male Airport and take a speedboat or seaplane to your resort.',
        afternoon: 'Check into your villa, relax, and explore the resort island.',
        evening: 'Enjoy a beachfront dinner with the soothing sound of the waves.'
      },
      {
        day: 2,
        theme: 'Underwater Exploration',
        morning: 'Go for a guided snorkeling or scuba diving session to see vibrant coral reefs.',
        afternoon: 'Relax by the pool or on your private deck over the water.',
        evening: 'Sunset cruise to spot dolphins.'
      }
    ]
  }
};

const FILLER_THEMES = [
  { theme: 'Local Markets & Cuisine', morning: 'Explore a bustling local market and pick up some souvenirs.', afternoon: 'Sample regional specialties at a well-reviewed local eatery.', evening: 'Wind down with a relaxed dinner and some live local music if available.' },
  { theme: 'Nature & Scenic Views', morning: 'Take a scenic nature trail or viewpoint hike nearby.', afternoon: 'Relax at a lakeside, riverside, or garden spot with a packed lunch.', evening: 'Catch the sunset from a well-known scenic point.' },
  { theme: 'Culture & Heritage', morning: 'Visit a historic monument, temple, or museum in the area.', afternoon: 'Explore the old town / heritage quarter on foot.', evening: 'Enjoy a cultural show or heritage walk if available.' },
  { theme: 'Adventure & Activities', morning: 'Try a popular local adventure activity (trekking, water sports, or similar).', afternoon: 'Continue exploring nearby attractions at a relaxed pace.', evening: 'Rest and recharge with a casual dinner near your stay.' },
  { theme: 'Leisure & Free Exploration', morning: 'Sleep in a little, then enjoy a leisurely breakfast.', afternoon: 'Free time to explore at your own pace — shopping, cafes, or a spa.', evening: 'Farewell dinner at a highly-rated local restaurant.' },
];

function buildDay(dayNum, destination, themeOverride) {
  const filler = FILLER_THEMES[(dayNum - 1) % FILLER_THEMES.length];
  return {
    day: dayNum,
    theme: themeOverride || `${filler.theme} in ${destination}`,
    morning: filler.morning,
    afternoon: filler.afternoon,
    evening: filler.evening,
    locations: [],
  };
}

function generateFallbackItinerary(destination, days) {
  const destKey = destination.toLowerCase();
  let baseData = null;
  for (const key of Object.keys(MOCK_ITINERARIES)) {
    if (destKey.includes(key)) {
      baseData = MOCK_ITINERARIES[key];
      break;
    }
  }

  if (!baseData) {
    baseData = {
      budgetBreakdown: { transport: 10000, hotel: 15000, food: 8000, activities: 5000 },
      packingList: ['Comfortable Walking Shoes', 'Weather-appropriate clothing', 'Camera', 'Power Bank', 'Travel Documents'],
      days: [],
    };
  }

  let resultDays;
  if (baseData.days.length >= days) {
    resultDays = baseData.days.slice(0, days).map((d, i) => ({ ...d, day: i + 1 }));
  } else {
    resultDays = [...baseData.days];
    for (let i = resultDays.length + 1; i <= days; i++) {
      resultDays.push(buildDay(i, destination));
    }
  }

  return {
    budgetBreakdown: baseData.budgetBreakdown,
    packingList: baseData.packingList,
    days: resultDays,
  };
}

const buildDynamicItinerary = async (destination, days) => {
  try {
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY || GEMINI_KEY.includes('your_gemini_api_key')) {
      return generateFallbackItinerary(destination, days).days;
    }

    const systemPrompt = `You are an expert AI Travel Planner. Generate a JSON itinerary for a trip to ${destination}.
Requirements:
- Duration: exactly ${days} days.

Return strictly in the following JSON format:
{
  "days": [
    {
      "day": 1,
      "theme": "Theme of the day",
      "morning": "Morning activity description",
      "afternoon": "Afternoon activity description",
      "evening": "Evening activity description"
    }
  ]
}
Return raw JSON. No markdown tags.`;

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
    replyText = replyText.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(replyText);
    
    // Safety check and padding/trimming
    if (!Array.isArray(parsed.days)) {
      throw new Error("Invalid format");
    }
    
    let resultDays = parsed.days;
    if (resultDays.length > days) {
      resultDays = resultDays.slice(0, days);
    } else if (resultDays.length < days) {
      const lastDay = resultDays.length;
      for (let i = lastDay + 1; i <= days; i++) {
        resultDays.push(buildDay(i, destination));
      }
    }
    
    return resultDays.map((d, i) => ({ ...d, day: i + 1 }));

  } catch (err) {
    console.error('Itinerary Builder Error:', err);
    return generateFallbackItinerary(destination, days).days;
  }
};

module.exports = {
  buildDynamicItinerary,
  generateFallbackItinerary
};

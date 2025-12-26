import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.warn('OPENAI_API_KEY is not set. AI features will be disabled.');
}

export const openai = new OpenAI({
    apiKey: apiKey || 'dummy_key',
});

export async function getAISearchFilters(query: string) {
    const prompt = `You are a Napa Valley Wine Expert. Analyze the user's query and extract search filters for wineries.
  
  User Query: "${query}"
  
  Available Filter options:
  - AVA: "Calistoga", "St. Helena", "Rutherford", "Oakville", "Yountville", "Stags Leap District", "Howell Mountain", "Pritchard Hill", "Diamond Mountain", "Spring Mountain", "Mount Veeder", "Coombsville", "Carneros", "Chiles Valley", "Pope Valley", "Atlas Peak", "Wild Horse Valley"
  - Wine Types: "Red", "White", "Rosé", "Sparkling", "Dessert"
  - Price Range: { min: number, max: number }
  - Features: "Outdoor Seating", "Modern Architecture", "Cave Tour", "Hidden Gem", "Historic", "Food Pairing", "Great Views", "Dog Friendly", "Kid Friendly", "Walk-ins Welcome", "Handicap Accessible"

  Return ONLY a JSON object:
  {
    "ava": string[],
    "wineTypes": string[],
    "priceRange": { "min": number, "max": number },
    "features": string[],
    "interpretation": "A brief sentence explaining what the user is looking for."
  }`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: "You are a professional sommelier assistant." },
            { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
}

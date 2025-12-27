import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. AI features will be disabled.');
}

const genAI = new GoogleGenerativeAI(apiKey || 'dummy_key');

export const geminiModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

export async function getAISearchFilters(query: string) {
    const prompt = `You are a Napa Valley Wine Expert. Analyze the user's query and extract search filters for wineries.
  
  User Query: "${query}"
  
  Available Filter options:
  - AVA: "Calistoga", "St. Helena", "Rutherford", "Oakville", "Yountville", "Stags Leap District", "Howell Mountain", "Pritchard Hill", "Diamond Mountain", "Spring Mountain", "Mount Veeder", "Coombsville", "Carneros", "Chiles Valley", "Pope Valley", "Atlas Peak", "Wild Horse Valley"
  - Wine Types: "Red", "White", "Rosé", "Sparkling", "Dessert"
  - Price Range: { min: number, max: number }
  - Features: "Outdoor Seating", "Modern Architecture", "Cave Tour", "Hidden Gem", "Historic", "Food Pairing", "Great Views", "Dog Friendly", "Kid Friendly", "Walk-ins Welcome", "Handicap Accessible"

  Return ONLY a JSON object that strictly follows this structure:
  {
    "ava": string[],
    "wineTypes": string[],
    "priceRange": { "min": number, "max": number },
    "features": string[],
    "interpretation": "A brief sentence explaining what the user is looking for."
  }`;

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return JSON.parse(text || '{}');
    } catch (error) {
        console.error("Gemini AI Search Error:", error);
        return {
            ava: [],
            wineTypes: [],
            priceRange: { min: 0, max: 500 },
            features: [],
            interpretation: "Unable to process query with AI."
        };
    }
}

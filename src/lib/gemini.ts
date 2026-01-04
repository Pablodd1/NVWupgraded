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
    "name": string | null,
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

// Separate model for chat to avoid JSON enforcement
export const chatModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});

export async function generateConversationalResponse(query: string, searchResults: any[], context: any[] = [], history: any[] = []) {
    try {
        // Simplify winery objects to save tokens, but keep critical info
        const simplify = (w: any) => ({
            name: w.name,
            phone: w.contact_info?.phone,
            address: w.location?.address,
            description: w.description?.substring(0, 100),
            tasting_price: w.tasting_info?.[0]?.tasting_price
        });

        const currentWineries = searchResults.slice(0, 5).map(simplify);
        const contextWineries = context.slice(0, 5).map(simplify);

        const historyText = history.map(h => `${h.isUser ? 'User' : 'Bot'}: ${h.text}`).join('\n');

        const prompt = `You are a helpful concierge for Napa Valley Wineries.
        
        Information Source (Current Search Results):
        ${JSON.stringify(currentWineries, null, 2)}

        Information Source (Previous Context - wineries user saw recently):
        ${JSON.stringify(contextWineries, null, 2)}

        Conversation History:
        ${historyText}

        User's Latest Query: "${query}"

        Instructions:
        1. Answer the user's question based on the Information Sources.
        2. If the user is asking for specific details (phone, address, price) about a winery mentioned in history or context, provide it from the data.
        3. If the user performed a new search (implied by the Current Search Results being relevant), summarize the top options.
        4. Be concise, friendly, and helpful. Use the language of the user (detect from query).
        5. If the search results correspond to the query, introduce them (e.g., "I found these wineries...").
        6. If the user asks for a phone number or address for a specific winery, look for it in the context or current results and provide it.
        7. If you cannot find the answer in the provided data, politely say you don't have that information but can help search for other things.

        Response:`;

        const result = await chatModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Chat Generation Error:", error);
        return "I'm having trouble connecting to my brain right now, but here are the wineries I found.";
    }
}

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
  - Number of People: integer

  Return ONLY a JSON object that strictly follows this structure:
  {
    "ava": string[],
    "wineTypes": string[],
    "priceRange": { "min": number, "max": number },
    "features": string[],
    "numberOfPeople": number | null,
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
        if (!apiKey || apiKey === 'dummy_key') {
            return "I'm sorry, my AI brain isn't fully connected right now. Please check if the GEMINI_API_KEY is configured correctly.";
        }

        // Simplify winery objects to save tokens, but keep critical info
        const simplify = (w: any) => ({
            name: w.name,
            phone: w.contact_info?.phone,
            address: w.location?.address,
            description: w.description?.substring(0, 150),
            tasting_price: w.tasting_info?.[0]?.tasting_price,
            website: w.contact_info?.website
        });

        const currentWineries = searchResults.slice(0, 5).map(simplify);
        const contextWineries = context.slice(0, 5).map(simplify);

        const historyText = history.map(h => `${h.isUser ? 'User' : 'Concierge'}: ${h.text}`).join('\n');

        const prompt = `You are the "NVW Concierge", a sophisticated, expert, and friendly wine guide for Napa Valley.
        Your goal is to help users find the perfect winery experience.

        CONTEXT INFORMATION:
        - Current Search Results: ${JSON.stringify(currentWineries, null, 2)}
        - Previously Viewed Wineries: ${JSON.stringify(contextWineries, null, 2)}
        - Conversation History:
        ${historyText}

        LATEST USER QUERY: "${query}"

        INSTRUCTIONS:
        1. Be a professional yet warm host. Use words like "splendid," "curated," "exquisite," but don't overdo it.
        2. If search results are present, describe the top 2-3 in a way that highlights why they match the user's query. Mention prices or specific features if available.
        3. If no search results are found for a specific query, politely explain why and suggest common alternatives (e.g., "I couldn't find a winery specifically for that, but many of our members enjoy [Name] for a similar vibe.")
        4. Always mention that users can find more details or book directly by clicking on the winery cards.
        5. If asked for contact details (phone, website), provide them clearly.
        6. Keep responses under 4 sentences unless describing multiple specific wineries.
        7. If the user is just greeting you, reply with a warm welcome to Napa Valley and offer assistance.

        Response:`;

        const result = await chatModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) throw new Error("Empty AI response");

        return text;
    } catch (error) {
        console.error("Gemini Chat Generation Error:", error);

        if (searchResults.length > 0) {
            return `I encountered a small glitch, but I did find some excellent choices for you! Top picks include ${searchResults.slice(0, 3).map(w => w.name).join(", ")}. Feel free to explore their details on the cards above.`;
        }

        return "I'm having a brief moment of reflection. Could you please rephrase your request? In the meantime, you can browse all our wonderful wineries on the main page.";
    }
}

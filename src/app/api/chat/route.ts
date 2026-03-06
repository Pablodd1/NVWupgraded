import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Note: Ensure GEMINI_API_KEY is defined in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ message: "AI Assistant is currently offline (Missing API Key)." }, { status: 503 });
        }

        const { messages } = await req.json();
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt = "You are a helpful and extremely polite winery assistant. You help vineyard owners set up their tasting packages and manage their account on our platform (owner dashboard). For consumers, you help them discover new experiences in the Napa Valley and direct them to search filters. Keep your answers concise, no longer than 3-4 sentences.\\n\\nHere is the conversation so far:\\n";

        messages.forEach((msg: any) => {
            prompt += `${msg.role === 'user' ? 'USER' : 'ASSISTANT'}: ${msg.content}\n`;
        });

        prompt += "ASSISTANT:";

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return NextResponse.json({ message: text });
    } catch (err: any) {
        console.error("Chat Error:", err);
        return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 });
    }
}

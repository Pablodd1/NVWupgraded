import { NextResponse } from 'next/server';
import { geminiModel } from '@/lib/gemini';
import Winery from '@/models/winery.model';
import { dbConnect } from '@/lib/dbConnect';

export async function GET() {
    try {
        await dbConnect();

        // 1. Get all winery IDs and names for Gemini to choose from
        const wineries = await Winery.find({}).select('name description _id');
        const wineryList = wineries.map(w => ({ name: w.name, description: w.description, id: w._id }));

        const prompt = `You are a Napa Valley Concierge. Look at this list of wineries and pick ONE "Hidden Gem" for a user today. 
        Choose one based on character and unique descriptions.
        
        Wineries: ${JSON.stringify(wineryList.slice(0, 20))}
        
        Return ONLY a JSON object:
        {
            "wineryId": "string",
            "reason": "A one sentence luxury-toned reason why this is today's pick."
        }`;

        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const json = JSON.parse(response.text() || '{}');

        const selectedWinery = await Winery.findById(json.wineryId);

        return NextResponse.json({
            winery: selectedWinery,
            reason: json.reason
        });

    } catch (error: any) {
        console.error('Surprise Me Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

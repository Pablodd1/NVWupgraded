import { NextResponse } from 'next/server';
import { getAISearchFilters, generateConversationalResponse } from '@/lib/gemini';
import Winery from '@/models/winery.model';
import { dbConnect } from '@/lib/dbConnect';

export async function POST(req: Request) {
    try {
        const { query, history, context } = await req.json();
        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        await dbConnect();

        // 1. Use AI to interpret the query
        const filters = await getAISearchFilters(query);
        console.log('AI Interpreted Filters:', filters);

        // 2. Build MongoDB query
        const mongoQuery: any = {};

        if (filters.name) {
            mongoQuery['name'] = { $regex: filters.name, $options: 'i' };
        }

        if (filters.ava && filters.ava.length > 0) {
            mongoQuery['tasting_info.ava'] = { $in: filters.ava };
        }

        if (filters.wineTypes && filters.wineTypes.length > 0) {
            mongoQuery['tasting_info.wine_types'] = { $in: filters.wineTypes };
        }

        if (filters.priceRange) {
            if (filters.priceRange.min !== undefined) {
                mongoQuery['tasting_info.tasting_price'] = { ...mongoQuery['tasting_info.tasting_price'], $gte: filters.priceRange.min };
            }
            if (filters.priceRange.max !== undefined) {
                mongoQuery['tasting_info.tasting_price'] = { ...mongoQuery['tasting_info.tasting_price'], $lte: filters.priceRange.max };
            }
        }

        if (filters.features && filters.features.length > 0) {
            const specialFeatures = filters.features.filter((f: string) => f !== "Handicap Accessible");
            const hasHandicapFilter = filters.features.includes("Handicap Accessible");

            if (specialFeatures.length > 0) {
                mongoQuery['tasting_info.special_features'] = { $in: specialFeatures };
            }

            if (hasHandicapFilter) {
                mongoQuery['amenities.handicap_accessible'] = true;
            }
        }

        if (filters.numberOfPeople) {
            mongoQuery['tasting_info.booking_info.max_guests_per_slot'] = { $gte: filters.numberOfPeople };
        }

        // 3. Search Wineries
        console.log('Final MongoDB Query:', JSON.stringify(mongoQuery, null, 2));
        const wineries = await Winery.find(mongoQuery).limit(10);
        console.log(`Found ${wineries.length} wineries matching query.`);

        // 4. Generate Conversational Response
        const message = await generateConversationalResponse(query, wineries, context || [], history || []);

        return NextResponse.json({
            filters,
            wineries,
            count: wineries.length,
            message
        });

    } catch (error: any) {
        console.error('AI Search Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

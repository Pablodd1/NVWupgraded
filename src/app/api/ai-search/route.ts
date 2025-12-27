import { NextResponse } from 'next/server';
import { getAISearchFilters } from '@/lib/gemini';
import Winery from '@/models/winery.model';
import { dbConnect } from '@/lib/dbConnect';

export async function POST(req: Request) {
    try {
        const { query } = await req.json();
        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        await dbConnect();

        // 1. Use AI to interpret the query
        const filters = await getAISearchFilters(query);
        console.log('AI Interpreted Filters:', filters);

        // 2. Build MongoDB query
        const mongoQuery: any = {};

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

        // 3. Search Wineries
        const wineries = await Winery.find(mongoQuery).limit(10);

        return NextResponse.json({
            filters,
            wineries,
            count: wineries.length
        });

    } catch (error: any) {
        console.error('AI Search Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

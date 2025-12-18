import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get('input');
    
    if (!input) {
      return NextResponse.json({ error: 'Input parameter is required' }, { status: 400 });
    }

    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!googleApiKey) {
      return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 });
    }

    const params = new URLSearchParams({
      input: input,
      key: googleApiKey,
      types: 'address',
      components: 'country:us',
      fields: 'formatted_address,geometry,place_id'
    });

    const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`);
    const data = await response.json();

    if (data.status === 'OK' && data.predictions) {
      // Convert Google Places format to match our expected format
      const results = data.predictions.map((prediction: any) => ({
        display_name: prediction.description,
        lat: '0', // We'll geocode this separately
        lon: '0',
        place_id: prediction.place_id,
        source: 'google'
      }));
      
      return NextResponse.json({ results });
    }
    
    return NextResponse.json({ results: [] });
  } catch (error) {
    console.error('Google Places API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Google Places data' }, { status: 500 });
  }
}

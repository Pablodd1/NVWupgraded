import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('place_id');
    
    if (!placeId) {
      return NextResponse.json({ error: 'Place ID parameter is required' }, { status: 400 });
    }

    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!googleApiKey) {
      return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 });
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${googleApiKey}`
    );
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      const result = data.result;
      return NextResponse.json({
        lat: result.geometry.location.lat,
        lon: result.geometry.location.lng,
        address: result.formatted_address
      });
    }
    
    return NextResponse.json({ error: 'Place not found' }, { status: 404 });
  } catch (error) {
    console.error('Google Places geocoding error:', error);
    return NextResponse.json({ error: 'Failed to geocode place' }, { status: 500 });
  }
}

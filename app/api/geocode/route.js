// app/api/geocode/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Add delay to respect rate limits (1 request per second)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'LocateMyCity/1.0 (contact@locatemycity.com)',
        'Accept-Language': 'en',
        'Referer': 'http://localhost:3000'
      }
    });

    const convertToLocalTime = (timestamp, timezoneOffset) => {
  return new Date((timestamp + timezoneOffset) * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  });
};

    if (!response.ok) {
      // If we get 403, try with different approach
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again later.' },
          { status: 503 }
        );
      }
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    const location = data[0];
    
    const result = {
      display_name: location.display_name,
      lat: location.lat,
      lon: location.lon,
      address: {
        city: location.address.city || location.address.town || location.address.village,
        state: location.address.state,
        country: location.address.country,
        country_code: location.address.country_code?.toLowerCase()
      },
      boundingbox: location.boundingbox,
      place_id: location.place_id
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Geocode API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location data' },
      { status: 500 }
    );
  }
}
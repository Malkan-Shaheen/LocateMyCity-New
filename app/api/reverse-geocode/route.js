// app/api/reverse-geocode/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Latitude and longitude parameters are required' },
      { status: 400 }
    );
  }

  try {
    // Validate lat/lon are valid numbers
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    
    if (isNaN(latNum) || isNaN(lonNum)) {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude' },
        { status: 400 }
      );
    }

    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=10`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'LocateMyCity/1.0 (contact@locatemycity.com)',
        'Accept-Language': 'en',
        'Referer': 'http://localhost:3000'
      }
    });

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.error) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    // Extract relevant address components (handle null address)
    const address = data.address || {};
    const result = {
      display_name: data.display_name || '',
      lat: data.lat || lat,
      lon: data.lon || lon,
      address: {
        city: address.city || address.town || address.village || address.municipality || null,
        state: address.state || address.region || null,
        country: address.country || null,
        country_code: address.country_code?.toLowerCase() || null,
        postcode: address.postcode || null,
        // Additional useful fields
        continent: address.continent || null,
        county: address.county || null,
        neighbourhood: address.neighbourhood || null,
        road: address.road || null,
        house_number: address.house_number || null
      },
      place_id: data.place_id || null,
      osm_type: data.osm_type || null,
      osm_id: data.osm_id || null
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Reverse geocode API error:', error.message || error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reverse geocode data' },
      { status: 500 }
    );
  }
}
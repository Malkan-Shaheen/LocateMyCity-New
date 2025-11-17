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
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=10`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'LocateMyCity/1.0 (your-email@example.com)',
        'Accept-Language': 'en'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.error) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    // Extract relevant address components
    const address = data.address;
    const result = {
      display_name: data.display_name,
      lat: data.lat,
      lon: data.lon,
      address: {
        city: address.city || address.town || address.village || address.municipality,
        state: address.state || address.region,
        country: address.country,
        country_code: address.country_code?.toLowerCase(),
        postcode: address.postcode,
        // Additional useful fields
        continent: address.continent,
        county: address.county,
        neighbourhood: address.neighbourhood,
        road: address.road,
        house_number: address.house_number
      },
      place_id: data.place_id,
      osm_type: data.osm_type,
      osm_id: data.osm_id
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Reverse geocode API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reverse geocode data' },
      { status: 500 }
    );
  }
}
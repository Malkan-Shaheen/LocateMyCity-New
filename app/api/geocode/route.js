// app/api/geocode/route.js
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "";
  
  if (!query) {
    return new Response(JSON.stringify({ error: "Missing query" }), { 
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "LocateMyCity/1.0 (contact@example.com)",
        Referer: "https://your-app.example",
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Geocoding service error" }), { 
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const data = await res.json();
    const first = data?.[0];
    
    if (!first) {
      return new Response(JSON.stringify({ error: "No results" }), { 
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const address = first.address || {};
    let countryCode = null;
    
    if (address.country_code) {
      countryCode = address.country_code.toUpperCase();
    }

    return new Response(
      JSON.stringify({
        lat: first.lat,
        lon: first.lon,
        display_name: first.display_name,
        country_code: countryCode,
        address: address
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, s-maxage=3600", // Cache for 1 hour
        } 
      }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
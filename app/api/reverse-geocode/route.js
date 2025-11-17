// app/api/reverse-geocode/route.js
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return new Response(JSON.stringify({ error: "Missing lat or lon parameters" }), { 
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lon}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "LocateMyCity/1.0 (contact@example.com)",
        Referer: "https://locatemycity.com",
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Reverse geocoding service error" }), { 
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const data = await res.json();
    
    if (!data || data.error) {
      return new Response(JSON.stringify({ error: "No results found" }), { 
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const address = data.address || {};
    let countryCode = null;
    
    if (address.country_code) {
      countryCode = address.country_code.toUpperCase();
    }

    return new Response(
      JSON.stringify({
        display_name: data.display_name,
        country_code: countryCode,
        address: address
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, s-maxage=3600",
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
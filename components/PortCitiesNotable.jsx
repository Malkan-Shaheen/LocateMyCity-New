"use client";

import Link from "next/link";

export default function PortCitiesNotable() {
  const featured = [
    { 
      name: "Portland, OR", 
      slug: "portland-oregon", 
      fact: "A major Pacific Northwest city named for its river port, long tied to trade, shipping, and regional commerce." 
    },
    { 
      name: "Portland, ME", 
      slug: "portland-maine", 
      fact: "A historic Atlantic port city known for maritime trade, fishing, and coastal tourism." 
    },
    { 
      name: "Portsmouth, NH", 
      slug: "portsmouth-new-hampshire", 
      fact: "One of the nation's oldest port cities, shaped by shipbuilding and early colonial trade." 
    },
    { 
      name: "Port Arthur, TX", 
      slug: "port-arthur-texas", 
      fact: "A Gulf Coast city developed around oil shipping, refining, and deep-water port access." 
    },
    { 
      name: "Port Huron, MI", 
      slug: "port-huron-michigan", 
      fact: "A Great Lakes port city located at the southern end of Lake Huron, critical to regional shipping." 
    },
    { 
      name: "Port Orange, FL", 
      slug: "port-orange-florida", 
      fact: "A Florida city whose name reflects its early river and coastal access for trade and transport." 
    },
    { 
      name: "Port Angeles, WA", 
      slug: "port-angeles-washington", 
      fact: "A Pacific Northwest port city tied to maritime industry, logging, and ferry connections." 
    },
    { 
      name: "Port Chester, NY", 
      slug: "port-chester-new-york", 
      fact: "A historic New York port community that developed along Long Island Sound as a regional trade point." 
    },
  ];

  return (
    <section className="notable-cities-section py-16">
      <div className="content-container max-w-5xl mx-auto">

        <h2 className="notable-title section-title text-center mb-6">
          Notable U.S. Cities That Begin With "Port"
        </h2>

        <p className="notable-intro text-gray-700 text-lg leading-relaxed text-center max-w-3xl mx-auto mb-10">
          While hundreds of places across the United States include the word "Port," 
          certain cities stand out due to their size, economic role, or historical importance. 
          Here are some of the most notable examples.
        </p>

        <div className="notable-grid grid gap-6 md:grid-cols-2">
          {featured.map((city) => (
            <div
              key={city.name}
              className="city-card rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm p-6 hover:shadow-md transition"
            >
              <h3 className="city-card-title font-semibold text-xl mb-2">
                <Link
                  href={`/how-far-is-${city.slug}-from-me`}
                  className="city-link text-blue-700 hover:text-blue-900 hover:underline"
                >
                  {city.name}
                </Link>
              </h3>

              <p className="city-card-description text-gray-700 leading-relaxed text-base">
                {city.fact}
              </p>
            </div>
          ))}
        </div>

        <p className="notable-footer text-gray-700 text-lg leading-relaxed text-center max-w-3xl mx-auto mt-10">
          These cities represent only a portion of the many "Port" communities found across the 
          country. Each carries a distinct story shaped by water access, trade routes, and regional 
          development.
        </p>

      </div>
    </section>
  );
}





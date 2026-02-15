"use client";

import Link from "next/link";

export default function SanCitiesNotable() {
  const featured = [
    { 
      name: "San Diego, CA", 
      slug: "san-diego-california", 
      fact: "A major coastal city known for its naval history, tourism industry, and Spanish colonial roots." 
    },
    { 
      name: "San Jose, CA", 
      slug: "san-jose-california", 
      fact: "One of the largest cities in California and a central hub of Silicon Valley, with origins tied to Spanish settlement." 
    },
    { 
      name: "San Francisco, CA", 
      slug: "san-francisco-california", 
      fact: "A globally recognized city shaped by Spanish missions, maritime trade, and cultural diversity." 
    },
    { 
      name: "San Antonio, TX", 
      slug: "san-antonio-texas", 
      fact: "A historic Texas city closely tied to Spanish missions, including the Alamo, and early colonial expansion." 
    },
    { 
      name: "San Bernardino, CA", 
      slug: "san-bernardino-california", 
      fact: "An inland Southern California city named during Spanish exploration and mission development." 
    },
    { 
      name: "San Mateo, CA", 
      slug: "san-mateo-california", 
      fact: "A Bay Area city with origins tied to Spanish land grants and early settlement patterns." 
    },
    { 
      name: "San Marcos, TX", 
      slug: "san-marcos-texas", 
      fact: "A rapidly growing Central Texas city named after the nearby river and Spanish colonial influence." 
    },
    { 
      name: "San Luis Obispo, CA", 
      slug: "san-luis-obispo-california", 
      fact: "A coastal California city founded around a Spanish mission and known for preserved historic character." 
    },
  ];

  return (
    <section className="notable-cities-section py-16">
      <div className="content-container max-w-5xl mx-auto">

        <h2 className="notable-title section-title text-center mb-6">
          Notable U.S. Cities That Begin With "San"
        </h2>

        <p className="notable-intro text-gray-700 text-lg leading-relaxed text-center max-w-3xl mx-auto mb-10">
          While hundreds of places across the United States include the word "San," 
          certain cities stand out due to their size, historical importance, or cultural influence. 
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
          These cities represent only a portion of the many "San" communities found across the 
          country. Each carries a distinct story shaped by Spanish heritage, regional development, and 
          cultural continuity.
        </p>

      </div>
    </section>
  );
}


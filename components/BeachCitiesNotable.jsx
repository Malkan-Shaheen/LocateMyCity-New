"use client";

import Link from "next/link";

export default function BeachCitiesNotable() {
  const featured = [
    { 
      name: "Miami Beach, FL", 
      slug: "miami-beach-florida", 
      fact: "An internationally known resort city famous for its beaches, nightlife, and Art Deco architecture." 
    },
    { 
      name: "Virginia Beach, VA", 
      slug: "virginia-beach-virginia", 
      fact: "A large coastal city known for its long beachfront, tourism economy, and military presence." 
    },
    { 
      name: "Long Beach, CA", 
      slug: "long-beach-california", 
      fact: "A major Southern California city shaped by port activity, tourism, and coastal living." 
    },
    { 
      name: "Palm Beach, FL", 
      slug: "palm-beach-florida", 
      fact: "A historic Florida resort town long associated with luxury tourism and oceanfront estates." 
    },
    { 
      name: "Myrtle Beach, SC", 
      slug: "myrtle-beach-south-carolina", 
      fact: "A popular East Coast vacation destination known for its boardwalk, golf courses, and entertainment." 
    },
    { 
      name: "Hermosa Beach, CA", 
      slug: "hermosa-beach-california", 
      fact: "A Southern California beach city recognized for its pier, surfing culture, and walkable coastline." 
    },
    { 
      name: "Redondo Beach, CA", 
      slug: "redondo-beach-california", 
      fact: "A coastal city with a working harbor, marina, and long-standing beach community." 
    },
    { 
      name: "Daytona Beach, FL", 
      slug: "daytona-beach-florida", 
      fact: "A well-known Florida city famous for its wide beaches, motorsports history, and tourism industry." 
    },
  ];

  return (
    <section className="notable-cities-section py-16">
      <div className="content-container max-w-5xl mx-auto">

        <h2 className="notable-title section-title text-center mb-6">
          Notable U.S. Cities That Begin With "Beach"
        </h2>

        <p className="notable-intro text-gray-700 text-lg leading-relaxed text-center max-w-3xl mx-auto mb-10">
          While hundreds of places across the United States include the word "Beach," 
          certain cities stand out due to their size, popularity, or cultural influence. 
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
          These cities represent only a portion of the many "Beach" communities found across the 
          country. Each carries a distinct story shaped by shoreline geography, tourism, and regional 
          development.
        </p>

      </div>
    </section>
  );
}





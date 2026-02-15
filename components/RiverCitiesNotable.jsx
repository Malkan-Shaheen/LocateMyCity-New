"use client";

import Link from "next/link";

export default function RiverCitiesNotable() {
  const featured = [
    { 
      name: "Riverdale, GA", 
      slug: "riverdale-georgia", 
      fact: "A suburban city near Atlanta whose growth was influenced by nearby waterways and transportation routes." 
    },
    { 
      name: "Riverside, CA", 
      slug: "riverside-california", 
      fact: "A major Southern California city named for its location along the Santa Ana River, with strong agricultural and economic history." 
    },
    { 
      name: "River Falls, WI", 
      slug: "river-falls-wisconsin", 
      fact: "A university town shaped by river-powered industry and early Midwestern settlement." 
    },
    { 
      name: "Riverhead, NY", 
      slug: "riverhead-new-york", 
      fact: "A historic Long Island town located at the headwaters of the Peconic River." 
    },
    { 
      name: "River Rouge, MI", 
      slug: "river-rouge-michigan", 
      fact: "An industrial city tied to river access and manufacturing along the Detroit River system." 
    },
    { 
      name: "River Oaks, TX", 
      slug: "river-oaks-texas", 
      fact: "A Texas community whose name reflects its proximity to local waterways and wooded river areas." 
    },
    { 
      name: "River Forest, IL", 
      slug: "river-forest-illinois", 
      fact: "A Chicago-area village named for the Des Plaines River and surrounding forested land." 
    },
    { 
      name: "River Edge, NJ", 
      slug: "river-edge-new-jersey", 
      fact: "A suburban borough whose name references the Hackensack River and early riverfront settlement." 
    },
  ];

  return (
    <section className="notable-cities-section py-16">
      <div className="content-container max-w-5xl mx-auto">

        <h2 className="notable-title section-title text-center mb-6">
          Notable U.S. Cities That Begin With "River"
        </h2>

        <p className="notable-intro text-gray-700 text-lg leading-relaxed text-center max-w-3xl mx-auto mb-10">
          While hundreds of places across the United States include the word "River," 
          certain cities stand out due to their size, regional importance, or historical role. 
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
          These cities represent only a portion of the many "River" communities found across the 
          country. Each carries a distinct story shaped by waterways, regional geography, and local 
          development.
        </p>

      </div>
    </section>
  );
}





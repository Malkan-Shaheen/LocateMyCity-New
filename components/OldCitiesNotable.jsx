"use client";

import Link from "next/link";

export default function OldCitiesNotable() {
  const featured = [
    { 
      name: "Old Saybrook, CT", 
      slug: "old-saybrook-connecticut", 
      fact: "A coastal New England town with deep colonial roots, known for its maritime history and early settlement significance." 
    },
    { 
      name: "Old Lyme, CT", 
      slug: "old-lyme-connecticut", 
      fact: "Famous for its historic art colony and preserved coastal character along the Connecticut shoreline." 
    },
    { 
      name: "Old Orchard Beach, ME", 
      slug: "old-orchard-beach-maine", 
      fact: "A long-established seaside destination recognized for its historic boardwalk and tourism legacy." 
    },
    { 
      name: "Old Forge, NY", 
      slug: "old-forge-new-york", 
      fact: "A well-known Adirondack community closely tied to outdoor recreation and early regional development." 
    },
    { 
      name: "Old Town, FL", 
      slug: "old-town-florida", 
      fact: "A small Florida town that reflects early settlement patterns in the southeastern United States." 
    },
    { 
      name: "Old Town, ME", 
      slug: "old-town-maine", 
      fact: "A historic riverfront city with roots in logging, industry, and Native American history." 
    },
    { 
      name: "Old Greenwich, CT", 
      slug: "old-greenwich-connecticut", 
      fact: "A coastal neighborhood with preserved historic character and long-standing residential significance." 
    },
    { 
      name: "Old Bridge, NJ", 
      slug: "old-bridge-new-jersey", 
      fact: "A township whose name reflects early transportation routes and colonial-era infrastructure." 
    },
  ];

  return (
    <section className="notable-cities-section py-16">
      <div className="content-container max-w-5xl mx-auto">

        <h2 className="notable-title section-title text-center mb-6">
          Notable U.S. Cities That Begin With "Old"
        </h2>

        <p className="notable-intro text-gray-700 text-lg leading-relaxed text-center max-w-3xl mx-auto mb-10">
          While hundreds of places across the United States include the word "Old," 
          certain cities stand out due to their historical significance, tourism appeal, 
          or regional recognition. Here are some of the most notable examples.
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
          These cities represent only a portion of the many "Old" communities found across the 
          country. Each carries a distinct story shaped by local history, geography, and generational 
          change.
        </p>

      </div>
    </section>
  );
}


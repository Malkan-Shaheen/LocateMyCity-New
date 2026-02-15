"use client";

import Link from "next/link";

export default function FortCitiesNotable() {
  const featured = [
    { 
      name: "Fort Worth, TX", 
      slug: "fort-worth-texas", 
      fact: "A major Texas city that originated as a frontier army post and later grew into a regional economic hub." 
    },
    { 
      name: "Fort Lauderdale, FL", 
      slug: "fort-lauderdale-florida", 
      fact: "A coastal city named after a series of forts built during the Seminole Wars, now known for tourism and waterways." 
    },
    { 
      name: "Fort Collins, CO", 
      slug: "fort-collins-colorado", 
      fact: "A northern Colorado city that developed around a military outpost and later became a center for education and innovation." 
    },
    { 
      name: "Fort Myers, FL", 
      slug: "fort-myers-florida", 
      fact: "A Gulf Coast city named after a military fort established during conflicts in the southeastern United States." 
    },
    { 
      name: "Fort Smith, AR", 
      slug: "fort-smith-arkansas", 
      fact: "A historic city that played a key role as a military and judicial center along the western frontier." 
    },
    { 
      name: "Fort Wayne, IN", 
      slug: "fort-wayne-indiana", 
      fact: "A Midwestern city named after a strategic fort at the convergence of rivers, critical to early transportation and defense." 
    },
    { 
      name: "Fort Pierce, FL", 
      slug: "fort-pierce-florida", 
      fact: "A coastal city whose name traces back to a fort built during the Second Seminole War." 
    },
    { 
      name: "Fort Bragg, CA", 
      slug: "fort-bragg-california", 
      fact: "A Northern California coastal city named after a former military garrison, later shaped by logging and maritime trade." 
    },
  ];

  return (
    <section className="notable-cities-section py-16">
      <div className="content-container max-w-5xl mx-auto">

        <h2 className="notable-title section-title text-center mb-6">
          Notable U.S. Cities That Begin With "Fort"
        </h2>

        <p className="notable-intro text-gray-700 text-lg leading-relaxed text-center max-w-3xl mx-auto mb-10">
          While hundreds of places across the United States include the word "Fort," 
          certain cities stand out due to their size, historical importance, or regional influence. 
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
          These cities represent only a portion of the many "Fort" communities found across the 
          country. Each carries a distinct story shaped by military history, settlement patterns, and 
          regional development.
        </p>

      </div>
    </section>
  );
}





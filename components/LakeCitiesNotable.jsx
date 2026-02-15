"use client";

import Link from "next/link";

export default function LakeCitiesNotable() {
  const featured = [
    { 
      name: "Lakewood, CO", 
      slug: "lakewood-colorado", 
      fact: "A major suburban city west of Denver, named for nearby lakes and early residential development." 
    },
    { 
      name: "Lake Charles, LA", 
      slug: "lake-charles-louisiana", 
      fact: "A prominent Gulf Coast city whose name reflects early settlement near a lake and surrounding waterways." 
    },
    { 
      name: "Lake City, FL", 
      slug: "lake-city-florida", 
      fact: "A historic Florida city named for its proximity to local lakes and inland travel routes." 
    },
    { 
      name: "Lake Forest, CA", 
      slug: "lake-forest-california", 
      fact: "A Southern California city whose name reflects early land use and surrounding natural features." 
    },
    { 
      name: "Lake Geneva, WI", 
      slug: "lake-geneva-wisconsin", 
      fact: "A long-established resort city centered around Geneva Lake, known for tourism and recreation." 
    },
    { 
      name: "Lake Havasu City, AZ", 
      slug: "lake-havasu-city-arizona", 
      fact: "A planned desert city built near Lake Havasu, shaped by recreation and waterfront development." 
    },
    { 
      name: "Lake Oswego, OR", 
      slug: "lake-oswego-oregon", 
      fact: "A suburban city near Portland named after a local lake that influenced early settlement and growth." 
    },
    { 
      name: "Lake Placid, NY", 
      slug: "lake-placid-new-york", 
      fact: "An internationally recognized Adirondack town named for nearby Lake Placid and known for winter sports history." 
    },
  ];

  return (
    <section className="notable-cities-section py-16">
      <div className="content-container max-w-5xl mx-auto">

        <h2 className="notable-title section-title text-center mb-6">
          Notable U.S. Cities That Begin With "Lake"
        </h2>

        <p className="notable-intro text-gray-700 text-lg leading-relaxed text-center max-w-3xl mx-auto mb-10">
          While hundreds of places across the United States include the word "Lake," 
          certain cities stand out due to their size, history, or regional importance. 
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
          These cities represent only a portion of the many "Lake" communities found across the 
          country. Each carries a distinct story shaped by freshwater geography, regional 
          development, and local history.
        </p>

      </div>
    </section>
  );
}





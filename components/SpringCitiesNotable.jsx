"use client";

import Link from "next/link";

export default function SpringCitiesNotable() {
  const featured = [
    { name: "Springfield, IL", slug: "springfield-il", fact: "The capital of Illinois and closely associated with Abraham Lincoln’s political legacy..." },
    { name: "Springfield, MO", slug: "springfield-mo", fact: "A regional hub in southwest Missouri known for its role in Route 66 history..." },
    { name: "Springfield, MA", slug: "springfield-ma", fact: "An important New England city with strong ties to manufacturing and American innovation..." },
    { name: "Springdale, AR", slug: "springdale-ar", fact: "A fast-growing Northwest Arkansas city near the Ozarks, known for its strong local economy..." },
    { name: "Spring Valley, NY", slug: "spring-valley-ny", fact: "A diverse suburban community north of New York City with deep regional connections..." },
    { name: "Spring Hill, TN", slug: "spring-hill-tn", fact: "A rapidly expanding city south of Nashville, shaped by manufacturing and residential growth..." },
    { name: "Springboro, OH", slug: "springboro-oh", fact: "A historic Ohio town with roots dating back to early westward settlement..." },
    { name: "Spring Lake, MI", slug: "spring-lake-mi", fact: "A scenic lakeside community near Lake Michigan known for outdoor recreation..." },
  ];

  return (
    <section className="notable-cities-section py-16">
      <div className="content-container max-w-5xl mx-auto">

        <h2 className="notable-title section-title text-center mb-6">
          Notable U.S. Cities With “Spring” in Their Name
        </h2>

        <p className="notable-intro text-gray-700 text-lg leading-relaxed text-center max-w-3xl mx-auto mb-10">
          Cities and towns containing the word “Spring” are found throughout the United States.
          While many were originally named after natural freshwater springs, others reflect
          historical or geographic naming traditions. Below are some of the most well-known
          examples.
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
          These locations represent only a small sample of the many U.S. communities with
          “Spring” in their name. Each reflects how geography, settlement patterns, and local
          history influenced place naming across the country.
        </p>

      </div>
    </section>
  );
}

"use client";

import Link from "next/link";

export default function NewCitiesNotable() {
  const featured = [
    { name: "New York, NY", slug: "new-york", fact: "The largest city in the United States, known worldwide for its financial district..." },
    { name: "New Orleans, LA", slug: "new-orleans", fact: "A major cultural hub famous for jazz music, Mardi Gras..." },
    { name: "New Haven, CT", slug: "new-haven", fact: "A historic New England city best known as the home of Yale University..." },
    { name: "New Braunfels, TX", slug: "new-braunfels", fact: "A fast-growing city with deep German heritage..." },
    { name: "New Bedford, MA", slug: "new-bedford", fact: "Once known as the ‘Whaling Capital of the World’..." },
    { name: "New Albany, IN", slug: "new-albany", fact: "A historic Ohio River city known for restored steamboat-era architecture..." },
    { name: "New London, CT", slug: "new-london", fact: "A coastal city with a rich naval history..." },
    { name: "New Britain, CT", slug: "new-britain", fact: "Nicknamed ‘The Hardware City,’ with strong industrial heritage..." },
  ];

  return (
    <section className="notable-cities-section py-16">
      <div className="content-container max-w-5xl mx-auto">

        <h2 className="notable-title section-title text-center mb-6">
          Notable U.S. Cities That Begin With “New”
        </h2>

        <p className="notable-intro text-gray-700 text-lg leading-relaxed text-center max-w-3xl mx-auto mb-10">
          While hundreds of places across the United States begin with the word “New,” 
          certain cities stand out due to their cultural influence, historical significance, 
          tourism appeal, or population size. Here are some of the most prominent examples.
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
          These cities represent only a fraction of the many “New” communities across the country. 
          Each carries a unique story shaped by local culture, migration, and American history.
        </p>

      </div>
    </section>
  );
}

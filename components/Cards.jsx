"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

export default function Features() {
  const features = [
    {
      icon: "/Images/cityfav1.png",
      title: "Distance From Me",
      desc: "Calculate the distance from your current location to chosen destination.",
      link: "/location-from-me",
      btn: "Calculate Distance",
    },
    {
      icon: "/Images/map.png",
      title: "Location to Location",
      desc: "Measure the distance between two locations of your choice.",
      link: "/location-from-location",
      btn: "Compare Locations",
    },
    {
      icon: "/Images/spring.png",
      title: "City Themes",
      desc: "Explore cities by theme - Beach, Fort, Lake, New, Old, Port, River, San, Rock, and Spring cities.",
      link: "/citythemes",
      btn: "Explore Themes",
    },
    {
      icon: "/Images/search.png",
      title: "Find Places & Cities",
      desc: "Search for any place, city, town name, or browse through categories.",
      link: "/find-places",
      btn: "Search Now",
    },
  ];
//return statement
  return (
    <>
      <Head>
        <title>LocateMyCity - Features</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <section className="features-wrapper1">
        <h2 className="main-title1">Explore Location Features</h2>

        {features.map((f, i) => (
          <Link href={f.link} key={i} className="feature-card-link">
            <div className="feature-section1 hover-card">
              <div className="feature-left1">
                <div className="feature-icon1">
                  <Image src={f.icon} alt={f.title} width={45} height={45} />
                </div>
                <div className="feature-content1">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </div>
              <div className="feature-btn1">
                {f.btn} <span>→</span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}

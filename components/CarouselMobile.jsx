"use client"; // Add this line at the very top

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";

export default function CarouselMobile() {
  const images = useMemo(() => [
    {
      src: "/get-from-to-images/eleuthera1.webp",
      alt: "Beautiful beach view of Eleuthera with turquoise waters"
    },
    {
      src: "/get-from-to-images/eleuthera2.webp", 
      alt: "Scenic landscape of Eleuthera showing pink sand beaches"
    },
    {
      src: "/get-from-to-images/eleuthera3.webp",
      alt: "Aerial view of Eleuthera's coastline and crystal clear waters"
    }
  ], []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const carouselRef = useRef(null);

  // Memoized navigation handler
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, [images.length]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  // Intersection Observer to pause carousel when not visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, []);

  // Optimized auto-advance with visibility check
  useEffect(() => {
    if (!isVisible) return; // Pause when not visible

    const interval = setInterval(goToNext, 3000);

    return () => clearInterval(interval);
  }, [goToNext, isVisible]);

  // Preload next image for smoother transitions - FIXED
  useEffect(() => {
    const nextIndex = (currentIndex + 1) % images.length;
    
    // Use window.Image to explicitly use the native browser Image constructor
    const img = new window.Image();
    img.src = images[nextIndex].src;
  }, [currentIndex, images]);

  return (
    <div ref={carouselRef} className="carousel-mobile relative w-full max-w-md mx-auto">
      {/* Image with priority for LCP */}
      <div className="relative w-full h-48 md:h-56 rounded-lg shadow-md overflow-hidden">
        <Image
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-opacity duration-500"
          priority={currentIndex === 0}
          loading={currentIndex === 0 ? "eager" : "lazy"}
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R"
        />
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 w-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 ${
              currentIndex === index 
                ? "bg-transparent scale-110" 
                : "bg-transparent bg-opacity-60 hover:bg-opacity-80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={currentIndex === index ? "true" : "false"}
          />
        ))}
      </div>

      {/* Previous/Next Buttons for better UX */}
      <button
        onClick={() => goToSlide((currentIndex - 1 + images.length) % images.length)}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Next slide"
      >
        ›
      </button>
    </div>
  );
}
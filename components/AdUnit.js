"use client";

import { useEffect } from "react";

export default function AdUnit({ slot, className = "" }) {
  useEffect(() => {
    // Defer ad loading until after page is interactive
    const idleCallback = typeof window !== 'undefined' && window.requestIdleCallback 
      ? window.requestIdleCallback 
      : (cb) => setTimeout(cb, 3000);
    
    idleCallback(() => {
      try {
        if (typeof window !== "undefined" && window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e) {
        // silent fail to avoid hydration crashes
      }
    });
  }, []);

  return (
    <div
      className={`ad-slot ${className}`}
      style={{
        margin: "32px 0",
        textAlign: "center",
        minHeight: "100px"
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-4601969084104531"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

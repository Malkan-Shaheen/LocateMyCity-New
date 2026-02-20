import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const baseUrl = "https://locatemycity.com";
const defaultOgImage = `${baseUrl}/images/og-default.jpg`;

export const metadata: Metadata = {
  title: {
    default: "LocateMyCity - Distance Calculator & Location Finder",
    template: "%s | LocateMyCity",
  },
  description:
    "Calculate distances between locations worldwide. Find how far cities, towns, and landmarks are from your current location or any starting point.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "LocateMyCity",
    locale: "en_US",
    url: baseUrl,
    title: "LocateMyCity - Distance Calculator & Location Finder",
    description:
      "Calculate distances between locations worldwide. Find how far cities, towns, and landmarks are from your current location or any starting point.",
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: "LocateMyCity - Distance Calculator & Location Finder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LocateMyCity - Distance Calculator & Location Finder",
    description:
      "Calculate distances between locations worldwide. Find how far cities, towns, and landmarks are from your current location or any starting point.",
    images: [defaultOgImage],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* All third-party scripts loaded via client-side script injection after page load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Load third-party scripts only after page is fully loaded and interactive
              (function() {
                function loadScripts() {
                  // Wait for page to be fully interactive
                  if (document.readyState === 'complete') {
                    setTimeout(loadThirdPartyScripts, 5000); // 5 second delay
                  } else {
                    window.addEventListener('load', function() {
                      setTimeout(loadThirdPartyScripts, 5000);
                    });
                  }
                }
                
                function loadThirdPartyScripts() {
                  // EZOIC PRIVACY / CMP
                  var script1 = document.createElement('script');
                  script1.src = 'https://cmp.gatekeeperconsent.com/min.js';
                  script1.setAttribute('data-cfasync', 'false');
                  document.head.appendChild(script1);
                  
                  var script2 = document.createElement('script');
                  script2.src = 'https://the.gatekeeperconsent.com/cmp.min.js';
                  script2.setAttribute('data-cfasync', 'false');
                  document.head.appendChild(script2);
                  
                  // EZOIC CORE
                  var script3 = document.createElement('script');
                  script3.src = 'https://www.ezojs.com/ezoic/sa.min.js';
                  document.head.appendChild(script3);
                  
                  window.ezstandalone = window.ezstandalone || {};
                  window.ezstandalone.cmd = window.ezstandalone.cmd || [];
                  
                  // GOOGLE ADSENSE
                  var script4 = document.createElement('script');
                  script4.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4601969084104531';
                  script4.async = true;
                  script4.crossOrigin = 'anonymous';
                  document.head.appendChild(script4);
                  
                  // GOOGLE ANALYTICS
                  var script5 = document.createElement('script');
                  script5.src = 'https://www.googletagmanager.com/gtag/js?id=G-MZ2JZL4WKS';
                  document.head.appendChild(script5);
                  
                  script5.onload = function() {
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-MZ2JZL4WKS', { anonymize_ip: true });
                  };
                }
                
                loadScripts();
              })();
            `,
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

"use client";
import { useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DistanceCalculator() {
  const [destinationInput, setDestinationInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const destinationInputRef = useRef(null);
  const router = useRouter();

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsFetching(true);
    try {
      const response = await fetch(
        `/api/suggestions?q=${encodeURIComponent(query)}&limit=10`,
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      
      const data = await response.json();

      const filtered = data.map((item) => {
        let name = item.display_name.split(",")[0];
        if (item.address) {
          name =
            item.address.city ||
            item.address.town ||
            item.address.village ||
            item.address.county ||
            item.address.state ||
            item.address.country ||
            name;
        }

        return {
          ...item,
          short_name: name.length > 30 ? `${name.substring(0, 30)}...` : name,
        };
      });

      setSuggestions(filtered);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setDestinationInput(value);
    setError("");
    fetchSuggestions(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setDestinationInput(suggestion.short_name);
    setError("");
    setShowSuggestions(false);
  };

  const handleCalculate = () => {
    if (!destinationInput.trim()) {
      setError("Please enter a destination first");
      return;
    }

    setError("");
    setIsLoading(true);

    const destinationSlug = destinationInput
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    router.push(`/how-far-is-${destinationSlug}-from-me`);
  };

  return (
    <>
      <Header />
      <Head>
        <title>Distance Calculator | LocateMyCity</title>
        <meta name="robots" content="index, follow" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </Head>

      <main id="main-content" className="main2">
        <div className="card2">
          <div className="card-border-top2" />
          <div className="card-content2">
            <div className="heading2">
              <h1>Distance Calculator</h1>
              <p>
                Find the exact distance between your current location and any
                destination worldwide.
              </p>
            </div>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            <div className="form2">
              <div className="input-group2">
                <label htmlFor="destination">Destination Location</label>
                <div style={{ position: "relative" }}>
                  <input
                    ref={destinationInputRef}
                    type="text"
                    id="destination"
                    className="input2"
                    placeholder="Enter address, city, or landmark"
                    value={destinationInput}
                    onChange={handleInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />

                  {isFetching && (
                    <div
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "0.85rem",
                        color: "#6c757d",
                      }}
                    >
                      Searching...
                    </div>
                  )}

                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="suggestions-list">
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="suggestion-item"
                        >
                          {suggestion.short_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="button-wrapper2">
                <button onClick={handleCalculate}>
                  {isLoading ? (
                    <span>
                      <span className="spinner"></span> Calculating
                    </span>
                  ) : (
                    <>
                      <span>Calculate Distance</span>
                      <i className="fas fa-arrow-right" style={{ marginLeft: "8px" }}></i>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="card-border-bottom2" />
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #fee;
          color: #c33;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #c33;
          animation: fadeIn 0.3s ease-in;
        }

        .error-message i {
          font-size: 18px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

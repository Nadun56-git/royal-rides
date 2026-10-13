"use client";

import React, { useState, useEffect } from "react";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";

interface MediaAbout {
  overview: string;
  conclusion: string;
}

interface MediaContent {
  src: string;
  poster?: string;
  background: string;
  title: string;
  date: string;
  scrollToExpand: string;
  about: MediaAbout;
}

interface MediaContentCollection {
  [key: string]: MediaContent;
}

const sampleMediaContent: MediaContentCollection = {
  sigiriya: {
    src: "/images/sigiriya_hero.jpg",
    poster: "/images/sigiriya_hero.jpg",
    background: "/images/sigiriya_hero.jpg",
    title: "SIGIRIYA CITADEL",
    date: "Ancient Kingdom of Sri Lanka • 5th Century AD",
    scrollToExpand: "↓ Scroll or Swipe to Expand Kingdom",
    about: {
      overview:
        "Sigiriya, known as the Lion Rock, is an ancient monolithic rock palace fortress rising 370m above sea level in Sri Lanka. Surrounded by symmetric water gardens, mirror walls, and legendary frescoes.",
      conclusion:
        "Experience Ceylon in sovereign luxury with Royal Rides private executive fleet and SLTDA-licensed heritage chauffeurs.",
    },
  },
  ella: {
    src: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=1280&q=85",
    poster: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=1280&q=85",
    background: "https://images.unsplash.com/photo-1546708973-b339540b5162?w=1920&q=85",
    title: "ELLA HIGHLANDS",
    date: "Nine Arch Railway Viaduct • Hill Country",
    scrollToExpand: "↓ Scroll or Swipe to Expand Tea Enclave",
    about: {
      overview:
        "Ella is a mountain village nestled in Sri Lanka's tea country at an elevation of 1,041m. Famous for the colonial-era Nine Arch Bridge, misty train rides, and lush emerald valleys.",
      conclusion:
        "Book private panoramic transfers from Colombo to Kandy, Nuwara Eliya, and Ella with Royal Rides chauffeur units.",
    },
  },
  galle: {
    src: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1280&q=85",
    poster: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1280&q=85",
    background: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1920&q=85",
    title: "GALLE BASTIONS",
    date: "UNESCO Dutch Fort • 17th Century Living Citadel",
    scrollToExpand: "↓ Scroll or Swipe to Expand Fortress",
    about: {
      overview:
        "Galle Fort was built by the Portuguese and fortified by the Dutch. Its ramparts and cobblestone alleys overlook the Indian Ocean.",
      conclusion:
        "Discover private coastal transfers and boutique sanctuary reservations with Royal Rides concierge.",
    },
  },
};

const MediaContent = ({ mediaType }: { mediaType: string }) => {
  const currentMedia = sampleMediaContent[mediaType] || sampleMediaContent.sigiriya;

  return (
    <div className="max-w-4xl mx-auto text-center space-y-6">
      <h2 className="text-3xl font-serif font-bold text-navy">
        About {currentMedia.title}
      </h2>
      <p className="text-base sm:text-lg text-content-body max-w-2xl mx-auto leading-relaxed">
        {currentMedia.about.overview}
      </p>
      <p className="text-sm text-gold font-semibold tracking-wide uppercase">
        {currentMedia.about.conclusion}
      </p>
    </div>
  );
};

export default function ScrollExpansionDemo() {
  const [heritageKey, setHeritageKey] = useState<string>("sigiriya");
  const currentMedia = sampleMediaContent[heritageKey] || sampleMediaContent.sigiriya;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [heritageKey]);

  return (
    <div className="min-h-screen bg-pearl">
      {/* Heritage Selector Controls */}
      <div className="fixed top-24 right-4 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-navy-950/80 backdrop-blur-md border border-gold/40 shadow-xl">
        <button
          onClick={() => setHeritageKey("sigiriya")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            heritageKey === "sigiriya"
              ? "bg-gold text-navy shadow-md font-bold"
              : "text-pearl-100 hover:text-white"
          }`}
        >
          Sigiriya
        </button>
        <button
          onClick={() => setHeritageKey("ella")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            heritageKey === "ella"
              ? "bg-gold text-navy shadow-md font-bold"
              : "text-pearl-100 hover:text-white"
          }`}
        >
          Ella
        </button>
        <button
          onClick={() => setHeritageKey("galle")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            heritageKey === "galle"
              ? "bg-gold text-navy shadow-md font-bold"
              : "text-pearl-100 hover:text-white"
          }`}
        >
          Galle Fort
        </button>
      </div>

      <ScrollExpandMedia
        mediaType="image"
        mediaSrc={currentMedia.src}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
      >
        <MediaContent mediaType={heritageKey} />
      </ScrollExpandMedia>
    </div>
  );
}

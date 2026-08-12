"use client";

import React, { useState, useRef } from "react";

interface PortfolioItem {
  id: string;
  category: string;
  badgeCol: string;
  heading: string;
  description: string;
  buttonText: string;
  url: string;
  image: string;
  stats?: string;
}

const portfolioCards: PortfolioItem[] = [
  {
    id: "logo-design",
    category: "Logo Design",
    badgeCol: "text-[#df7626] bg-[#df7626]/10 border-[#df7626]/20",
    heading: "Distinctive Logo Design",
    description:
      "Create a lasting first impression. We design unique, memorable logos that distill your brand's essence and stand out in the crowded marketplace.",
    buttonText: "View Logo Design",
    url: "https://www.behance.net/gallery/247700045/Selflance-Brand-Identity-Logo-Design",
    image: "/profile/Logo Design.png",
    stats: "Vector System • Brand Mark",
  },
  {
    id: "brand-identity",
    category: "Brand Identity",
    badgeCol: "text-[#A855F7] bg-[#A855F7]/10 border-[#A855F7]/20",
    heading: "Complete Brand Identity",
    description:
      "Build a cohesive visual system. We craft comprehensive brand guidelines, including premium color palettes and typography, that resonate with your target audience.",
    buttonText: "See Brand Systems",
    url: "https://www.behance.net/moodboard/223167327/Brand-Identity-Logo-Design",
    image: "/profile/Complete Brand Identity.png",
    stats: "Design Guidelines • Typography",
  },
  {
    id: "mobile-ui",
    category: "Mobile App UI Design",
    badgeCol: "text-[#60A5FA] bg-[#60A5FA]/10 border-[#60A5FA]/20",
    heading: "Mobile App UI/UX",
    description:
      "Deliver intuitive and engaging experiences. We design sleek, modern, and user-centered app interfaces that look beautiful and perform seamlessly.",
    buttonText: "Explore App UI",
    url: "https://www.behance.net/moodboard/223358043/Mobile-App-UI-Design",
    image: "/profile/Mobile App UI Design.png",
    stats: "iOS & Android • High Fidelity",
  },
  {
    id: "web-product",
    category: "Web & Product Design",
    badgeCol: "text-[#34D399] bg-[#34D399]/10 border-[#34D399]/20",
    heading: "Web & Product Design",
    description:
      "Transform complex ideas into high-converting digital products and scalable web applications engineered for measurable growth.",
    buttonText: "View Full Profile",
    url: "https://www.behance.net/selflance",
    image: "/profile/Web & Product Design.png",
    stats: "SaaS Platforms • Conversion UX",
  },
];

export function PortfolioShowcaseSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync scroll position on mobile
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.offsetWidth * 0.85;
    const newIndex = Math.round(scrollLeft / itemWidth);
    if (newIndex >= 0 && newIndex < portfolioCards.length) {
      setActiveIndex(newIndex);
    }
  };

  const scrollToSlide = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const targetCard = container.children[index] as HTMLElement;
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
    setActiveIndex(index);
  };

  const handlePrev = () => {
    const nextIdx = Math.max(0, activeIndex - 1);
    scrollToSlide(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = Math.min(portfolioCards.length - 1, activeIndex + 1);
    scrollToSlide(nextIdx);
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10 overflow-hidden" id="portfolio-showcase">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[540px] h-[320px] sm:h-[540px] bg-[#6366F1]/15 blur-[110px] rounded-full pointer-events-none -z-10"></div>

      <div className="bg-[#0F1629]/90 border border-[#2A3552]/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Header with badge & controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-full px-3 py-1 text-[#818CF8] text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-ping"></span>
              Featured Case Studies &amp; Portfolio
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Crafted for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#df7626]">
                Impact &amp; Scale
              </span>
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm md:text-base mt-2 max-w-xl">
              Explore our comprehensive brand systems, custom digital products, and high-conversion UI/UX engineered for modern brands.
            </p>
          </div>

          {/* Desktop & Mobile Quick Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <a
              href="https://www.behance.net/selflance"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-[#1A233D] hover:bg-[#253256] border border-[#2A3552] rounded-xl px-3 py-2 transition-colors mr-2"
            >
              <svg className="w-3.5 h-3.5 text-[#0057ff]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-4.726 3-3.268 0-5.5-2.264-5.5-5.547 0-3.175 2.148-5.453 5.385-5.453 3.418 0 5.115 2.457 4.796 6H16.5c.075 1.579 1.157 2.41 2.593 2.41 1.094 0 1.942-.486 2.308-1.41h2.325zM16.5 12h4.555c-.092-1.309-.906-2.148-2.222-2.148-1.391 0-2.227.876-2.333 2.148zM8.594 13.602c.983-.45 1.623-1.353 1.623-2.524 0-2.454-1.849-3.078-4.217-3.078H0v12h6.183c2.569 0 4.636-.889 4.636-3.619 0-1.332-.782-2.368-2.225-2.779zM3 10h2.72c1.077 0 1.938.257 1.938 1.408 0 1.055-.861 1.392-1.938 1.392H3V10zm3.036 7.2H3V14.4h3.036c1.231 0 2.215.352 2.215 1.455 0 1.096-.984 1.345-2.215 1.345z" />
              </svg>
              <span>Behance Profile</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Carousel navigation buttons */}
            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              aria-label="Previous slide"
              className="w-8 h-8 rounded-lg bg-[#121A2F] border border-[#2A3552] flex items-center justify-center text-gray-300 hover:text-white hover:border-[#6366F1] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={activeIndex === portfolioCards.length - 1}
              aria-label="Next slide"
              className="w-8 h-8 rounded-lg bg-[#121A2F] border border-[#2A3552] flex items-center justify-center text-gray-300 hover:text-white hover:border-[#6366F1] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* CARDS DISPLAY:
            - Mobile: Slidable touch-friendly carousel (compact height & width)
            - Tablet & Desktop (md+): 2-column luxury grid
        */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-2 gap-3.5 sm:gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-none pb-3 md:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {portfolioCards.map((card) => (
            <div
              key={card.id}
              className="w-[78vw] max-w-[280px] sm:w-[320px] sm:max-w-[340px] md:w-auto md:max-w-none snap-center shrink-0 flex flex-col justify-between bg-[#0B1121]/90 hover:bg-[#121A2F] border border-[#2A3552]/80 hover:border-[#6366F1]/60 rounded-2xl p-3 sm:p-4 md:p-5 transition-all duration-300 group shadow-lg hover:shadow-[0_10px_30px_rgba(99,102,241,0.15)]"
            >
              <div>
                {/* Image Container with compact height (h-36 on mobile, h-44 on tablet, h-52 on desktop) */}
                <div className="relative w-full h-36 sm:h-44 md:h-52 lg:h-56 rounded-xl overflow-hidden bg-[#0A0F1C] border border-[#2A3552]/60 mb-3 sm:mb-4 group-hover:border-[#6366F1]/40 transition-colors">
                  <img
                    src={card.image}
                    alt={card.heading}
                    loading="lazy"
                    className="w-full h-full object-cover object-top sm:object-center transform group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121] via-transparent to-black/20 opacity-60 group-hover:opacity-40 transition-opacity"></div>

                  {/* Top Floating Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className={`inline-flex items-center text-[9px] sm:text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border backdrop-blur-md ${card.badgeCol}`}>
                      {card.category}
                    </span>
                  </div>

                  {/* Top Right Behance Icon Pill */}
                  <a
                    href={card.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 hover:bg-[#0057ff] backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all transform hover:scale-110"
                    aria-label={`Open ${card.heading} on Behance`}
                  >
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  {/* Bottom Stats pill */}
                  {card.stats && (
                    <div className="absolute bottom-1.5 left-2 z-10 text-[8px] sm:text-[9px] text-gray-300 font-medium bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10">
                      {card.stats}
                    </div>
                  )}
                </div>

                {/* Card Title & Content */}
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-[#818CF8] transition-colors leading-snug">
                  {card.heading}
                </h3>
                <p className="text-gray-300/90 text-xs sm:text-[13px] leading-relaxed mt-1.5 line-clamp-2 sm:line-clamp-3">
                  {card.description}
                </p>
              </div>

              {/* Action Button linking to Behance direct URL */}
              <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-[#2A3552]/60">
                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-[#1E293B]/90 hover:bg-[#6366F1] text-white hover:text-white border border-[#334155] hover:border-[#6366F1] font-semibold text-xs sm:text-sm py-2 sm:py-2.5 px-3 rounded-xl transition-all duration-300 shadow-sm group/btn"
                >
                  <span>{card.buttonText}</span>
                  <svg
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 transform group-hover/btn:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Carousel Indicators (dots) */}
        <div className="flex md:hidden justify-center items-center gap-2 mt-4">
          {portfolioCards.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? "w-6 bg-[#6366F1]" : "w-2 bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Footer Sub-Note */}
        <div className="mt-6 sm:mt-8 pt-4 border-t border-[#2A3552]/60 flex flex-col sm:flex-row items-center justify-between text-gray-400 text-[11px] sm:text-xs gap-2 text-center sm:text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-green-400 font-bold">✔</span>
            <span>100% Bespoke Systems • No generic templates or shortcuts</span>
          </div>
          <a
            href="https://www.behance.net/selflance"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#60A5FA] hover:text-[#93C5FD] font-semibold underline underline-offset-4 flex items-center gap-1"
          >
            <span>Explore all case studies on Behance</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";

interface MeemstonexHeaderProps {
  onBookClick: () => void;
}

export function MeemstonexHeader({ onBookClick }: MeemstonexHeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-40 bg-transparent md:sticky md:top-0 md:bg-[#FAF7F0]/95 md:backdrop-blur-md transition-all duration-300 w-full max-w-full overflow-hidden">
      {/* Top Announcement Ribbon */}
      <div className="bg-[#0B0A08]/90 text-[#F3EAC9] py-1.5 px-3 text-center text-[10px] sm:text-xs font-medium tracking-wide border-b border-[#B8860B]/20 flex justify-center items-center gap-1.5 sm:gap-2 w-full max-w-full overflow-hidden min-w-0">
        <span className="inline-block w-2 h-2 rounded-full bg-[#CCA338] animate-ping shrink-0" />
        <span className="truncate min-w-0 flex-1 sm:flex-initial">
          Select Custom Mandir Projects Across India & Global Locations
        </span>
        <span className="hidden md:inline text-[#CCA338] font-bold shrink-0">
          • Starting from ₹1 Lakh
        </span>
      </div>

      {/* Main Header Bar */}
      <div className="bg-transparent md:bg-[#FAF7F0]/95 border-b border-white/10 md:border-[#B8860B]/20 transition-all duration-300 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between gap-2 min-w-0">
          {/* Brand Logo & Sanskrit Mantra */}
          <a href="#" className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-1 sm:flex-initial">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border-2 border-[#B8860B]/40 p-0.5 bg-[#12110E]/60 md:bg-[#FAF7F0] flex items-center justify-center shadow-md group-hover:border-[#B8860B] transition-colors shrink-0">
              {/* Brand Lotus Logo */}
              <svg viewBox="0 0 200 200" className="w-full h-full text-[#B8860B] fill-current">
                <circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
                <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M100 35 C115 65 140 85 155 110 C140 125 115 130 100 128 C85 130 60 125 45 110 C60 85 85 65 100 35 Z" fill="none" stroke="currentColor" strokeWidth="3" />
                <path d="M100 50 C110 75 125 90 135 115 C115 122 100 122 100 122 C100 122 85 122 65 115 C75 90 90 75 100 50 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M100 128 L100 138 M95 138 L105 138" stroke="currentColor" strokeWidth="2" />
                <circle cx="100" cy="62" r="5" fill="currentColor" />
                <path d="M100 78 C96 82 92 88 92 95 C92 102 108 102 108 95 C108 88 104 82 100 78 Z" fill="currentColor" />
                <path d="M85 90 Q100 85 115 90 M82 95 Q100 90 118 95 M84 100 Q100 95 116 100" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0 justify-center">
              <span className="font-serif text-base sm:text-2xl font-black tracking-wider sm:tracking-widest text-[#FFFEFA] md:text-[#0B0A08] leading-none truncate">
                MEEMSTONEX
              </span>
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.14em] sm:tracking-[0.18em] text-[#E5C365] md:text-[#8B5E05] mt-1 truncate">
                Sacred Marble Architecture
              </span>
            </div>
          </a>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-6 shrink-0">
            <a href="#process" className="text-sm font-semibold text-[#1E1C17] hover:text-[#996C05] transition-colors">
              Our Process
            </a>
            <a href="#gallery" className="text-sm font-semibold text-[#1E1C17] hover:text-[#996C05] transition-colors">
              Projects
            </a>
            <a href="#faq" className="text-sm font-semibold text-[#1E1C17] hover:text-[#996C05] transition-colors">
              FAQs
            </a>

            <button
              onClick={onBookClick}
              className="gold-btn-luxury shimmer-btn text-[#1A1207] px-6 py-2.5 rounded-full font-extrabold text-sm shadow-[0_6px_25px_rgba(200,153,39,0.45)] hover:shadow-[0_8px_30px_rgba(200,153,39,0.65)] transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <span>Discuss My Project</span>
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>

          {/* Mobile Quick Header Button */}
          <div className="flex md:hidden items-center shrink-0">
            <button
              onClick={onBookClick}
              className="gold-btn-luxury text-[#1A1207] text-[11px] px-3.5 py-1.5 rounded-full font-black shadow-[0_4px_15px_rgba(200,153,39,0.4)] flex items-center gap-1 shrink-0 whitespace-nowrap cursor-pointer"
            >
              <span>Discuss</span>
              <i className="fa-solid fa-chevron-right text-[10px] shrink-0"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

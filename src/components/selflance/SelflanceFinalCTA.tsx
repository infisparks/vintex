"use client";

import React from "react";

interface SelflanceFinalCTAProps {
  isUS?: boolean;
  onBookClick: () => void;
}

export function SelflanceFinalCTA({ isUS = false, onBookClick }: SelflanceFinalCTAProps) {
  return (
    <>
      {/* FINAL CTA BANNER */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10 text-center overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] bg-[#df7626]/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <div className="bg-gradient-to-br from-[#141A2E] via-[#0F1629] to-[#1A1228] border border-[#6366F1]/40 rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-[0_20px_60px_rgba(99,102,241,0.25)] relative overflow-hidden">
          {/* Top badge */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 bg-[#6366F1]/10 border border-[#6366F1]/30 rounded-full px-4 py-1.5 text-[#818CF8] text-[10px] sm:text-xs font-extrabold uppercase tracking-widest shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-ping"></span>
              1-on-1 Strategy Session
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 max-w-3xl mx-auto tracking-tight">
            Ready To Build Technology That <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#df7626] via-amber-300 to-yellow-400 drop-shadow">
              {isUS ? "Moves Your Business Forward?" : "Actually Grows Your Business?"}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-gray-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed mb-8 font-medium">
            {isUS
              ? "Book your Business Technology Strategy Session and discover how the right digital systems can support your next stage of growth."
              : "Book Your Business Technology Strategy Session Today. Let's understand your business... Identify growth opportunities... Aur milkar ek scalable technology roadmap banayein."}
          </p>

          {/* Custom Executive CTA Button */}
          <div className="flex flex-col items-center gap-3.5 mb-6">
            <button
              onClick={onBookClick}
              className="group relative w-full max-w-[94%] sm:max-w-lg mx-auto bg-gradient-to-r from-[#df7626] via-[#ea580c] to-[#d97706] hover:from-[#ea580c] hover:to-[#df7626] text-white py-4 sm:py-4.5 rounded-2xl font-extrabold text-sm sm:text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_10px_35px_-5px_rgba(223,118,38,0.5)] hover:shadow-[0_15px_40px_-5px_rgba(223,118,38,0.7)] border-t border-white/30 border-b-4 border-[#9a3412] active:border-b-0 active:translate-y-1 overflow-hidden px-5 cursor-pointer"
            >
              {/* Shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.4s_infinite]"></div>

              {/* Icon */}
              <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>

              <span className="relative z-10 tracking-wide">Book My Strategy Session</span>

              {/* Arrow icon */}
              <svg className="w-5 h-5 text-white/90 transform group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </button>

            {/* Live Availability Indicator */}
            <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Slots Open For This Week &bull; No Obligation</span>
            </div>
          </div>

          {/* Scarcity / Guarantee Pill */}
          <div className="inline-flex items-center justify-center gap-2 text-[10px] sm:text-xs text-amber-300 font-semibold tracking-wide bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/30 shadow-sm max-w-full">
            <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
            </svg>
            <span className="truncate">Limited consultation slots available every week.</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-gray-800/80 bg-[#070B16] py-10 px-4 sm:px-6 relative z-10 text-center sm:text-left overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center mb-2 justify-center sm:justify-start">
              <img
                src="/Selflance Logo.png"
                alt="Selflance Logo"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
              />
            </div>
            <p className="text-[#818CF8] text-xs sm:text-sm font-semibold max-w-md">
              We Engineer Technology That Helps Businesses Scale Faster.
            </p>
            <p className="text-gray-500 text-[11px] mt-1">
              India&apos;s Premier Business Technology Partner.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/919100000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366]/10 px-4 py-2 rounded-full border border-[#25D366]/30 text-[#25D366] text-xs font-bold hover:bg-[#25D366]/20 transition-colors"
            >
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>

        <div className="max-w-5xl mx-auto border-t border-gray-800/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-gray-500 text-[11px] gap-2">
          <span>&copy; {new Date().getFullYear()} Selflance. All rights reserved.</span>
          <span>Technology &bull; Automation &bull; Digital Transformation</span>
        </div>
      </footer>
    </>
  );
}

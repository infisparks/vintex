"use client";

import React from "react";

interface SituationCheckSectionProps {
  isUS?: boolean;
}

export function SituationCheckSection({ isUS = false }: SituationCheckSectionProps) {
  const itemsIN = [
    "Business grow kar raha hai, lekin Technology peeche chhoot rahi hai",
    "Old website ya software slow aur outdated ho gaya hai",
    "Mobile App launch karne ka plan hai",
    "Custom Internal Software (CRM/ERP) ki zaroorat hai",
    "Operations manual hone ki wajah se team efficiency kam ho rahi hai",
    "Multi-location/branch management complex hota ja raha hai",
    "Scattered software tools ke darmiyan coordination break ho rahi hai",
    "Reliability aur long-term technology partner dhoondh rahe hain",
  ];

  const itemsUS = [
    "Business is scaling rapidly, but technology can't keep up",
    "Existing website or portal is outdated & sluggish",
    "Mobile App development is in active planning",
    "Custom internal software (CRM/ERP) is urgently required",
    "Manual operations need end-to-end automation",
    "Managing multiple branches or locations is becoming complex",
    "Disconnected software platforms need seamless API integration",
    "Looking to switch to a reliable, long-term tech partner",
  ];

  const items = isUS ? itemsUS : itemsIN;

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-amber-900/15 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="bg-[#0F1629]/90 border border-[#2A3552]/80 rounded-2xl sm:rounded-3xl p-5 sm:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Top badge */}
        <div className="flex justify-center sm:justify-start mb-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            Self Assessment
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white text-center sm:text-left leading-snug sm:leading-tight mb-6">
          {isUS ? (
            <>
              Is Your Business Facing Any Of These{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300">
                Growth Challenges?
              </span>
            </>
          ) : (
            <>
              Kya Aapka Business Inme Se Kisi Situation Se{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300">
                Guzar Raha Hai?
              </span>
            </>
          )}
        </h2>

        {/* Checklist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {items.map((text, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-[#131C35] border border-[#2A3552] rounded-xl p-3.5 hover:border-amber-500/50 transition-all duration-300 shadow-md group"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">
                ✓
              </div>
              <span className="text-gray-200 text-xs sm:text-sm font-medium leading-snug">
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* Callout */}
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-transparent border-l-4 border-amber-400 rounded-r-xl p-4 sm:p-6 text-center sm:text-left">
          <div className="text-amber-400 text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-1">
            If your answer is YES...
          </div>
          <p className="text-white text-sm sm:text-lg font-extrabold leading-snug">
            Yeh strategy session{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              specifically aapke business ke liye hai.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

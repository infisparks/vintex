"use client";

import React from "react";

interface GrowthBottleneckSectionProps {
  isUS?: boolean;
}

export function GrowthBottleneckSection({ isUS = false }: GrowthBottleneckSectionProps) {
  const problemsIN = [
    "Operations manual hain.",
    "Multiple software use ho rahe hain.",
    "Website sirf brochure banke reh gayi hai.",
    "Mobile app customers use hi nahi karte.",
    "Teams Excel aur WhatsApp pe business chala rahi hain.",
  ];

  const problemsUS = [
    "Operations remain manual and inefficient.",
    "Multiple disconnected software systems creating silos.",
    "Website acts as an online brochure with no lead conversion.",
    "Mobile apps fail to retain or engage customers.",
    "Teams rely on complex spreadsheets and scattered messaging tools.",
  ];

  const problems = isUS ? problemsUS : problemsIN;

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] bg-red-600/15 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      <div className="bg-gradient-to-b from-[#141A2D] via-[#0F1629] to-[#0A0E1A] border border-[#2A3552] rounded-2xl sm:rounded-3xl p-5 sm:p-10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Top badge */}
        <div className="flex justify-center sm:justify-start mb-4">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-3.5 py-1 text-red-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            The Real Bottleneck
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-base sm:text-3xl md:text-4xl font-extrabold text-white text-center sm:text-left leading-snug sm:leading-tight mb-2.5">
          {isUS ? (
            <>
              <span>Most Software Projects Don&apos;t Fail Because of Code.</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-400 drop-shadow">
                They Fail Because Nobody Understood the Business.
              </span>
            </>
          ) : (
            <>
              <span>Aaj Ka Biggest Business Problem Website Ya App Nahi Hai...</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-400 drop-shadow">
                It&apos;s Growth.
              </span>
            </>
          )}
        </h2>

        {/* Intro text */}
        <p className="text-gray-300 text-[11px] sm:text-base leading-normal sm:leading-relaxed text-center sm:text-left mb-6 max-w-3xl font-medium">
          {isUS ? (
            <>
              The biggest mistake businesses make isn&apos;t hiring the wrong developer. It&apos;s hiring someone who starts writing code before understanding your business model, customers, operations, expansion plans, and revenue goals.{" "}
              <span className="text-red-400 font-bold underline decoration-red-500/50">
                Technology should support the business—not the other way around.
              </span>
            </>
          ) : (
            <>
              Bahut si companies lakhon rupaye marketing mein invest karti hain. Leads bhi aate hain. Team bhi badi hoti hai.{" "}
              <span className="text-red-400 font-bold underline decoration-red-500/50">Lekin...</span>
            </>
          )}
        </p>

        {/* Problem points list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 mb-7 sm:mb-9">
          {problems.map((text, idx) => (
            <div
              key={idx}
              className={`group flex items-center gap-3.5 bg-gradient-to-r from-[#1A1224] to-[#111827] border border-red-500/20 hover:border-red-500/70 rounded-2xl p-4 transition-all duration-300 shadow-md hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] ${
                idx === 4 ? "md:col-span-2" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-400 font-extrabold text-sm shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.3)] group-hover:scale-110 transition-transform">
                ✕
              </div>
              <span className="text-white text-xs sm:text-sm font-semibold tracking-wide">
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* Result Highlight Callout */}
        <div className="relative bg-gradient-to-r from-red-950/40 via-orange-950/20 to-[#0F1629] border-l-4 border-red-500 rounded-r-2xl p-5 sm:p-7 shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 text-red-400 text-xs sm:text-sm font-extrabold uppercase tracking-widest mb-1.5">
            <span className="text-base">⚠️</span>
            <span>Result?</span>
          </div>
          <p className="text-white text-base sm:text-xl font-extrabold leading-snug tracking-tight">
            Business grow karta hai...{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-300">
              System nahi.
            </span>
          </p>
          <p className="text-gray-300 text-xs sm:text-base font-medium mt-1.5 leading-relaxed">
            Aur jab systems scale nahi karte...{" "}
            <span className="text-red-400 font-extrabold underline decoration-red-500/40">
              Business ruk jaata hai.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

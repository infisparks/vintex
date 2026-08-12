"use client";

import React from "react";

interface WhyChooseUsSectionProps {
  isUS?: boolean;
}

export function WhyChooseUsSection({ isUS = false }: WhyChooseUsSectionProps) {
  const questions = [
    "Where is your business today?",
    "Where do you want to be in the next 3–5 years?",
    "What systems & bottlenecks are slowing you down?",
    "Which technology investments will yield the highest ROI?",
  ];

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-900/15 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="bg-[#0F1629]/90 border border-[#2A3552]/80 rounded-2xl sm:rounded-3xl p-5 sm:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Top badge */}
        <div className="flex justify-center sm:justify-start mb-4">
          <div className="inline-flex items-center gap-2 bg-[#A855F7]/10 border border-[#A855F7]/20 rounded-full px-3 py-1 text-[#D8B4FE] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#A855F7] animate-ping"></span>
            Why Selflance
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-4xl md:text-4xl font-extrabold text-white text-center sm:text-left leading-snug sm:leading-tight mb-3">
          Why Businesses{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#df7626]">
            Choose Selflance
          </span>
        </h2>

        {/* Subtitle statement */}
        <p className="text-[#A5B4FC] text-xs sm:text-sm font-extrabold uppercase tracking-wider text-center sm:text-left mb-2">
          THEY DON&apos;T CHOOSE US BECAUSE WE WRITE CODE. THEY CHOOSE US BECAUSE WE ASK BETTER QUESTIONS.
        </p>

        <p className="text-gray-300 text-xs sm:text-base font-medium text-center sm:text-left mb-6">
          Before recommending any solution, we analyze:
        </p>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
          {questions.map((q, idx) => (
            <div
              key={idx}
              className="bg-[#131C35] border border-[#2A3552] rounded-xl p-4 flex items-center gap-3.5 hover:border-[#A855F7]/60 transition-all duration-300 shadow-md group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#A855F7]/15 border border-[#A855F7]/30 flex items-center justify-center text-[#D8B4FE] font-extrabold text-sm shrink-0 group-hover:scale-110 transition-transform">
                ?
              </div>
              <span className="text-gray-200 text-xs sm:text-sm font-semibold leading-snug">
                {q}
              </span>
            </div>
          ))}
        </div>

        {/* Box */}
        <div className="bg-gradient-to-r from-[#6366F1]/15 via-[#A855F7]/15 to-transparent border-l-4 border-[#A855F7] rounded-r-xl p-4 sm:p-6 text-center sm:text-left">
          <p className="text-gray-300 text-xs sm:text-sm font-medium mb-1">
            ...And only then do we architect your technology.
          </p>
          <p className="text-white text-sm sm:text-lg font-extrabold leading-snug">
            Technology is only valuable when it{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A855F7]">
              drives real business growth.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

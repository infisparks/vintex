"use client";

import React from "react";

interface BeforeYouBookSectionProps {
  isUS?: boolean;
}

export function BeforeYouBookSection({ isUS = false }: BeforeYouBookSectionProps) {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-red-900/15 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="bg-[#0F1629]/90 border border-[#df7626]/40 rounded-2xl sm:rounded-3xl p-5 sm:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Top badge */}
        <div className="flex justify-center sm:justify-start mb-4">
          <div className="inline-flex items-center gap-2 bg-[#df7626]/10 border border-[#df7626]/20 rounded-full px-3 py-1 text-[#df7626] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#df7626] animate-pulse"></span>
            Important Notice
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-4xl md:text-4xl font-extrabold text-white text-center sm:text-left leading-snug sm:leading-tight mb-4">
          Before You <span className="text-[#df7626]">Book...</span>
        </h2>

        {/* Paragraphs */}
        <div className="space-y-4 text-xs sm:text-base text-gray-300 font-medium leading-relaxed mb-6">
          {isUS ? (
            <>
              <p>
                <strong className="text-white">Please note:</strong> To respect everyone&apos;s time, we accept only a limited number of new projects each month.
              </p>
              <p>
                This strategy session is intended for businesses that are planning meaningful technology investments and are looking for a long-term partner.
              </p>
              <p>
                <span className="text-gray-300 font-semibold">
                  If your primary goal is simply to find the lowest-cost developer, Selflance may not be the right fit.
                </span>
              </p>
            </>
          ) : (
            <>
              <p>
                <strong className="text-white">Please note:</strong> Hum limited projects hi accept karte hain. Har enquiry project nahi banti.
              </p>
              <p>
                Hum sirf un businesses ke saath kaam karte hain...{" "}
                <span className="text-white font-semibold">
                  Jo technology ko long-term investment ki tarah dekhte hain.
                </span>
              </p>
            </>
          )}
        </div>

        {/* Box */}
        <div className="bg-gradient-to-r from-[#df7626]/15 via-amber-500/15 to-transparent border-l-4 border-[#df7626] rounded-r-xl p-4 sm:p-6 text-center sm:text-left">
          <p className="text-white text-sm sm:text-lg font-extrabold leading-snug">
            {isUS ? (
              <>
                If you value quality, scalability, and a true technology partner...{" "}
                <br className="hidden sm:block" />
                <span className="text-[#df7626]">We look forward to speaking with you.</span>
              </>
            ) : (
              <>
                Agar aap quality, scalability aur long-term partnership chahte hain...{" "}
                <br className="hidden sm:block" />
                <span className="text-[#df7626]">To hum aapse baat karna pasand karenge.</span>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

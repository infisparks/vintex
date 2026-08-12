"use client";

import React from "react";

interface GrowthPartnerSectionProps {
  isUS?: boolean;
}

export function GrowthPartnerSection({ isUS = false }: GrowthPartnerSectionProps) {
  const stepsIN = [
    { num: "Step 01", title: "Business Samajhte Hain", sub: "Goals & Vision", border: "hover:border-[#6366F1]", textCol: "text-[#A5B4FC]" },
    { num: "Step 02", title: "Process Mapping", sub: "Operations Flow", border: "hover:border-[#A855F7]", textCol: "text-[#D8B4FE]" },
    { num: "Step 03", title: "Bottlenecks Identify", sub: "Leakage Points", border: "hover:border-[#df7626]", textCol: "text-[#FDBA74]" },
    { num: "Step 04", title: "Automation System", sub: "Smart Workflows", border: "hover:border-blue-400", textCol: "text-[#93C5FD]" },
    { num: "Step 05", title: "Build Solution", sub: "Custom Technology", border: "hover:border-green-400", textCol: "text-[#86EFAC]" },
  ];

  const stepsUS = [
    { num: "Layer 1", title: "Business Strategy", sub: "Revenue Model First", border: "hover:border-[#6366F1]", textCol: "text-[#A5B4FC]" },
    { num: "Layer 2", title: "Customer Experience", sub: "Trust & Conversions", border: "hover:border-[#A855F7]", textCol: "text-[#D8B4FE]" },
    { num: "Layer 3", title: "Tech Architecture", sub: "Secure & Scalable", border: "hover:border-[#df7626]", textCol: "text-[#FDBA74]" },
    { num: "Layer 4", title: "Automation Systems", sub: "Frictionless Workflows", border: "hover:border-blue-400", textCol: "text-[#93C5FD]" },
    { num: "Layer 5", title: "Growth & Scale", sub: "Long-Term Expansion", border: "hover:border-green-400", textCol: "text-[#86EFAC]" },
  ];

  const steps = isUS ? stepsUS : stepsIN;

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10 overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-900/15 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="bg-[#0F1629]/90 border border-[#2A3552]/80 rounded-2xl sm:rounded-3xl p-5 sm:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Top badge */}
        <div className="flex justify-center sm:justify-start mb-4">
          <div className="inline-flex items-center gap-2 bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-full px-3 py-1 text-[#818cf8] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-ping"></span>
            Our Philosophy
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white text-center sm:text-left leading-snug sm:leading-tight mb-3">
          {isUS ? (
            <>
              We Didn&apos;t Start Selflance To Be Another Agency.
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#df7626]">
                We Are Your Technology Growth Partner.
              </span>
            </>
          ) : (
            <>
              Isi Liye Hum Development Company Nahi...
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] via-[#A855F7] to-[#df7626]">
                Technology Growth Partner Hain.
              </span>
            </>
          )}
        </h2>

        {/* Subtext */}
        <p className="text-gray-300 text-xs sm:text-base leading-relaxed text-center sm:text-left mb-8 max-w-3xl">
          {isUS
            ? "We started Selflance because we saw businesses investing thousands into websites and apps that never delivered real ROI. Beautiful design, modern tech, but zero growth. That's why every project starts with business strategy—not development:"
            : "Humara kaam sirf coding karna nahi hai. Solution build karne se pehle hum structured strategy follow karte hain:"}
        </p>

        {/* 5-Step Process Timeline Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden bg-[#131C35] border border-[#2A3552] rounded-xl p-4 min-h-[105px] sm:min-h-[110px] flex flex-col justify-between ${step.border} transition-all duration-300 group shadow-lg ${
                idx === 4 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="relative z-10">
                <div className={`text-[11px] font-extrabold ${step.textCol} tracking-widest uppercase mb-1 drop-shadow`}>
                  {step.num}
                </div>
                <h3 className={`text-sm sm:text-base font-extrabold text-white group-${step.textCol} transition-colors leading-snug drop-shadow-md`}>
                  {step.title}
                </h3>
              </div>
              <div className="relative z-10 text-[11px] text-gray-200 font-semibold drop-shadow mt-2">
                {step.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Investment Highlight Box */}
        <div className="bg-gradient-to-r from-[#6366F1]/15 via-[#A855F7]/15 to-transparent border-l-4 border-[#6366F1] rounded-r-xl p-4 sm:p-6">
          <p className="text-white text-sm sm:text-lg font-extrabold leading-snug">
            Isliye hum har project ko{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              business investment
            </span>{" "}
            ki tarah treat karte hain...{" "}
            <span className="text-gray-400 line-through">Expense ki tarah nahi.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

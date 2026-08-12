"use client";

import React from "react";

interface DeliverablesSectionProps {
  isUS?: boolean;
}

export function DeliverablesSection({ isUS = false }: DeliverablesSectionProps) {
  const deliverables = [
    "Current Technology Gaps Evaluation",
    "High-Impact Growth Opportunities",
    "Operational Bottleneck Identification",
    "End-to-End Automation Feasibility",
    "Custom Website or App Tech Roadmap",
    "Recommended Enterprise Tech Stack",
    "Project Scope & Feasibility Analysis",
    "Estimated Investment Range & Timeline",
    "Phased Implementation Strategy",
  ];

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-900/15 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="bg-[#0F1629]/90 border border-[#2A3552]/80 rounded-2xl sm:rounded-3xl p-5 sm:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Top badge */}
        <div className="flex justify-center sm:justify-start mb-4">
          <div className="inline-flex items-center gap-2 bg-[#60A5FA]/10 border border-[#60A5FA]/20 rounded-full px-3 py-1 text-[#60A5FA] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-ping"></span>
            Value &amp; Outcomes
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-4xl md:text-4xl font-extrabold text-white text-center sm:text-left leading-snug sm:leading-tight mb-8">
          What You Get In Your Business Technology{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] via-[#6366F1] to-[#A855F7]">
            Strategy Session
          </span>
        </h2>

        {/* Deliverables Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 mb-8">
          {deliverables.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#131C35] border border-[#2A3552] rounded-xl p-4 flex items-center gap-3.5 hover:border-[#60A5FA]/60 transition-all duration-300 shadow-md group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#60A5FA]/15 border border-[#60A5FA]/30 flex items-center justify-center text-[#60A5FA] font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">
                {idx + 1}
              </div>
              <span className="text-gray-200 text-xs sm:text-sm font-semibold leading-snug">
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Callout Box */}
        <div className="bg-gradient-to-r from-[#df7626]/15 via-amber-500/15 to-transparent border-l-4 border-[#df7626] rounded-r-xl p-4 sm:p-6 text-center sm:text-left">
          <p className="text-white text-sm sm:text-lg font-extrabold leading-snug">
            <span className="text-gray-300">This is not a sales call.</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#df7626] to-yellow-400">
              This is a 1-on-1 strategic business consultation.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

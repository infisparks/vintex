"use client";

import React from "react";

export function ProofSystemSection() {
  const pillars = [
    {
      step: "01",
      icon: "fa-certificate",
      title: "100% Certified Pure Natural Stone",
      subtitle: "Raw Quarried Marble Only",
      desc: "Zero synthetic resin or artificial powder substitutes. We source pure Makrana, Vietnam Onyx, and Sandstone directly from certified quarries.",
    },
    {
      step: "02",
      icon: "fa-compass-drafting",
      title: "3D Layout & Sample Approval Guarantee",
      subtitle: "Zero Risk Before Production",
      desc: "Every detail—stone shade, vein pattern, inlay contrast, and carving depth—is approved by you in 3D & physical sample before a single chisel touches stone.",
    },
    {
      step: "03",
      icon: "fa-hands-holding-circle",
      title: "3rd Generation Master Artisans",
      subtitle: "Heritage Hand Carving",
      desc: "Carved by craftsmen whose families have sculpted sacred architecture for over 28 years across 100+ cities in India and globally.",
    },
    {
      step: "04",
      icon: "fa-shield-halved",
      title: "Turnkey Installation & Lifetime Guarantee",
      subtitle: "White-Glove Pan-India Assembly",
      desc: "Our dedicated installation team dry-fits, transports, and completes site assembly with structural warranties for complete peace of mind.",
    },
  ];

  return (
    <section className="py-14 sm:py-24 bg-[#12110E] text-[#FFFEFA] border-t border-[#B8860B]/30 relative w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-[#CCA338] text-xs font-bold uppercase tracking-widest block mb-1.5">
            ✦ Unmatched Trust &amp; Quality System
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#FFFEFA] leading-tight">
            Why High-Value Buyers &amp; Architects Trust Meemstonex
          </h2>
          <p className="text-[#CEBEA3] text-xs sm:text-base mt-3 font-medium">
            When investing ₹1 Lakh to ₹5 Lakh+ in a permanent asset, you deserve absolute certainty at every stage.
          </p>
        </div>

        {/* 4 Proof Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.step}
              className="bg-[#181612] p-6 rounded-3xl border border-[#B8860B]/25 hover:border-[#D4AF37]/60 transition-all flex flex-col justify-between group shadow-lg"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl gold-gradient-bg text-[#1A1207] flex items-center justify-center text-lg font-bold shadow-md">
                    <i className={`fa-solid ${pillar.icon}`}></i>
                  </div>
                  <span className="font-serif font-black text-2xl text-[#CCA338]/40 group-hover:text-[#CCA338] transition-colors">
                    {pillar.step}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black text-[#CCA338] tracking-wider block">
                    {pillar.subtitle}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#FFFEFA] leading-tight">
                    {pillar.title}
                  </h3>
                </div>

                <p className="text-xs text-[#CEBEA3] leading-relaxed font-medium">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#B8860B]/15 flex items-center gap-1.5 text-[11px] font-extrabold text-[#F0DB8A]">
                <i className="fa-solid fa-circle-check text-xs text-[#CCA338]"></i>
                <span>Guaranteed Standard</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

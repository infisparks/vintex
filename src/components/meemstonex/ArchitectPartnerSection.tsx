"use client";

import React from "react";

interface ArchitectPartnerSectionProps {
  onBookClick: () => void;
}

export function ArchitectPartnerSection({ onBookClick }: ArchitectPartnerSectionProps) {
  return (
    <section className="py-14 sm:py-24 bg-[#0B0A08] text-[#FFFEFA] border-t border-[#B8860B]/30 relative w-full max-w-full overflow-hidden">
      {/* Glow Ambient Accent */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-[#B8860B]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading & Value Proposition */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E1C17] border border-[#B8860B]/40 text-[#D8BC5F] text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#D8BC5F] animate-ping" />
              <span>Architects &amp; Interior Designers</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#FFFEFA] leading-tight">
              Your Architectural Vision Shouldn’t Be Compromised by the Stone Vendor.
            </h2>

            <p className="text-xs sm:text-base text-[#E5DAC6] font-medium leading-relaxed">
              Complex marble detailing, inlay patterns, carved wall panels, water features, and custom stone elements require an execution partner who reads blueprints—not just a marble seller.
            </p>

            {/* Key Advantages for Designers */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-[#171511] border border-[#B8860B]/20">
                <div className="w-8 h-8 rounded-lg gold-gradient-bg text-[#FFFEFA] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  <i className="fa-solid fa-[#1A1207] fa-ruler-combined"></i>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#F0DB8A]">Exact CAD &amp; 3D Blueprint Execution</h4>
                  <p className="text-xs text-[#CEBEA3]">
                    We translate your exact architectural drawings into millimeter-accurate stone carving and inlay.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-[#171511] border border-[#B8860B]/20">
                <div className="w-8 h-8 rounded-lg gold-gradient-bg text-[#FFFEFA] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  <i className="fa-solid fa-[#1A1207] fa-gem"></i>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#F0DB8A]">Direct Quarry Stone Sourcing</h4>
                  <p className="text-xs text-[#CEBEA3]">
                    Pure Makrana, Vietnam Onyx, Sandstone, and semi-precious lapis/mother-of-pearl inlays.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-[#171511] border border-[#B8860B]/20">
                <div className="w-8 h-8 rounded-lg gold-gradient-bg text-[#FFFEFA] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  <i className="fa-solid fa-[#1A1207] fa-truck-ramp-box"></i>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#F0DB8A]">Turnkey Pan-India &amp; Global Site Assembly</h4>
                  <p className="text-xs text-[#CEBEA3]">
                    Our master masons manage transport, dry-fitting, and full on-site installation with zero hassle for your team.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={onBookClick}
                className="gold-btn-luxury shimmer-btn text-[#1A1207] px-6 py-3.5 rounded-full font-extrabold text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2.5 shadow-[0_6px_25px_rgba(200,153,39,0.45)] hover:scale-105 transition-transform cursor-pointer"
              >
                <span>Partner On Architect Project →</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Showcase Box for Architects */}
          <div className="lg:col-span-6">
            <div className="glass-card-dark p-6 sm:p-8 rounded-3xl border border-[#B8860B]/35 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-[#B8860B]/20 mb-6">
                <div>
                  <span className="text-[10px] text-[#CCA338] uppercase font-bold tracking-widest block">Design Partner Program</span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#FFFEFA]">What We Build for Architects</h3>
                </div>
                <span className="text-xs text-[#F0DB8A] font-extrabold bg-[#1E1C17] px-3 py-1 rounded-full border border-[#B8860B]/30">
                  ₹1L – ₹25L+ Scope
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                <div className="p-3.5 rounded-xl bg-[#171511] border border-[#B8860B]/20 flex items-center gap-2 text-[#E5DAC6]">
                  <i className="fa-solid fa-check text-[#CCA338]"></i>
                  <span>Bespoke Home Mandirs</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#171511] border border-[#B8860B]/20 flex items-center gap-2 text-[#E5DAC6]">
                  <i className="fa-solid fa-check text-[#CCA338]"></i>
                  <span>Backlit Onyx Panels</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#171511] border border-[#B8860B]/20 flex items-center gap-2 text-[#E5DAC6]">
                  <i className="fa-solid fa-check text-[#CCA338]"></i>
                  <span>Intricate Pietra Dura Inlay</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#171511] border border-[#B8860B]/20 flex items-center gap-2 text-[#E5DAC6]">
                  <i className="fa-solid fa-check text-[#CCA338]"></i>
                  <span>Luxury Water Fountains</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#171511] border border-[#B8860B]/20 flex items-center gap-2 text-[#E5DAC6]">
                  <i className="fa-solid fa-check text-[#CCA338]"></i>
                  <span>Carved CNC Wall Cladding</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#171511] border border-[#B8860B]/20 flex items-center gap-2 text-[#E5DAC6]">
                  <i className="fa-solid fa-check text-[#CCA338]"></i>
                  <span>Custom Monolith Basins</span>
                </div>
              </div>

              {/* Architect Quote Box */}
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#1E1C17] to-[#14120F] border border-[#B8860B]/30 flex items-start gap-3">
                <i className="fa-solid fa-quote-left text-2xl text-[#CCA338] shrink-0 mt-1"></i>
                <p className="text-xs text-[#E5DAC6] italic font-medium leading-relaxed">
                  "Working with Meemstonex saved our project 4 weeks of back-and-forth. Their team reviewed our CAD drawings, suggested structural adjustments for stone weight, and delivered flawless carving."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";

interface SacredArchitectureSectionProps {
  onBookClick: () => void;
}

export function SacredArchitectureSection({ onBookClick }: SacredArchitectureSectionProps) {
  return (
    <section className="py-14 sm:py-24 bg-[#FAF7F0] border-t border-[#B8860B]/20 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-[#996C05] text-xs font-bold uppercase tracking-widest block mb-1.5">
            ✦ Sacred &amp; Institutional Projects
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B0A08] leading-tight">
            Sacred Architecture Deserves Craftsmanship Worthy of the Space.
          </h2>
          <p className="text-[#2C2922] text-xs sm:text-base mt-3 font-medium">
            From grand temple pavilions &amp; Jain shrines to mosque mimbars, mehrabs &amp; institutional marble monuments — built with sacred geometry and generational stone mastery.
          </p>
        </div>

        {/* 3 Sacred Project Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Pillar 1: Grand Temples & Shrines */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#B8860B]/25 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:border-[#B8860B]/60 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl gold-gradient-bg text-[#FFFEFA] flex items-center justify-center text-xl font-bold shadow-md">
                <i className="fa-solid fa-gopuram text-[#1A1207]"></i>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0B0A08]">
                Home &amp; Community Temples
              </h3>
              <p className="text-xs sm:text-sm text-[#423E34] leading-relaxed font-medium">
                Complete white marble mandirs, domes (Shikhar), carved pillars, garbhagriha altars, and deity thrones carved to exact Vastu &amp; shastra proportions.
              </p>
            </div>

            <div className="pt-6 border-t border-[#B8860B]/15 mt-6">
              <span className="text-[11px] font-extrabold text-[#996C05] uppercase tracking-wider block">
                Scope: ₹1L – ₹15L+
              </span>
            </div>
          </div>

          {/* Pillar 2: Mosques, Mimbars & Mehrabs */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#B8860B]/25 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:border-[#B8860B]/60 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl gold-gradient-bg text-[#FFFEFA] flex items-center justify-center text-xl font-bold shadow-md">
                <i className="fa-solid fa-[#1A1207] fa-mosque"></i>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0B0A08]">
                Mosques, Mimbars &amp; Mehrabs
              </h3>
              <p className="text-xs sm:text-sm text-[#423E34] leading-relaxed font-medium">
                Intricately carved marble mimbars, mehrab archways, calligraphic wall panels, and jaali work crafted specifically for Islamic sacred spaces.
              </p>
            </div>

            <div className="pt-6 border-t border-[#B8860B]/15 mt-6">
              <span className="text-[11px] font-extrabold text-[#996C05] uppercase tracking-wider block">
                Scope: ₹1.5L – ₹10L+
              </span>
            </div>
          </div>

          {/* Pillar 3: Fountains & Architectural Monuments */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#B8860B]/25 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:border-[#B8860B]/60 transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl gold-gradient-bg text-[#FFFEFA] flex items-center justify-center text-xl font-bold shadow-md">
                <i className="fa-solid fa-[#1A1207] fa-[#1A1207] fa-water"></i>
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0B0A08]">
                Fountains &amp; Monumental Cladding
              </h3>
              <p className="text-xs sm:text-sm text-[#423E34] leading-relaxed font-medium">
                Multi-tiered marble fountains, stone jharokhas, carved entryways, and custom inlaid courtyards for heritage resorts, trusts &amp; luxury estates.
              </p>
            </div>

            <div className="pt-6 border-t border-[#B8860B]/15 mt-6">
              <span className="text-[11px] font-extrabold text-[#996C05] uppercase tracking-wider block">
                Scope: ₹2L – ₹20L+
              </span>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-[#0B0A08] text-[#FFFEFA] border border-[#B8860B]/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-serif font-bold text-lg sm:text-xl text-[#F0DB8A]">
              Planning a Sacred or Institutional Project?
            </h4>
            <p className="text-xs sm:text-sm text-[#E5DAC6] font-medium">
              Share your location, dimensions, and reference design. Our senior stone experts will evaluate feasibility &amp; scope.
            </p>
          </div>
          <button
            onClick={onBookClick}
            className="gold-btn-luxury shimmer-btn text-[#1A1207] px-6 py-3.5 rounded-full font-extrabold text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2 shadow-[0_6px_25px_rgba(200,153,39,0.45)] hover:scale-105 transition-transform cursor-pointer shrink-0"
          >
            <span>Discuss Sacred Project →</span>
          </button>
        </div>
      </div>
    </section>
  );
}

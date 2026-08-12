"use client";

import React from "react";

export function ProcessSection() {
  return (
    <section id="process" className="py-14 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <span className="text-[#996C05] text-xs font-bold uppercase tracking-widest block mb-1.5">
          Sales Execution Mechanism
        </span>
        <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B0A08]">
          From Your Vision to a Finished Marble Masterpiece
        </h2>
        <p className="text-[#2C2922] text-xs sm:text-base mt-2 font-medium">
          Our structured 5-step journey ensures zero errors, complete transparency, and flawless delivery.
        </p>
      </div>

      {/* 5 Steps Vertical Cards */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* STEP 01 */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-[#B8860B]/20 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all hover:border-[#B8860B]/50 flex items-start gap-4 sm:gap-6 group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl gold-gradient-bg text-[#FFFEFA] flex items-center justify-center font-serif text-xl sm:text-2xl font-black shrink-0 shadow-[0_0_25px_rgba(184,134,11,0.25)] group-hover:scale-105 transition-transform">
            01
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0B0A08]">Understand</h3>
              <span className="text-[10px] sm:text-xs font-bold text-[#7A5200] bg-[#F3EAC9] px-2.5 py-0.5 rounded-full">Step 1</span>
            </div>
            <p className="text-xs sm:text-base text-[#2C2922] font-semibold leading-relaxed">
              We study your space, requirements, photos and design references in exact detail.
            </p>
          </div>
        </div>

        {/* STEP 02 */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-[#B8860B]/20 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all hover:border-[#B8860B]/50 flex items-start gap-4 sm:gap-6 group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl gold-gradient-bg text-[#FFFEFA] flex items-center justify-center font-serif text-xl sm:text-2xl font-black shrink-0 shadow-[0_0_25px_rgba(184,134,11,0.25)] group-hover:scale-105 transition-transform">
            02
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0B0A08]">Explore</h3>
              <span className="text-[10px] sm:text-xs font-bold text-[#7A5200] bg-[#F3EAC9] px-2.5 py-0.5 rounded-full">Step 2</span>
            </div>
            <p className="text-xs sm:text-base text-[#2C2922] font-semibold leading-relaxed">
              Choose from existing designs or create a fully customised concept tailored to your interior layout.
            </p>
          </div>
        </div>

        {/* STEP 03 */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-[#B8860B]/20 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all hover:border-[#B8860B]/50 flex items-start gap-4 sm:gap-6 group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl gold-gradient-bg text-[#FFFEFA] flex items-center justify-center font-serif text-xl sm:text-2xl font-black shrink-0 shadow-[0_0_25px_rgba(184,134,11,0.25)] group-hover:scale-105 transition-transform">
            03
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0B0A08]">Refine</h3>
              <span className="text-[10px] sm:text-xs font-bold text-[#7A5200] bg-[#F3EAC9] px-2.5 py-0.5 rounded-full">Step 3</span>
            </div>
            <p className="text-xs sm:text-base text-[#2C2922] font-semibold leading-relaxed">
              Dimensions, details, finishes and craftsmanship are finalised together before any stone cutting starts.
            </p>
          </div>
        </div>

        {/* STEP 04 */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-[#B8860B]/20 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all hover:border-[#B8860B]/50 flex items-start gap-4 sm:gap-6 group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl gold-gradient-bg text-[#FFFEFA] flex items-center justify-center font-serif text-xl sm:text-2xl font-black shrink-0 shadow-[0_0_25px_rgba(184,134,11,0.25)] group-hover:scale-105 transition-transform">
            04
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0B0A08]">Approve</h3>
              <span className="text-[10px] sm:text-xs font-bold text-[#7A5200] bg-[#F3EAC9] px-2.5 py-0.5 rounded-full">Step 4</span>
            </div>
            <p className="text-xs sm:text-base text-[#2C2922] font-semibold leading-relaxed">
              You review and approve everything (3D layouts &amp; marble samples) before production begins.
            </p>
          </div>
        </div>

        {/* STEP 05 */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-[#B8860B]/20 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-all hover:border-[#B8860B]/50 flex items-start gap-4 sm:gap-6 group">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl gold-gradient-bg text-[#FFFEFA] flex items-center justify-center font-serif text-xl sm:text-2xl font-black shrink-0 shadow-[0_0_25px_rgba(184,134,11,0.25)] group-hover:scale-105 transition-transform">
            05
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0B0A08]">Craft &amp; Install</h3>
              <span className="text-[10px] sm:text-xs font-bold text-[#7A5200] bg-[#F3EAC9] px-2.5 py-0.5 rounded-full">Final Step</span>
            </div>
            <p className="text-xs sm:text-base text-[#2C2922] font-semibold leading-relaxed">
              Artisans handcraft the piece. We deliver and install it at your location smoothly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

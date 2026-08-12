"use client";

import React from "react";

interface ProblemSectionProps {
  onBookClick: () => void;
}

export function ProblemSection({ onBookClick }: ProblemSectionProps) {
  return (
    <section className="py-12 sm:py-20 bg-[#FAF7F0] border-y border-[#B8860B]/20 relative w-full max-w-full overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-[#996C05] text-xs font-bold uppercase tracking-widest block mb-1.5">
            The Customization Dilemma
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#0B0A08] leading-tight">
            Your Dream Mandir Shouldn’t Look Like Everyone Else’s.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Vision Box */}
          <div className="md:col-span-5 glass-card p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#B8860B]/25 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0B0A08] mb-4 flex items-center gap-2">
                <i className="fa-solid fa-eye text-[#996C05]"></i>
                <span>You already have a vision:</span>
              </h3>
              <ul className="space-y-3 text-xs sm:text-base text-[#1E1C17] font-semibold">
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#B8860B] mt-1.5 shrink-0" />
                  <span>A specific room or wall in your home</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#B8860B] mt-1.5 shrink-0" />
                  <span>Preferred marble variety, vein or shade</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#B8860B] mt-1.5 shrink-0" />
                  <span>A specific reference design or deity tradition</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#B8860B] mt-1.5 shrink-0" />
                  <span>Exact size, Vastu compliance, and height</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[#B8860B]/20">
              <p className="text-xs sm:text-sm font-bold text-[#5C3C00] bg-[#FAF6E9]/80 p-3 rounded-xl border border-[#E6D494]">
                ❌ Buying a ready-made piece rarely matches that vision.
              </p>
            </div>
          </div>

          {/* Right Execution Gap Box */}
          <div className="md:col-span-7 bg-[#0B0A08] text-[#FFFEFA] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#B8860B]/35 shadow-2xl flex flex-col justify-between relative overflow-hidden max-w-full">
            <div className="absolute right-0 bottom-0 w-40 h-40 bg-[#B8860B]/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#D8BC5F] mb-2">
                Turning your idea into a finished marble structure needs:
              </h3>
              <p className="text-xs sm:text-sm text-[#E5DAC6] mb-5 font-medium">
                Design + stone selection + precision craftsmanship + finishing + proper installation.
              </p>

              {/* Component Formula Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 text-center text-[11px] sm:text-xs font-bold mb-6 max-w-full">
                <div className="p-2 rounded-lg bg-[#1E1C17] border border-[#B8860B]/20 text-[#E6D494] truncate">Design</div>
                <div className="p-2 rounded-lg bg-[#1E1C17] border border-[#B8860B]/20 text-[#E6D494] truncate">Stone Selection</div>
                <div className="p-2 rounded-lg bg-[#1E1C17] border border-[#B8860B]/20 text-[#E6D494] truncate">Precision Craft</div>
                <div className="p-2 rounded-lg bg-[#1E1C17] border border-[#B8860B]/20 text-[#E6D494] truncate">Hand Finishing</div>
                <div className="p-2 rounded-lg bg-[#1E1C17] border border-[#B8860B]/20 text-[#E6D494] col-span-2 sm:col-span-1 truncate">Site Installation</div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#3D2700]/60 to-[#1E1C17] border border-[#B8860B]/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="block text-[10px] uppercase text-[#CCA338] font-bold tracking-wider">The Meemstonex Rule</span>
                  <span className="text-base sm:text-lg font-serif font-bold text-[#FFFEFA]">
                    Most vendors sell products.<br />
                    <span className="gold-gradient-text">We execute projects.</span>
                  </span>
                </div>
                <button
                  onClick={onBookClick}
                  className="gold-gradient-bg text-[#FFFEFA] text-xs px-4 py-2.5 rounded-full font-bold shadow-[0_0_25px_rgba(184,134,11,0.25)] shrink-0 hover:scale-105 transition-transform cursor-pointer"
                >
                  Start Your Project →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

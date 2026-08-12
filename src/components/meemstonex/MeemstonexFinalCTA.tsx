"use client";

import React from "react";

interface MeemstonexFinalCTAProps {
  onBookClick: () => void;
}

export function MeemstonexFinalCTA({ onBookClick }: MeemstonexFinalCTAProps) {
  return (
    <>
      <section className="py-14 sm:py-24 bg-[#0B0A08] text-[#FFFEFA] relative overflow-hidden border-t border-[#B8860B]/30 w-full max-w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-5">
          <div className="w-14 h-14 rounded-full gold-gradient-bg text-[#FFFEFA] flex items-center justify-center mx-auto shadow-[0_12px_35px_-10px_rgba(184,134,11,0.45)]">
            <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#FFFEFA] leading-tight">
            Ready to turn your vision into stone?
          </h2>

          <p className="text-[#E5DAC6] text-xs sm:text-base max-w-xl mx-auto font-medium">
            Share your project details. We’ll review scope, design possibilities and next steps — no pressure, no generic sales call.
          </p>

          <div className="pt-3 flex flex-col items-center gap-2.5">
            <button
              onClick={onBookClick}
              className="w-full sm:w-auto gold-gradient-bg shimmer-btn text-[#FFFEFA] px-8 py-4 rounded-full font-extrabold text-base sm:text-lg shadow-[0_12px_35px_-10px_rgba(184,134,11,0.45)] hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Discuss My Mandir Project →</span>
            </button>

            <span className="text-xs text-[#E5C365] font-bold">
              Starting from ₹1 Lakh projects. We focus on serious custom work.
            </span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0B0A08] text-[#CEBEA3] py-8 border-t border-[#B8860B]/10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#CCA338] text-base">MEEMSTONEX</span>
            <span className="text-[#CEBEA3] text-[11px]">| Turnkey Custom Marble Architecture</span>
          </div>
          <div className="text-[11px] text-[#CEBEA3]">
            © 2026 Meemstonex. All rights reserved. Built for 3rd Generation Stone Craftsmanship.
          </div>
        </div>
      </footer>
    </>
  );
}

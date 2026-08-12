"use client";

import React from "react";

export function DifferentiationSection() {
  return (
    <section className="py-12 sm:py-20 bg-[#FAF7F0] border-t border-[#B8860B]/20 w-full max-w-full overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[#996C05] text-xs font-bold uppercase tracking-widest block mb-1.5">
            Uncompromising Quality
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#0B0A08]">
            Not Another Marble Supplier
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Conventional Vendors */}
          <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#F3EDE0]/80 border border-[#12110E]/10 space-y-3">
            <div className="inline-block px-3 py-1 rounded-md bg-red-100 text-red-700 text-xs font-bold uppercase">
              Most Marble Vendors
            </div>
            <p className="text-xs text-[#423E34] font-semibold">
              Most companies sell slabs or ready-made pieces.
            </p>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#2C2922] font-semibold">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✕</span>
                <span>Push ready-made catalog items that don't fit your space</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✕</span>
                <span>No responsibility for site measurements or assembly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✕</span>
                <span>High risk of breakage or stone mismatch during installation</span>
              </li>
            </ul>
          </div>

          {/* Meemstonex Partnership */}
          <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#0B0A08] text-[#FFFEFA] border-2 border-[#B8860B]/40 shadow-xl space-y-3 relative">
            <div className="inline-block px-3 py-1 rounded-md gold-gradient-bg text-[#FFFEFA] text-xs font-bold uppercase">
              Meemstonex Partnership
            </div>
            <p className="text-xs text-[#D8BC5F] font-bold">We partner with you on the full journey:</p>
            <p className="text-xs sm:text-sm font-serif font-bold text-[#E6D494]">
              Vision → Design → Craft → Approval → Installation
            </p>
            <p className="text-xs sm:text-sm text-[#FAF7F0] font-semibold">
              You get a permanent, one-of-a-kind sacred or luxury asset — not a catalogue item.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

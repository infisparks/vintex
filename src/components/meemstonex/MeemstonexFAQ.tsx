"use client";

import React, { useState } from "react";

export function MeemstonexFAQ() {
  const [openId, setOpenId] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const faqs = [
    {
      id: 1,
      q: "What if I spend ₹2–5 lakh and the final product doesn't match my expectations?",
      a: "Zero risk. Production only begins after you review and approve 3D CAD models, exact dimensions, carving depth, and physical marble stone samples. Nothing is carved until you give 100% sign-off.",
    },
    {
      id: 2,
      q: "Can you work directly from my Architect's or Interior Designer's CAD blueprints?",
      a: "Yes! We specialize in executing architect-provided drawings to exact millimeter precision. We handle stone feasibility, weight distribution, structural joins, and dry-fit assembly.",
    },
    {
      id: 3,
      q: "What is your minimum project scope?",
      a: "We focus exclusively on custom, high-consideration stone projects starting from ₹1 Lakh up to ₹25 Lakh+. We do not sell generic mass-produced factory items.",
    },
    {
      id: 4,
      q: "Do you handle turnkey delivery and installation across India & global sites?",
      a: "Yes. Our master masons deliver and assemble turnkey marble structures in 100+ cities across India as well as international destinations with white-glove site safety.",
    },
    {
      id: 5,
      q: "Do you build sacred institutional projects like Mosques, Mimbars, and Jain Shrines?",
      a: "Yes. Our 3rd generation craftsmen have extensive expertise in sacred geometry, traditional shastra temple mandirs, mosque mimbars, mehrab archways, and complex Pietra Dura inlay.",
    },
    {
      id: 6,
      q: "How long does a custom marble mandir or stone project take to complete?",
      a: "Most custom projects take between 3 to 6 weeks from final design approval to complete site installation, depending on carving complexity.",
    },
  ];

  return (
    <section id="faq" className="py-14 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      <div className="text-center mb-10">
        <span className="text-[#996C05] text-xs font-bold uppercase tracking-widest block mb-1.5">
          ✦ Direct &amp; Transparent Answers
        </span>
        <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#0B0A08]">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="glass-card rounded-2xl border border-[#B8860B]/20 overflow-hidden">
              <button
                className="w-full p-4 sm:p-5 text-left font-serif font-bold text-sm sm:text-base text-[#0B0A08] flex justify-between items-center gap-3 cursor-pointer"
                onClick={() => toggleFaq(faq.id)}
              >
                <span>{faq.q}</span>
                <i
                  className={`fa-solid fa-chevron-down text-xs text-[#996C05] transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 sm:px-5 pb-4 text-xs sm:text-sm text-[#2C2922] leading-relaxed border-t border-[#B8860B]/10 pt-2.5 font-medium">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";

interface DesignItem {
  id: number;
  title: string;
  imageWebp: string;
  imagePng: string;
  description: string;
  tags: string[];
  badge: string;
  tag: string;
}

interface FeaturedDesignsSectionProps {
  onBookClick: () => void;
}

export function FeaturedDesignsSection({ onBookClick }: FeaturedDesignsSectionProps) {
  const [selectedDesign, setSelectedDesign] = useState<DesignItem | null>(null);

  const designs: DesignItem[] = [
    {
      id: 1,
      title: "Makrana Floral Carved Altar Mandir",
      imageWebp: "/meemstonex/designs/makrana-floral-carved-altar-mandir.webp",
      imagePng: "/meemstonex/designs/makrana-floral-carved-altar-mandir.png",
      description:
        "Hand-carved virgin white Makrana marble altar cabinet featuring an intricate circular lotus medallion back wall, floral relief doors, and warm spotlighting.",
      tags: ["Pure Makrana White", "Hand-Carved Relief", "Storage Cabinet"],
      badge: "Popular Classic",
      tag: "Virgin Makrana",
    },
    {
      id: 2,
      title: "Grand Kalpavriksha Archway Mandir",
      imageWebp: "/meemstonex/designs/grand-kalpavriksha-archway-mandir.webp",
      imagePng: "/meemstonex/designs/grand-kalpavriksha-archway-mandir.png",
      description:
        "Majestic carved marble archway shrine with a detailed Kalpavriksha (Tree of Life) stone relief, perimeter LED backlighting, and ornate elephant pillars.",
      tags: ["Kalpavriksha Relief", "Perimeter LED Glow", "Pillar Archway"],
      badge: "Architect’s Choice",
      tag: "LED Backlit",
    },
    {
      id: 3,
      title: "Radha Krishna Sacred Temple Pavilion",
      imageWebp: "/meemstonex/designs/radha-krishna-sacred-pavilion-mandir.webp",
      imagePng: "/meemstonex/designs/radha-krishna-sacred-pavilion-mandir.png",
      description:
        "Grand multi-dome (Shikhar) sacred temple shrine pavilion with hand-carved deity sanctum, intricate marble inlay floor, and brass hanging lamps.",
      tags: ["Triple Shikhar Domes", "Marble Inlay Floor", "Deity Sanctum"],
      badge: "Grand Bespoke",
      tag: "Shikhar Dome",
    },
    {
      id: 4,
      title: "Modern Backlit Stone Inlay Om Mandir",
      imageWebp: "/meemstonex/designs/modern-backlit-inlay-om-mandir.webp",
      imagePng: "/meemstonex/designs/modern-backlit-inlay-om-mandir.png",
      description:
        "Contemporary luxury pooja shrine with semi-precious stone inlay floral archway, illuminated golden Om emblem, and backlit star Jali pillar panels.",
      tags: ["Semiprecious Inlay", "Backlit Golden Om", "Star Jali Pillars"],
      badge: "Modern Luxury",
      tag: "Stone Inlay",
    },
  ];

  return (
    <>
      <section className="py-10 sm:py-16 bg-[#0B0A08] text-[#FFFEFA] relative overflow-hidden dark-marble-pattern border-b border-[#B8860B]/30 w-full max-w-full">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl h-80 bg-[#B8860B]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          {/* Section Title */}
          <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1E1C17] border border-[#B8860B]/30 text-[#D8BC5F] text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest">
              <i className="fa-solid fa-gem text-[#CCA338]"></i>
              <span>Signature Bespoke Masterpieces</span>
            </div>
            <h2 className="font-serif text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#FFFEFA]">
              Exquisite Custom Marble Mandir Designs
            </h2>
            <p className="text-[#E5DAC6] text-[11px] sm:text-sm max-w-2xl mx-auto font-medium leading-tight">
              Handcrafted in Makrana &amp; Vietnam Marble — tap any image to preview in full screen.
            </p>
          </div>

          {/* 2-Column Grid on Mobile, 4-Column Grid on Desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
            {designs.map((design) => (
              <div
                key={design.id}
                className="glass-card-dark rounded-xl sm:rounded-2xl border border-[#B8860B]/30 overflow-hidden shadow-xl flex flex-col justify-between group hover:border-[#B8860B]/70 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {/* Full-width image container with tap to preview */}
                <div
                  className="relative h-44 sm:h-56 md:h-64 w-full bg-[#12110E] overflow-hidden cursor-pointer group/img"
                  onClick={() => setSelectedDesign(design)}
                  title="Click to view full image preview"
                >
                  <img
                    src={design.imageWebp}
                    alt={design.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = design.imagePng;
                    }}
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08] via-transparent to-transparent opacity-60 pointer-events-none" />

                  {/* Badge Top Left */}
                  <span className="absolute top-2 left-2 bg-[#0B0A08]/85 text-[#D8BC5F] text-[8px] sm:text-[9px] font-extrabold px-2 py-0.5 rounded border border-[#B8860B]/30 backdrop-blur-md">
                    {design.badge}
                  </span>

                  {/* Zoom Hint Top Right */}
                  <span className="absolute top-2 right-2 bg-[#0B0A08]/80 text-[#FFFEFA] hover:text-[#D8BC5F] text-[9px] font-bold p-1 sm:px-2 sm:py-0.5 rounded-full border border-[#B8860B]/40 flex items-center gap-1 backdrop-blur-md">
                    <i className="fa-solid fa-expand text-[9px]"></i>
                    <span className="hidden sm:inline">Preview</span>
                  </span>

                  {/* Material Tag Bottom Right */}
                  <span className="absolute bottom-2 right-2 bg-[#1E1C17]/90 text-[#E6D494] border border-[#B8860B]/30 text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded shadow">
                    ✨ {design.tag}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-xs sm:text-base text-[#FFFEFA] leading-tight group-hover:text-[#D8BC5F] transition-colors line-clamp-1">
                      {design.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[#CEBEA3] leading-tight line-clamp-2">
                      {design.description}
                    </p>
                  </div>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {design.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[8px] sm:text-[9px] font-semibold text-[#E6D494] bg-[#1E1C17] border border-[#B8860B]/20 px-1.5 py-0.5 rounded"
                      >
                        • {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action CTA Button */}
                  <div className="pt-1.5 border-t border-[#B8860B]/20">
                    <button
                      onClick={onBookClick}
                      className="w-full gold-gradient-bg shimmer-btn text-[#FFFEFA] py-1.5 sm:py-2 px-2 rounded-md sm:rounded-lg font-bold text-[10px] sm:text-xs shadow-[0_0_15px_rgba(184,134,11,0.2)] hover:brightness-110 flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Request Details</span>
                      <i className="fa-solid fa-arrow-right text-[8px] sm:text-[9px]"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Micro Trust Banner Under Grid */}
          <div className="mt-5 sm:mt-8 pt-3 border-t border-[#B8860B]/20 text-center flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] text-[#E5DAC6]">
            <span className="flex items-center gap-1 font-semibold">
              <i className="fa-solid fa-compass-drafting text-[#CCA338]"></i>
              Custom dimensions &amp; Vastu positioning
            </span>
            <span className="hidden sm:inline text-[#B8860B]">•</span>
            <span className="flex items-center gap-1 font-semibold">
              <i className="fa-solid fa-truck-fast text-[#CCA338]"></i>
              Pan-India &amp; Global Zero-Breakage Delivery
            </span>
          </div>
        </div>
      </section>

      {/* FULL IMAGE LIGHTBOX PREVIEW MODAL */}
      {selectedDesign && (
        <div className="fixed inset-0 z-50 bg-[#0B0A08]/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#12110E] border border-[#B8860B]/50 rounded-2xl sm:rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[92vh] my-auto">
            {/* Modal Header */}
            <div className="p-3 sm:p-4 border-b border-[#B8860B]/20 flex items-center justify-between bg-[#0B0A08]">
              <div className="flex items-center space-x-2">
                <span className="bg-[#B8860B]/20 border border-[#B8860B]/40 text-[#D8BC5F] text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {selectedDesign.badge}
                </span>
                <h3 className="font-serif text-xs sm:text-base font-bold text-[#FFFEFA] truncate max-w-[200px] sm:max-w-md">
                  {selectedDesign.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDesign(null)}
                className="w-8 h-8 rounded-full bg-[#1E1C17] text-[#CEBEA3] hover:text-[#FFFEFA] hover:bg-[#2C2922] flex items-center justify-center text-sm transition-colors cursor-pointer border border-[#B8860B]/30"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Uncropped Full Image Display */}
            <div className="p-3 sm:p-5 bg-[#0B0A08] flex items-center justify-center overflow-auto max-h-[60vh]">
              <img
                src={selectedDesign.imageWebp}
                alt={selectedDesign.title}
                className="max-h-[55vh] w-auto max-w-full object-contain rounded-xl border border-[#B8860B]/30 shadow-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = selectedDesign.imagePng;
                }}
              />
            </div>

            {/* Modal Footer & Details */}
            <div className="p-4 sm:p-5 border-t border-[#B8860B]/20 space-y-3 bg-[#12110E]">
              <p className="text-xs sm:text-sm text-[#E5DAC6] leading-relaxed">
                {selectedDesign.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {selectedDesign.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold text-[#E6D494] bg-[#1E1C17] border border-[#B8860B]/30 px-2 py-0.5 rounded-md"
                  >
                    • {tag}
                  </span>
                ))}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedDesign(null);
                    onBookClick();
                  }}
                  className="w-full sm:flex-1 gold-gradient-bg shimmer-btn text-[#FFFEFA] py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Request 3D Layout &amp; Custom Quote</span>
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </button>
                <button
                  onClick={() => setSelectedDesign(null)}
                  className="w-full sm:w-auto bg-[#1E1C17] hover:bg-[#2C2922] text-[#CEBEA3] font-bold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer border border-[#B8860B]/20"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import React from "react";

interface CraftsmanshipSectionProps {
  onBookClick?: () => void;
}

export function CraftsmanshipSection({ onBookClick }: CraftsmanshipSectionProps) {
  const projects = [
    {
      id: "white-makrana",
      title: "White Makrana Home Mandir",
      location: "📍 Delhi NCR",
      tag: "Pure White Marble Altar",
      image: "/meemstonex/Proven_Craftsmanship/1.webp",
      description:
        "Hand-carved white marble structure with intricate lotus pillars, backlit floral inlay backdrop, and soft ambient illumination.",
    },
    {
      id: "vietnam-onyx",
      title: "Vietnam Onyx Pooja Wall Panel",
      location: "📍 Mumbai & North India",
      tag: "Backlit Translucent Stone",
      image: "/meemstonex/Proven_Craftsmanship/2.webp",
      description:
        "Backlit translucent stone wall panels with champagne gold lotus inlay & brass trims for luxury duplexes.",
    },
    {
      id: "grand-pavilion",
      title: "Grand Marble Temple Pavilion",
      location: "📍 Hyderabad, TS",
      tag: "Multi-Pillar Architecture",
      image: "/meemstonex/Proven_Craftsmanship/3.webp",
      description:
        "Multi-pillar sacred shrine with carved dome (Shikhar), brass kalash, and mirror-finish marble floor detailing.",
    },
  ];

  return (
    <section id="gallery" className="py-14 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-full overflow-hidden">
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <span className="text-[#996C05] text-xs font-bold uppercase tracking-widest block mb-1.5">
          ✦ Proven Authority
        </span>
        <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B0A08]">
          Proven Craftsmanship Across India
        </h2>
        <p className="text-[#2C2922] text-xs sm:text-base mt-2 font-medium">
          28+ years &amp; three generations of stone craftsmanship across 100+ cities.
        </p>
      </div>

      {/* Social Proof Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
        <div className="glass-card p-4 sm:p-6 rounded-2xl text-center border border-[#B8860B]/20 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          <span className="font-serif text-2xl sm:text-4xl font-black gold-gradient-text block">28+</span>
          <span className="text-[11px] sm:text-xs text-[#2C2922] font-bold mt-1 block">Years Heritage</span>
        </div>
        <div className="glass-card p-4 sm:p-6 rounded-2xl text-center border border-[#B8860B]/20 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          <span className="font-serif text-2xl sm:text-4xl font-black gold-gradient-text block">3</span>
          <span className="text-[11px] sm:text-xs text-[#2C2922] font-bold mt-1 block">Generations</span>
        </div>
        <div className="glass-card p-4 sm:p-6 rounded-2xl text-center border border-[#B8860B]/20 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          <span className="font-serif text-2xl sm:text-4xl font-black gold-gradient-text block">100+</span>
          <span className="text-[11px] sm:text-xs text-[#2C2922] font-bold mt-1 block">Cities Completed</span>
        </div>
        <div className="glass-card p-4 sm:p-6 rounded-2xl text-center border border-[#B8860B]/20 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          <span className="font-serif text-2xl sm:text-4xl font-black gold-gradient-text block">₹1 Lakh+</span>
          <span className="text-[11px] sm:text-xs text-[#2C2922] font-bold mt-1 block">Custom Scope</span>
        </div>
      </div>

      {/* Projects Cards Grid (Mobile Slidable Horizontal Carousel, Desktop 3-Col Grid) */}
      <div className="relative">
        <div className="flex md:grid md:grid-cols-3 gap-5 sm:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {projects.map((project) => (
            <div
              key={project.id}
              className="w-[85vw] max-w-[340px] md:w-auto shrink-0 snap-center bg-[#12110E] text-[#FFFEFA] rounded-2xl overflow-hidden border border-[#B8860B]/35 shadow-[0_15px_45px_rgba(0,0,0,0.4)] group flex flex-col justify-between transition-all duration-300 hover:border-[#D4AF37]/80 hover:shadow-[0_20px_50px_rgba(184,134,11,0.25)]"
            >
              {/* Image Container with Luxury Aspect Ratio */}
              <div className="relative aspect-[3/4] bg-[#0B0A08] overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Top Location Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#0B0A08]/85 backdrop-blur-md text-[#F0DB8A] text-[11px] font-extrabold px-3 py-1 rounded-full border border-[#B8860B]/40 shadow-md">
                  <span>{project.location}</span>
                </div>

                {/* Bottom Tag Badge */}
                <div className="absolute bottom-3 left-3 bg-[#B8860B]/90 text-[#FFFEFA] text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm">
                  {project.tag}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="font-serif font-bold text-lg text-[#FFFEFA] leading-tight group-hover:text-[#F0DB8A] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-[#E5DAC6] leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={onBookClick}
                  className="w-full gold-btn-luxury shimmer-btn text-[#1A1207] py-2.5 px-4 rounded-xl font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 mt-2"
                >
                  <span>Discuss Similar Project</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex md:hidden items-center justify-center gap-2 mt-2 text-xs font-bold text-[#996C05]">
          <i className="fa-solid fa-arrows-left-right text-xs animate-pulse"></i>
          <span>Swipe left / right to view designs</span>
        </div>
      </div>
    </section>
  );
}

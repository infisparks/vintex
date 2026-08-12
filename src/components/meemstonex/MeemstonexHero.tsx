"use client";

import React, { useEffect, useRef } from "react";

interface MeemstonexHeroProps {
  onBookClick: () => void;
  onVideoClick: () => void;
}

export function MeemstonexHero({ onBookClick, onVideoClick }: MeemstonexHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const animWebpRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const webp = animWebpRef.current;

    if (video) {
      const handleVideoError = () => {
        if (webp) {
          video.classList.add("hidden");
          webp.classList.remove("hidden");
        }
      };
      video.addEventListener("error", handleVideoError);
      video.play().catch(() => {
        if (webp) {
          video.classList.add("hidden");
          webp.classList.remove("hidden");
        }
      });
      return () => {
        video.removeEventListener("error", handleVideoError);
      };
    }
  }, []);

  return (
    <>
      <section
        id="heroSection"
        className="relative min-h-[100dvh] md:min-h-0 pt-24 pb-8 sm:py-10 lg:py-16 overflow-hidden w-full max-w-full bg-[#0B0A08] md:bg-transparent flex flex-col justify-center"
        style={{ contain: "layout paint", isolation: "isolate" }}
      >
        {/* Mobile Background Video Engine */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/meemstonex/thumbnail.webp"
          className="md:hidden absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-90"
          style={{ transform: "translateZ(0)", willChange: "transform" }}
        >
          <source src="https://res.cloudinary.com/q7zxhlwn/video/upload/v1786440101/hero.mp4" type="video/mp4" />
        </video>

        {/* Crystal-Clear 540p HD Animated WebP Fallback Engine */}
        <img
          ref={animWebpRef}
          src="/meemstonex/hero_mobile_hd.webp"
          alt="Meemstonex Craftsmanship Background"
          className="md:hidden absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-90 hidden"
        />

        {/* Dark Contrast Overlay for Text Legibility */}
        <div className="md:hidden absolute inset-0 bg-gradient-to-b from-[#0B0A08]/75 via-[#0B0A08]/45 to-[#0B0A08]/90 z-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Hero Main Content Column */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
              {/* Micro Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12110E]/95 md:bg-[#F3EAC9]/90 border border-[#CCA338]/40 md:border-[#E6D494]/80 text-[#D8BC5F] md:text-[#5C3C00] text-[11px] sm:text-xs font-bold tracking-wide shadow-xs">
                <i className="fa-solid fa-wand-magic-sparkles text-[#CCA338] md:text-[#996C05]"></i>
                <span>Luxury Handcrafted Stone Architecture</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-2xl sm:text-4xl lg:text-6xl font-extrabold text-[#FFFEFA] md:text-[#0B0A08] leading-[1.18] tracking-tight">
                Your Space. Your Vision.<br />
                <span className="gold-gradient-text">Crafted in Marble.</span>
              </h1>

              {/* Sub-headline */}
              <p className="text-sm sm:text-lg lg:text-xl text-[#F3EDE0] md:text-[#2C2922] font-semibold max-w-2xl mx-auto lg:mx-0 leading-snug">
                Custom marble mandirs designed for your home — Starting from ₹1 Lakh
              </p>

              {/* VIDEO THUMBNAIL CONTAINER */}
              <div className="my-3 max-w-sm sm:max-w-xl mx-auto lg:mx-0 w-full">
                <div className="relative rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 glass-card-dark md:glass-card shadow-xl border border-[#B8860B]/30 group">
                  {/* Thumbnail Wrapper */}
                  <div
                    className="relative aspect-[2048/768] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#0B0A08] cursor-pointer shadow-inner"
                    onClick={onVideoClick}
                  >
                    <img
                      src="/meemstonex/thumbnail.webp"
                      alt="Meemstonex Marble Mandir Craftsmen Video"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/meemstonex/thumbnail.jpg";
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0A08]/90 via-[#0B0A08]/25 to-transparent" />

                    {/* Animated Play Button Trigger */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full gold-gradient-bg text-[#FFFEFA] flex items-center justify-center shadow-[0_12px_35px_-10px_rgba(184,134,11,0.45)] animate-subtle-pulse group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-play text-base sm:text-lg ml-0.5"></i>
                      </div>
                      <span className="mt-2 text-[10px] sm:text-xs font-bold text-[#FFFEFA] bg-[#12110E]/95 px-3 py-1 rounded-full border border-[#CCA338]/40 shadow-md flex items-center gap-1.5">
                        <i className="fa-brands fa-youtube text-red-500 text-xs"></i>
                        <span>Watch How We Craft Masterpieces (Short Video)</span>
                      </span>
                    </div>

                    {/* Floating Badge */}
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] sm:text-[11px] font-bold text-[#FAF7F0]">
                      <span className="flex items-center gap-1 bg-[#0B0A08]/80 px-2 py-0.5 rounded border border-[#B8860B]/30">
                        <i className="fa-solid fa-shield-halved text-[#CCA338]"></i> Makrana &amp; Vietnam Marble
                      </span>
                      <span className="bg-[#B8860B] text-[#FFFEFA] px-1.5 py-0.5 rounded font-black">HD</span>
                    </div>
                  </div>

                  {/* Caption under video */}
                  <p className="text-center text-[10px] sm:text-xs font-semibold text-[#F3EDE0] md:text-[#2C2922] mt-1.5 flex items-center justify-center gap-1">
                    <i className="fa-solid fa-circle-check text-[#CCA338] md:text-[#996C05]"></i>
                    <span>Authentic marble carving &amp; artisan precision in action</span>
                  </p>
                </div>
              </div>

              {/* Primary CTA & Micro Trust Line */}
              <div className="pt-1 flex flex-col items-center lg:items-start gap-3">
                <button
                  onClick={onBookClick}
                  className="w-full sm:w-auto gold-btn-luxury shimmer-btn text-[#1A1207] px-8 py-3.5 sm:py-4 rounded-full font-extrabold text-base sm:text-lg shadow-[0_10px_35px_rgba(200,153,39,0.5)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 group cursor-pointer"
                >
                  <span>Discuss My Mandir Project</span>
                  <i className="fa-solid fa-arrow-right text-sm group-hover:translate-x-1 transition-transform text-[#1A1207]"></i>
                </button>

                {/* Tiny Trust Line */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold text-[#FAF7F0] md:text-[#2C2922] bg-[#12110E]/95 md:bg-[#FAF7F0]/90 px-3 py-1.5 rounded-full border border-[#B8860B]/35 md:border-[#B8860B]/25 shadow-xs max-w-full text-center flex-wrap">
                  <i className="fa-solid fa-award text-[#CCA338] md:text-[#996C05]"></i>
                  <span>28+ Years • 3rd Generation • Custom Craftsmanship</span>
                </div>
              </div>

              {/* Quick Highlight Stats */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3 pt-4 border-t border-[#B8860B]/30 md:border-[#B8860B]/20 max-w-md mx-auto lg:mx-0 text-left min-w-0">
                <div className="space-y-0.5 min-w-0">
                  <span className="block font-serif font-black text-base sm:text-2xl text-[#CCA338] md:text-[#996C05] truncate">100%</span>
                  <span className="block text-[9px] sm:text-xs text-[#F3EDE0] md:text-[#423E34] font-semibold leading-tight break-words">Bespoke Design</span>
                </div>
                <div className="space-y-0.5 border-l border-[#B8860B]/30 md:border-[#B8860B]/20 pl-2 sm:pl-3 min-w-0">
                  <span className="block font-serif font-black text-base sm:text-2xl text-[#CCA338] md:text-[#996C05] truncate">100+</span>
                  <span className="block text-[9px] sm:text-xs text-[#F3EDE0] md:text-[#423E34] font-semibold leading-tight break-words">Cities Delivered</span>
                </div>
                <div className="space-y-0.5 border-l border-[#B8860B]/30 md:border-[#B8860B]/20 pl-2 sm:pl-3 min-w-0">
                  <span className="block font-serif font-black text-base sm:text-2xl text-[#CCA338] md:text-[#996C05] truncate">Turnkey</span>
                  <span className="block text-[9px] sm:text-xs text-[#F3EDE0] md:text-[#423E34] font-semibold leading-tight break-words">Craft &amp; Install</span>
                </div>
              </div>
            </div>

            {/* Desktop Showcase Card Column */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="glass-card rounded-3xl p-8 border border-[#B8860B]/30 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#B8860B]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-2">
                  <span className="text-[#996C05] text-xs font-extrabold uppercase tracking-wider block">Bespoke Excellence</span>
                  <h3 className="font-serif text-2xl font-bold text-[#0B0A08]">Turnkey Marble Sacred Architecture</h3>
                  <p className="text-sm text-[#2C2922] leading-relaxed font-medium">
                    Every structure is tailored to your home layout, marble grade preferences, and divine aesthetic traditions.
                  </p>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF7F0] border border-[#B8860B]/15">
                    <div className="w-8 h-8 rounded-lg gold-gradient-bg text-[#FFFEFA] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                      <i className="fa-solid fa-gem text-xs"></i>
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#0B0A08]">Pure Makrana &amp; Vietnam Marble</h4>
                      <p className="text-xs text-[#423E34]">Selected virgin marble blocks with flawless finish and vein matching.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF7F0] border border-[#B8860B]/15">
                    <div className="w-8 h-8 rounded-lg gold-gradient-bg text-[#FFFEFA] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                      <i className="fa-solid fa-compass-drafting text-xs"></i>
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#0B0A08]">1-on-1 3D Design Approval</h4>
                      <p className="text-xs text-[#423E34]">Detailed CAD &amp; 3D visualizations before any stone carving begins.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF7F0] border border-[#B8860B]/15">
                    <div className="w-8 h-8 rounded-lg gold-gradient-bg text-[#FFFEFA] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                      <i className="fa-solid fa-truck-fast text-xs"></i>
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#0B0A08]">White-Glove Pan-India Install</h4>
                      <p className="text-xs text-[#423E34]">Zero-breakage transit &amp; expert master artisan site assembly.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#B8860B]/20 flex items-center justify-between text-xs font-bold text-[#5C3C00]">
                  <span className="flex items-center gap-1.5">
                    <i className="fa-solid fa-shield-halved text-[#996C05]"></i>
                    100% Transparent Pricing
                  </span>
                  <span className="text-[#423E34] text-[11px]">Starting from ₹1 Lakh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE SEPARATE BESPOKE EXCELLENCE FEATURE SECTION */}
      <section className="lg:hidden py-10 px-4 bg-[#FAF7F0] border-b border-[#B8860B]/20 w-full max-w-full">
        <div className="max-w-md mx-auto">
          <div className="glass-card rounded-2xl p-6 border border-[#B8860B]/30 shadow-xl space-y-5 relative overflow-hidden">
            <div className="space-y-1.5 text-center">
              <span className="text-[#996C05] text-xs font-extrabold uppercase tracking-wider block">Bespoke Excellence</span>
              <h3 className="font-serif text-xl font-bold text-[#0B0A08]">Turnkey Marble Sacred Architecture</h3>
              <p className="text-xs text-[#2C2922] leading-relaxed font-medium">
                Every structure is tailored to your home layout, marble grade preferences, and divine aesthetic traditions.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF7F0] border border-[#B8860B]/15">
                <div className="w-7 h-7 rounded-lg gold-gradient-bg text-[#FFFEFA] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <i className="fa-solid fa-gem text-xs"></i>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#0B0A08]">Pure Makrana &amp; Vietnam Marble</h4>
                  <p className="text-[11px] text-[#423E34]">Selected virgin marble blocks with flawless finish and vein matching.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF7F0] border border-[#B8860B]/15">
                <div className="w-7 h-7 rounded-lg gold-gradient-bg text-[#FFFEFA] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <i className="fa-solid fa-compass-drafting text-xs"></i>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#0B0A08]">1-on-1 3D Design Approval</h4>
                  <p className="text-[11px] text-[#423E34]">Detailed CAD &amp; 3D visualizations before any stone carving begins.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF7F0] border border-[#B8860B]/15">
                <div className="w-7 h-7 rounded-lg gold-gradient-bg text-[#FFFEFA] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <i className="fa-solid fa-truck-fast text-xs"></i>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-[#0B0A08]">White-Glove Pan-India Install</h4>
                  <p className="text-[11px] text-[#423E34]">Zero-breakage transit &amp; expert master artisan site assembly.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#B8860B]/20 flex items-center justify-between text-xs font-bold text-[#5C3C00]">
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-shield-halved text-[#996C05]"></i>
                Transparent Pricing
              </span>
              <span className="text-[#423E34] text-[10px]">Starting from ₹1 Lakh</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

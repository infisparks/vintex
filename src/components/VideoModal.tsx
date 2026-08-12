"use client";

import React, { useEffect, useState } from "react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  author?: string;
  embedId?: string;
  onBookClick: () => void;
}

export function VideoModal({
  isOpen,
  onClose,
  title = "Meemstonex Craftsmanship Documentary",
  author = "3rd Generation Stone Artisans",
  embedId = "2TOgOB_d1sI",
  onBookClick,
}: VideoModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const activeVideoId = embedId || "2TOgOB_d1sI";

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B0A08]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      <div
        className="relative bg-[#12110E] border border-[#B8860B]/40 rounded-3xl w-full max-w-[380px] sm:max-w-[420px] overflow-hidden shadow-[0_25px_70px_-15px_rgba(184,134,11,0.35)] flex flex-col my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#B8860B]/20 bg-[#171612]">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B8860B]/20 border border-[#CCA338]/40 text-[#D8BC5F] text-[10px] sm:text-[11px] font-bold tracking-wide shrink-0">
              <i className="fa-solid fa-play text-[9px] text-[#CCA338]"></i>
              <span>Watch Short</span>
            </span>
            <h3
              id="video-modal-title"
              className="text-xs sm:text-sm font-bold text-[#FFFEFA] truncate"
              title={title}
            >
              {title}
            </h3>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close video popup"
            className="w-8 h-8 rounded-full bg-[#0B0A08]/80 hover:bg-[#B8860B] text-[#F3EDE0] hover:text-[#FFFEFA] border border-[#B8860B]/30 flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer shadow-md"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* 9:16 YouTube Shorts Video Player Container */}
        <div className="relative aspect-[9/16] w-full bg-black flex items-center justify-center overflow-hidden">
          {/* Loading Skeleton */}
          {isLoading && (
            <div className="absolute inset-0 bg-[#0B0A08] flex flex-col items-center justify-center gap-3 z-10">
              <div className="w-12 h-12 rounded-full border-2 border-[#B8860B]/30 border-t-[#CCA338] animate-spin"></div>
              <p className="text-xs text-[#D8BC5F] font-semibold tracking-wide animate-pulse">
                Loading Masterpiece Video...
              </p>
            </div>
          )}

          {/* YouTube Embed Iframe */}
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&controls=1&loop=1&playlist=${activeVideoId}&enablejsapi=1`}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          ></iframe>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#171612] border-t border-[#B8860B]/20 space-y-3">
          {/* Artisan Tagline */}
          <div className="flex items-center justify-between text-[11px] text-[#E5DAC6]">
            <span className="flex items-center gap-1 font-semibold">
              <i className="fa-solid fa-shield-halved text-[#CCA338]"></i>
              <span>{author}</span>
            </span>
            <a
              href={`https://www.youtube.com/shorts/${activeVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D8BC5F] hover:text-[#FFFEFA] font-bold flex items-center gap-1 transition-colors"
            >
              <i className="fa-brands fa-youtube text-red-500"></i>
              <span>Open on YouTube</span>
            </a>
          </div>

          {/* Primary CTA Button */}
          <button
            onClick={() => {
              onClose();
              onBookClick();
            }}
            className="w-full gold-btn-luxury shimmer-btn text-[#1A1207] py-3 px-4 rounded-xl font-extrabold text-sm shadow-[0_8px_25px_rgba(200,153,39,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Discuss My Mandir Project</span>
            <i className="fa-solid fa-arrow-right text-xs"></i>
          </button>

          {/* Micro Trust */}
          <p className="text-[10px] text-center text-[#A89F91] font-medium">
            ✦ Pure Makrana &amp; Vietnam Marble • 100+ Cities • 28+ Years Heritage
          </p>
        </div>
      </div>
    </div>
  );
}

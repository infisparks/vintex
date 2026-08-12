"use client";

import React, { useState, useEffect } from "react";

interface SelflanceHeroProps {
  isUS?: boolean;
  onBookClick: () => void;
  onVideoClick?: () => void;
}

const testimonialsIN = [
  {
    avatar: "https://i.pravatar.cc/80?img=33",
    borderColor: "border-[#6366F1]/40",
    quote: "Revenue ₹80L se ₹2.6Cr ho gayi — sirf 8 mahine mein. Selflance ka system ne sab badal diya.",
    name: "Rahul Mehta",
    role: "· E-commerce Founder",
    badge: "↑ 3.2x Revenue",
    badgeColor: "text-green-400 bg-green-400/10 border-green-400/20",
  },
  {
    avatar: "https://i.pravatar.cc/80?img=47",
    borderColor: "border-[#A855F7]/40",
    quote: "Humara CRM + automation system ne manual work 70% reduce kar diya. Sales team ab 2x zyada deals close kar rahi hai.",
    name: "Priya Sharma",
    role: "· SaaS Co-founder",
    badge: "70% Less Work",
    badgeColor: "text-[#A855F7] bg-[#A855F7]/10 border-[#A855F7]/20",
  },
  {
    avatar: "https://i.pravatar.cc/80?img=60",
    borderColor: "border-[#df7626]/40",
    quote: "6 mahine mein ₹12Cr ka project deliver hua — on time, on budget. Aisa koi aur agency nahi karti.",
    name: "Anil Verma",
    role: "· Retail Chain Owner",
    badge: "₹12Cr Delivered",
    badgeColor: "text-[#df7626] bg-[#df7626]/10 border-[#df7626]/20",
  },
];

const testimonialsUS = [
  {
    avatar: "https://i.pravatar.cc/80?img=33",
    borderColor: "border-[#6366F1]/40",
    quote: "Revenue grew 3.2x in 8 months. Selflance's automated system changed everything for us.",
    name: "Rahul Mehta",
    role: "· E-commerce Founder",
    badge: "↑ 3.2x Revenue",
    badgeColor: "text-green-400 bg-green-400/10 border-green-400/20",
  },
  {
    avatar: "https://i.pravatar.cc/80?img=47",
    borderColor: "border-[#A855F7]/40",
    quote: "Our CRM + automation workflow reduced manual labor by 70%. The sales team is closing 2x more deals.",
    name: "Priya Sharma",
    role: "· SaaS Co-founder",
    badge: "70% Less Work",
    badgeColor: "text-[#A855F7] bg-[#A855F7]/10 border-[#A855F7]/20",
  },
  {
    avatar: "https://i.pravatar.cc/80?img=60",
    borderColor: "border-[#df7626]/40",
    quote: "Delivered a complex $1.5M enterprise platform in 6 months—on time and on budget.",
    name: "Anil Verma",
    role: "· Retail Chain Owner",
    badge: "$1.5M Delivered",
    badgeColor: "text-[#df7626] bg-[#df7626]/10 border-[#df7626]/20",
  },
];

export function SelflanceHero({ isUS = false, onBookClick, onVideoClick }: SelflanceHeroProps) {
  const [activeTestiIndex, setActiveTestiIndex] = useState(0);
  const testimonials = isUS ? testimonialsUS : testimonialsIN;

  // Carousel auto advance
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestiIndex((prev) => (prev + 1) % testimonials.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <main className="w-full max-w-5xl mx-auto min-h-screen pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-12 relative px-4 sm:px-6 z-10 flex flex-col justify-start items-center text-center gap-y-2 sm:gap-y-3 overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-blue-900/20 blur-[90px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[220px] h-[220px] bg-purple-500/10 blur-[80px] rounded-full pointer-events-none -z-10 animate-[float_8s_ease-in-out_infinite]"></div>

      {/* UPPER CONTENT */}
      <div className="flex flex-col items-center w-full gap-y-2 sm:gap-y-3 pt-1.5 sm:pt-2">
        {/* TOP BADGES ROW */}
        <div className="flex items-center justify-center flex-wrap gap-2">
          {/* Top-Rated Agency Badge */}
          <div className="inline-flex items-center gap-2 bg-[#121A2F]/80 backdrop-blur-sm border border-[#2A3552] rounded-full px-3 py-1 sm:px-4 sm:py-1.5 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#df7626] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#df7626]"></span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-300 tracking-widest uppercase">
              Top-Rated Agency
            </span>
          </div>

          {/* Animated Client Satisfaction Trust Badge */}
          <div className="group relative inline-flex items-center gap-1.5 bg-[#121A2F]/90 backdrop-blur-md border border-[#2A3552] hover:border-[#6366F1]/80 rounded-full px-3 py-1 sm:px-3.5 sm:py-1.5 transition-all duration-300 shadow-md overflow-hidden cursor-pointer">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <svg className="w-3.5 h-3.5 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-200 group-hover:text-white transition-colors">
              Client Satisfaction
            </span>
            <svg className="w-3.5 h-3.5 text-yellow-400 fill-current transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="bg-[#1E293B] border border-gray-700/60 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold text-yellow-400 tracking-tight">
              4.9/5
            </span>
          </div>
        </div>

        {/* HEADLINE */}
        <h1 className="text-[22.5px] sm:text-4xl md:text-[50px] font-extrabold leading-[1.2] tracking-tight text-white drop-shadow-lg px-1 w-full max-w-[345px] md:max-w-4xl mx-auto">
          {isUS ? (
            <>
              We Don&apos;t Just Build Websites &amp; Apps. We Build{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A855F7]">
                Scalable Digital Businesses
              </span>
            </>
          ) : (
            <>
              Your Business Needs More Than a Website. It Needs a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A855F7]">
                Digital Growth Engine
              </span>{" "}
              That Helps You{" "}
              <span className="text-[#df7626] relative inline-block">
                Scale.
                <svg
                  className="absolute -bottom-1 sm:-bottom-2 left-0 w-full text-[#df7626] h-[6px] sm:h-3"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path d="M0,15 Q50,25 100,5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </>
          )}
        </h1>

        {/* SUB-HEADLINE */}
        <p className="text-[#94A3B8] text-[12px] sm:text-[13.5px] md:text-base leading-snug sm:leading-relaxed max-w-[335px] sm:max-w-2xl mx-auto font-medium px-1">
          {isUS ? (
            <>
              Helping established businesses replace outdated systems, automate operations, improve customer experience and prepare for long-term growth through world-class technology.
              <br className="hidden sm:block" />
              <span className="text-gray-300 font-medium text-xs sm:text-sm mt-1.5 block">
                If you&apos;re looking for the cheapest developer, we&apos;re probably not the right fit. If you&apos;re looking for a long-term technology partner that thinks like a business owner, let&apos;s talk.
              </span>
            </>
          ) : (
            <>
              Business scale karne ke liye manual hustle nahi, smart systems chahiye. Hum{" "}
              <strong className="text-gray-200">Technology, Automation &amp; Strategy</strong> ke through high-performing growth engines build karte hain.
            </>
          )}
        </p>

        {/* LIVE RESULTS TICKER */}
        <div
          className="w-full overflow-hidden relative"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="flex gap-2 animate-[ticker_18s_linear_infinite] hover:[animation-play-state:paused] w-max">
            {/* Ticker items repeated twice for infinite loop */}
            {[1, 2].map((loopKey) => (
              <React.Fragment key={loopKey}>
                <div className="flex items-center gap-1.5 bg-[#111424] border border-[#2A3552] rounded-full px-3 py-1 whitespace-nowrap shrink-0">
                  <span className="text-green-400 text-[10px] sm:text-xs font-bold">&#8593; 3.2x</span>
                  <span className="text-gray-400 text-[9px] sm:text-[11px]">Revenue Growth</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#111424] border border-[#2A3552] rounded-full px-3 py-1 whitespace-nowrap shrink-0">
                  <span className="text-[#6366F1] text-[10px] sm:text-xs font-bold">50+</span>
                  <span className="text-gray-400 text-[9px] sm:text-[11px]">Businesses Scaled</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#111424] border border-[#2A3552] rounded-full px-3 py-1 whitespace-nowrap shrink-0">
                  <span className="text-[#df7626] text-[10px] sm:text-xs font-bold">
                    {isUS ? "$50M+" : "₹40Cr+"}
                  </span>
                  <span className="text-gray-400 text-[9px] sm:text-[11px]">
                    {isUS ? "Value Generated" : "Revenue Generated"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#111424] border border-[#2A3552] rounded-full px-3 py-1 whitespace-nowrap shrink-0">
                  <span className="text-yellow-400 text-[10px] sm:text-xs font-bold">&#9733; 4.9/5</span>
                  <span className="text-gray-400 text-[9px] sm:text-[11px]">Client Rating</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#111424] border border-[#2A3552] rounded-full px-3 py-1 whitespace-nowrap shrink-0">
                  <span className="text-[#60A5FA] text-[10px] sm:text-xs font-bold">90 Days</span>
                  <span className="text-gray-400 text-[9px] sm:text-[11px]">Avg Delivery</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#111424] border border-[#2A3552] rounded-full px-3 py-1 whitespace-nowrap shrink-0">
                  <span className="text-green-400 text-[10px] sm:text-xs font-bold">98%</span>
                  <span className="text-gray-400 text-[9px] sm:text-[11px]">Client Retention</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#111424] border border-[#2A3552] rounded-full px-3 py-1 whitespace-nowrap shrink-0">
                  <span className="text-purple-400 text-[10px] sm:text-xs font-bold">ISO 27001</span>
                  <span className="text-gray-400 text-[9px] sm:text-[11px]">Certified</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* FEATURE PILLS */}
        <div className="flex flex-row flex-wrap justify-center gap-1.5 sm:gap-3 w-full max-w-[330px] md:max-w-xl mx-auto">
          <div className="border border-[#2A3552]/80 bg-[#0F1629]/50 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span className="text-[10px] sm:text-[11px] text-gray-300 font-semibold">Fast Delivery</span>
          </div>
          <div className="border border-[#2A3552]/80 bg-[#0F1629]/50 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            <span className="text-[10px] sm:text-[11px] text-gray-300 font-semibold">Secure &amp; Scalable</span>
          </div>
          <div className="border border-[#2A3552]/80 bg-[#0F1629]/50 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
            </svg>
            <span className="text-[10px] sm:text-[11px] text-gray-300 font-semibold">Future-Ready</span>
          </div>
        </div>

        {/* VIDEO THUMBNAIL */}
        <div
          onClick={onVideoClick || onBookClick}
          className="relative w-full max-w-[88%] sm:max-w-lg lg:max-w-xl mx-auto group cursor-pointer rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20 border border-gray-700/60 bg-[#0A0F1C]"
        >
          <div className="absolute inset-0 bg-[#df7626]/15 blur-[25px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
            <img
              src="https://raw.githubusercontent.com/infisparks/images/refs/heads/main/Selflancethumbnail.png"
              alt="Selflance Digital Growth Engine Presentation"
              className="w-full h-auto object-contain block transform group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors duration-300">
              <div className="w-10 h-7 sm:w-16 sm:h-11 bg-[#FF0000] rounded-lg sm:rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(255,0,0,0.5)] transform group-hover:scale-110 transition-transform duration-300">
                <svg className="w-4 h-4 sm:w-7 sm:h-7 text-white ml-0.5 sm:ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ROTATING TESTIMONIAL STRIP */}
        <div className="w-full max-w-[92%] sm:max-w-lg mx-auto relative">
          <div className="overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeTestiIndex * 100}%)` }}
            >
              {testimonials.map((item, index) => (
                <div
                  key={index}
                  className="min-w-full bg-[#0F1629] border border-[#2A3552]/80 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-3 text-left"
                >
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 ${item.borderColor} shrink-0 object-cover`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9.5px] sm:text-[11px] text-gray-300 leading-snug font-medium">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div>
                        <span className="text-[9px] sm:text-[10px] font-bold text-white">{item.name}</span>
                        <span className="text-[8px] sm:text-[9px] text-gray-500 ml-1">{item.role}</span>
                      </div>
                      <span
                        className={`text-[8px] sm:text-[9px] font-bold border rounded-full px-2 py-0.5 shrink-0 ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-2">
            {testimonials.map((_, i) => (
              <span
                key={i}
                onClick={() => setActiveTestiIndex(i)}
                className={`cursor-pointer h-1 rounded-full transition-all duration-300 ${
                  i === activeTestiIndex ? "w-4 bg-[#6366F1]" : "w-1.5 bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* LOWER CONTENT */}
      <div className="w-full flex flex-col items-center gap-y-2 sm:gap-y-3 z-30 shrink-0 mt-3">
        {/* CTA BUTTON */}
        <button
          onClick={onBookClick}
          className="group relative w-full max-w-[92%] sm:max-w-md mx-auto bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-[13px] sm:text-[15px] flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_8px_20px_-5px_rgba(109,40,217,0.5)] border-t border-white/20 border-b-[3px] border-b-[#4c1d95] active:border-b-0 active:translate-y-0 overflow-hidden px-3 cursor-pointer"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <span className="text-base drop-shadow-md">&#128197;</span>
          <span className="relative z-10 drop-shadow-sm tracking-wide text-center leading-tight">
            Book Your Business Technology Strategy Session
          </span>
        </button>

        {/* TRUST BAR */}
        <div className="w-full max-w-[96%] sm:max-w-3xl mx-auto flex items-center justify-center flex-wrap gap-x-2.5 sm:gap-x-4 gap-y-1 text-[8.5px] sm:text-[10.5px] text-gray-300 font-medium pt-0.5">
          <span className="flex items-center gap-1">
            <span className="text-green-400 font-bold">✔</span>
            <span>{isUS ? "Trusted by Growing US & Global Businesses" : "Trusted by Growing Indian Businesses"}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-green-400 font-bold">✔</span>
            <span>{isUS ? "Custom Built Scalable Systems" : "Custom Built Solutions"}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-green-400 font-bold">✔</span>
            <span>Long-Term Technology Partner</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="text-green-400 font-bold">✔</span>
            <span>Enterprise-Level Development Standards</span>
          </span>
        </div>

        {/* SCARCITY PILL */}
        <div className="inline-flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-[#df7626] font-semibold tracking-wide bg-[#111424] px-4 py-1.5 rounded-full border border-[#df7626]/30 shadow-sm">
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#df7626]" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z"
              clipRule="evenodd"
            />
          </svg>
          <span>Limited consultation slots available every week.</span>
        </div>

        {/* TRUST FOOTER */}
        <div className="flex flex-row justify-between items-center w-full max-w-[96%] sm:max-w-4xl mx-auto pt-2 sm:pt-3 border-t border-gray-800/80">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex -space-x-2 sm:-space-x-3">
              <img className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-[#0B1121] object-cover" src="https://i.pravatar.cc/100?img=11" alt="Client" />
              <img className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-[#0B1121] object-cover" src="https://i.pravatar.cc/100?img=12" alt="Client" />
              <img className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-[#0B1121] object-cover" src="https://i.pravatar.cc/100?img=15" alt="Client" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex text-[#EAB308]">
                {[...Array(5)].map((_, starIdx) => (
                  <svg key={starIdx} className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium">50+ Happy Clients</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-5">
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <span className="text-[9px] sm:text-[11px] font-bold text-gray-300">GDPR</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
              <span className="text-[9px] sm:text-[11px] font-bold text-gray-300">ISO27001</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <span className="text-[9px] sm:text-[11px] font-bold text-gray-300">PCI DSS</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

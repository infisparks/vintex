"use client";

import React from "react";

export function WhatWeBuildSection() {
  const capabilities = [
    {
      title: "Enterprise Websites",
      category: "Web & Digital",
      badgeCol: "text-[#60A5FA] bg-[#60A5FA]/10 border-[#60A5FA]/20",
      topLine: "from-[#60A5FA] to-[#3B82F6]",
      hoverBorder: "hover:border-[#60A5FA]",
      iconCol: "text-[#60A5FA] bg-[#60A5FA]/10 border-[#60A5FA]/30",
      desc: "Jo sirf beautiful nahi... <strong class=\"text-white font-semibold\">High-converting bhi hoti hain.</strong>",
      footer: "High Speed • SEO Ready • UX Focused",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m6 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
        </svg>
      ),
    },
    {
      title: "Mobile Applications",
      category: "iOS & Android",
      badgeCol: "text-[#C084FC] bg-[#A855F7]/10 border-[#A855F7]/20",
      topLine: "from-[#A855F7] to-[#C084FC]",
      hoverBorder: "hover:border-[#A855F7]",
      iconCol: "text-[#A855F7] bg-[#A855F7]/10 border-[#A855F7]/30",
      desc: "Scalable, fast aur user-friendly mobile experiences for iOS & Android.",
      footer: "Native & Cross-Platform • Offline Support",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
      ),
    },
    {
      title: "Custom Software (CRM/ERP)",
      category: "Internal Systems",
      badgeCol: "text-[#FDBA74] bg-[#df7626]/10 border-[#df7626]/20",
      topLine: "from-[#df7626] to-[#F59E0B]",
      hoverBorder: "hover:border-[#df7626]",
      iconCol: "text-[#df7626] bg-[#df7626]/10 border-[#df7626]/30",
      desc: "Aapke business rules ke hisaab se tailored CRM, ERP & Management Systems.",
      footer: "Custom Dashboards • Workflow Engine",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      ),
    },
    {
      title: "Business Process Automation",
      category: "Smart Workflows",
      badgeCol: "text-[#86EFAC] bg-emerald-500/10 border-emerald-500/20",
      topLine: "from-emerald-400 to-teal-500",
      hoverBorder: "hover:border-emerald-400",
      iconCol: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      desc: "Repetitive tasks aur manual hustle ko automated API workflows me covert karein.",
      footer: "API Integration • WhatsApp & Email Bots",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      ),
    },
    {
      title: "Cloud Infrastructure & Security",
      category: "Infrastructure",
      badgeCol: "text-[#93C5FD] bg-blue-500/10 border-blue-500/20",
      topLine: "from-blue-400 to-indigo-500",
      hoverBorder: "hover:border-blue-400",
      iconCol: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      desc: "High uptime, 99.9% reliability aur enterprise-grade data security setup.",
      footer: "AWS/GCP • ISO27001 Ready • Automated Backups",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-900/15 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="bg-[#0F1629]/90 border border-[#2A3552]/80 rounded-2xl sm:rounded-3xl p-5 sm:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Top badge */}
        <div className="flex justify-center sm:justify-start mb-4">
          <div className="inline-flex items-center gap-2 bg-[#60A5FA]/10 border border-[#60A5FA]/20 rounded-full px-3 py-1 text-[#60A5FA] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-ping"></span>
            Capabilities
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white text-center sm:text-left leading-snug sm:leading-tight mb-8">
          What We{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] via-[#6366F1] to-[#A855F7]">
            Build
          </span>
        </h2>

        {/* Grid of Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {capabilities.map((cap, idx) => (
            <div
              key={idx}
              className={`relative group bg-gradient-to-b from-[#131C35] to-[#0F1629] border border-[#2A3552] ${cap.hoverBorder} rounded-2xl p-5 sm:p-6 transition-all duration-300 shadow-xl overflow-hidden flex flex-col justify-between`}
            >
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${cap.topLine} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${cap.iconCol} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {cap.icon}
                  </div>
                  <span className={`text-[10px] font-bold ${cap.badgeCol} px-2.5 py-0.5 rounded-full uppercase tracking-wider`}>
                    {cap.category}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">{cap.title}</h3>
                <p
                  className="text-gray-300 text-xs sm:text-sm font-medium leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: cap.desc }}
                />
              </div>
              <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center gap-1.5 text-[11px] text-[#60A5FA] font-bold">
                <span>{cap.footer}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

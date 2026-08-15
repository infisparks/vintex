"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { event as fbEvent, customEvent as fbCustomEvent, getPreservedQueryString } from "@/lib/fpixel";
import { MeemstonexHeader } from "@/components/meemstonex/MeemstonexHeader";
import { MeemstonexHero } from "@/components/meemstonex/MeemstonexHero";
import { FeaturedDesignsSection } from "@/components/meemstonex/FeaturedDesignsSection";
import { ProblemSection } from "@/components/meemstonex/ProblemSection";
import { ProcessSection } from "@/components/meemstonex/ProcessSection";
import { CraftsmanshipSection } from "@/components/meemstonex/CraftsmanshipSection";
import { ArchitectPartnerSection } from "@/components/meemstonex/ArchitectPartnerSection";
import { SacredArchitectureSection } from "@/components/meemstonex/SacredArchitectureSection";
import { ProofSystemSection } from "@/components/meemstonex/ProofSystemSection";
import { DifferentiationSection } from "@/components/meemstonex/DifferentiationSection";
import { MeemstonexFAQ } from "@/components/meemstonex/MeemstonexFAQ";
import { MeemstonexFinalCTA } from "@/components/meemstonex/MeemstonexFinalCTA";
import { MeemstonexStickyMobileCTA } from "@/components/meemstonex/MeemstonexStickyMobileCTA";
import { BookingModal } from "@/components/BookingModal";
import { VideoModal } from "@/components/VideoModal";

function URLParamsHandler({
  onConfigureBooking,
  onCountryChange,
}: {
  onConfigureBooking: (config: {
    isOpen: boolean;
    step: 1 | 2 | 3 | 4;
    leadId: string | null;
    createdDate: string | null;
    campaignName: string | null;
  }) => void;
  onCountryChange: (isUS: boolean) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const countryParam = (searchParams.get("c") || searchParams.get("country") || "").toLowerCase();
    onCountryChange(countryParam === "us");

    const pathname = window.location.pathname;
    const stepParam = searchParams.get("step");
    const bookingParam =
      searchParams.get("booking") ||
      searchParams.get("book") ||
      searchParams.get("form") ||
      searchParams.get("openBooking");
    const leadIdParam = searchParams.get("leadId");
    const createdDateParam = searchParams.get("createdDate");
    const campaignParam = searchParams.get("campaign");

    let targetStep: 1 | 2 | 3 | 4 | null = null;

    if (pathname === "/form") targetStep = 1;
    else if (pathname === "/survey") targetStep = 2;
    else if (pathname === "/meeting") targetStep = 3;
    else if (pathname === "/success") targetStep = 4;
    else if (stepParam === "survey" || stepParam === "2") targetStep = 2;
    else if (stepParam === "meeting" || stepParam === "3") targetStep = 3;
    else if (stepParam === "4" || stepParam === "success") targetStep = 4;
    else if (
      stepParam === "1" ||
      stepParam === "contact" ||
      stepParam === "form" ||
      stepParam === "book" ||
      bookingParam
    )
      targetStep = 1;
    else if (campaignParam) targetStep = 1;

    if (targetStep !== null) {
      onConfigureBooking({
        isOpen: true,
        step: targetStep,
        leadId: leadIdParam,
        createdDate: createdDateParam,
        campaignName: campaignParam,
      });
    }
  }, [searchParams, onConfigureBooking, onCountryChange]);

  return null;
}

export default function Home({
  defaultStep,
  defaultOpen = false,
}: {
  defaultStep?: 1 | 2 | 3 | 4;
  defaultOpen?: boolean;
} = {}) {
  const [isUS, setIsUS] = useState(false);
  const [bookingConfig, setBookingConfig] = useState<{
    isOpen: boolean;
    step: 1 | 2 | 3 | 4;
    leadId: string | null;
    createdDate: string | null;
    campaignName: string | null;
  }>({
    isOpen: defaultOpen || !!defaultStep,
    step: defaultStep || 1,
    leadId: null,
    createdDate: null,
    campaignName: null,
  });

  const [videoModal, setVideoModal] = useState<{
    isOpen: boolean;
    title: string;
    author: string;
    embedId?: string;
  }>({
    isOpen: false,
    title: "",
    author: "",
    embedId: undefined,
  });

  // Dispatch PageView via Node.js CAPI
  useEffect(() => {
    if (typeof window === "undefined") return;

    const serverUrl = (process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || "https://vintex.infiplus.in").replace(/\/$/, "");
    const params = new URLSearchParams(window.location.search);
    const testCode = params.get("test_event_code") || params.get("fbtest") || undefined;

    fetch(`${serverUrl}/api/whatsapp/capi-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "PageView",
        eventSourceUrl: window.location.href,
        testEventCode: testCode,
      }),
    }).catch((err) => console.error("Async CAPI PageView trigger error:", err));
  }, []);

  const handleOpenBooking = useCallback(() => {
    if (typeof window !== "undefined") {
      const preserved = getPreservedQueryString();
      window.history.replaceState({}, "", window.location.pathname + preserved);
    }

    fbEvent("Lead", {
      content_name: "CTA Button Click",
      currency: isUS ? "USD" : "INR",
      value: 0,
    });
    fbCustomEvent("ButtonClick", {
      button_name: "Discuss My Project CTA",
    });

    setBookingConfig({
      isOpen: true,
      step: 1,
      leadId: null,
      createdDate: null,
      campaignName: null,
    });
  }, [isUS]);

  const handleCloseBooking = useCallback(() => {
    setBookingConfig({
      isOpen: false,
      step: 1,
      leadId: null,
      createdDate: null,
      campaignName: null,
    });
  }, []);

  const handleConfigureBooking = useCallback(
    (config: {
      isOpen: boolean;
      step: 1 | 2 | 3 | 4;
      leadId: string | null;
      createdDate: string | null;
      campaignName: string | null;
    }) => {
      setBookingConfig((prev) => {
        if (
          prev.isOpen === config.isOpen &&
          prev.step === config.step &&
          prev.leadId === config.leadId &&
          prev.createdDate === config.createdDate &&
          prev.campaignName === config.campaignName
        ) {
          return prev;
        }
        return config;
      });
    },
    []
  );

  const handleCountryChange = useCallback((usState: boolean) => {
    setIsUS(usState);
  }, []);

  const handleOpenVideo = useCallback(() => {
    setVideoModal({
      isOpen: true,
      title: "Meemstonex Marble Mandir Craftsmanship",
      author: "3rd Generation Stone Artisans",
      embedId: "2TOgOB_d1sI",
    });
  }, []);

  const handleCloseVideo = useCallback(() => {
    setVideoModal({
      isOpen: false,
      title: "",
      author: "",
      embedId: undefined,
    });
  }, []);

  return (
    <div className="marble-pattern antialiased text-[#1E1C17] pb-20 md:pb-0 overflow-x-hidden max-w-full w-full min-h-screen relative">
      {/* Root Overflow Prevention Wrapper */}
      <div className="w-full max-w-full overflow-x-hidden relative">
        {/* URL Parameter Direct Link & Country Handler */}
        <Suspense fallback={null}>
          <URLParamsHandler
            onConfigureBooking={handleConfigureBooking}
            onCountryChange={handleCountryChange}
          />
        </Suspense>

        {/* Header */}
        <MeemstonexHeader onBookClick={handleOpenBooking} />

        {/* Section 1: Hero Section (Untouched as requested) */}
        <MeemstonexHero onBookClick={handleOpenBooking} onVideoClick={handleOpenVideo} />

        {/* Section 1.5: Signature Bespoke Masterpieces Showcase */}
        <FeaturedDesignsSection onBookClick={handleOpenBooking} />

        {/* Section 2: Problem Section */}
        <ProblemSection onBookClick={handleOpenBooking} />

        {/* Section 3: Process Section (5-Step Mechanism) */}
        <ProcessSection />

        {/* Section 4: Proven Craftsmanship Across India */}
        <CraftsmanshipSection onBookClick={handleOpenBooking} />

        {/* Section 5: Architect & Interior Designer Collaboration (ICP #2) */}
        <ArchitectPartnerSection onBookClick={handleOpenBooking} />

        {/* Section 6: Sacred & Institutional Architecture (ICP #3) */}
        <SacredArchitectureSection onBookClick={handleOpenBooking} />

        {/* Section 7: Unmatched Trust & Quality Proof System */}
        <ProofSystemSection />

        {/* Section 8: Differentiation */}
        <DifferentiationSection />

        {/* Section 9: FAQs */}
        <MeemstonexFAQ />

        {/* Section 10: Final CTA & Footer */}
        <MeemstonexFinalCTA onBookClick={handleOpenBooking} />

        {/* Mobile Sticky CTA */}
        <MeemstonexStickyMobileCTA onBookClick={handleOpenBooking} />

        {/* Booking Modal */}
        <BookingModal
          isOpen={bookingConfig.isOpen}
          onClose={handleCloseBooking}
          initialStep={bookingConfig.step}
          initialLeadId={bookingConfig.leadId}
          initialCreatedDate={bookingConfig.createdDate}
          campaignName={bookingConfig.campaignName || "vintexair"}
        />

        {/* Video Modal */}
        <VideoModal
          isOpen={videoModal.isOpen}
          onClose={handleCloseVideo}
          title={videoModal.title}
          author={videoModal.author}
          embedId={videoModal.embedId}
          onBookClick={handleOpenBooking}
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ViewFlowPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/crms");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center font-sans">
      <div className="flex items-center space-x-3 text-indigo-600 font-bold text-sm">
        <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
        <span>Redirecting to CRM Workspace...</span>
      </div>
    </div>
  );
}

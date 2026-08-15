"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Quotation,
  InventoryItem,
  getQuotations,
  getInventoryItems,
} from "@/lib/firebase";
import { QuotationsWorkspaceView } from "@/components/crm/quotations/QuotationsWorkspaceView";

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [qList, iList] = await Promise.all([
        getQuotations(),
        getInventoryItems(),
      ]);
      setQuotations(qList);
      setInventoryItems(iList);
    } catch (err) {
      console.error("Failed to load quotations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-slate-900 font-sans p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-1">
            <Link href="/crms" className="hover:text-indigo-600 transition-colors">
              CRM Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-700">Quotations & Estimates</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-sm">
              <i className="fa-solid fa-file-invoice"></i>
            </span>
            <span>Vintex Air Quotations & Commercial Estimates</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, manage, print and share official customer estimates with live stock deduction & 18% GST calculation.
          </p>
        </div>

        <Link
          href="/crms"
          className="self-start sm:self-auto bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs px-3.5 py-2 rounded-xl border border-slate-300 shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i>
          <span>Back to Main CRM</span>
        </Link>
      </div>

      {/* Quotations Workspace Component */}
      <QuotationsWorkspaceView
        quotations={quotations}
        inventoryItems={inventoryItems}
        isLoading={isLoading}
        onRefresh={loadData}
      />
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PurchaseBill, Vendor, getPurchaseBills, getVendors } from "@/lib/firebase";
import { PurchaseBillsView } from "@/components/crm/inventory/PurchaseBillsView";

export default function PurchaseBillsPage() {
  const [bills, setBills] = useState<PurchaseBill[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bList, vList] = await Promise.all([
        getPurchaseBills(),
        getVendors(),
      ]);
      setBills(bList);
      setVendors(vList);
    } catch (err) {
      console.error("Failed to load purchase bills:", err);
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
            <Link href="/crms?tab=inventory" className="hover:text-indigo-600 transition-colors">
              Inventory
            </Link>
            <span>/</span>
            <span className="text-slate-700">Purchase Inward Bills</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm">
              <i className="fa-solid fa-receipt"></i>
            </span>
            <span>Purchase Inward Bills & Procurement Receipts</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View, verify, print and audit supplier inward goods receipts, PO references, and payable amounts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/crms/inventory/products"
            className="bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs px-3 py-2 rounded-xl border border-slate-300 shadow-2xs transition-all flex items-center space-x-1.5"
          >
            <i className="fa-solid fa-boxes-stacked text-xs"></i>
            <span>Products Catalog</span>
          </Link>

          <Link
            href="/crms"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left text-xs"></i>
            <span>Back to CRM</span>
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <Link
          href="/crms/inventory/products"
          className="px-3.5 py-2 rounded-xl bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
        >
          📦 Products Catalog
        </Link>
        <Link
          href="/crms/inventory/vendors"
          className="px-3.5 py-2 rounded-xl bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
        >
          🏭 Vendors Registry
        </Link>
        <Link
          href="/crms/inventory/stock"
          className="px-3.5 py-2 rounded-xl bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
        >
          ⚡ Stock Movement Ledger
        </Link>
        <Link
          href="/crms/inventory/purchase-bills"
          className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white shadow-xs"
        >
          🧾 Purchase Inward Bills
        </Link>
      </div>

      {/* Purchase Bills View Component */}
      <PurchaseBillsView
        bills={bills}
        vendors={vendors}
        isLoading={isLoading}
        onRefresh={loadData}
      />
    </div>
  );
}

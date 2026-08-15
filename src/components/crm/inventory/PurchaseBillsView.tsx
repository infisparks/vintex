"use client";

import React, { useState, useMemo } from "react";
import { PurchaseBill, Vendor } from "@/lib/firebase";

interface PurchaseBillsViewProps {
  bills: PurchaseBill[];
  vendors: Vendor[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export function PurchaseBillsView({
  bills,
  vendors,
  isLoading,
  onRefresh,
}: PurchaseBillsViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingBill, setViewingBill] = useState<PurchaseBill | null>(null);

  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      if (statusFilter !== "all" && b.paymentStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const bNo = (b.billNo || "").toLowerCase();
        const vName = (b.vendorName || "").toLowerCase();
        const po = (b.poReference || "").toLowerCase();
        return bNo.includes(q) || vName.includes(q) || po.includes(q);
      }
      return true;
    });
  }, [bills, searchQuery, statusFilter]);

  const handleViewBill = (b: PurchaseBill) => {
    setViewingBill(b);
    setIsViewModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* FILTER & ACTIONS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 w-full">
          <div className="relative flex-1 min-w-[220px]">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search by Bill #, PO reference, vendor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl text-xs font-medium text-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid In Full</option>
            <option value="partial">Partially Paid</option>
            <option value="pending">Pending Payment</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
          title="Refresh Bills"
        >
          <i className={`fa-solid fa-arrows-rotate ${isLoading ? "fa-spin" : ""}`}></i>
        </button>
      </div>

      {/* BILLS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800 font-sans">
            <thead className="bg-slate-50 text-slate-600 font-black border-b border-slate-200 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Bill # & Date</th>
                <th className="px-4 py-3">Vendor / Supplier</th>
                <th className="px-4 py-3">PO Reference</th>
                <th className="px-4 py-3">Items Inward</th>
                <th className="px-4 py-3 text-right">Taxable Subtotal</th>
                <th className="px-4 py-3 text-right">GST Total</th>
                <th className="px-4 py-3 text-right">Total Payable</th>
                <th className="px-4 py-3 text-center">Payment Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    <i className="fa-solid fa-spinner fa-spin text-lg text-indigo-600 mb-2 block"></i>
                    <span>Loading purchase bills...</span>
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-10 text-center text-slate-400">
                    <i className="fa-solid fa-receipt text-3xl mb-2 text-slate-300 block"></i>
                    <p className="font-bold text-slate-600 text-sm">No Purchase Bills Recorded</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Inward procurement slips with auto-generate bill checked will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                          PB
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{b.billNo}</p>
                          <span className="text-[10px] text-slate-500 font-mono">{b.billDate}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="font-extrabold text-slate-900 truncate">{b.vendorName}</p>
                      {b.vendorGstin && (
                        <p className="text-[10px] text-slate-500 font-mono uppercase">{b.vendorGstin}</p>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-indigo-700 font-bold">
                      {b.poReference || "--"}
                    </td>

                    <td className="px-4 py-3 max-w-[220px]">
                      <div className="space-y-0.5">
                        {(b.items || []).slice(0, 2).map((it, idx) => (
                          <p key={idx} className="text-[11px] text-slate-700 truncate font-medium">
                            • <strong className="text-slate-900">{it.qty}x</strong> {it.name}
                          </p>
                        ))}
                        {b.items.length > 2 && (
                          <span className="text-[10px] text-emerald-700 font-extrabold">
                            +{b.items.length - 2} more items...
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-right text-slate-600 font-medium">
                      ₹{b.subtotal.toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3 font-mono text-right text-slate-600 font-medium">
                      ₹{b.taxAmount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3 font-mono text-right font-black text-slate-900 text-sm">
                      ₹{b.totalAmount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          b.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : b.paymentStatus === "partial"
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-rose-100 text-rose-800 border border-rose-300"
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleViewBill(b)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="View Purchase Bill Slip"
                      >
                        <i className="fa-solid fa-receipt mr-1"></i>
                        <span>View Slip</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW PURCHASE BILL SLIP MODAL */}
      {isViewModalOpen && viewingBill && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0 print:hidden" onClick={() => setIsViewModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 border border-slate-200 z-10 font-sans print:p-0 print:shadow-none print:border-none print:w-full print:max-w-none">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 print:hidden">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Purchase Slip #{viewingBill.billNo}
                </span>
                <span className="text-xs text-slate-500">Inward Procurement Receipt</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-print text-xs"></i>
                  <span>Print Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 font-bold flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Bill Sheet Body */}
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4 bg-slate-50/50 text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Vendor / Supplier:</span>
                  <span className="font-extrabold text-slate-900 text-base">{viewingBill.vendorName}</span>
                  {viewingBill.vendorGstin && (
                    <p className="font-mono text-slate-600 text-xs">GSTIN: {viewingBill.vendorGstin}</p>
                  )}
                  {viewingBill.vendorPhone && (
                    <p className="font-mono text-slate-600 text-xs">Phone: {viewingBill.vendorPhone}</p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Bill Date & Ref:</span>
                  <span className="font-bold text-slate-900">{viewingBill.billDate}</span>
                  <p className="font-mono text-indigo-700 font-bold">{viewingBill.poReference}</p>
                </div>
              </div>

              <table className="w-full text-left text-xs bg-white rounded-xl overflow-hidden border border-slate-200">
                <thead className="bg-slate-100 text-slate-600 font-bold text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Item & Specs</th>
                    <th className="p-2.5">HSN Code</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Purchase Rate (₹)</th>
                    <th className="p-2.5 text-right">GST</th>
                    <th className="p-2.5 text-right">Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingBill.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold text-slate-800">{it.name}</td>
                      <td className="p-2.5 font-mono text-slate-600">{it.hsnCode || "84796000"}</td>
                      <td className="p-2.5 text-center font-mono font-bold">{it.qty} {it.unit}</td>
                      <td className="p-2.5 text-right font-mono">₹{it.purchaseRate.toLocaleString("en-IN")}</td>
                      <td className="p-2.5 text-right font-mono text-slate-500">₹{it.taxAmount.toLocaleString("en-IN")} ({it.gstRate}%)</td>
                      <td className="p-2.5 text-right font-mono font-black text-emerald-700">₹{it.totalAmount.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-1 pt-2 border-t border-slate-200 text-right">
                <div className="text-slate-600">Taxable Subtotal: <span className="font-mono font-bold text-slate-900">₹{viewingBill.subtotal.toLocaleString("en-IN")}</span></div>
                <div className="text-slate-600">Total GST: <span className="font-mono font-bold text-slate-900">₹{viewingBill.taxAmount.toLocaleString("en-IN")}</span></div>
                <div className="text-base font-black text-emerald-700 pt-1">
                  Grand Total Payable: ₹{viewingBill.totalAmount.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  In Words: {viewingBill.totalAmountInWords}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

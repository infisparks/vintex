import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Quotation, InventoryItem, deleteQuotation } from "@/lib/firebase";
import { QuotationInvoicePrintModal } from "./QuotationInvoicePrintModal";
import { FullPageQuotationBuilder } from "./FullPageQuotationBuilder";

interface QuotationsWorkspaceViewProps {
  quotations: Quotation[];
  inventoryItems: InventoryItem[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export function QuotationsWorkspaceView({
  quotations,
  inventoryItems,
  isLoading,
  onRefresh,
}: QuotationsWorkspaceViewProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [datePreset, setDatePreset] = useState("all"); // 'all' | 'today' | '7days'

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);

  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered Quotations
  const filteredQuotations = useMemo(() => {
    const todayStr = new Date().toLocaleDateString("en-GB"); // DD/MM/YYYY
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return quotations.filter((q) => {
      if (statusFilter !== "all" && q.status !== statusFilter) return false;

      if (datePreset === "today") {
        if (q.quotationDate !== todayStr) return false;
      } else if (datePreset === "7days") {
        if (q.createdAt) {
          const qDate = new Date(q.createdAt);
          if (qDate < sevenDaysAgo) return false;
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const client = (q.clientName || "").toLowerCase();
        const num = (q.quotationNo || "").toLowerCase();
        const phone = (q.clientMobile || "").toLowerCase();
        const itemsMatch = (q.items || []).some((it) => it.name.toLowerCase().includes(query));
        return client.includes(query) || num.includes(query) || phone.includes(query) || itemsMatch;
      }

      return true;
    });
  }, [quotations, searchQuery, statusFilter, datePreset]);

  // KPI Calculations
  const stats = useMemo(() => {
    const todayStr = new Date().toLocaleDateString("en-GB");
    const todayQuotes = quotations.filter((q) => q.quotationDate === todayStr);
    const confirmedQuotes = quotations.filter((q) => q.status === "confirmed");
    const totalPipelineVal = quotations.reduce((acc, q) => acc + (q.totalAmount || 0), 0);

    return {
      total: quotations.length,
      todayCount: todayQuotes.length,
      confirmedCount: confirmedQuotes.length,
      pipelineValue: totalPipelineVal,
    };
  }, [quotations]);

  const handleCreateNew = () => {
    router.push("/crms/quotations/create");
  };

  const handleEdit = (q: Quotation) => {
    router.push(`/crms/quotations/create?id=${q.id}`);
  };

  const handleView = (q: Quotation) => {
    setViewingQuotation(q);
    setIsViewModalOpen(true);
  };

  const handleWhatsAppShare = (q: Quotation) => {
    const cleanPhone = (q.clientMobile || "").replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;

    const itemsSummary = q.items
      .map(
        (it, idx) =>
          `*${idx + 1}.* ${it.name} (${it.qty} ${it.unit}) @ ₹${it.rate.toLocaleString("en-IN")} + ${it.gstRate}% GST = *₹${it.amount.toLocaleString("en-IN")}*`
      )
      .join("\n");

    const message =
      `📄 *ESTIMATE / QUOTATION #${q.quotationNo}*\n` +
      `*Vintex Air - Industrial Evaporative Cooling Solutions*\n` +
      `-----------------------------------------\n` +
      `👤 *Client:* ${q.clientName}\n` +
      `📅 *Date:* ${q.quotationDate}\n` +
      `📍 *Location:* ${q.clientAddress || "Maharashtra"}\n\n` +
      `*QUOTED ITEMS:*\n${itemsSummary}\n\n` +
      `-----------------------------------------\n` +
      `💵 *Taxable Subtotal:* ₹${q.taxableAmount.toLocaleString("en-IN")}\n` +
      `📊 *GST Total (18%):* ₹${q.totalTax.toLocaleString("en-IN")}\n` +
      `💰 *GRAND TOTAL:* ₹${q.totalAmount.toLocaleString("en-IN")}\n` +
      `🔤 *In Words:* ${q.totalAmountInWords}\n\n` +
      `🏦 *BANK PAYMENT DETAILS:*\n` +
      `Bank: Axis Bank, Malegaon\n` +
      `A/C Name: Royal Aircone\n` +
      `A/C No: 91902002803808042\n` +
      `IFSC: UTIB0001240\n` +
      `UPI ID: 9922245312@axisbank\n\n` +
      `For inquiries or order confirmation, please contact:\n` +
      `📞 Vintex Air Sales: +91 9922245312 | ✉️ vintexair@gmail.com`;

    const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleDeleteQuotationSubmit = async () => {
    if (!quotationToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteQuotation(quotationToDelete.id);
      if (res) {
        setQuotationToDelete(null);
        await onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* TOP 4 KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Total Quotes</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xs">
              <i className="fa-solid fa-file-invoice"></i>
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{stats.total}</span>
            <span className="text-[10px] text-purple-800 font-bold bg-purple-100 px-1.5 py-0.5 rounded-md">
              All Active
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Today&apos;s Quotes</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs">
              <i className="fa-solid fa-calendar-day"></i>
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{stats.todayCount}</span>
            <span className="text-[10px] text-indigo-700 font-bold bg-indigo-100 px-1.5 py-0.5 rounded-md">
              Today
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Quoted Pipeline</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs">
              <i className="fa-solid fa-indian-rupee-sign"></i>
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-emerald-800 font-mono">
              ₹{(stats.pipelineValue / 100000).toFixed(2)}L
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded-md">
              Pipeline
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Confirmed Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xs">
              <i className="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{stats.confirmedCount}</span>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-1.5 py-0.5 rounded-md">
              Won Orders
            </span>
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-auto flex-1 flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search by quote #, client name, mobile, item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 focus:border-purple-600 rounded-xl text-xs font-medium text-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Date Preset Filter */}
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600 cursor-pointer"
          >
            <option value="all">📅 All Quotations</option>
            <option value="today">⚡ Today&apos;s Quotes</option>
            <option value="7days">🗓️ Last 7 Days</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="sent">Sent to Client</option>
            <option value="confirmed">Confirmed / Accepted</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="w-full md:w-auto flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
            title="Refresh Quotations"
          >
            <i className={`fa-solid fa-arrows-rotate ${isLoading ? "fa-spin" : ""}`}></i>
          </button>

          <button
            type="button"
            onClick={handleCreateNew}
            className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>+ Create Quotation</span>
          </button>
        </div>
      </div>

      {/* QUOTATIONS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800 font-sans">
            <thead className="bg-slate-50 text-slate-600 font-black border-b border-slate-200 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Quote # & Date</th>
                <th className="px-4 py-3">Client / Business</th>
                <th className="px-4 py-3">Items Quoted</th>
                <th className="px-4 py-3 text-right">Taxable Subtotal</th>
                <th className="px-4 py-3 text-right">GST (18%)</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    <i className="fa-solid fa-spinner fa-spin text-lg text-purple-600 mb-2 block"></i>
                    <span>Loading quotations database...</span>
                  </td>
                </tr>
              ) : filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <i className="fa-solid fa-file-invoice text-3xl mb-2 text-slate-300 block"></i>
                    <p className="font-bold text-slate-600 text-sm">No Quotations Found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery
                        ? "No quotations match your search criteria."
                        : "Click '+ Create Quotation' to generate your first estimate."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                          #{q.quotationNo}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">Estimate #{q.quotationNo}</p>
                          <span className="text-[10px] text-slate-600 font-mono">{q.quotationDate}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 max-w-[200px]">
                      <p className="font-extrabold text-slate-900 truncate">{q.clientName}</p>
                      <p className="text-[11px] text-slate-600 font-mono truncate">{q.clientMobile}</p>
                      {q.clientAddress && (
                        <p className="text-[10px] text-slate-600 truncate">{q.clientAddress}</p>
                      )}
                    </td>

                    <td className="px-4 py-3.5 max-w-[240px]">
                      <div className="space-y-0.5">
                        {(q.items || []).slice(0, 2).map((it, idx) => (
                          <p key={idx} className="text-[11px] text-slate-700 truncate font-medium">
                            • <strong className="text-slate-900">{it.qty}x</strong> {it.name}
                          </p>
                        ))}
                        {q.items.length > 2 && (
                          <span className="text-[10px] text-purple-800 font-extrabold">
                            +{q.items.length - 2} more items...
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-right text-slate-600 font-medium">
                      ₹{q.taxableAmount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-right text-slate-600 font-medium">
                      ₹{q.totalTax.toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-right font-black text-slate-900 text-sm">
                      ₹{q.totalAmount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          q.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : q.status === "sent"
                            ? "bg-purple-100 text-purple-800 border border-purple-300"
                            : q.status === "cancelled"
                            ? "bg-rose-100 text-rose-800 border border-rose-300"
                            : "bg-slate-100 text-slate-700 border border-slate-300"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleView(q)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                          title="View / Print Official Quotation"
                        >
                          <i className="fa-solid fa-print"></i>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleWhatsAppShare(q)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                          title="Share Estimate on WhatsApp"
                        >
                          <i className="fa-brands fa-whatsapp"></i>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(q)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                          title="Edit Quotation"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>

                        <button
                          type="button"
                          onClick={() => setQuotationToDelete(q)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                          title="Delete Quotation"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL-PAGE LIVE SPLIT-SCREEN QUOTATION & PDF BUILDER */}
      <FullPageQuotationBuilder
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        editingQuotation={editingQuotation}
        inventoryItems={inventoryItems}
        onSuccess={async (saved) => {
          await onRefresh();
          setViewingQuotation(saved);
          setIsViewModalOpen(true);
        }}
      />

      {/* EXACT INVOICE PRINT MODAL */}
      <QuotationInvoicePrintModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        quotation={viewingQuotation}
        onShareWhatsApp={handleWhatsAppShare}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {quotationToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => !isDeleting && setQuotationToDelete(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4 border border-slate-200 z-10 font-sans animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center text-xl mx-auto">
              <i className="fa-solid fa-file-invoice"></i>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Delete Quotation #{quotationToDelete.quotationNo}?</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete this estimate for <strong className="text-slate-900 font-extrabold">{quotationToDelete.clientName}</strong>? If stock was deducted, it will be automatically restored back to inventory.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setQuotationToDelete(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2.5 rounded-xl transition-all border border-slate-200 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteQuotationSubmit}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <i className={`fa-solid fa-trash-can ${isDeleting ? "fa-spin" : ""}`}></i>
                <span>{isDeleting ? "Deleting..." : "Yes, Delete & Restore Stock"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

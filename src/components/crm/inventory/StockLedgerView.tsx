"use client";

import React, { useState, useMemo } from "react";
import {
  InventoryTransaction,
  InventoryItem,
  Vendor,
  recordStockTransaction,
} from "@/lib/firebase";

interface StockLedgerViewProps {
  transactions: InventoryTransaction[];
  inventoryItems: InventoryItem[];
  vendors: Vendor[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export function StockLedgerView({
  transactions,
  inventoryItems,
  vendors,
  isLoading,
  onRefresh,
}: StockLedgerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Stock In Modal State
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [stockInItem, setStockInItem] = useState<InventoryItem | null>(null);
  const [stockInQty, setStockInQty] = useState("5");
  const [stockInRate, setStockInRate] = useState("");
  const [stockInVendorId, setStockInVendorId] = useState("");
  const [stockInVendor, setStockInVendor] = useState("");
  const [stockInRefNo, setStockInRefNo] = useState("");
  const [stockInNotes, setStockInNotes] = useState("");
  const [stockInGenerateBill, setStockInGenerateBill] = useState(true);

  // Stock Out Modal State
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  const [stockOutItem, setStockOutItem] = useState<InventoryItem | null>(null);
  const [stockOutQty, setStockOutQty] = useState("1");
  const [stockOutRate, setStockOutRate] = useState("");
  const [stockOutCustomer, setStockOutCustomer] = useState("");
  const [stockOutCustomerPhone, setStockOutCustomerPhone] = useState("");
  const [stockOutInvoiceNo, setStockOutInvoiceNo] = useState("");
  const [stockOutNotes, setStockOutNotes] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [modalError, setModalError] = useState("");

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const sku = (t.itemSku || "").toLowerCase();
        const name = (t.itemName || "").toLowerCase();
        const party = (t.partyName || "").toLowerCase();
        const refNo = (t.referenceNo || "").toLowerCase();
        return sku.includes(q) || name.includes(q) || party.includes(q) || refNo.includes(q);
      }
      return true;
    });
  }, [transactions, searchQuery, typeFilter]);

  const handleOpenStockIn = (item?: InventoryItem) => {
    const sel = item || inventoryItems[0] || null;
    setStockInItem(sel);
    setStockInQty("5");
    setStockInRate(sel ? sel.purchaseRate.toString() : "");
    setStockInVendorId(sel?.vendorId || "");
    setStockInVendor(sel?.supplierName || "");
    setStockInRefNo(`PO-${Math.floor(1000 + Math.random() * 9000)}`);
    setStockInNotes("Inward procurement shipment from vendor");
    setStockInGenerateBill(true);
    setModalError("");
    setIsStockInOpen(true);
  };

  const handleOpenStockOut = (item?: InventoryItem) => {
    const sel = item || inventoryItems[0] || null;
    setStockOutItem(sel);
    setStockOutQty("1");
    setStockOutRate(sel ? sel.sellingRate.toString() : "");
    setStockOutCustomer("");
    setStockOutCustomerPhone("");
    setStockOutInvoiceNo(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
    setStockOutNotes("Client installation and delivery");
    setModalError("");
    setIsStockOutOpen(true);
  };

  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInItem) return;
    const qty = Number(stockInQty);
    if (!qty || qty <= 0) {
      setModalError("Please specify a valid inward quantity.");
      return;
    }

    setIsProcessing(true);
    setModalError("");

    try {
      const pRate = Number(stockInRate) || stockInItem.purchaseRate;
      const res = await recordStockTransaction({
        type: "purchase",
        itemId: stockInItem.id,
        itemSku: stockInItem.sku,
        itemName: stockInItem.name,
        qty: Math.abs(qty),
        unitRate: pRate,
        gstRate: stockInItem.gstRate,
        taxAmount: Math.round((pRate * qty * (stockInItem.gstRate / 100)) * 100) / 100,
        totalAmount: Math.round((pRate * qty * (1 + stockInItem.gstRate / 100)) * 100) / 100,
        referenceNo: stockInRefNo.trim() || `PO-${Date.now().toString().slice(-6)}`,
        partyName: stockInVendor.trim() || stockInItem.supplierName || "Direct Supplier",
        vendorId: stockInVendorId || stockInItem.vendorId,
        notes: stockInNotes.trim(),
        performedBy: "Vintex Inventory Admin",
      });

      if (!res.success) {
        setModalError(res.error || "Failed to record inward stock.");
      } else {
        setIsStockInOpen(false);
        await onRefresh();
      }
    } catch (err: any) {
      setModalError(err.message || "Failed to record inward stock.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStockOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockOutItem) return;
    const qty = Number(stockOutQty);
    if (!qty || qty <= 0) {
      setModalError("Please specify a valid quantity.");
      return;
    }
    if (qty > stockOutItem.currentStock) {
      setModalError(`Insufficient stock! Available quantity is ${stockOutItem.currentStock} ${stockOutItem.unit}.`);
      return;
    }

    setIsProcessing(true);
    setModalError("");

    try {
      const sRate = Number(stockOutRate) || stockOutItem.sellingRate;
      const res = await recordStockTransaction({
        type: "sale",
        itemId: stockOutItem.id,
        itemSku: stockOutItem.sku,
        itemName: stockOutItem.name,
        qty: -Math.abs(qty),
        unitRate: sRate,
        gstRate: stockOutItem.gstRate,
        taxAmount: Math.round((sRate * qty * (stockOutItem.gstRate / 100)) * 100) / 100,
        totalAmount: Math.round((sRate * qty * (1 + stockOutItem.gstRate / 100)) * 100) / 100,
        referenceNo: stockOutInvoiceNo.trim() || `INV-${Date.now().toString().slice(-6)}`,
        partyName: stockOutCustomer.trim() || "Direct Client Sale",
        partyContact: stockOutCustomerPhone.trim(),
        notes: stockOutNotes.trim(),
        performedBy: "Vintex Inventory Admin",
      });

      if (!res.success) {
        setModalError(res.error || "Failed to record sale.");
      } else {
        setIsStockOutOpen(false);
        await onRefresh();
      }
    } catch (err: any) {
      setModalError(err.message || "Failed to record sale.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCsv = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ["Date", "Type", "SKU", "Item Name", "Qty", "Rate", "Total", "Party Name", "Reference #", "Notes"];
    const rows = filteredTransactions.map((t) => [
      t.createdAt ? t.createdAt.slice(0, 10) : "",
      t.type,
      t.itemSku,
      `"${(t.itemName || "").replace(/"/g, '""')}"`,
      t.qty,
      t.unitRate,
      t.totalAmount,
      `"${(t.partyName || "").replace(/"/g, '""')}"`,
      t.referenceNo || "",
      `"${(t.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vintex_stock_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* FILTER & ACTIONS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-auto flex-1 flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[220px]">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search by SKU, product name, vendor, ref #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl text-xs font-medium text-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="all">⚡ All Movements</option>
            <option value="purchase">📥 Stock In (Procurement)</option>
            <option value="sale">📤 Stock Out (Sales)</option>
            <option value="adjustment">⚙️ Stock Adjustment</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleExportCsv}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-3 py-2 rounded-xl border border-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
            title="Export Ledger CSV"
          >
            <i className="fa-solid fa-file-csv"></i>
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenStockIn()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-arrow-down text-[10px]"></i>
            <span>+ Inward Stock</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenStockOut()}
            className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-arrow-up text-[10px]"></i>
            <span>- Outward Sale</span>
          </button>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800 font-sans">
            <thead className="bg-slate-50 text-slate-600 font-black border-b border-slate-200 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Product SKU & Name</th>
                <th className="px-4 py-3 text-center">Movement Qty</th>
                <th className="px-4 py-3 text-center">Previous ➔ New Stock</th>
                <th className="px-4 py-3 text-right">Unit Rate</th>
                <th className="px-4 py-3">Vendor / Client / Ref #</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    <i className="fa-solid fa-spinner fa-spin text-lg text-indigo-600 mb-2 block"></i>
                    <span>Loading stock transaction ledger...</span>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <i className="fa-solid fa-clock-rotate-left text-3xl mb-2 text-slate-300 block"></i>
                    <p className="font-bold text-slate-600 text-sm">No Stock Movements Logged</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Inward purchase receipts and outward sale invoices will appear here automatically.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {t.createdAt ? t.createdAt.slice(0, 10) : ""}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          t.type === "purchase"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : t.type === "sale"
                            ? "bg-purple-100 text-purple-800 border border-purple-300"
                            : "bg-blue-100 text-blue-800 border border-blue-300"
                        }`}
                      >
                        {t.type === "purchase" ? "📥 Inward (+)" : t.type === "sale" ? "📤 Sale (-)" : "⚙️ Adjust"}
                      </span>
                    </td>

                    <td className="px-4 py-3 max-w-[220px]">
                      <span className="font-mono text-[10px] font-black text-indigo-700 block uppercase">
                        {t.itemSku}
                      </span>
                      <p className="font-bold text-slate-900 text-xs truncate leading-snug">{t.itemName}</p>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`font-mono font-black text-xs ${
                          t.qty > 0 ? "text-emerald-700" : "text-rose-600"
                        }`}
                      >
                        {t.qty > 0 ? `+${t.qty}` : t.qty}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center font-mono text-xs text-slate-700">
                      <span className="text-slate-400">{t.previousStock}</span>
                      <span className="mx-1 text-slate-300">➔</span>
                      <strong className="text-slate-900">{t.newStock}</strong>
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-900 font-bold text-right">
                      ₹{t.unitRate?.toLocaleString("en-IN") || "0"}
                    </td>

                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="font-bold text-slate-900 truncate">{t.partyName || "Direct"}</p>
                      {t.referenceNo && (
                        <span className="font-mono text-[10px] text-indigo-600 font-medium">
                          Ref: {t.referenceNo}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-slate-500 text-[11px] max-w-[160px] truncate">
                      {t.notes || "--"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK INWARD STOCK MODAL */}
      {isStockInOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => !isProcessing && setIsStockInOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 border border-slate-200 z-10 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-base border border-emerald-200">
                  <i className="fa-solid fa-arrow-down"></i>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Stock Inward / Purchase Entry</h3>
                  <p className="text-xs text-slate-500">Record incoming stock from registered vendor</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isProcessing && setIsStockInOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStockInSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Select Product *</label>
                <select
                  value={stockInItem?.id || ""}
                  onChange={(e) => {
                    const sel = inventoryItems.find((i) => i.id === e.target.value);
                    setStockInItem(sel || null);
                    if (sel) {
                      setStockInRate(sel.purchaseRate.toString());
                      setStockInVendorId(sel.vendorId || "");
                      const vMatch = vendors.find((v) => v.id === sel.vendorId);
                      setStockInVendor(vMatch ? vMatch.name : (sel.supplierName || ""));
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.sku}] {item.name.slice(0, 50)}... (Current: {item.currentStock} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Inward Quantity (+) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={stockInQty}
                    onChange={(e) => setStockInQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Purchase Rate / Unit (₹)</label>
                  <input
                    type="number"
                    value={stockInRate}
                    onChange={(e) => setStockInRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Vendor / Supplier</label>
                  <select
                    value={stockInVendorId}
                    onChange={(e) => {
                      const vId = e.target.value;
                      setStockInVendorId(vId);
                      const vObj = vendors.find((v) => v.id === vId);
                      if (vObj) setStockInVendor(vObj.name);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="">-- Direct Supplier --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">PO / Ref Number</label>
                  <input
                    type="text"
                    value={stockInRefNo}
                    onChange={(e) => setStockInRefNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Notes / Inward Purpose</label>
                <input
                  type="text"
                  value={stockInNotes}
                  onChange={(e) => setStockInNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              {modalError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold p-3 rounded-xl">
                  {modalError}
                </div>
              )}

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setIsStockInOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2.5 rounded-xl transition-all border border-slate-200 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <i className={`fa-solid ${isProcessing ? "fa-spinner fa-spin" : "fa-arrow-down"}`}></i>
                  <span>{isProcessing ? "Adding..." : "Confirm Stock In (+)"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK OUTWARD SALE MODAL */}
      {isStockOutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => !isProcessing && setIsStockOutOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 border border-slate-200 z-10 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-black text-base border border-purple-200">
                  <i className="fa-solid fa-arrow-up"></i>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Stock Outward / Client Sale</h3>
                  <p className="text-xs text-slate-500">Deduct stock and record customer sale</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isProcessing && setIsStockOutOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStockOutSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Select Product *</label>
                <select
                  value={stockOutItem?.id || ""}
                  onChange={(e) => {
                    const sel = inventoryItems.find((i) => i.id === e.target.value);
                    setStockOutItem(sel || null);
                    if (sel) setStockOutRate(sel.sellingRate.toString());
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.sku}] {item.name.slice(0, 50)}... (Available: {item.currentStock} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Sale Quantity (-) *
                    {stockOutItem && (
                      <span className="text-[10px] text-slate-500 font-normal ml-1">
                        (Max: {stockOutItem.currentStock})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={stockOutItem ? stockOutItem.currentStock : undefined}
                    value={stockOutQty}
                    onChange={(e) => setStockOutQty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Selling Rate / Unit (₹)</label>
                  <input
                    type="number"
                    value={stockOutRate}
                    onChange={(e) => setStockOutRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Customer / Client Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={stockOutCustomer}
                    onChange={(e) => setStockOutCustomer(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Invoice / Challan #</label>
                  <input
                    type="text"
                    value={stockOutInvoiceNo}
                    onChange={(e) => setStockOutInvoiceNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Customer Phone / Contact</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={stockOutCustomerPhone}
                  onChange={(e) => setStockOutCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Remarks / Project Details</label>
                <input
                  type="text"
                  placeholder="e.g. Commercial showroom ventilation installation order"
                  value={stockOutNotes}
                  onChange={(e) => setStockOutNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              {modalError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold p-3 rounded-xl">
                  {modalError}
                </div>
              )}

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setIsStockOutOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2.5 rounded-xl transition-all border border-slate-200 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <i className={`fa-solid ${isProcessing ? "fa-spinner fa-spin" : "fa-arrow-up"}`}></i>
                  <span>{isProcessing ? "Deducting..." : "Confirm Stock Out (-)"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

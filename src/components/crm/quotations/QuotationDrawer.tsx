"use client";

import React, { useState, useEffect } from "react";
import {
  Quotation,
  QuotationItem,
  InventoryItem,
  VINTEX_AIR_COMPANY_DETAILS,
  numberToIndianWords,
  saveQuotation,
} from "@/lib/firebase";

interface QuotationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  editingQuotation: Quotation | null;
  inventoryItems: InventoryItem[];
  prefilledClient?: {
    leadId?: string;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  onSuccess: (saved: Quotation) => void;
}

export function QuotationDrawer({
  isOpen,
  onClose,
  editingQuotation,
  inventoryItems,
  prefilledClient,
  onSuccess,
}: QuotationDrawerProps) {
  const [quotationNo, setQuotationNo] = useState("");
  const [quotationDate, setQuotationDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientMobile, setClientMobile] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("Maharashtra");
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [deductStock, setDeductStock] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingQuotation) {
      setQuotationNo(editingQuotation.quotationNo);
      setQuotationDate(editingQuotation.quotationDate);
      setClientName(editingQuotation.clientName);
      setClientMobile(editingQuotation.clientMobile);
      setClientEmail(editingQuotation.clientEmail || "");
      setClientAddress(editingQuotation.clientAddress || "");
      setPlaceOfSupply(editingQuotation.placeOfSupply || "Maharashtra");
      setItems(editingQuotation.items || []);
      setDeductStock(editingQuotation.isStockDeducted || false);
      setNotes(editingQuotation.notes || "");
    } else {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const yyyy = now.getFullYear();

      setQuotationNo(String(Math.floor(100 + Math.random() * 900)));
      setQuotationDate(`${dd}/${mm}/${yyyy}`);
      setClientName(prefilledClient?.name || "");
      setClientMobile(prefilledClient?.phone || "");
      setClientEmail(prefilledClient?.email || "");
      setClientAddress(prefilledClient?.address || "");
      setPlaceOfSupply("Maharashtra");
      setDeductStock(false);
      setNotes("Supply and installation of industrial ventilation system");

      if (inventoryItems.length > 0) {
        const p1 = inventoryItems[0];
        const tax1 = Math.round((p1.sellingRate * (p1.gstRate / 100)) * 100) / 100;
        setItems([
          {
            id: `item_${Date.now()}_1`,
            itemId: p1.id,
            sku: p1.sku,
            name: p1.name,
            hsnCode: p1.hsnCode || "84796000",
            qty: 1,
            unit: p1.unit,
            rate: p1.sellingRate,
            gstRate: p1.gstRate,
            taxAmount: tax1,
            amount: p1.sellingRate + tax1,
          },
        ]);
      } else {
        setItems([]);
      }
    }
    setError("");
  }, [editingQuotation, prefilledClient, inventoryItems, isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const defaultProduct = inventoryItems[0];
    const rate = defaultProduct ? defaultProduct.sellingRate : 65000;
    const gst = defaultProduct ? defaultProduct.gstRate : 18;
    const tax = Math.round((rate * (gst / 100)) * 100) / 100;

    const newItem: QuotationItem = {
      id: `item_${Date.now()}_${items.length + 1}`,
      itemId: defaultProduct?.id || "",
      sku: defaultProduct?.sku || "VA16-U30",
      name: defaultProduct?.name || "( VA16- U30 ) EVAPORATIVE AIR COOLER, 30000 CMH",
      hsnCode: defaultProduct?.hsnCode || "84796000",
      qty: 1,
      unit: defaultProduct?.unit || "PCS",
      rate,
      gstRate: gst,
      taxAmount: tax,
      amount: rate + tax,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectProduct = (index: number, productId: string) => {
    const prod = inventoryItems.find((p) => p.id === productId);
    if (!prod) return;

    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;
        const rate = prod.sellingRate;
        const gst = prod.gstRate;
        const tax = Math.round((rate * it.qty * (gst / 100)) * 100) / 100;
        return {
          ...it,
          itemId: prod.id,
          sku: prod.sku,
          name: prod.name,
          hsnCode: prod.hsnCode,
          unit: prod.unit,
          rate,
          gstRate: gst,
          taxAmount: tax,
          amount: Math.round((rate * it.qty + tax) * 100) / 100,
        };
      })
    );
  };

  const handleUpdateItemField = (index: number, field: keyof QuotationItem, value: any) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;
        const updated = { ...it, [field]: value };
        const qty = Number(field === "qty" ? value : it.qty) || 1;
        const rate = Number(field === "rate" ? value : it.rate) || 0;
        const gst = Number(field === "gstRate" ? value : it.gstRate) || 0;
        const tax = Math.round((rate * qty * (gst / 100)) * 100) / 100;
        updated.taxAmount = tax;
        updated.amount = Math.round((rate * qty + tax) * 100) / 100;
        return updated;
      })
    );
  };

  const calculateTotals = () => {
    const taxable = items.reduce((acc, it) => acc + (it.qty * it.rate), 0);
    const taxTotal = items.reduce((acc, it) => acc + it.taxAmount, 0);
    const grandTotal = Math.round((taxable + taxTotal) * 100) / 100;
    const cgst = Math.round((taxTotal / 2) * 100) / 100;
    const sgst = Math.round((taxTotal / 2) * 100) / 100;
    return { taxable, taxTotal, grandTotal, cgst, sgst };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotationNo.trim() || !clientName.trim() || !clientMobile.trim()) {
      setError("Please provide Quotation #, Client Name, and Client Mobile.");
      return;
    }
    if (items.length === 0) {
      setError("Please add at least one line item to the quotation.");
      return;
    }

    const { taxable, taxTotal, grandTotal, cgst, sgst } = calculateTotals();
    setIsSaving(true);
    setError("");

    try {
      const qPayload = {
        quotationNo: quotationNo.trim(),
        quotationDate: quotationDate.trim(),
        leadId: editingQuotation?.leadId || prefilledClient?.leadId || `lead_${Date.now()}`,
        campaign: "vintexair",
        clientName: clientName.trim(),
        clientMobile: clientMobile.trim(),
        clientEmail: clientEmail.trim(),
        clientAddress: clientAddress.trim(),
        placeOfSupply: placeOfSupply.trim(),
        shipToName: clientName.trim(),
        shipToAddress: clientAddress.trim(),
        items,
        subtotal: grandTotal,
        taxableAmount: taxable,
        cgstRate: 9,
        cgstAmount: cgst,
        sgstRate: 9,
        sgstAmount: sgst,
        igstRate: 0,
        igstAmount: 0,
        totalTax: taxTotal,
        totalAmount: grandTotal,
        totalAmountInWords: numberToIndianWords(grandTotal),
        bankDetails: VINTEX_AIR_COMPANY_DETAILS.bankDetails,
        status: editingQuotation?.status || "sent",
        notes: notes.trim(),
      };

      const savedQ = await saveQuotation(
        {
          id: editingQuotation?.id,
          ...qPayload,
        },
        { shouldDeductStock: deductStock }
      );

      onSuccess(savedQ);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save quotation.");
    } finally {
      setIsSaving(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end font-sans animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={() => !isSaving && onClose()} />

      <div className="relative w-full sm:max-w-2xl bg-white h-full shadow-2xl flex flex-col font-sans border-l border-slate-200 z-10 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-purple-200 bg-purple-50/70 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-600 text-white font-bold text-sm sm:text-base flex items-center justify-center shadow-sm flex-shrink-0">
              <i className="fa-solid fa-file-invoice text-sm"></i>
            </div>
            <div className="truncate">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-tight">
                {editingQuotation ? `Edit Quotation #${editingQuotation.quotationNo}` : "Create Vintex Air Official Quotation"}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                Commercial estimate with items, HSN, 18% GST, bank details, and stock sync
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !isSaving && onClose()}
            className="w-8 h-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* 1. Client Details */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-user-tag text-purple-600 text-xs"></i>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    1. Client / Customer & Estimate Info
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Quotation No. *</label>
                  <input
                    type="text"
                    required
                    value={quotationNo}
                    onChange={(e) => setQuotationNo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Quotation Date *</label>
                  <input
                    type="text"
                    required
                    value={quotationDate}
                    onChange={(e) => setQuotationDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Bakery"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Client Mobile *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9325212498"
                    value={clientMobile}
                    onChange={(e) => setClientMobile(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Billing & Delivery Address</label>
                <input
                  type="text"
                  placeholder="e.g. Madani Chowk Indira Nagar Aurangabad, Maharashtra, 431001"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Client Email</label>
                  <input
                    type="email"
                    placeholder="e.g. royalbakery@gmail.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Place of Supply</label>
                  <input
                    type="text"
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Line Items */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-boxes-stacked text-purple-600 text-xs"></i>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    2. Line Items & Products ({items.length})
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-extrabold text-[11px] px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <i className="fa-solid fa-plus text-[10px]"></i>
                  <span>+ Add Line Item</span>
                </button>
              </div>

              {items.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  No items added. Click &quot;+ Add Line Item&quot; to pick from inventory catalog.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-500">
                          Item #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                          title="Remove Item"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>

                      {/* Pick Product Dropdown */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 block">Choose from Catalog:</label>
                        <select
                          value={item.itemId || ""}
                          onChange={(e) => handleSelectProduct(idx, e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                        >
                          <option value="">-- Or enter custom specification below --</option>
                          {inventoryItems.map((p) => (
                            <option key={p.id} value={p.id}>
                              [{p.sku}] {p.name.slice(0, 60)}... - ₹{p.sellingRate.toLocaleString("en-IN")}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 block">Item Name & Technical Specs *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ( VA16- U30 ) EVAPORATIVE AIR COOLER, 30000 CMH"
                          value={item.name}
                          onChange={(e) => handleUpdateItemField(idx, "name", e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 block">HSN Code</label>
                          <input
                            type="text"
                            value={item.hsnCode}
                            onChange={(e) => handleUpdateItemField(idx, "hsnCode", e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 block">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleUpdateItemField(idx, "qty", e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 block">Unit</label>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleUpdateItemField(idx, "unit", e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 block">Rate (₹)</label>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleUpdateItemField(idx, "rate", e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-mono font-bold text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200 font-mono">
                        <span className="text-[10px] text-slate-500 font-sans">
                          Tax ({item.gstRate}%): <strong>+₹{item.taxAmount.toLocaleString("en-IN")}</strong>
                        </span>
                        <span className="font-black text-emerald-700">
                          Total: ₹{item.amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Stock Sync & Summary */}
            <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="deductStockOpt"
                  checked={deductStock}
                  onChange={(e) => setDeductStock(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="deductStockOpt" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Deduct physical inventory stock immediately upon confirming this quotation
                </label>
              </div>

              <div className="bg-white border border-purple-100 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Subtotal:</span>
                  <span className="font-mono font-bold">₹{totals.taxable.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CGST (9%):</span>
                  <span className="font-mono font-bold">₹{totals.cgst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST (9%):</span>
                  <span className="font-mono font-bold">₹{totals.sgst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-base font-black text-emerald-700 pt-1.5 border-t border-slate-200">
                  <span>Grand Total Amount:</span>
                  <span className="font-mono">₹{totals.grandTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="text-[11px] text-slate-500 italic pt-1">
                  In words: {numberToIndianWords(totals.grandTotal)}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold p-3.5 rounded-2xl flex items-center space-x-2">
                <i className="fa-solid fa-triangle-exclamation text-rose-600 text-sm"></i>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-t border-slate-200 bg-slate-50 flex items-center space-x-3 sticky bottom-0 z-20">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="flex-1 bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs py-2.5 rounded-xl transition-all border border-slate-300 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                  <span>Generating Quotation...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-file-invoice text-xs"></i>
                  <span>{editingQuotation ? "Update Quotation Record" : "Save & View Quotation 🚀"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

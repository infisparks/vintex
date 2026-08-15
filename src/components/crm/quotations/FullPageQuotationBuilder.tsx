"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Quotation,
  QuotationItem,
  InventoryItem,
  LeadData,
  VINTEX_AIR_COMPANY_DETAILS,
  saveQuotation,
  numberToIndianWords,
  getAllLeadsAcrossDates,
  updateLeadAddressAndClientInfo,
} from "@/lib/firebase";

import { openQuotationPdfBlobUrl, generateQuotationPDF } from "@/lib/pdfGenerator";


interface FullPageQuotationBuilderProps {
  isOpen: boolean;
  editingQuotation: Quotation | null;
  inventoryItems: InventoryItem[];
  leads?: LeadData[];
  initialLeadId?: string | null;
  onClose: () => void;
  onSuccess: (savedQuotation: Quotation) => void;
  performedBy?: string;
}

export function FullPageQuotationBuilder({
  isOpen,
  editingQuotation,
  inventoryItems,
  leads = [],
  initialLeadId = null,
  onClose,
  onSuccess,
  performedBy = "Vintex Air Executive",
}: FullPageQuotationBuilderProps) {

  // Leads state for dropdown selector
  const [loadedLeads, setLoadedLeads] = useState<LeadData[]>(leads || []);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    editingQuotation?.leadId || initialLeadId || ""
  );

  // Client Info State
  const [quotationNo, setQuotationNo] = useState("5");
  const [quotationDate, setQuotationDate] = useState(
    new Date().toLocaleDateString("en-GB")
  );
  const [clientName, setClientName] = useState("Royal Bakery");
  const [clientMobile, setClientMobile] = useState("9325212498");
  const [clientEmail, setClientEmail] = useState("royalbakery.aur@gmail.com");
  const [clientAddress, setClientAddress] = useState(
    "Madani Chowk Indira Nagar"
  );
  const [clientCity, setClientCity] = useState("Aurangabad");
  const [clientPincode, setClientPincode] = useState("431001");
  const [placeOfSupply, setPlaceOfSupply] = useState("Maharashtra");
  const [clientGstin, setClientGstin] = useState("");

  // Shipping Info State
  const [isSameShippingAddress, setIsSameShippingAddress] = useState(true);
  const [shipToName, setShipToName] = useState("Royal Bakery");
  const [shipToAddress, setShipToAddress] = useState(
    "Madani Chowk Indira Nagar, Aurangabad, Maharashtra, 431001"
  );

  // Line Items State
  const [items, setItems] = useState<QuotationItem[]>([]);

  // Item Selector helper state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [customItemName, setCustomItemName] = useState("");
  const [customHsn, setCustomHsn] = useState("84796000");
  const [customQty, setCustomQty] = useState("1");
  const [customUnit, setCustomUnit] = useState("PCS");
  const [customRate, setCustomRate] = useState("65000");
  const [customTax, setCustomTax] = useState("18");

  // Options State
  const [deductStock, setDeductStock] = useState(false);
  const [notes, setNotes] = useState(
    "Supply and commissioning of industrial evaporative cooler system."
  );
  const [isInterState, setIsInterState] = useState(false); // false = CGST+SGST (9%+9%), true = IGST (18%)

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [error, setError] = useState("");
  const [zoomScale, setZoomScale] = useState(100);

  const previewRef = useRef<HTMLDivElement>(null);

  // Fetch leads if not passed
  useEffect(() => {
    if (leads && leads.length > 0) {
      setLoadedLeads(leads);
    } else {
      getAllLeadsAcrossDates().then((fetched) => {
        if (fetched && fetched.length > 0) {
          setLoadedLeads(fetched);
        }
      }).catch(console.error);
    }
  }, [leads]);

  // Disable mouse wheel value change on all number inputs
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        target.tagName === "INPUT" &&
        (target as HTMLInputElement).type === "number"
      ) {
        (target as HTMLInputElement).blur();
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  // Lead selection helper
  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    if (!leadId) return;

    const lead = loadedLeads.find((l) => l.id === leadId);
    if (lead) {
      const name = lead.companyName || lead.fullName || "";
      const phone = lead.phone || "";
      const email = lead.email || "";
      const addr = lead.clientAddress || lead.address || lead.survey?.address || "";
      const city = lead.city || lead.survey?.city || "";
      const state = lead.placeOfSupply || lead.state || lead.survey?.state || "Maharashtra";
      const pin = lead.pincode || "";
      const gstin = lead.gstin || "";
      const shipAddr = lead.shippingAddress || addr;

      setClientName(name);
      setClientMobile(phone);
      setClientEmail(email);
      setClientAddress(addr);
      setClientCity(city);
      setClientPincode(pin);
      setPlaceOfSupply(state);
      setClientGstin(gstin);
      setShipToName(name);
      setShipToAddress(shipAddr);
      setIsSameShippingAddress(!lead.shippingAddress || lead.shippingAddress === addr);
    }
  };

  // Initialize form state
  useEffect(() => {
    if (!isOpen) return;

    if (editingQuotation) {
      setQuotationNo(editingQuotation.quotationNo);
      setQuotationDate(editingQuotation.quotationDate);
      setClientName(editingQuotation.clientName || "");
      setClientMobile(editingQuotation.clientMobile || "");
      setClientEmail(editingQuotation.clientEmail || "");
      setClientAddress(editingQuotation.clientAddress || "");
      setPlaceOfSupply(editingQuotation.placeOfSupply || "Maharashtra");
      setShipToName(
        editingQuotation.shipToName || editingQuotation.clientName || ""
      );
      setShipToAddress(
        editingQuotation.shipToAddress || editingQuotation.clientAddress || ""
      );
      setIsSameShippingAddress(
        !editingQuotation.shipToAddress ||
        editingQuotation.shipToAddress === editingQuotation.clientAddress
      );
      setSelectedLeadId(editingQuotation.leadId || "");
      setItems(editingQuotation.items || []);
      setDeductStock(editingQuotation.isStockDeducted || false);
      setNotes(editingQuotation.notes || "");
      setIsInterState(editingQuotation.igstAmount > 0);
    } else if (initialLeadId && loadedLeads.length > 0) {
      handleSelectLead(initialLeadId);
      setQuotationNo(Math.floor(100 + Math.random() * 900).toString());
      setQuotationDate(new Date().toLocaleDateString("en-GB"));
      setDeductStock(false);
      setNotes(
        "Supply and commissioning of industrial evaporative cooler system."
      );
      setIsInterState(false);
    } else if (!editingQuotation && !initialLeadId) {
      // Default to exact user specs matching image if creating fresh
      setQuotationNo(Math.floor(100 + Math.random() * 900).toString());
      setQuotationDate(new Date().toLocaleDateString("en-GB"));
      setClientName("Royal Bakery");
      setClientMobile("9325212498");
      setClientEmail("royalbakery.aur@gmail.com");
      setClientAddress("Madani Chowk Indira Nagar");
      setClientCity("Aurangabad");
      setClientPincode("431001");
      setPlaceOfSupply("Maharashtra");
      setShipToName("Royal Bakery");
      setShipToAddress(
        "Madani Chowk Indira Nagar, Aurangabad, Maharashtra, 431001"
      );
      setIsSameShippingAddress(true);
      setDeductStock(false);
      setNotes(
        "Supply and commissioning of industrial evaporative cooler system."
      );
      setIsInterState(false);

      // Seed with default Vintex Air products from inventory catalog if available
      if (inventoryItems.length >= 2) {
        const item1 = inventoryItems[0];
        const item2 = inventoryItems[1];
        setItems([
          {
            id: "q_item_1",
            itemId: item1.id,
            sku: item1.sku,
            name: item1.name,
            subtext: item1.category,
            hsnCode: item1.hsnCode || "84796000",
            qty: 1,
            unit: item1.unit || "PCS",
            rate: item1.sellingRate,
            gstRate: item1.gstRate || 18,
            taxAmount: Math.round(item1.sellingRate * (item1.gstRate / 100)),
            amount:
              Math.round(item1.sellingRate * (1 + item1.gstRate / 100)),
          },
          {
            id: "q_item_2",
            itemId: item2.id,
            sku: item2.sku,
            name: item2.name,
            subtext: item2.category,
            hsnCode: item2.hsnCode || "84796000",
            qty: 1,
            unit: item2.unit || "PCS",
            rate: item2.sellingRate,
            gstRate: item2.gstRate || 18,
            taxAmount: Math.round(item2.sellingRate * (item2.gstRate / 100)),
            amount:
              Math.round(item2.sellingRate * (1 + item2.gstRate / 100)),
          },
        ]);
      } else {
        setItems([
          {
            id: "q_item_1",
            sku: "VA16-U30",
            name: "( VA16- U30 ) EVAPORATIVE AIR COOLER, 30000 CMH , TOP DISCHARGE, 3 KW 415V, PREMIUM QUALITY MOTOR COPER WINDING , SINGLE SPEED , AXIAL FAN TYPE , 4 SIDE 100 MM THECKNES BEST QUALITY COOLING PADS, SUMMERSIBLE 75W PUMP, AUTO DRAIN & WATER BALL AUTO SYSTEM",
            hsnCode: "84796000",
            qty: 1,
            unit: "PCS",
            rate: 65000,
            gstRate: 18,
            taxAmount: 11700,
            amount: 76700,
          },
        ]);
      }
    }
  }, [isOpen, editingQuotation, inventoryItems]);

  // Realtime Financial Calculations
  const totals = useMemo(() => {
    let taxableAmount = 0;
    let totalTax = 0;

    const calculatedItems = items.map((it) => {
      const q = Math.max(1, Number(it.qty || 1));
      const r = Number(it.rate || 0);
      const taxRate = Number(it.gstRate || 0);
      const baseLine = Math.round(q * r * 100) / 100;
      const taxLine = Math.round((baseLine * (taxRate / 100)) * 100) / 100;
      const lineTotal = Math.round((baseLine + taxLine) * 100) / 100;

      taxableAmount += baseLine;
      totalTax += taxLine;

      return {
        ...it,
        qty: q,
        rate: r,
        taxAmount: taxLine,
        amount: lineTotal,
      };
    });

    const grandTotal = Math.round((taxableAmount + totalTax) * 100) / 100;
    const cgst = isInterState ? 0 : Math.round((totalTax / 2) * 100) / 100;
    const sgst = isInterState ? 0 : Math.round((totalTax / 2) * 100) / 100;
    const igst = isInterState ? Math.round(totalTax * 100) / 100 : 0;

    return {
      calculatedItems,
      taxableAmount,
      totalTax,
      cgst,
      sgst,
      igst,
      grandTotal,
      amountInWords: numberToIndianWords(grandTotal),
    };
  }, [items, isInterState]);

  if (!isOpen) return null;

  // Add selected inventory product
  const handleAddProductFromCatalog = () => {
    if (!selectedProductId) return;
    const found = inventoryItems.find((i) => i.id === selectedProductId);
    if (!found) return;

    const newItem: QuotationItem = {
      id: `q_item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      itemId: found.id,
      sku: found.sku,
      name: found.name,
      subtext: found.category,
      hsnCode: found.hsnCode || "84796000",
      qty: 1,
      unit: found.unit || "PCS",
      rate: found.sellingRate,
      gstRate: found.gstRate || 18,
      taxAmount: Math.round(found.sellingRate * (found.gstRate / 100)),
      amount: Math.round(found.sellingRate * (1 + found.gstRate / 100)),
    };

    setItems((prev) => [...prev, newItem]);
    setSelectedProductId("");
  };

  // Add custom item
  const handleAddCustomItem = () => {
    if (!customItemName.trim()) return;

    const qty = Number(customQty) || 1;
    const rate = Number(customRate) || 0;
    const taxRate = Number(customTax) || 0;
    const taxAmt = Math.round((qty * rate * (taxRate / 100)) * 100) / 100;
    const totalAmt = Math.round((qty * rate + taxAmt) * 100) / 100;

    const newItem: QuotationItem = {
      id: `q_custom_${Date.now()}`,
      sku: `CUSTOM-${Math.floor(100 + Math.random() * 900)}`,
      name: customItemName.trim(),
      hsnCode: customHsn.trim() || "84796000",
      qty,
      unit: customUnit.trim() || "PCS",
      rate,
      gstRate: taxRate,
      taxAmount: taxAmt,
      amount: totalAmt,
    };

    setItems((prev) => [...prev, newItem]);
    setCustomItemName("");
  };

  // Update item field
  const handleUpdateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Formatted Combined Client Address
  const formattedClientAddress = useMemo(() => {
    const addrClean = (clientAddress || "").trim();
    const cityClean = (clientCity || "").trim();
    const stateClean = (placeOfSupply || "").trim();
    const pinClean = (clientPincode || "").trim();

    const parts: string[] = [];
    if (addrClean) parts.push(addrClean);
    if (cityClean && !addrClean.toLowerCase().includes(cityClean.toLowerCase())) {
      parts.push(cityClean);
    }
    if (stateClean && !addrClean.toLowerCase().includes(stateClean.toLowerCase())) {
      parts.push(stateClean);
    }
    if (pinClean && !addrClean.includes(pinClean)) {
      parts.push(pinClean);
    }

    return parts.length > 0 ? parts.join(", ") : "Client Premises";
  }, [clientAddress, clientCity, placeOfSupply, clientPincode]);

  const effectiveShipToName = isSameShippingAddress
    ? (clientName || "Customer Name")
    : (shipToName || clientName || "Customer Name");

  const effectiveShipToAddress = isSameShippingAddress
    ? formattedClientAddress
    : (shipToAddress || formattedClientAddress);

  // Save Quotation
  const handleSaveQuotationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientMobile.trim()) {
      setError("Client Name and Mobile Number are required.");
      return;
    }
    if (items.length === 0) {
      setError("Please add at least 1 product item to the quotation.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const payload: Partial<Quotation> = {
        quotationNo: quotationNo.trim(),
        quotationDate: quotationDate.trim(),
        leadId: selectedLeadId || undefined,
        clientName: clientName.trim(),
        clientMobile: clientMobile.trim(),
        clientEmail: clientEmail.trim(),
        clientAddress: formattedClientAddress,
        placeOfSupply: placeOfSupply.trim() || "Maharashtra",
        shipToName: effectiveShipToName.trim(),
        shipToAddress: effectiveShipToAddress.trim(),
        items: totals.calculatedItems,
        subtotal: totals.grandTotal,
        taxableAmount: totals.taxableAmount,
        cgstRate: isInterState ? 0 : 9,
        cgstAmount: totals.cgst,
        sgstRate: isInterState ? 0 : 9,
        sgstAmount: totals.sgst,
        igstRate: isInterState ? 18 : 0,
        igstAmount: totals.igst,
        totalTax: totals.totalTax,
        totalAmount: totals.grandTotal,
        totalAmountInWords: totals.amountInWords,
        bankDetails: VINTEX_AIR_COMPANY_DETAILS.bankDetails,
        status: editingQuotation?.status || "sent",
        notes: notes.trim(),
      };

      const savedQ = await saveQuotation(
        {
          id: editingQuotation?.id,
          ...payload,
        } as any,
        { shouldDeductStock: deductStock }
      );

      // Persist updated client details to the lead profile in Firebase for future quotations
      if (selectedLeadId) {
        await updateLeadAddressAndClientInfo(
          selectedLeadId,
          undefined,
          {
            fullName: clientName.trim(),
            phone: clientMobile.trim(),
            email: clientEmail.trim(),
            address: formattedClientAddress,
            clientAddress: clientAddress.trim(),
            shippingAddress: effectiveShipToAddress.trim(),
            city: clientCity.trim(),
            state: placeOfSupply.trim(),
            pincode: clientPincode.trim(),
            placeOfSupply: placeOfSupply.trim(),
            gstin: clientGstin.trim(),
          }
        );
      }

      onSuccess(savedQ);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save quotation.");
    } finally {
      setIsSaving(false);
    }
  };

  // Pure Vector High-Definition PDF Download using jsPDF
  const handleDownloadProfessionalPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const qtnObj: Quotation = {
        id: editingQuotation?.id || `QTN_${Date.now()}`,
        quotationNo: quotationNo || "5",
        quotationDate: quotationDate || new Date().toLocaleDateString("en-GB"),
        leadId: selectedLeadId || editingQuotation?.leadId || "",
        campaign: editingQuotation?.campaign || "vintexair",
        clientName: clientName || "Customer Name",
        clientAddress: formattedClientAddress,
        clientMobile: clientMobile || "9325212498",
        clientEmail: clientEmail || "",
        placeOfSupply: placeOfSupply || "Maharashtra",
        shipToName: effectiveShipToName,
        shipToAddress: effectiveShipToAddress,
        items: totals.calculatedItems.map((it, idx) => ({
          id: it.id || `item_${idx}`,
          name: it.name,
          sku: it.sku || "",
          hsnCode: it.hsnCode || "84796000",
          qty: it.qty,
          unit: it.unit || "PCS",
          rate: it.rate,
          gstRate: it.gstRate || 18,
          taxAmount: it.taxAmount,
          amount: it.amount,
        })),
        subtotal: totals.taxableAmount,
        taxableAmount: totals.taxableAmount,
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 18,
        cgstAmount: totals.cgst,
        sgstAmount: totals.sgst,
        igstAmount: totals.igst,
        totalTax: totals.totalTax,
        totalAmount: totals.grandTotal,
        totalAmountInWords: totals.amountInWords,
        bankDetails: VINTEX_AIR_COMPANY_DETAILS.bankDetails,
        status: editingQuotation?.status || "draft",
        isStockDeducted: false,
        notes: notes || "",
        createdBy: performedBy || "Vintex Air Executive",
        createdAt: editingQuotation?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };


      openQuotationPdfBlobUrl(qtnObj);
    } catch (err: any) {
      console.error("PDF Generation Error:", err);
      alert("Failed to generate PDF: " + err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#F5F6F8] font-sans flex flex-col animate-in fade-in duration-200">
      {/* TOP DUAL-PANE CONTROL HEADER */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 text-slate-900 flex items-center justify-between z-20 flex-shrink-0 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
            VA
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <span>{editingQuotation ? `Edit Quotation #${editingQuotation.quotationNo}` : "Create New Quotation & PDF"}</span>
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                Realtime PDF Engine
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Live Split View: Left side PDF updates live as you edit inputs on the right side.
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center space-x-2">
          {/* 1 SINGLE CLEAN PRIMARY ACTION BUTTON */}
          <button
            type="button"
            onClick={handleDownloadProfessionalPDF}
            disabled={isGeneratingPdf}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            title="Open official vector PDF with native print and download controls"
          >
            <i className={`fa-solid ${isGeneratingPdf ? "fa-spinner fa-spin" : "fa-print"}`}></i>
            <span>{isGeneratingPdf ? "Opening PDF..." : "Print / Download PDF"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center text-sm transition-colors cursor-pointer"
            title="Close Builder"
          >
            ✕
          </button>
        </div>
      </div>


      {/* SPLIT SCREEN MAIN CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#F5F6F8]">
        
        {/* ========================================================= */}
        {/* LEFT PANE: REALTIME LIVE PDF VIEWER (PREVIEW)             */}
        {/* ========================================================= */}
        <div className="w-full lg:w-1/2 bg-slate-100/90 border-r border-slate-200 flex flex-col overflow-hidden relative">
          
          {/* PDF Viewer Header Toolbar */}
          <div className="bg-white px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 flex-shrink-0">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <i className="fa-solid fa-eye text-purple-600"></i>
              <span>Live PDF Document Viewer</span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.max(60, z - 10))}
                className="w-5 h-5 rounded hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
                title="Zoom Out"
              >
                -
              </button>
              <span className="text-[10px] font-mono text-purple-700 font-bold px-1">{zoomScale}%</span>
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.min(140, z + 10))}
                className="w-5 h-5 rounded hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
                title="Zoom In"
              >
                +
              </button>
            </div>
          </div>

          {/* PDF Sheet Canvas Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center items-start bg-slate-100/70 custom-scrollbar">
            
            {/* The Actual PDF Document Card matching user's exact uploaded image */}
            <div
              style={{ transform: `scale(${zoomScale / 100})`, transformOrigin: "top center" }}
              className="transition-transform duration-150 w-full max-w-[794px]"
            >
              <div
                id="quotation-realtime-pdf-preview"
                ref={previewRef}
                className="bg-white text-slate-900 font-poppins font-sans p-6 sm:p-10 border border-slate-200 text-[11px] leading-relaxed shadow-lg select-text"
              >

                {/* Top Label */}
                <div className="font-extrabold text-[11px] tracking-wider uppercase text-slate-900 mb-3">
                  QUOTATION
                </div>

                {/* Logo & Header Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex items-center space-x-2 pt-0.5 flex-shrink-0">
                    <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                    <span className="font-black text-xl text-blue-900 tracking-tight">Vintexair</span>
                  </div>

                  <div className="space-y-0.5 text-slate-900">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
                      {VINTEX_AIR_COMPANY_DETAILS.companyName}
                    </h2>
                    <p className="text-slate-700 text-[11px] font-normal leading-tight">
                      {VINTEX_AIR_COMPANY_DETAILS.address}
                    </p>
                    <p className="text-slate-800 text-[11px] font-medium pt-0.5">
                      <strong>Mobile:</strong> {VINTEX_AIR_COMPANY_DETAILS.mobile}
                      <span className="ml-4">
                        <strong>GSTIN:</strong> {VINTEX_AIR_COMPANY_DETAILS.gstin}
                      </span>
                      <span className="ml-4">
                        <strong>PAN Number:</strong> {VINTEX_AIR_COMPANY_DETAILS.panNumber}
                      </span>
                    </p>
                    <p className="text-slate-800 text-[11px] font-medium">
                      <strong>Email:</strong> {VINTEX_AIR_COMPANY_DETAILS.email}
                    </p>
                  </div>
                </div>

                {/* Quotation No. & Quotation Date Bar */}
                <div className="bg-slate-200/90 text-slate-900 font-bold px-4 py-2 rounded-none flex items-center justify-between text-xs my-4 border-t border-b border-slate-300">
                  <span>
                    Quotation No.: <strong className="font-black">{quotationNo || "5"}</strong>
                  </span>
                  <span>
                    Quotation Date: <strong className="font-semibold">{quotationDate || "28/06/2026"}</strong>
                  </span>
                </div>

                {/* BILL TO & SHIP TO Grid */}
                <div className="grid grid-cols-2 gap-8 my-4 text-xs">
                  <div className="space-y-1">
                    <div className="font-extrabold text-slate-900 uppercase text-[11px]">
                      BILL TO
                    </div>
                    <p className="font-bold text-slate-900 text-sm">{clientName || "Customer Name"}</p>
                    <p className="text-slate-700 text-[11px] leading-snug">
                      {formattedClientAddress}
                    </p>
                    <p className="text-slate-800 text-[11px]">
                      <strong>Mobile:</strong> {clientMobile || "9325212498"}
                    </p>
                    {clientEmail && (
                      <p className="text-slate-700 text-[10px]">
                        <strong>Email:</strong> {clientEmail}
                      </p>
                    )}
                    <p className="text-slate-800 text-[11px]">
                      <strong>Place of Supply:</strong> {placeOfSupply || "Maharashtra"}
                    </p>
                    {clientGstin && (
                      <p className="text-slate-800 text-[10px]">
                        <strong>GSTIN:</strong> {clientGstin}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="font-extrabold text-slate-900 uppercase text-[11px]">
                      SHIP TO
                    </div>
                    <p className="font-bold text-slate-900 text-sm">
                      {effectiveShipToName}
                    </p>
                    <p className="text-slate-700 text-[11px] leading-snug">
                      {effectiveShipToAddress}
                    </p>
                    <p className="text-slate-800 text-[11px]">
                      <strong>Mobile:</strong> {clientMobile || "9325212498"}
                    </p>
                  </div>
                </div>

                {/* ITEMS TABLE */}
                <div className="my-5">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-t-2 border-b-2 border-slate-900 text-slate-900 font-extrabold text-[11px] uppercase">
                        <th className="py-2.5 px-1 text-left w-7/12">ITEMS</th>
                        <th className="py-2.5 px-1 text-center">HSN</th>
                        <th className="py-2.5 px-1 text-center">QTY.</th>
                        <th className="py-2.5 px-1 text-right">RATE</th>
                        <th className="py-2.5 px-1 text-right">TAX</th>
                        <th className="py-2.5 px-1 text-right">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {totals.calculatedItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                            No items added yet. Select products from the right pane.
                          </td>
                        </tr>
                      ) : (
                        totals.calculatedItems.map((it, idx) => (
                          <tr key={it.id || idx} className="align-top">
                            <td className="py-3 px-1 pr-4">
                              <p className="font-bold text-slate-900 text-[11px] leading-snug uppercase">
                                {it.name}
                              </p>
                              {it.sku && (
                                <p className="text-[10px] text-slate-500 mt-0.5">{it.sku}</p>
                              )}
                              {it.subtext && (
                                <p className="text-[10px] text-slate-500">{it.subtext}</p>
                              )}
                            </td>
                            <td className="py-3 px-1 text-center font-mono text-[11px] text-slate-700">
                              {it.hsnCode || "84796000"}
                            </td>
                            <td className="py-3 px-1 text-center font-bold text-slate-900">
                              {it.qty} {it.unit || "PCS"}
                            </td>
                            <td className="py-3 px-1 text-right font-mono text-slate-900">
                              {it.rate.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 px-1 text-right font-mono text-slate-700">
                              <div>{it.taxAmount.toLocaleString("en-IN")}</div>
                              <div className="text-[9px] text-slate-400 font-sans">
                                ({it.gstRate || 18}%)
                              </div>
                            </td>
                            <td className="py-3 px-1 text-right font-mono font-bold text-slate-900">
                              {it.amount.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-b-2 border-slate-900 font-extrabold text-xs">
                        <td colSpan={2} className="py-2.5 px-1 uppercase text-slate-900">
                          SUBTOTAL
                        </td>
                        <td className="py-2.5 px-1 text-center text-slate-900">-</td>
                        <td className="py-2.5 px-1 text-right text-slate-900"></td>
                        <td className="py-2.5 px-1 text-right font-mono text-slate-900">
                          ₹ {totals.totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-1 text-right font-mono text-slate-900">
                          ₹ {totals.grandTotal.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* BANK DETAILS & TAX SUMMARY GRID */}
                <div className="grid grid-cols-2 gap-8 my-4 text-xs items-start">
                  {/* Bank Details */}
                  <div className="space-y-1">
                    <div className="font-extrabold text-slate-900 uppercase text-[11px] mb-1">
                      BANK DETAILS
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 text-[11px] text-slate-800 space-y-0.5">
                      <span className="text-slate-600">Name:</span>
                      <span className="col-span-2 font-semibold">
                        {VINTEX_AIR_COMPANY_DETAILS.bankDetails.accountName}
                      </span>

                      <span className="text-slate-600">IFSC Code:</span>
                      <span className="col-span-2 font-mono font-semibold">
                        {VINTEX_AIR_COMPANY_DETAILS.bankDetails.ifscCode}
                      </span>

                      <span className="text-slate-600">Account No:</span>
                      <span className="col-span-2 font-mono font-semibold">
                        {VINTEX_AIR_COMPANY_DETAILS.bankDetails.accountNo}
                      </span>

                      <span className="text-slate-600">Bank:</span>
                      <span className="col-span-2 font-semibold">
                        {VINTEX_AIR_COMPANY_DETAILS.bankDetails.bankName}
                      </span>
                    </div>
                  </div>

                  {/* Tax Breakdown */}
                  <div className="space-y-1.5 text-right">
                    <div className="flex justify-between text-[11px] text-slate-800">
                      <span className="text-slate-700">Taxable Amount</span>
                      <span className="font-mono">
                        ₹ {totals.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {!isInterState ? (
                      <>
                        <div className="flex justify-between text-[11px] text-slate-800">
                          <span className="text-slate-700">CGST @9%</span>
                          <span className="font-mono">
                            ₹ {totals.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-800">
                          <span className="text-slate-700">SGST @9%</span>
                          <span className="font-mono">
                            ₹ {totals.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-[11px] text-slate-800">
                        <span className="text-slate-700">IGST @18%</span>
                        <span className="font-mono">
                          ₹ {totals.igst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t-2 border-slate-900 pt-1.5 mt-2">
                      <span>Total Amount</span>
                      <span className="font-mono text-base">
                        ₹ {totals.grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* PAYMENT DETAILS & TOTAL IN WORDS */}
                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs items-end">
                  {/* Payment Details */}
                  <div className="space-y-1">
                    <div className="font-extrabold text-slate-900 uppercase text-[11px] mb-1">
                      PAYMENT DETAILS
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <p className="text-slate-700">
                        <strong>UPI ID:</strong>{" "}
                        <span className="font-mono font-bold text-slate-900 ml-1">
                          {VINTEX_AIR_COMPANY_DETAILS.bankDetails.upiId}
                        </span>
                      </p>

                      <div className="flex items-center space-x-2 pt-0.5 text-[9px] font-bold text-slate-500">
                        <span className="text-purple-700">PhonePe</span> •{" "}
                        <span className="text-blue-600">GPay</span> •{" "}
                        <span className="text-sky-600">Paytm</span> •{" "}
                        <span className="text-orange-600">UPI</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Amount in Words */}
                  <div className="text-right space-y-1">
                    <div className="font-extrabold text-slate-900 text-[11px]">
                      Total Amount (in words)
                    </div>
                    <div className="font-semibold text-slate-900 text-xs leading-snug">
                      {totals.amountInWords || `${numberToIndianWords(totals.grandTotal)} Rupees`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANE: INTERACTIVE QUOTATION FORM BUILDER           */}
        {/* ========================================================= */}
        <div className="w-full lg:w-1/2 bg-[#F5F6F8] flex flex-col overflow-hidden">
          
          <form onSubmit={handleSaveQuotationSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
              
              {/* 1. CLIENT & BILLING DETAILS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <i className="fa-solid fa-user text-purple-600 text-xs"></i>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      1. Client & Commercial Billing Details
                    </h3>
                  </div>
                  {selectedLeadId && (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <i className="fa-solid fa-link text-[9px]"></i>
                      <span>Linked to Lead</span>
                    </span>
                  )}
                </div>

                {/* CLIENT / LEAD DROPDOWN SELECTOR */}
                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-purple-900 flex items-center space-x-1.5">
                      <i className="fa-solid fa-users text-purple-600 text-xs"></i>
                      <span>Select Client from CRM Leads:</span>
                    </label>
                    {selectedLeadId && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLeadId("");
                          setClientName("");
                          setClientMobile("");
                          setClientEmail("");
                          setClientAddress("");
                          setClientCity("");
                          setClientPincode("");
                          setClientGstin("");
                          setShipToName("");
                          setShipToAddress("");
                        }}
                        className="text-[10px] font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                      >
                        + Switch to Custom Client
                      </button>
                    )}
                  </div>

                  <select
                    value={selectedLeadId}
                    onChange={(e) => handleSelectLead(e.target.value)}
                    className="w-full bg-white border border-purple-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 cursor-pointer shadow-2xs"
                  >
                    <option value="">-- Choose from Leads / Clients ({loadedLeads.length} available) --</option>
                    {loadedLeads.map((l) => (
                      <option key={l.id || l.phone} value={l.id}>
                        {l.fullName || l.companyName || "Unnamed"} • {l.phone} {l.city ? `(${l.city})` : l.email ? `(${l.email})` : ""}
                      </option>
                    ))}
                  </select>

                  {selectedLeadId ? (
                    <p className="text-[10px] text-purple-700 font-medium flex items-center space-x-1 pt-0.5">
                      <i className="fa-solid fa-circle-check text-purple-600 text-[10px]"></i>
                      <span>Client profile loaded. Any address changes will auto-save to this client&apos;s record!</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 font-medium">
                      Select a client above to auto-fill their address & details, or enter new client info below.
                    </p>
                  )}
                </div>

                {/* Estimate Number and Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Estimate No.</label>
                    <input
                      type="text"
                      value={quotationNo}
                      onChange={(e) => setQuotationNo(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-purple-700 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Estimate Date</label>
                    <input
                      type="text"
                      value={quotationDate}
                      onChange={(e) => setQuotationDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>
                </div>

                {/* Client Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Client / Business Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Bakery"
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        if (isSameShippingAddress) setShipToName(e.target.value);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9325212498"
                      value={clientMobile}
                      onChange={(e) => setClientMobile(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. client@example.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>
                </div>

                {/* Enhanced Address Fields */}
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Billing Address (Street / Area / Building) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Opp Salim Sizing, Madani Chowk, Indira Nagar"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">City / District</label>
                      <input
                        type="text"
                        placeholder="e.g. Aurangabad / Malegaon"
                        value={clientCity}
                        onChange={(e) => setClientCity(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Pincode</label>
                      <input
                        type="text"
                        placeholder="e.g. 431001"
                        value={clientPincode}
                        onChange={(e) => setClientPincode(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Client GSTIN (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 27AAAAA0000A1Z5"
                        value={clientGstin}
                        onChange={(e) => setClientGstin(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Place of Supply (State)</label>
                      <input
                        type="text"
                        value={placeOfSupply}
                        onChange={(e) => setPlaceOfSupply(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">GST Mode</label>
                      <button
                        type="button"
                        onClick={() => setIsInterState(!isInterState)}
                        className={`w-full py-2 px-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                          !isInterState
                            ? "bg-purple-50 border-purple-300 text-purple-700"
                            : "bg-amber-50 border-amber-300 text-amber-800"
                        }`}
                      >
                        {!isInterState ? "CGST + SGST (9% + 9%)" : "IGST (18% Inter-state)"}
                      </button>
                    </div>
                  </div>

                  {/* Shipping Address Options */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isSameShippingAddress}
                        onChange={(e) => {
                          setIsSameShippingAddress(e.target.checked);
                          if (e.target.checked) {
                            setShipToName(clientName);
                            setShipToAddress(formattedClientAddress);
                          }
                        }}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-white border-slate-300"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        Shipping Address is same as Billing Address
                      </span>
                    </label>

                    {!isSameShippingAddress && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 animate-in fade-in duration-150">
                        <span className="text-[10px] font-bold text-slate-600 uppercase block">
                          Delivery / Installation Site Address:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Consignee / Site Name"
                            value={shipToName}
                            onChange={(e) => setShipToName(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                          />
                          <input
                            type="text"
                            placeholder="Complete Site Delivery Address"
                            value={shipToAddress}
                            onChange={(e) => setShipToAddress(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. ITEM PICKER & LINE ITEMS TABLE */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <i className="fa-solid fa-boxes-stacked text-purple-600 text-xs"></i>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      2. Product Items & Quantities
                    </h3>
                  </div>
                  <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-bold font-mono">
                    {items.length} items added
                  </span>
                </div>

                {/* Quick Add from Stock Catalog */}
                <div className="flex gap-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600 cursor-pointer"
                  >
                    <option value="">-- Pick from Inventory Catalog --</option>
                    {inventoryItems.map((it) => (
                      <option key={it.id} value={it.id}>
                        [{it.sku}] {it.name.slice(0, 50)}... (₹{it.sellingRate})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddProductFromCatalog}
                    disabled={!selectedProductId}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs disabled:opacity-40 cursor-pointer"
                  >
                    + Add Product
                  </button>
                </div>

                {/* Custom Line Item Builder */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-600 block uppercase">
                    + Or Add Custom Fitting / Ducting Item:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Item Description (e.g. GI DUCTING 24 GAGE)"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      className="sm:col-span-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600"
                    />
                    <input
                      type="number"
                      placeholder="Rate ₹"
                      value={customRate}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => setCustomRate(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomItem}
                      disabled={!customItemName.trim()}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs py-1.5 rounded-lg transition-all disabled:opacity-40 cursor-pointer"
                    >
                      + Add Custom
                    </button>
                  </div>
                </div>

                {/* Added Line Items List */}
                <div className="space-y-2 pt-1">
                  {items.map((it, idx) => (
                    <div
                      key={it.id || idx}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <input
                          type="text"
                          value={it.name}
                          onChange={(e) => handleUpdateItem(it.id, "name", e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="text-rose-500 hover:text-rose-700 p-1 font-bold text-xs cursor-pointer"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-slate-700">
                        <div>
                          <label className="text-[9px] text-slate-500 font-bold block">HSN</label>
                          <input
                            type="text"
                            value={it.hsnCode}
                            onChange={(e) => handleUpdateItem(it.id, "hsnCode", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:border-purple-600"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-500 font-bold block">QTY</label>
                          <input
                            type="number"
                            min="1"
                            value={it.qty}
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) => handleUpdateItem(it.id, "qty", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-purple-700 focus:outline-none focus:border-purple-600"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-500 font-bold block">RATE (₹)</label>
                          <input
                            type="number"
                            value={it.rate}
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) => handleUpdateItem(it.id, "rate", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-emerald-700 focus:outline-none focus:border-purple-600"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] text-slate-500 font-bold block">GST (%)</label>
                          <input
                            type="number"
                            value={it.gstRate}
                            onWheel={(e) => e.currentTarget.blur()}
                            onChange={(e) => handleUpdateItem(it.id, "gstRate", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono text-slate-800 focus:outline-none focus:border-purple-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. STOCK SYNC & REMARKS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                  <i className="fa-solid fa-gear text-purple-600 text-xs"></i>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    3. Inventory Stock Sync & Terms
                  </h3>
                </div>

                <label className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deductStock}
                    onChange={(e) => setDeductStock(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-white border-slate-300"
                  />
                  <div className="text-xs">
                    <span className="font-extrabold text-slate-900 block">
                      ⚡ Automatically Deduct Stock from Warehouse Inventory
                    </span>
                    <span className="text-[10px] text-slate-500">
                      When enabled, saving this quotation will automatically record sale transactions in the stock ledger.
                    </span>
                  </div>
                </label>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Terms & Remarks</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3.5 rounded-2xl flex items-center space-x-2">
                  <i className="fa-solid fa-triangle-exclamation text-rose-500 text-sm"></i>
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Save & Action Footer Bar */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center space-x-3 flex-shrink-0">
              <button
                type="button"
                disabled={isSaving}
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-3 rounded-xl border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                    <span>Saving Estimate...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check text-xs"></i>
                    <span>{editingQuotation ? "Update Estimate 🚀" : "Save Quotation 🚀"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Quotation, VINTEX_AIR_COMPANY_DETAILS, numberToIndianWords } from "@/lib/firebase";
import { openQuotationPdfBlobUrl, generateQuotationPDF } from "@/lib/pdfGenerator";


interface QuotationInvoicePrintModalProps {
  quotation: Quotation | null;
  isOpen: boolean;
  onClose: () => void;
  onShareWhatsApp?: (q: Quotation) => void;
}

export function QuotationInvoicePrintModal({
  quotation,
  isOpen,
  onClose,
  onShareWhatsApp,
}: QuotationInvoicePrintModalProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen || !quotation) return null;

  const handlePrintOrDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      openQuotationPdfBlobUrl(quotation);
    } catch (err: any) {
      console.error("PDF Open Error:", err);
      // Fallback
      generateQuotationPDF(quotation);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isMaharashtra = (quotation.placeOfSupply || "Maharashtra")
    .toLowerCase()
    .includes("maharashtra");

  const amountInWords =
    quotation.totalAmountInWords ||
    `${numberToIndianWords(quotation.totalAmount)} Rupees`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="fixed inset-0 print:hidden" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-4 sm:p-8 space-y-6 border border-slate-200 z-10 font-sans animate-in fade-in zoom-in duration-150 print:p-0 print:shadow-none print:border-none print:w-full print:max-w-none">
        {/* Top Action Toolbar (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-300">
              Quotation #{quotation.quotationNo}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Vintex Air Official Estimate Preview
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* 1 SINGLE CLEAN PRIMARY ACTION BUTTON */}
            <button
              type="button"
              onClick={handlePrintOrDownloadPdf}
              disabled={isGeneratingPdf}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              title="Open Official HD Vector PDF with Print & Download controls"
            >
              <i
                className={`fa-solid ${
                  isGeneratingPdf ? "fa-spinner fa-spin" : "fa-print"
                } text-xs`}
              ></i>
              <span>{isGeneratingPdf ? "Opening PDF..." : "Print / Download PDF"}</span>
            </button>

            {onShareWhatsApp && (
              <button
                type="button"
                onClick={() => onShareWhatsApp(quotation)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <i className="fa-brands fa-whatsapp text-sm"></i>
                <span>WhatsApp</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 font-bold flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>


        {/* 100% PRECISE DOCUMENT FORMAT MATCHING USER REFERENCE SCREENSHOT */}
        <div
          id="quotation-print-area"
          className="bg-white text-slate-900 font-poppins font-sans p-6 sm:p-10 border border-slate-200 text-[11px] leading-relaxed select-text"
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
              Quotation No.: <strong className="font-black">{quotation.quotationNo}</strong>
            </span>
            <span>
              Quotation Date: <strong className="font-semibold">{quotation.quotationDate}</strong>
            </span>
          </div>

          {/* BILL TO & SHIP TO Grid */}
          <div className="grid grid-cols-2 gap-8 my-4 text-xs">
            <div className="space-y-1">
              <div className="font-extrabold text-slate-900 uppercase text-[11px]">
                BILL TO
              </div>
              <p className="font-bold text-slate-900 text-sm">{quotation.clientName}</p>
              <p className="text-slate-700 text-[11px] leading-snug">
                {quotation.clientAddress || "Client Premises"}
              </p>
              <p className="text-slate-800 text-[11px]">
                <strong>Mobile:</strong> {quotation.clientMobile}
              </p>
              <p className="text-slate-800 text-[11px]">
                <strong>Place of Supply:</strong> {quotation.placeOfSupply || "Maharashtra"}
              </p>
            </div>

            <div className="space-y-1">
              <div className="font-extrabold text-slate-900 uppercase text-[11px]">
                SHIP TO
              </div>
              <p className="font-bold text-slate-900 text-sm">
                {quotation.shipToName || quotation.clientName}
              </p>
              <p className="text-slate-700 text-[11px] leading-snug">
                {quotation.shipToAddress || quotation.clientAddress || "Client Installation Site"}
              </p>
              <p className="text-slate-800 text-[11px]">
                <strong>Mobile:</strong> {quotation.clientMobile}
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
                {quotation.items.map((it, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="py-3 px-1 pr-4">
                      <p className="font-bold text-slate-900 text-[11px] leading-snug uppercase">
                        {it.name}
                      </p>
                      {it.sku && (
                        <p className="text-[10px] text-slate-500 mt-0.5">{it.sku}</p>
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
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-b-2 border-slate-900 font-extrabold text-xs">
                  <td colSpan={2} className="py-2.5 px-1 uppercase text-slate-900">
                    SUBTOTAL
                  </td>
                  <td className="py-2.5 px-1 text-center text-slate-900">-</td>
                  <td className="py-2.5 px-1 text-right text-slate-900"></td>
                  <td className="py-2.5 px-1 text-right font-mono text-slate-900">
                    ₹ {quotation.totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-1 text-right font-mono text-slate-900">
                    ₹ {quotation.totalAmount.toLocaleString("en-IN")}
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
                  ₹ {quotation.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {isMaharashtra ? (
                <>
                  <div className="flex justify-between text-[11px] text-slate-800">
                    <span className="text-slate-700">CGST @9%</span>
                    <span className="font-mono">
                      ₹ {quotation.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-800">
                    <span className="text-slate-700">SGST @9%</span>
                    <span className="font-mono">
                      ₹ {quotation.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-[11px] text-slate-800">
                  <span className="text-slate-700">IGST @18%</span>
                  <span className="font-mono">
                    ₹ {quotation.totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t-2 border-slate-900 pt-1.5 mt-2">
                <span>Total Amount</span>
                <span className="font-mono text-base">
                  ₹ {quotation.totalAmount.toLocaleString("en-IN")}
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
                {amountInWords}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

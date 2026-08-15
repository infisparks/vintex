import jsPDF from "jspdf";
import { Quotation, VINTEX_AIR_COMPANY_DETAILS, numberToIndianWords } from "./firebase";

/**
 * High-Precision Vector jsPDF Builder for Vintex Air Commercial Quotations.
 * Uses exact baseline offsets to ensure 100% clean clearance between all text and lines.
 */
export function createQuotationJsPDF(quotation: Quotation): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 12;
  const pageWidth = 210;
  const contentWidth = pageWidth - margin * 2; // 186 mm
  const rightX = pageWidth - margin; // 198 mm
  let y = 14;

  // Color Palette
  const black = [15, 23, 42]; // #0f172a
  const gray = [100, 116, 139]; // #64748b
  const lightGray = [241, 245, 249]; // #f1f5f9
  const borderGray = [203, 213, 225]; // #cbd5e1

  // 1. Top Document Label
  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(black[0], black[1], black[2]);
  doc.text("QUOTATION", margin, y);
  y += 6;

  // 2. Company Brand Header & Details
  // Brand Logo Mark
  doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(37, 99, 235); // Blue-600
  doc.text("Vintexair", margin, y + 4);

  // Company Name
  doc.setFont("helvetica", "bold").setFontSize(20).setTextColor(black[0], black[1], black[2]);
  doc.text(VINTEX_AIR_COMPANY_DETAILS.companyName, margin + 34, y + 2);

  y += 7;
  // Address
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(gray[0], gray[1], gray[2]);
  const addressLines = doc.splitTextToSize(VINTEX_AIR_COMPANY_DETAILS.address, 135);
  doc.text(addressLines, margin + 34, y);
  y += addressLines.length * 3.8;

  // Contact info line
  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(black[0], black[1], black[2]);
  doc.text(
    `Mobile: ${VINTEX_AIR_COMPANY_DETAILS.mobile}    GSTIN: ${VINTEX_AIR_COMPANY_DETAILS.gstin}    PAN Number: ${VINTEX_AIR_COMPANY_DETAILS.panNumber}`,
    margin + 34,
    y
  );
  y += 4;
  doc.text(`Email: ${VINTEX_AIR_COMPANY_DETAILS.email}`, margin + 34, y);
  y += 8;

  // 3. Quotation No. & Date Banner Bar
  const barHeight = 9;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(margin, y, contentWidth, barHeight, "F");

  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]).setLineWidth(0.4);
  doc.line(margin, y, rightX, y); // Top border
  doc.line(margin, y + barHeight, rightX, y + barHeight); // Bottom border

  // Text placed 6mm below top border line (centered vertically)
  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(black[0], black[1], black[2]);
  doc.text(`Quotation No.: ${quotation.quotationNo}`, margin + 4, y + 6);
  doc.text(`Quotation Date: ${quotation.quotationDate}`, rightX - 4, y + 6, { align: "right" });
  y += barHeight + 8;

  // 4. BILL TO & SHIP TO Grid
  const col1X = margin;
  const col2X = margin + contentWidth / 2 + 4;
  const billShipY = y;

  // BILL TO Column
  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(black[0], black[1], black[2]);
  doc.text("BILL TO", col1X, y);
  y += 5;

  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(black[0], black[1], black[2]);
  doc.text(quotation.clientName, col1X, y);
  y += 4.5;

  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(gray[0], gray[1], gray[2]);
  const clientAddrLines = doc.splitTextToSize(quotation.clientAddress || "Client Premises", 85);
  doc.text(clientAddrLines, col1X, y);
  y += clientAddrLines.length * 3.8;

  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(black[0], black[1], black[2]);
  doc.text(`Mobile: ${quotation.clientMobile}`, col1X, y);
  y += 4;
  doc.text(`Place of Supply: ${quotation.placeOfSupply || "Maharashtra"}`, col1X, y);

  // SHIP TO Column
  let shipY = billShipY;
  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(black[0], black[1], black[2]);
  doc.text("SHIP TO", col2X, shipY);
  shipY += 5;

  doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(black[0], black[1], black[2]);
  doc.text(quotation.shipToName || quotation.clientName, col2X, shipY);
  shipY += 4.5;

  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(gray[0], gray[1], gray[2]);
  const shipAddrLines = doc.splitTextToSize(
    quotation.shipToAddress || quotation.clientAddress || "Client Installation Site",
    85
  );
  doc.text(shipAddrLines, col2X, shipY);
  shipY += shipAddrLines.length * 3.8;

  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(black[0], black[1], black[2]);
  doc.text(`Mobile: ${quotation.clientMobile}`, col2X, shipY);

  y = Math.max(y, shipY) + 9;

  // 5. ITEMS TABLE
  const colItemsX = margin;
  const colHsnX = margin + 102;
  const colQtyX = margin + 120;
  const colRateX = margin + 142;
  const colTaxX = margin + 164;
  const colAmountX = rightX;

  // Table Top Header Line
  doc.setDrawColor(black[0], black[1], black[2]).setLineWidth(0.7);
  doc.line(margin, y, rightX, y);

  // Header text 5mm below top line
  doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(black[0], black[1], black[2]);
  doc.text("ITEMS", colItemsX, y + 5);
  doc.text("HSN", colHsnX, y + 5, { align: "center" });
  doc.text("QTY.", colQtyX, y + 5, { align: "center" });
  doc.text("RATE", colRateX, y + 5, { align: "right" });
  doc.text("TAX", colTaxX, y + 5, { align: "right" });
  doc.text("AMOUNT", colAmountX, y + 5, { align: "right" });

  // Table Header Bottom Line 8mm below top line
  doc.line(margin, y + 8, rightX, y + 8);
  y += 8; // Top of row 1 boundary is at header bottom line

  // Table Item Rows
  for (const item of quotation.items) {
    // Each row starts with top boundary at `y`. First line of text is placed at `y + 5` (2mm clear below top line)
    const textBaselineY = y + 5;

    // Item Name / Specification (Multi-line)
    doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(black[0], black[1], black[2]);
    const nameLines = doc.splitTextToSize(item.name.toUpperCase(), 94);
    doc.text(nameLines, colItemsX, textBaselineY);
    let itemContentHeight = (nameLines.length - 1) * 4;

    if (item.sku) {
      doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(gray[0], gray[1], gray[2]);
      doc.text(item.sku, colItemsX, textBaselineY + itemContentHeight + 4);
      itemContentHeight += 4;
    }

    // HSN
    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(black[0], black[1], black[2]);
    doc.text(item.hsnCode || "84796000", colHsnX, textBaselineY, { align: "center" });

    // QTY
    doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(black[0], black[1], black[2]);
    doc.text(`${item.qty} ${item.unit || "PCS"}`, colQtyX, textBaselineY, { align: "center" });

    // RATE
    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(black[0], black[1], black[2]);
    doc.text(item.rate.toLocaleString("en-IN"), colRateX, textBaselineY, { align: "right" });

    // TAX
    doc.text(item.taxAmount.toLocaleString("en-IN"), colTaxX, textBaselineY, { align: "right" });
    doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(gray[0], gray[1], gray[2]);
    doc.text(`(${item.gstRate || 18}%)`, colTaxX, textBaselineY + 3.8, { align: "right" });

    // AMOUNT
    doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(black[0], black[1], black[2]);
    doc.text(item.amount.toLocaleString("en-IN"), colAmountX, textBaselineY, { align: "right" });

    // Row Bottom Line position = textBaselineY + itemContentHeight + 4.5mm padding
    const rowBottomY = textBaselineY + Math.max(itemContentHeight, 2) + 4.5;

    // Draw Light row separator line
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]).setLineWidth(0.2);
    doc.line(margin, rowBottomY, rightX, rowBottomY);

    y = rowBottomY; // Next row starts at this line!
  }

  // 6. SUBTOTAL ROW
  doc.setDrawColor(black[0], black[1], black[2]).setLineWidth(0.7);
  doc.line(margin, y, rightX, y); // Top subtotal line

  const subtotalBaselineY = y + 5.5; // 2.5mm below top line

  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(black[0], black[1], black[2]);
  doc.text("SUBTOTAL", margin, subtotalBaselineY);
  doc.text("-", colQtyX, subtotalBaselineY, { align: "center" });

  doc.text(
    `Rs. ${quotation.totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    colTaxX,
    subtotalBaselineY,
    { align: "right" }
  );
  doc.text(
    `Rs. ${quotation.totalAmount.toLocaleString("en-IN")}`,
    colAmountX,
    subtotalBaselineY,
    { align: "right" }
  );

  const subtotalBottomY = y + 9; // Bottom subtotal line
  doc.line(margin, subtotalBottomY, rightX, subtotalBottomY);
  y = subtotalBottomY + 12;

  // 7. BANK DETAILS & TAX SUMMARY GRID
  const bankY = y;

  // Left: BANK DETAILS
  doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(black[0], black[1], black[2]);
  doc.text("BANK DETAILS", margin, y);
  y += 5;

  const bankInfo = [
    ["Name:", VINTEX_AIR_COMPANY_DETAILS.bankDetails.accountName],
    ["IFSC Code:", VINTEX_AIR_COMPANY_DETAILS.bankDetails.ifscCode],
    ["Account No:", VINTEX_AIR_COMPANY_DETAILS.bankDetails.accountNo],
    ["Bank:", VINTEX_AIR_COMPANY_DETAILS.bankDetails.bankName],
  ];

  for (const [label, val] of bankInfo) {
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(gray[0], gray[1], gray[2]);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "bold").setFontSize(8).setTextColor(black[0], black[1], black[2]);
    doc.text(val, margin + 22, y);
    y += 4.2;
  }

  // Right: Tax Summary
  let taxY = bankY;
  const isMaharashtra = (quotation.placeOfSupply || "Maharashtra")
    .toLowerCase()
    .includes("maharashtra");

  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(black[0], black[1], black[2]);
  doc.text("Taxable Amount", margin + 105, taxY);
  doc.text(
    `Rs. ${quotation.taxableAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    rightX,
    taxY,
    { align: "right" }
  );
  taxY += 5;

  if (isMaharashtra) {
    doc.text("CGST @9%", margin + 105, taxY);
    doc.text(
      `Rs. ${quotation.cgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      rightX,
      taxY,
      { align: "right" }
    );
    taxY += 5;

    doc.text("SGST @9%", margin + 105, taxY);
    doc.text(
      `Rs. ${quotation.sgstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      rightX,
      taxY,
      { align: "right" }
    );
    taxY += 5;
  } else {
    doc.text("IGST @18%", margin + 105, taxY);
    doc.text(
      `Rs. ${quotation.totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      rightX,
      taxY,
      { align: "right" }
    );
    taxY += 5;
  }

  // Total Amount Line (6.5mm padding above text)
  doc.setDrawColor(black[0], black[1], black[2]).setLineWidth(0.7);
  doc.line(margin + 98, taxY, rightX, taxY);
  taxY += 6.5;

  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(black[0], black[1], black[2]);
  doc.text("Total Amount", margin + 105, taxY);
  doc.text(`Rs. ${quotation.totalAmount.toLocaleString("en-IN")}`, rightX, taxY, {
    align: "right",
  });

  y = Math.max(y, taxY) + 9;

  // 8. PAYMENT DETAILS & TOTAL AMOUNT IN WORDS
  const bottomY = y;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]).setLineWidth(0.3);
  doc.line(margin, bottomY, rightX, bottomY);

  // Left: PAYMENT DETAILS
  doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(black[0], black[1], black[2]);
  doc.text("PAYMENT DETAILS", margin, bottomY + 6);

  doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(black[0], black[1], black[2]);
  doc.text("UPI ID:", margin, bottomY + 11);
  doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(black[0], black[1], black[2]);
  doc.text(VINTEX_AIR_COMPANY_DETAILS.bankDetails.upiId, margin, bottomY + 15.5);

  doc.setFont("helvetica", "normal").setFontSize(7.5).setTextColor(gray[0], gray[1], gray[2]);
  doc.text("PhonePe • GPay • Paytm • UPI", margin, bottomY + 20);

  // Right: TOTAL AMOUNT IN WORDS
  const amountWords =
    quotation.totalAmountInWords ||
    `${numberToIndianWords(quotation.totalAmount)} Rupees`;

  doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(black[0], black[1], black[2]);
  doc.text("Total Amount (in words)", rightX, bottomY + 6, { align: "right" });

  doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(black[0], black[1], black[2]);
  const wordLines = doc.splitTextToSize(amountWords, 85);
  doc.text(wordLines, rightX, bottomY + 11, { align: "right" });

  return doc;
}

/**
 * Generates and downloads the PDF directly.
 */
export async function generateQuotationPDF(quotation: Quotation): Promise<void> {
  const doc = createQuotationJsPDF(quotation);
  const safeName = (quotation.clientName || "Customer").replace(/\s+/g, "_");
  doc.save(`Vintex_Air_Quotation_${quotation.quotationNo}_${safeName}.pdf`);
}

/**
 * Generates the PDF Blob URL and opens it in a new window/tab.
 * Gives user native browser PDF controls (Print, Download, Zoom, Fit-Page).
 */
export function openQuotationPdfBlobUrl(quotation: Quotation): void {
  const doc = createQuotationJsPDF(quotation);
  const blob = doc.output("blob");
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank");
}

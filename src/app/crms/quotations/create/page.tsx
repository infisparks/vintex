"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Quotation,
  InventoryItem,
  LeadData,
  getQuotations,
  getInventoryItems,
  getAllLeadsAcrossDates,
} from "@/lib/firebase";
import { FullPageQuotationBuilder } from "@/components/crm/quotations/FullPageQuotationBuilder";

function QuotationBuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const quotationId = searchParams.get("id");
  const leadId = searchParams.get("leadId");

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [qList, iList, leadsList] = await Promise.all([
          getQuotations(),
          getInventoryItems(),
          getAllLeadsAcrossDates(),
        ]);
        setInventoryItems(iList);
        setLeads(leadsList);

        if (quotationId) {
          const match = qList.find((q) => q.id === quotationId);
          if (match) setQuotation(match);
        }
      } catch (err) {
        console.error("Failed to load quotation data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [quotationId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] text-slate-900 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <i className="fa-solid fa-spinner fa-spin text-3xl text-purple-600"></i>
          <p className="text-xs text-slate-600 font-bold">
            Loading Realtime Quotation PDF Builder...
          </p>
        </div>
      </div>
    );
  }

  return (
    <FullPageQuotationBuilder
      isOpen={true}
      editingQuotation={quotation}
      inventoryItems={inventoryItems}
      leads={leads}
      initialLeadId={leadId}
      onClose={() => router.push("/crms/quotations")}
      onSuccess={(savedQ) => {
        router.push("/crms/quotations");
      }}
    />
  );
}

export default function CreateQuotationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F6F8] text-slate-900 flex items-center justify-center font-sans">
          <i className="fa-solid fa-spinner fa-spin text-3xl text-purple-600"></i>
        </div>
      }
    >
      <QuotationBuilderContent />
    </Suspense>
  );
}

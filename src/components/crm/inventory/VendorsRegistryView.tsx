"use client";

import React, { useState, useMemo } from "react";
import { Vendor, saveVendor, deleteVendor } from "@/lib/firebase";

interface VendorsRegistryViewProps {
  vendors: Vendor[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export function VendorsRegistryView({
  vendors,
  isLoading,
  onRefresh,
}: VendorsRegistryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Malegaon");
  const [state, setState] = useState("Maharashtra");
  const [pincode, setPincode] = useState("423203");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredVendors = useMemo(() => {
    if (!searchQuery.trim()) return vendors;
    const q = searchQuery.toLowerCase();
    return vendors.filter((v) => {
      const vName = (v.name || "").toLowerCase();
      const vGst = (v.gstin || "").toLowerCase();
      const vCity = (v.city || "").toLowerCase();
      const vPhone = (v.phone || "").toLowerCase();
      const vContact = (v.contactPerson || "").toLowerCase();
      return (
        vName.includes(q) ||
        vGst.includes(q) ||
        vCity.includes(q) ||
        vPhone.includes(q) ||
        vContact.includes(q)
      );
    });
  }, [vendors, searchQuery]);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setName("");
    setContactPerson("");
    setPhone("");
    setEmail("");
    setGstin("");
    setPanNumber("");
    setAddress("Industrial Area, MIDC");
    setCity("Malegaon");
    setState("Maharashtra");
    setPincode("423203");
    setBankName("Axis Bank, Malegaon");
    setAccountNumber("");
    setIfscCode("UTIB0001240");
    setNotes("");
    setError("");
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (v: Vendor) => {
    setEditingVendor(v);
    setName(v.name);
    setContactPerson(v.contactPerson || "");
    setPhone(v.phone || "");
    setEmail(v.email || "");
    setGstin(v.gstin || "");
    setPanNumber(v.pan || "");
    setAddress(v.address || "");
    setCity(v.city || "Malegaon");
    setState(v.state || "Maharashtra");
    setPincode(v.pincode || "423203");
    setBankName(v.bankName || "");
    setAccountNumber(v.bankAccountNo || "");
    setIfscCode(v.bankIfsc || "");
    setNotes(v.notes || "");
    setError("");
    setIsDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Vendor name and phone number are required.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await saveVendor({
        id: editingVendor?.id,
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim(),
        gstin: gstin.trim().toUpperCase(),
        pan: panNumber.trim().toUpperCase(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        bankName: bankName.trim(),
        bankAccountNo: accountNumber.trim(),
        bankIfsc: ifscCode.trim().toUpperCase(),
        notes: notes.trim(),
      });

      setIsDrawerOpen(false);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to save vendor.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!vendorToDelete) return;
    setIsDeleting(true);
    try {
      const success = await deleteVendor(vendorToDelete.id);
      if (success) {
        setVendorToDelete(null);
        await onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* FILTER & ACTIONS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search vendor by name, GSTIN, city, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl text-xs font-medium text-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
            title="Refresh Vendors"
          >
            <i className={`fa-solid fa-arrows-rotate ${isLoading ? "fa-spin" : ""}`}></i>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>+ Register New Vendor</span>
          </button>
        </div>
      </div>

      {/* VENDORS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800 font-sans">
            <thead className="bg-slate-50 text-slate-600 font-black border-b border-slate-200 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Vendor / Company</th>
                <th className="px-4 py-3">Contact Person & Phone</th>
                <th className="px-4 py-3">GSTIN / PAN</th>
                <th className="px-4 py-3">City & Location</th>
                <th className="px-4 py-3">Bank Details</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <i className="fa-solid fa-spinner fa-spin text-lg text-indigo-600 mb-2 block"></i>
                    <span>Loading vendor registry...</span>
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-400">
                    <i className="fa-solid fa-industry text-3xl mb-2 text-slate-300 block"></i>
                    <p className="font-bold text-slate-600 text-sm">No Vendors Registered</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery
                        ? "No vendors match your search query."
                        : "Click '+ Register New Vendor' to add supplier accounts."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="font-extrabold text-slate-900 text-xs truncate">{v.name}</p>
                      {v.email && <p className="text-[11px] text-slate-500 truncate">{v.email}</p>}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{v.contactPerson || "Commercial Sales"}</p>
                      <p className="text-[11px] font-mono text-indigo-700 font-bold">{v.phone}</p>
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px]">
                      {v.gstin ? (
                        <p className="font-bold text-slate-800 uppercase">{v.gstin}</p>
                      ) : (
                        <span className="text-slate-400">GST Exempt</span>
                      )}
                      {v.pan && <p className="text-[10px] text-slate-500 uppercase">{v.pan}</p>}
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-700">
                      <p className="font-bold text-slate-900">{v.city || "Malegaon"}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{v.address}</p>
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                      {v.bankName ? (
                        <div>
                          <p className="font-bold text-slate-800">{v.bankName}</p>
                          <p className="text-[10px]">{v.bankAccountNo} ({v.bankIfsc})</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(v)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                          title="Edit Vendor"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>

                        <button
                          type="button"
                          onClick={() => setVendorToDelete(v)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                          title="Delete Vendor"
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

      {/* VENDOR REGISTRATION DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end font-sans animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => !isSaving && setIsDrawerOpen(false)} />

          <div className="relative w-full sm:max-w-xl bg-white h-full shadow-2xl flex flex-col font-sans border-l border-slate-200 z-10 overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center space-x-3 truncate">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm sm:text-base flex items-center justify-center shadow-sm flex-shrink-0">
                  <i className="fa-solid fa-industry text-sm"></i>
                </div>
                <div className="truncate">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-tight">
                    {editingVendor ? `Edit Vendor: ${editingVendor.name}` : "Register New Vendor / Supplier"}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    Vendor profile, GSTIN, PAN, and Bank Accounts for inward procurement
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isSaving && setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {/* 1. Basic Vendor Info */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                    <i className="fa-solid fa-building text-indigo-600 text-xs"></i>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      1. Vendor Company & Contact
                    </h4>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Vendor / Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jindal Steel & Sheets Ltd."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Contact Person</label>
                      <input
                        type="text"
                        placeholder="e.g. Rajesh Sharma"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. sales@vendor.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">GSTIN</label>
                      <input
                        type="text"
                        placeholder="e.g. 27AAACJ1234F1Z5"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none transition-all placeholder:text-slate-400 uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">PAN Number</label>
                    <input
                      type="text"
                      placeholder="e.g. AAACJ1234F"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none transition-all uppercase"
                    />
                  </div>
                </div>

                {/* 2. Address */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                    <i className="fa-solid fa-location-dot text-indigo-600 text-xs"></i>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      2. Address & Place of Business
                    </h4>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. Industrial Area, Plot 42, MIDC"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">City</label>
                      <input
                        type="text"
                        placeholder="Malegaon"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">State</label>
                      <input
                        type="text"
                        placeholder="Maharashtra"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 block">Pincode</label>
                      <input
                        type="text"
                        placeholder="423203"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Bank Details */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                  <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
                    <i className="fa-solid fa-building-columns text-indigo-600 text-xs"></i>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      3. Bank Details for Procurement Payment
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g. State Bank of India, Malegaon"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Account Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 308912345678"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SBIN0000423"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none uppercase"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold p-3.5 rounded-2xl flex items-center space-x-2">
                    <i className="fa-solid fa-triangle-exclamation text-rose-600 text-sm"></i>
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-t border-slate-200 bg-slate-50 flex items-center space-x-3 sticky bottom-0 z-20">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs py-2.5 rounded-xl transition-all border border-slate-300 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                      <span>Saving Vendor...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check text-xs"></i>
                      <span>{editingVendor ? "Update Vendor Record" : "Register Vendor 🚀"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {vendorToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => !isDeleting && setVendorToDelete(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4 border border-slate-200 z-10 font-sans">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center text-xl mx-auto">
              <i className="fa-solid fa-industry"></i>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Delete Vendor Record?</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete <strong className="text-slate-900 font-extrabold">{vendorToDelete.name}</strong> from your vendor registry?
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setVendorToDelete(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2.5 rounded-xl transition-all border border-slate-200 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <i className={`fa-solid fa-trash-can ${isDeleting ? "fa-spin" : ""}`}></i>
                <span>{isDeleting ? "Deleting..." : "Yes, Delete Vendor"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

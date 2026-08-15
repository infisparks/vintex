"use client";

import React, { useState, useMemo } from "react";
import {
  InventoryItem,
  Vendor,
  VINTEX_INVENTORY_CATEGORIES,
  VINTEX_INVENTORY_UNITS,
  saveInventoryItem,
  deleteInventoryItem,
} from "@/lib/firebase";

interface ProductsCatalogViewProps {
  products: InventoryItem[];
  vendors: Vendor[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onOpenStockIn?: (item: InventoryItem) => void;
  onOpenStockOut?: (item: InventoryItem) => void;
}

export function ProductsCatalogView({
  products,
  vendors,
  isLoading,
  onRefresh,
  onOpenStockIn,
  onOpenStockOut,
}: ProductsCatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null);

  const [productToDelete, setProductToDelete] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formSku, setFormSku] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState(VINTEX_INVENTORY_CATEGORIES[0]);
  const [formHsnCode, setFormHsnCode] = useState("84796000");
  const [formUnit, setFormUnit] = useState(VINTEX_INVENTORY_UNITS[0]);
  const [formCurrentStock, setFormCurrentStock] = useState("0");
  const [formMinStockAlert, setFormMinStockAlert] = useState("5");
  const [formSellingRate, setFormSellingRate] = useState("");
  const [formPurchaseRate, setFormPurchaseRate] = useState("");
  const [formGstRate, setFormGstRate] = useState("18");
  const [formVendorId, setFormVendorId] = useState("");
  const [formSupplier, setFormSupplier] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (stockStatusFilter !== "all" && p.status !== stockStatusFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const sku = (p.sku || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        const hsn = (p.hsnCode || "").toLowerCase();
        const supplier = (p.supplierName || "").toLowerCase();
        return sku.includes(query) || name.includes(query) || hsn.includes(query) || supplier.includes(query);
      }
      return true;
    });
  }, [products, searchQuery, categoryFilter, stockStatusFilter]);

  const handleOpenAddDrawer = () => {
    setEditingProduct(null);
    setFormSku(`VA-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormName("");
    setFormCategory(VINTEX_INVENTORY_CATEGORIES[0]);
    setFormDescription("");
    setFormHsnCode("84796000");
    setFormUnit("PCS");
    setFormCurrentStock("5");
    setFormMinStockAlert("2");
    setFormPurchaseRate("50000");
    setFormSellingRate("65000");
    setFormGstRate("18");
    const defaultVendor = vendors.length > 0 ? vendors[0] : null;
    setFormVendorId(defaultVendor ? defaultVendor.id : "");
    setFormSupplier(defaultVendor ? defaultVendor.name : "Direct Supplier");
    setFormLocation("Main Plant - Malegaon");
    setFormError("");
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (product: InventoryItem) => {
    setEditingProduct(product);
    setFormSku(product.sku);
    setFormName(product.name);
    setFormCategory(product.category || VINTEX_INVENTORY_CATEGORIES[0]);
    setFormDescription(product.fullDescription || "");
    setFormHsnCode(product.hsnCode || "84796000");
    setFormUnit(product.unit || "PCS");
    setFormCurrentStock(product.currentStock.toString());
    setFormMinStockAlert(product.minStockAlert.toString());
    setFormPurchaseRate(product.purchaseRate.toString());
    setFormSellingRate(product.sellingRate.toString());
    setFormGstRate(product.gstRate.toString());
    setFormVendorId(product.vendorId || "");
    setFormSupplier(product.supplierName || product.vendorName || "");
    setFormLocation(product.warehouseLocation || "Main Plant - Malegaon");
    setFormError("");
    setIsDrawerOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSku.trim() || !formName.trim() || !formSellingRate) {
      setFormError("SKU code, Product Name, and Selling Rate are strictly required.");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const selectedVendor = vendors.find((v) => v.id === formVendorId);

      await saveInventoryItem({
        id: editingProduct?.id,
        sku: formSku.trim().toUpperCase(),
        name: formName.trim(),
        fullDescription: formDescription.trim(),
        category: formCategory,
        hsnCode: formHsnCode.trim(),
        unit: formUnit,
        currentStock: Number(formCurrentStock) || 0,
        minStockAlert: Number(formMinStockAlert) || 0,
        purchaseRate: Number(formPurchaseRate) || 0,
        sellingRate: Number(formSellingRate) || 0,
        gstRate: Number(formGstRate) || 18,
        supplierName: selectedVendor ? selectedVendor.name : formSupplier.trim(),
        vendorName: selectedVendor ? selectedVendor.name : formSupplier.trim(),
        vendorId: formVendorId || undefined,
        warehouseLocation: formLocation.trim(),
      });

      setIsDrawerOpen(false);
      await onRefresh();
    } catch (err: any) {
      setFormError(err.message || "Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const success = await deleteInventoryItem(productToDelete.id);
      if (success) {
        setProductToDelete(null);
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
      {/* FILTER & ACTION TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-auto flex-1 flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input
              type="text"
              placeholder="Search by SKU, item name, HSN, vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl text-xs font-medium text-slate-900 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="all">📦 All Categories</option>
            {VINTEX_INVENTORY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Stock Status Filter */}
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
          >
            <option value="all">📊 All Stock Levels</option>
            <option value="in_stock">✅ In Stock</option>
            <option value="low_stock">⚠️ Low Stock Alert</option>
            <option value="out_of_stock">❌ Out of Stock</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="w-full md:w-auto flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs transition-colors cursor-pointer"
            title="Refresh Products"
          >
            <i className={`fa-solid fa-arrows-rotate ${isLoading ? "fa-spin" : ""}`}></i>
          </button>

          <button
            type="button"
            onClick={handleOpenAddDrawer}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <i className="fa-solid fa-plus text-[10px]"></i>
            <span>+ Register New Product</span>
          </button>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800 font-sans">
            <thead className="bg-slate-50 text-slate-600 font-black border-b border-slate-200 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Product SKU & Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">HSN Code</th>
                <th className="px-4 py-3 text-right">Selling Rate</th>
                <th className="px-4 py-3 text-right">GST %</th>
                <th className="px-4 py-3 text-center">On-Hand Stock</th>
                <th className="px-4 py-3">Linked Vendor</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    <i className="fa-solid fa-spinner fa-spin text-lg text-indigo-600 mb-2 block"></i>
                    <span>Loading products catalog...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400">
                    <i className="fa-solid fa-boxes-stacked text-3xl mb-2 text-slate-300 block"></i>
                    <p className="font-bold text-slate-600 text-sm">No Products Found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery
                        ? "No products match your search."
                        : "Click '+ Register New Product' to add items to catalog."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 max-w-[280px]">
                      <div className="flex items-start space-x-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-black text-[10px] border border-indigo-200 uppercase mt-0.5">
                          {p.sku}
                        </span>
                        <div className="truncate">
                          <p className="font-extrabold text-slate-900 text-xs truncate leading-snug">{p.name}</p>
                          {p.warehouseLocation && (
                            <span className="text-[10px] text-slate-400 font-medium">📍 {p.warehouseLocation}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {p.category}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 font-bold">
                      {p.hsnCode || "84796000"}
                    </td>

                    <td className="px-4 py-3 font-mono font-black text-slate-900 text-right">
                      ₹{p.sellingRate.toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-600 text-right">
                      {p.gstRate}%
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        <span className="font-mono font-black text-slate-900 text-xs">
                          {p.currentStock} {p.unit}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p.status === "in_stock"
                              ? "bg-emerald-500"
                              : p.status === "low_stock"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                        />
                      </div>
                    </td>

                    <td className="px-4 py-3 max-w-[160px] truncate text-slate-700 text-xs font-medium">
                      🏭 {p.supplierName || "Vintex Direct"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {onOpenStockIn && (
                          <button
                            type="button"
                            onClick={() => onOpenStockIn(p)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                            title="Inward Stock (+)"
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>
                        )}

                        {onOpenStockOut && (
                          <button
                            type="button"
                            onClick={() => onOpenStockOut(p)}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                            title="Outward Sale (-)"
                          >
                            <i className="fa-solid fa-minus"></i>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditDrawer(p)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>

                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                          title="Delete Product"
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

      {/* REGISTER / EDIT PRODUCT SLIDE-OVER DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end font-sans animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => !isSaving && setIsDrawerOpen(false)} />

          <div className="relative w-full sm:max-w-xl bg-white h-full shadow-2xl flex flex-col font-sans border-l border-slate-200 z-10 overflow-hidden animate-in slide-in-from-right duration-200">
            <div className="px-4 py-3.5 sm:px-5 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center space-x-3 truncate">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm sm:text-base flex items-center justify-center shadow-sm flex-shrink-0">
                  <i className="fa-solid fa-boxes-stacked text-sm"></i>
                </div>
                <div className="truncate">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-tight">
                    {editingProduct ? `Edit Product: ${editingProduct.sku}` : "Register New Vintex Product"}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    Master catalog SKU, technical specifications, and vendor linking
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

            <form onSubmit={handleSaveProduct} className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {/* 1. Identification */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                    <i className="fa-solid fa-barcode text-indigo-600 text-xs"></i>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      1. Product Identification
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        SKU Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. VA16-U30"
                        value={formSku}
                        onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none transition-all uppercase"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">HSN / SAC Code</label>
                      <input
                        type="text"
                        placeholder="e.g. 84796000"
                        value={formHsnCode}
                        onChange={(e) => setFormHsnCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Product Name & Full Technical Specs <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. ( VA16- U30 ) EVAPORATIVE AIR COOLER, 30000 CMH , TOP DISCHARGE, 3 KW 415V"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl p-3 text-xs font-bold text-slate-900 focus:outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Category</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
                      >
                        {VINTEX_INVENTORY_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Unit of Measurement</label>
                      <select
                        value={formUnit}
                        onChange={(e) => setFormUnit(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
                      >
                        {VINTEX_INVENTORY_UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. Stock & Vendor */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                    <i className="fa-solid fa-industry text-indigo-600 text-xs"></i>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      2. Supplier & Location
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Linked Vendor</label>
                      <select
                        value={formVendorId}
                        onChange={(e) => {
                          const vId = e.target.value;
                          setFormVendorId(vId);
                          const vObj = vendors.find((v) => v.id === vId);
                          if (vObj) setFormSupplier(vObj.name);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer"
                      >
                        <option value="">-- Direct Vintex Manufacturing --</option>
                        {vendors.map((v) => (
                          <option key={v.id} value={v.id}>
                            🏭 {v.name} ({v.city || "Malegaon"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Warehouse Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Plant Warehouse - Bay A1"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Initial Stock</label>
                      <input
                        type="number"
                        value={formCurrentStock}
                        onChange={(e) => setFormCurrentStock(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Min Stock Alert</label>
                      <input
                        type="number"
                        value={formMinStockAlert}
                        onChange={(e) => setFormMinStockAlert(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Pricing & GST */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                  <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2">
                    <i className="fa-solid fa-calculator text-indigo-600 text-xs"></i>
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      3. Pricing & GST Calculation
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">
                        Base Selling Rate (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 65000"
                        value={formSellingRate}
                        onChange={(e) => setFormSellingRate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">GST Rate %</label>
                      <select
                        value={formGstRate}
                        onChange={(e) => setFormGstRate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        <option value="18">18% GST (Standard)</option>
                        <option value="12">12% GST</option>
                        <option value="28">28% GST</option>
                        <option value="5">5% GST</option>
                        <option value="0">0% (Tax Exempt)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Purchase Cost (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 50000"
                        value={formPurchaseRate}
                        onChange={(e) => setFormPurchaseRate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1 text-emerald-950 text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold text-emerald-800">Base Price:</span>
                      <span className="font-mono font-bold">₹{Number(formSellingRate || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-emerald-800">+ GST ({formGstRate}%):</span>
                      <span className="font-mono font-bold">
                        ₹{Math.round(((Number(formSellingRate) || 0) * (Number(formGstRate) / 100)) * 100 / 100).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between font-black text-emerald-900 pt-1 border-t border-emerald-200">
                      <span>Total Selling Price:</span>
                      <span className="font-mono text-emerald-700">
                        ₹{(
                          (Number(formSellingRate) || 0) +
                          Math.round(((Number(formSellingRate) || 0) * (Number(formGstRate) / 100)) * 100 / 100)
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold p-3.5 rounded-2xl flex items-center space-x-2">
                    <i className="fa-solid fa-triangle-exclamation text-rose-600 text-sm"></i>
                    <span>{formError}</span>
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
                      <span>Saving to Inventory...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check text-xs"></i>
                      <span>{editingProduct ? "Update Product Record" : "Save & Add to Catalog 🚀"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => !isDeleting && setProductToDelete(null)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4 border border-slate-200 z-10 font-sans animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center text-xl mx-auto">
              <i className="fa-solid fa-trash-can"></i>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Delete Product from Catalog?</h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete <strong className="font-mono text-purple-900 font-extrabold">[{productToDelete.sku}] {productToDelete.name}</strong>?
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2.5 rounded-xl transition-all border border-slate-200 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteProduct}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <i className={`fa-solid fa-trash-can ${isDeleting ? "fa-spin" : ""}`}></i>
                <span>{isDeleting ? "Deleting..." : "Yes, Delete Product"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// src/features/stock/components/StockFilters.tsx
import { Search, Plus, Download, Filter } from "lucide-react";
import type { StockFiltersState, StockStatusFilter } from "../types";

interface StockFiltersProps {
  filters: StockFiltersState;
  onSearchChange: (val: string) => void;
  onCategoryChange: (cat: string) => void;
  onStatusChange: (status: StockStatusFilter) => void;
  categories: string[];
  onOpenNewProductModal: () => void;
  onExportCsv: () => void;
}

export function StockFilters({
  filters,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  categories,
  onOpenNewProductModal,
  onExportCsv
}: StockFiltersProps) {
  const statusTabs: { id: StockStatusFilter; label: string }[] = [
    { id: "all", label: "Tous" },
    { id: "in_stock", label: "En Stock" },
    { id: "low_stock", label: "Stock Bas" },
    { id: "out_of_stock", label: "Rupture" },
    { id: "expiring_soon", label: "Périme Bientôt" }
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      
      {/* Ligne 1 : Recherche + Catégorie + Boutons d'action */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Champ de recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher par nom, DCI ou code-barres..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-none transition-all"
            />
          </div>

          {/* Sélecteur de catégorie */}
          <div className="relative w-full sm:w-56">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <select
              value={filters.category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="Tous">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onExportCsv}
            title="Exporter l'inventaire en CSV / Excel"
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs active:scale-98"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">Exporter CSV</span>
          </button>

          <button
            onClick={onOpenNewProductModal}
            className="px-5 py-2.5 rounded-xl bg-[#2720ff] hover:bg-[#1f19cc] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-[#2720ff]/20 active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Médicament</span>
          </button>
        </div>

      </div>

      {/* Ligne 2 : Onglets de statut de stock */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
        {statusTabs.map((tab) => {
          const isActive = filters.status === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onStatusChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100/70 hover:bg-slate-100 text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

    </div>
  );
}

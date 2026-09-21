// src/features/stock/components/StockKpiBanner.tsx
import { Package, AlertTriangle, AlertCircle, TrendingUp } from "lucide-react";
import type { StockKpis } from "../types";

export function StockKpiBanner({ kpis }: { kpis: StockKpis }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      
      {/* 1. Total Références & Boîtes */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#2720ff] flex items-center justify-center shrink-0">
          <Package className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Références Actives</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-2xl font-black text-slate-900">{kpis.totalReferences}</h3>
            <span className="text-xs text-slate-500 font-semibold">({kpis.totalUnits.toLocaleString()} boîtes)</span>
          </div>
        </div>
      </div>

      {/* 2. Valeur Marchande du Stock */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Valeur Vente Estimée</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-2xl font-black text-slate-900">{kpis.totalValueSelling.toLocaleString()}</h3>
            <span className="text-xs font-bold text-slate-700">FCFA</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Coût achat : {kpis.totalValuePurchase.toLocaleString()} FCFA
          </p>
        </div>
      </div>

      {/* 3. Alertes Ruptures & Stocks Bas */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Stocks Critiques</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-2xl font-black text-slate-900">
              {kpis.outOfStockCount + kpis.lowStockCount}
            </h3>
            <span className="text-xs font-semibold text-slate-500">produits</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            <span className="text-red-600 font-bold">{kpis.outOfStockCount} en rupture</span> • {kpis.lowStockCount} bas
          </p>
        </div>
      </div>

      {/* 4. Alertes Péremptions Imminentes (< 3 mois) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Péremption &lt; 3 Mois</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className={`text-2xl font-black ${kpis.expiringCount > 0 ? "text-red-600" : "text-slate-900"}`}>
              {kpis.expiringCount}
            </h3>
            <span className="text-xs font-semibold text-slate-500">lots à écouler</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Priorité déstockage FEFO</p>
        </div>
      </div>

    </div>
  );
}

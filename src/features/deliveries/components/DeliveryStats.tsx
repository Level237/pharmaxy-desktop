// src/features/deliveries/components/DeliveryStats.tsx
import { Truck, Building2, Package } from "lucide-react";
import type { DeliveryKpis } from "../types";

export function DeliveryStats({ stats }: { stats: DeliveryKpis }) {
    return (
        <div className="space-y-4">
            {/* Carte Principale : Livraisons du Mois */}
            <div className="bg-[#2720ff] p-6 rounded-[28px] text-white relative overflow-hidden shadow-lg shadow-[#2720ff]/20">
                <div className="relative z-10">
                    <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <Truck className="h-4 w-4" />
                        Approvisionnements du Mois
                    </p>

                    <div className="flex items-baseline gap-2 mb-4">
                        <h3 className="text-4xl font-black tracking-tight">{stats.monthlyDeliveriesCount}</h3>
                        <span className="text-xs font-semibold text-white/80">
                            {stats.monthlyDeliveriesCount > 1 ? "bons de livraison" : "bon de livraison"}
                        </span>
                    </div>

                    <div className="pt-3 border-t border-white/20 space-y-0.5">
                        <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wider">Valeur Totale Achetée</p>
                        <p className="text-2xl font-black tracking-tight">
                            {stats.monthlyTotalValue.toLocaleString()} <span className="text-sm font-bold text-white/80">FCFA</span>
                        </p>
                    </div>
                </div>

                {/* Icône décorative en arrière-plan */}
                <div className="absolute -right-3 -bottom-3 opacity-15 pointer-events-none">
                    <Truck className="h-36 w-36 rotate-[-12deg]" />
                </div>
            </div>

            {/* Cartes Métriques Secondaires */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2720ff] flex items-center justify-center mb-2">
                        <Building2 className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Répartiteurs</span>
                    <p className="text-lg font-black text-slate-900 mt-0.5">
                        {stats.activeSuppliersCount} <span className="text-xs font-medium text-slate-500">actifs</span>
                    </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                        <Package className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Articles Livrés</span>
                    <p className="text-lg font-black text-slate-900 mt-0.5">
                        {stats.totalProductsSupplied} <span className="text-xs font-medium text-slate-500">références</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

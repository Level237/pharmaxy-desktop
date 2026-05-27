import { Truck } from "lucide-react";
import type { DeliveryStats as StatsType } from "../types";

export function DeliveryStats({ stats }: { stats: StatsType }) {
  return (
    <div className="bg-[#3B82F6] p-8 rounded-[32px] text-white relative overflow-hidden">
      <div className="relative z-10">
        <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-6">Livraisons du mois</p>

        <div className="flex items-end gap-3 mb-6">
          <h3 className="text-5xl font-black">{stats.monthlyDeliveries}</h3>
          <span className="bg-white/20 px-2 py-1 rounded-lg text-xs font-bold mb-1">
            +{stats.percentageChange}%
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-white/70 text-sm">Total valeur:</p>
          <p className="text-2xl font-bold">{stats.totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
        </div>
      </div>

      {/* Decorative Truck Icon */}
      <div className="absolute -right-4 -bottom-4 opacity-10">
        <Truck className="h-48 w-48 rotate-[-15deg]" />
      </div>
    </div>
  );
}

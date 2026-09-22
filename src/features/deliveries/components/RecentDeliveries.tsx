// src/features/deliveries/components/RecentDeliveries.tsx
import { History } from "lucide-react";
import type { DeliverySummary } from "../types";

export function RecentDeliveries({ 
    deliveries, 
    onViewDetail 
}: { 
    deliveries: DeliverySummary[];
    onViewDetail?: (id: number) => void;
}) {
    const recent = deliveries.slice(0, 5);

    if (recent.length === 0) {
        return (
            <div className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-sm text-center">
                <History className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Aucune réception récente</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-[28px] border border-slate-200/80 shadow-sm flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <History className="h-4 w-4 text-[#2720ff]" />
                    <span>Derniers Bons Reçus</span>
                </h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {recent.length} récents
                </span>
            </div>

            <div className="space-y-3">
                {recent.map((d) => (
                    <div
                        key={d.id}
                        onClick={() => onViewDetail?.(d.id)}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/60 hover:border-blue-200 transition-all cursor-pointer group flex items-center justify-between"
                    >
                        <div className="space-y-1">
                            <p className="font-bold text-xs text-slate-900 group-hover:text-[#2720ff] transition-colors">
                                {d.supplier_name}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                <span className="font-mono">{d.invoice_number}</span>
                                <span>•</span>
                                <span>{new Date(d.delivery_date).toLocaleDateString('fr-FR')}</span>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="text-xs font-black text-slate-900 block">
                                {d.total_amount.toLocaleString()} F
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                                {d.items_count} {d.items_count > 1 ? "lots" : "lot"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// src/features/deliveries/components/StockOptimizationCard.tsx
import { TrendingDown, ArrowRight } from "lucide-react";

interface StockOptimizationCardProps {
    onOpenPriceComparator?: () => void;
}

export function StockOptimizationCard({ onOpenPriceComparator }: StockOptimizationCardProps) {
    return (
        <div 
            onClick={onOpenPriceComparator}
            className="relative rounded-[28px] overflow-hidden p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl shadow-indigo-950/20 group cursor-pointer border border-indigo-900/50 hover:border-indigo-700 transition-all"
        >
            <div className="relative z-10 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2720ff] text-white flex items-center justify-center shadow-md shadow-[#2720ff]/30">
                    <TrendingDown className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-black text-base text-white leading-tight">
                        Comparateur Centrales
                    </h4>
                    <p className="text-white/70 text-xs mt-1">
                        Comparez les prix d'achat réels (CENAME, Laborex, UCPA, Cephac, PCT) pour maximiser votre marge.
                    </p>
                </div>

                <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-indigo-300 group-hover:text-white transition-colors">
                    <span>Ouvrir l'analyse comparative</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>

            {/* Background motif */}
            <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
                <TrendingDown className="h-36 w-36 rotate-[-15deg]" />
            </div>
        </div>
    );
}

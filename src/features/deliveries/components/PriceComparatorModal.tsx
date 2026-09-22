// src/features/deliveries/components/PriceComparatorModal.tsx
import { useEffect, useState, useTransition } from "react";
import { 
    X, 
    TrendingDown, 
    Search, 
    ArrowUpDown, 
    Building2, 
    Info 
} from "lucide-react";
import { SupplierProductPriceComparison } from "../types";
import { fetchPriceComparisonAction } from "../actions/deliveriesActions";

interface PriceComparatorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PriceComparatorModal({
    isOpen,
    onClose
}: PriceComparatorModalProps) {
    const [comparisons, setComparisons] = useState<SupplierProductPriceComparison[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [, startTransition] = useTransition();

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            fetchPriceComparisonAction()
                .then(setComparisons)
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filtered = comparisons.filter(c => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return c.productName.toLowerCase().includes(q) || (c.dci && c.dci.toLowerCase().includes(q));
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* 1. Header */}
                <div className="px-6 py-5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#2720ff] text-white flex items-center justify-center shadow-md shadow-[#2720ff]/20">
                            <TrendingDown className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 leading-tight">
                                Comparateur de Tarifs Centrales & Répartiteurs
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Analyse comparative des prix d'achat réels (CENAME/CAMEG, Laborex, UCPA, Cephac, PCT)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* 2. Barre de recherche et info-bulle */}
                <div className="p-6 pb-2 space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    startTransition(() => setSearch(val));
                                }}
                                placeholder="Rechercher une molécule ou spécialité (ex: Amoxicilline, Augmentin)..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2720ff]/30 focus:border-[#2720ff]"
                            />
                        </div>
                        <span className="text-xs font-bold text-slate-500 self-center">
                            {filtered.length} {filtered.length > 1 ? "médicaments comparés" : "médicament comparé"}
                        </span>
                    </div>

                    <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
                        <Info className="h-4 w-4 shrink-0 text-[#2720ff] mt-0.5" />
                        <span>
                            Les prix d'achat sont extraits des bons de livraison réels enregistrés dans votre système. 
                            Le répartiteur le plus compétitif est surligné en vert avec le gain potentiel sur la marge officinale.
                        </span>
                    </div>
                </div>

                {/* 3. Tableau comparatif */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {isLoading ? (
                        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <div className="h-8 w-8 border-2 border-slate-200 border-t-[#2720ff] rounded-full animate-spin" />
                            <span className="text-xs font-medium">Calcul des écarts de prix...</span>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="space-y-4">
                            {filtered.map((item) => {
                                const priceGap = item.highestPrice - item.lowestPrice;
                                const gapPercent = item.lowestPrice > 0 ? Math.round((priceGap / item.lowestPrice) * 100) : 0;

                                return (
                                    <div
                                        key={item.productId}
                                        className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 shadow-sm space-y-4 transition-all"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                                    {item.productName}
                                                    {item.dosage && (
                                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                                            {item.dosage}
                                                        </span>
                                                    )}
                                                </h4>
                                                {item.dci && (
                                                    <p className="text-xs text-slate-500 italic mt-0.5">
                                                        DCI : {item.dci} • Forme : {item.form || "N/A"}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-xs">
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Prix Vente POS</span>
                                                    <p className="font-black text-slate-900">{item.sellingPrice.toLocaleString()} F</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Marge Max</span>
                                                    <p className="font-black text-emerald-600">+{item.potentialMargin.toLocaleString()} F</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Grille des offres répartiteurs */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {item.pricesBySupplier.map((sp) => {
                                                const isBest = sp.purchasePrice === item.lowestPrice;
                                                return (
                                                    <div
                                                        key={sp.supplierId}
                                                        className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                                                            isBest
                                                                ? "bg-emerald-50/70 border-emerald-300 shadow-sm"
                                                                : "bg-slate-50/70 border-slate-200/80"
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                                                                <Building2 className={`h-3.5 w-3.5 shrink-0 ${isBest ? "text-emerald-600" : "text-slate-400"}`} />
                                                                {sp.supplierName}
                                                            </span>
                                                            {isBest && (
                                                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-600 text-white uppercase tracking-wider">
                                                                    Meilleur Prix
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex items-baseline justify-between mt-2">
                                                            <span className="text-[10px] text-slate-500 font-medium">
                                                                Lot: {sp.lotNumber}
                                                            </span>
                                                            <span className={`text-sm font-black ${isBest ? "text-emerald-700" : "text-slate-800"}`}>
                                                                {sp.purchasePrice.toLocaleString()} <span className="text-[10px]">FCFA</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Différentiel et opportunité d'économie */}
                                        {priceGap > 0 && (
                                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 pt-2 border-t border-slate-100">
                                                <span className="flex items-center gap-1.5 text-amber-700">
                                                    <ArrowUpDown className="h-3.5 w-3.5" />
                                                    Écart de prix constaté : {priceGap.toLocaleString()} FCFA ({gapPercent}%)
                                                </span>
                                                <span className="text-slate-500">
                                                    Source recommandée : <strong className="text-emerald-700">{item.bestSupplierName}</strong>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-slate-400 space-y-2">
                            <TrendingDown className="h-10 w-10 text-slate-300 mx-auto" />
                            <p className="text-sm font-bold text-slate-700">Aucune donnée comparative disponible.</p>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Enregistrez vos bons de livraison auprès de différents répartiteurs (CAMEG, Laborex, UCPA, Cephac, PCT) pour afficher la comparaison des tarifs d'achat en temps réel.
                            </p>
                        </div>
                    )}
                </div>

                {/* 4. Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

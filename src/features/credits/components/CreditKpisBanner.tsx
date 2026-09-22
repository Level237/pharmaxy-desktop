// src/features/credits/components/CreditKpisBanner.tsx
import { CreditCard, AlertTriangle, ShieldAlert, ArrowDownRight, Users } from "lucide-react";
import { CreditKpis } from "../types";

interface CreditKpisBannerProps {
    kpis: CreditKpis;
    onFilterClick?: (status: 'all' | 'overdue' | 'critical' | 'settled') => void;
}

export function CreditKpisBanner({ kpis, onFilterClick }: CreditKpisBannerProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* 1. Total Encours Dettes */}
            <div 
                onClick={() => onFilterClick?.('all')}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Encours Global
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2720ff] flex items-center justify-center group-hover:bg-[#2720ff] group-hover:text-white transition-colors shadow-sm">
                        <CreditCard className="h-5 w-5" />
                    </div>
                </div>
                <div className="flex items-baseline justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                            {kpis.totalDebtAmount.toLocaleString()} <span className="text-sm font-bold text-slate-500">FCFA</span>
                        </h3>
                        <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            <span>{kpis.debtorCount} {kpis.debtorCount > 1 ? "patients débiteurs" : "patient débiteur"}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. Créances en Souffrance (> 30 jours) */}
            <div 
                onClick={() => onFilterClick?.('overdue')}
                className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-gradient-to-br from-amber-50/30 to-transparent"
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        En Souffrance (&gt; 30j)
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-sm">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                </div>
                <div className="flex items-baseline justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-amber-900 tracking-tight">
                            {kpis.overdueDebtAmount.toLocaleString()} <span className="text-sm font-bold text-amber-700">FCFA</span>
                        </h3>
                        <p className="text-xs font-medium text-amber-600 mt-1">
                            À relancer en priorité
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. Retards Critiques (> 60 jours) */}
            <div 
                onClick={() => onFilterClick?.('critical')}
                className="bg-white rounded-2xl p-5 border border-red-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-gradient-to-br from-red-50/30 to-transparent"
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                        Critique (&gt; 60j)
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors shadow-sm">
                        <ShieldAlert className="h-5 w-5" />
                    </div>
                </div>
                <div className="flex items-baseline justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-red-900 tracking-tight">
                            {kpis.criticalDebtAmount.toLocaleString()} <span className="text-sm font-bold text-red-700">FCFA</span>
                        </h3>
                        <p className="text-xs font-medium text-red-600 mt-1">
                            Contentieux / Blocage crédit
                        </p>
                    </div>
                </div>
            </div>

            {/* 4. Recouvrements du Mois */}
            <div 
                onClick={() => onFilterClick?.('settled')}
                className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-gradient-to-br from-emerald-50/30 to-transparent"
            >
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                        Recouvré ce Mois
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-sm">
                        <ArrowDownRight className="h-5 w-5" />
                    </div>
                </div>
                <div className="flex items-baseline justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-emerald-900 tracking-tight">
                            {kpis.totalRepaidThisMonth.toLocaleString()} <span className="text-sm font-bold text-emerald-700">FCFA</span>
                        </h3>
                        <p className="text-xs font-medium text-emerald-600 mt-1">
                            Acomptes & dettes soldées
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

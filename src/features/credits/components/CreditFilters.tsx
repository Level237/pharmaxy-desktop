// src/features/credits/components/CreditFilters.tsx
import { Search, RotateCcw, AlertTriangle, ShieldAlert, CheckCircle2, Users } from "lucide-react";
import { CreditStatusFilter } from "../types";

interface CreditFiltersProps {
    search: string;
    onSearchChange: (val: string) => void;
    statusFilter: CreditStatusFilter;
    onStatusFilterChange: (val: CreditStatusFilter) => void;
    onReset: () => void;
    totalCount: number;
}

export function CreditFilters({
    search,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    onReset,
    totalCount
}: CreditFiltersProps) {
    const tabs: { id: CreditStatusFilter; label: string; icon: any; colorClass: string }[] = [
        { id: 'all', label: 'Tous les Débiteurs', icon: Users, colorClass: 'text-slate-700' },
        { id: 'overdue', label: 'En retard (> 30j)', icon: AlertTriangle, colorClass: 'text-amber-600' },
        { id: 'critical', label: 'Critique (> 60j)', icon: ShieldAlert, colorClass: 'text-red-600' },
        { id: 'settled', label: 'Historique Soldé', icon: CheckCircle2, colorClass: 'text-emerald-600' }
    ];

    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm mb-6 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* 1. Recherche par nom ou téléphone */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Rechercher un client ou un téléphone..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2720ff]/30 focus:border-[#2720ff] transition-all"
                    />
                </div>

                {/* 2. Bouton réinitialiser & Compteur */}
                <div className="flex items-center gap-3 self-end md:self-auto">
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                        {totalCount} {totalCount > 1 ? "comptes affichés" : "compte affiché"}
                    </span>
                    {(search || statusFilter !== 'all') && (
                        <button
                            onClick={onReset}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Réinitialiser
                        </button>
                    )}
                </div>
            </div>

            {/* 3. Onglets de filtrage par statut de créance */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                {tabs.map((tab) => {
                    const isActive = statusFilter === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onStatusFilterChange(tab.id)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                    ? "bg-[#2720ff] text-white shadow-sm shadow-[#2720ff]/20"
                                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
                            }`}
                        >
                            <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : tab.colorClass}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

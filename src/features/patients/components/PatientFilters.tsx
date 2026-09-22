// src/features/patients/components/PatientFilters.tsx
import { Search, UserPlus, AlertTriangle, Activity, CreditCard, Users } from "lucide-react";
import type { PatientFiltersState, PatientFilterStatus } from "../types";

interface PatientFiltersProps {
  filters: PatientFiltersState;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: PatientFilterStatus) => void;
  onOpenNewPatientModal: () => void;
}

export function PatientFilters({
  filters,
  onSearchChange,
  onStatusChange,
  onOpenNewPatientModal
}: PatientFiltersProps) {
  const tabs: { id: PatientFilterStatus; label: string; icon: typeof Users }[] = [
    { id: "all", label: "Tous les patients", icon: Users },
    { id: "allergies", label: "Avec Allergies", icon: AlertTriangle },
    { id: "chronic", label: "Suivi Chronique", icon: Activity },
    { id: "debt", label: "Avec Solde Crédit", icon: CreditCard }
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      {/* Ligne 1 : Recherche + Bouton Nouveau Patient */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Champ de recherche */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher par nom, téléphone, allergie..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-all"
          />
        </div>

        {/* Bouton Nouveau Patient */}
        <button
          type="button"
          onClick={onOpenNewPatientModal}
          className="px-5 py-2.5 bg-[#2720ff] hover:bg-[#201ac9] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#2720ff]/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Nouveau Patient</span>
        </button>
      </div>

      {/* Ligne 2 : Onglets de filtrage */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
        {tabs.map((tab) => {
          const isActive = filters.status === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? "bg-[#2720ff] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

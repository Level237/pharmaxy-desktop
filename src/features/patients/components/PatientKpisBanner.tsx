// src/features/patients/components/PatientKpisBanner.tsx
import { Users, AlertTriangle, Activity, CreditCard } from "lucide-react";
import type { PatientStats } from "../types";

export function PatientKpisBanner({ stats }: { stats: PatientStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Total Patients */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#2720ff] flex items-center justify-center shrink-0">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Dossiers Patients</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-2xl font-black text-slate-900">{stats.totalPatients}</h3>
            <span className="text-xs text-slate-400 font-semibold">enregistrés</span>
          </div>
        </div>
      </div>

      {/* 2. Terrain Allergique */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Vigilance Allergies</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-2xl font-black text-rose-600">{stats.patientsWithAllergies}</h3>
            <span className="text-xs text-rose-500 font-semibold">patient(s) à risque</span>
          </div>
        </div>
      </div>

      {/* 3. Pathologies Chroniques */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Suivi Chronique</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-2xl font-black text-slate-900">{stats.patientsWithPathologies}</h3>
            <span className="text-xs text-sky-600 font-semibold">diabète, HTA, etc.</span>
          </div>
        </div>
      </div>

      {/* 4. Encours Crédit */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <CreditCard className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Encours Crédits</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-2xl font-black text-slate-900">
              {stats.totalDebtAmount.toLocaleString("fr-FR")}
            </h3>
            <span className="text-xs font-bold text-slate-700">FCFA</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {stats.patientsWithDebt} patient(s) avec solde dû
          </p>
        </div>
      </div>
    </div>
  );
}

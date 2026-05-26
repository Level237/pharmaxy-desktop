import { User, KeyRound, Sparkles, ChevronLeft } from "lucide-react";
import type { AdminData } from "../types";

interface StepAdminInfoProps {
  data: AdminData;
  onChange: (data: Partial<AdminData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onPrev: () => void;
  isSubmitting: boolean;
}

export function StepAdminInfo({ data, onChange, onSubmit, onPrev, isSubmitting }: StepAdminInfoProps) {
  return (
    <div className="flex flex-col p-8 md:p-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Administrateur</h1>
        <p className="text-slate-500 font-medium max-w-sm mx-auto">
          Configurez l'accès principal pour la gestion de votre officine.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 mb-12">
        <div className="group">
          <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
            Nom Complet du Gérant
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <input
              type="text"
              placeholder="Ex: Emmanuel Macron"
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="w-full bg-[#F1F5F9]/50 border border-slate-400 rounded-2xl py-4 pl-12 pr-6 text-slate-900 font-bold placeholder:text-slate-400 focus:bg-white focus:border-slate-900 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
              Code PIN (4 chiffres)
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={data.pinCode}
                onChange={(e) => onChange({ pinCode: e.target.value.replace(/\D/g, "") })}
                className="w-full bg-[#F1F5F9]/50 border border-slate-400 rounded-2xl py-4 pl-12 pr-6 text-slate-900 font-bold placeholder:text-slate-400 focus:bg-white focus:border-slate-900 outline-none transition-all text-center tracking-[0.5em]"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
              Confirmer le Code PIN
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={data.confirmPinCode}
                onChange={(e) => onChange({ confirmPinCode: e.target.value.replace(/\D/g, "") })}
                className="w-full bg-[#F1F5F9]/50 border border-slate-400 rounded-2xl py-4 pl-12 pr-6 text-slate-900 font-bold placeholder:text-slate-400 focus:bg-white focus:border-slate-900 outline-none transition-all text-center tracking-[0.5em]"
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-[#1E293B] rounded-2xl text-white flex items-start gap-4 shadow-lg shadow-slate-200">
          <Sparkles className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs font-medium leading-relaxed text-slate-300">
            Conservez précieusement ce code PIN. Il constitue votre clé unique pour déverrouiller la caisse <span className="text-white font-bold">Pharmaxy</span> en toute sécurité.
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onPrev}
            disabled={isSubmitting}
            className="flex-1 py-5 border-2 border-slate-100 hover:border-slate-200 text-slate-900 font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] tracking-widest uppercase text-sm disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
            Retour
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] tracking-widest uppercase text-sm disabled:opacity-50"
          >
            {isSubmitting ? "Initialisation..." : "Finaliser l'installation"}
          </button>
        </div>
      </form>
    </div>
  );
}

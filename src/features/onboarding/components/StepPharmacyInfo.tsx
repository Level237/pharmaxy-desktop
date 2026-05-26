import { Settings, MapPin, Phone, User, FileText, ChevronRight, ChevronLeft } from "lucide-react";
import type { PharmacyData } from "../types";

interface StepPharmacyInfoProps {
  data: PharmacyData;
  onChange: (data: Partial<PharmacyData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepPharmacyInfo({ data, onChange, onNext, onPrev }: StepPharmacyInfoProps) {
  return (
    <div className="flex flex-col p-8 md:p-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Identité de l'Officine</h1>
        <p className="text-slate-500 font-medium max-w-sm mx-auto">
          Ces informations apparaîtront sur vos tickets de caisse et rapports officiels.
        </p>
      </div>

      <div className="space-y-6 mb-12">
        <div className="group">
          <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
            Nom de la Pharmacie
          </label>
          <div className="relative">
            <Settings className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <input
              type="text"
              placeholder="Ex: Pharmacie de l'Espoir"
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="w-full bg-[#F1F5F9]/50 border border-slate-400 rounded-2xl py-4 pl-12 pr-6 text-slate-900 font-bold placeholder:text-slate-400 focus:bg-white focus:border-slate-900 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
              Adresse Physique
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input
                type="text"
                placeholder="Ex: Akwa, Douala"
                value={data.address}
                onChange={(e) => onChange({ address: e.target.value })}
                className="w-full bg-[#F1F5F9]/50 border border-slate-400 rounded-2xl py-4 pl-12 pr-6 text-slate-900 font-bold placeholder:text-slate-400 focus:bg-white focus:border-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
              Numéro de Téléphone
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input
                type="text"
                placeholder="Ex: +237 600 000 000"
                value={data.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                className="w-full bg-[#F1F5F9]/50 border border-slate-400 rounded-2xl py-4 pl-12 pr-6 text-slate-900 font-bold placeholder:text-slate-400 focus:bg-white focus:border-slate-900 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
              Pharmacien Titulaire
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input
                type="text"
                placeholder="Ex: Dr. Atangana"
                value={data.ownerName}
                onChange={(e) => onChange({ ownerName: e.target.value })}
                className="w-full bg-[#F1F5F9]/50 border border-slate-400 rounded-2xl py-4 pl-12 pr-6 text-slate-900 font-bold placeholder:text-slate-400 focus:bg-white focus:border-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          <div className="group">
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">
              Agrément MINSANTE
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input
                type="text"
                placeholder="Ex: MSP-2024-..."
                value={data.licenseNumber}
                onChange={(e) => onChange({ licenseNumber: e.target.value })}
                className="w-full bg-[#F1F5F9]/50 border border-slate-400 rounded-2xl py-4 pl-12 pr-6 text-slate-900 font-bold placeholder:text-slate-400 focus:bg-white focus:border-slate-900 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          className="flex-1 py-5 border-2 border-slate-100 hover:border-slate-200 text-slate-900 font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] tracking-widest uppercase text-sm"
        >
          <ChevronLeft className="h-5 w-5" />
          Retour
        </button>
        <button
          onClick={onNext}
          className="flex-[2] py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] tracking-widest uppercase text-sm"
        >
          Continuer
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

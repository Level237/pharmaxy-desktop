import { AlertTriangle } from "lucide-react";

export function AlertBanner() {
  return (
    <div className="bg-[#FEF2F2] border border-[#FEE2E2] p-6 rounded-2xl flex items-center gap-6 relative overflow-hidden">
      <div className="h-14 w-14 bg-white rounded-xl flex items-center justify-center text-[#EF4444] shadow-sm shrink-0">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div className="flex-1">
        <h4 className="text-[#991B1B] font-black text-lg">Alerte Stock : Météo des Stocks</h4>
        <p className="text-[#B91C1C] text-sm opacity-90 mt-0.5">
          3 produits sont sous le seuil minimum (Amoxicilline, Paracétamol, etc.). Passez commande immédiatement pour éviter les ruptures.
        </p>
      </div>
      <button className="bg-[#991B1B] hover:bg-[#7F1D1D] text-white px-6 py-3 rounded-xl font-bold transition-all shrink-0">
        Gérer le Stock
      </button>
    </div>
  );
}

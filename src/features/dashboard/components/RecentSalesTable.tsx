import { useState, useTransition } from "react";
import type { Sale } from "../types";
import { ShoppingBag, Eye, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SaleReceiptModal } from "../../pos/components/SaleReceiptModal";

export function RecentSalesTable({ 
  sales, 
  onRefresh 
}: { 
  sales: Sale[];
  onRefresh?: () => void;
}) {
  const navigate = useNavigate();
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleManualRefresh = () => {
    startTransition(() => {
      onRefresh?.();
    });
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Ventes Récentes</h3>
            <p className="text-xs text-slate-500 mt-0.5">Dernières transactions enregistrées en caisse</p>
          </div>
          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                onClick={handleManualRefresh}
                disabled={isPending}
                title="Actualiser les ventes"
                className="p-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#2720ff] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin text-[#2720ff]" : ""}`} />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
            )}
            <button 
              onClick={() => navigate("/pos")}
              className="text-[#2720ff] hover:text-[#1f19cc] text-xs font-bold hover:underline cursor-pointer"
            >
              Ouvrir le POS
            </button>
          </div>
        </div>

        {sales.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <p className="font-bold text-slate-700 text-sm">Aucune vente enregistrée pour le moment</p>
            <p className="text-xs text-slate-400 mt-1">Les ventes validées sur le terminal POS s'afficheront ici en direct.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-3.5">N° Reçu</th>
                  <th className="px-4 py-3.5">Client</th>
                  <th className="px-4 py-3.5">Médicaments</th>
                  <th className="px-4 py-3.5">Montant</th>
                  <th className="px-4 py-3.5">Heure</th>
                  <th className="px-4 py-3.5">Statut</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((sale, i) => (
                  <tr 
                    key={i} 
                    onClick={() => sale.saleId && setSelectedSaleId(sale.saleId)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-xs font-bold text-[#2720ff] group-hover:underline">
                      {sale.id}
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-slate-800">{sale.client}</td>
                    <td className="px-4 py-4 text-xs text-slate-600 max-w-xs truncate">{sale.products}</td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-900">{sale.amount}</td>
                    <td className="px-4 py-4 text-xs text-slate-500">{sale.time}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        sale.status === "Payé"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (sale.saleId) setSelectedSaleId(sale.saleId);
                        }}
                        title="Voir et imprimer le reçu officiel"
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-[#2720ff] bg-white text-slate-600 hover:text-[#2720ff] transition-all cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Reçu de Caisse Officiel */}
      <SaleReceiptModal
        saleId={selectedSaleId}
        isOpen={!!selectedSaleId}
        onClose={() => setSelectedSaleId(null)}
      />
    </>
  );
}

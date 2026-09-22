// src/features/cash/components/CashZReceiptModal.tsx
import { useEffect, useState } from "react";
import { Printer, X, CheckCircle } from "lucide-react";
import { getPharmacyInfo } from "../../../db/pharmacyQueries";
import type { CashSession, CashSessionSummary } from "../types";

interface CashZReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: CashSession;
  summary?: CashSessionSummary | null;
}

interface PharmacyHeaderInfo {
  name: string;
  address?: string;
  phone?: string;
  taxpayer_number?: string;
}

export function CashZReceiptModal({
  isOpen,
  onClose,
  session,
  summary
}: CashZReceiptModalProps) {
  const [pharmacy, setPharmacy] = useState<PharmacyHeaderInfo | null>(null);

  useEffect(() => {
    if (isOpen) {
      getPharmacyInfo()
        .then((res) => {
          if (res && res.length > 0) {
            setPharmacy(res[0]);
          }
        })
        .catch((err) => console.error("Erreur chargement infos pharmacie:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const openingAmount = session.opening_amount || 0;
  const cashSales = summary?.cashSales ?? session.total_cash_sales;
  const momoSales = summary?.momoSales ?? session.total_momo_sales;
  const creditSales = summary?.creditSales ?? session.total_credit_sales;
  const withdrawals = summary?.withdrawals ?? session.total_withdrawals;
  const deposits = summary?.deposits ?? 0;
  const expectedCash = session.closing_amount_expected ?? (openingAmount + cashSales + deposits - withdrawals);
  const realCash = session.closing_amount_real ?? expectedCash;
  const difference = session.difference ?? (realCash - expectedCash);
  const totalCA = cashSales + momoSales + creditSales + (summary?.cardSales || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-z-title"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h2 id="ticket-z-title" className="text-sm font-bold text-slate-900">
              Ticket Z - Clôture de Caisse
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zone Imprimable (Ticket Thermique) */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 print:p-0 print:bg-white print:overflow-visible">
          <div 
            id="ticket-z-print-area"
            className="w-full max-w-[320px] mx-auto bg-white p-5 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-1 font-mono text-[11px] text-slate-800 leading-tight space-y-3"
          >
            {/* Entête Officielle */}
            <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-3">
              <p className="font-bold text-[9px] uppercase tracking-wider text-slate-500">
                RÉPUBLIQUE DU CAMEROUN
              </p>
              <p className="font-bold text-[9px] uppercase text-slate-500">
                MINISTÈRE DE LA SANTÉ PUBLIQUE
              </p>
              <h1 className="font-black text-sm text-slate-900 uppercase pt-1">
                {pharmacy?.name || "PHARMAXY OFFICINE"}
              </h1>
              {pharmacy?.address && <p className="text-[10px] text-slate-600">{pharmacy.address}</p>}
              {pharmacy?.phone && <p className="text-[10px] text-slate-600">Tél: {pharmacy.phone}</p>}
              {pharmacy?.taxpayer_number && (
                <p className="text-[9px] text-slate-500">NIU: {pharmacy.taxpayer_number}</p>
              )}
            </div>

            {/* Titre Ticket Z */}
            <div className="text-center py-1 border-b border-dashed border-slate-300">
              <p className="font-black text-xs uppercase tracking-widest text-slate-900">
                RAPPORT Z - CLÔTURE DE CAISSE
              </p>
              <p className="text-[10px] text-slate-500 font-bold">
                Session N° #{session.id.toString().padStart(5, "0")}
              </p>
            </div>

            {/* Informations Session */}
            <div className="space-y-1 text-[10px] border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Caissier :</span>
                <span className="font-bold text-slate-800">{session.user_name || "Caissier"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ouverture :</span>
                <span>{session.opened_at.replace("T", " ").substring(0, 16)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clôture :</span>
                <span>{(session.closed_at || new Date().toISOString()).replace("T", " ").substring(0, 16)}</span>
              </div>
            </div>

            {/* Récapitulatif Chiffre d'Affaires */}
            <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
              <p className="font-bold text-[10px] uppercase text-slate-600">
                1. ENCAISSEMENTS VENTES
              </p>
              <div className="flex justify-between pl-1">
                <span>Espèces :</span>
                <span className="font-bold">{cashSales.toLocaleString("fr-FR")} F</span>
              </div>
              <div className="flex justify-between pl-1">
                <span>Mobile Money (OM/MoMo) :</span>
                <span className="font-bold">{momoSales.toLocaleString("fr-FR")} F</span>
              </div>
              <div className="flex justify-between pl-1">
                <span>Ventes à Crédit :</span>
                <span className="font-bold">{creditSales.toLocaleString("fr-FR")} F</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-dotted border-slate-200 font-bold text-slate-900">
                <span>Total CA Journalier :</span>
                <span>{totalCA.toLocaleString("fr-FR")} FCFA</span>
              </div>
            </div>

            {/* Détail Mouvements Espèces */}
            <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
              <p className="font-bold text-[10px] uppercase text-slate-600">
                2. GESTION DU TIROIR-CAISSE
              </p>
              <div className="flex justify-between pl-1">
                <span>Fond de Caisse Initial :</span>
                <span>{openingAmount.toLocaleString("fr-FR")} F</span>
              </div>
              <div className="flex justify-between pl-1 text-emerald-700">
                <span>+ Encaissements Espèces :</span>
                <span>+{cashSales.toLocaleString("fr-FR")} F</span>
              </div>
              {deposits > 0 && (
                <div className="flex justify-between pl-1 text-emerald-700">
                  <span>+ Dépôts complémentaires :</span>
                  <span>+{deposits.toLocaleString("fr-FR")} F</span>
                </div>
              )}
              {withdrawals > 0 && (
                <div className="flex justify-between pl-1 text-rose-700">
                  <span>- Décaissements / Dépenses :</span>
                  <span>-{withdrawals.toLocaleString("fr-FR")} F</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-dotted border-slate-200 font-bold">
                <span>Espèces Théoriques :</span>
                <span>{expectedCash.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className="flex justify-between font-black text-slate-900">
                <span>Espèces Réelles Comptées :</span>
                <span>{realCash.toLocaleString("fr-FR")} FCFA</span>
              </div>
              <div className={`flex justify-between pt-1 border-t border-slate-200 font-black ${
                difference === 0 ? "text-emerald-700" : difference < 0 ? "text-rose-700" : "text-blue-700"
              }`}>
                <span>ÉCART DE CAISSE :</span>
                <span>
                  {difference > 0 ? `+${difference.toLocaleString("fr-FR")}` : difference.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            </div>

            {/* Note éventuelle */}
            {session.notes && (
              <div className="text-[10px] italic text-slate-500 border-b border-dashed border-slate-300 pb-2">
                Note : {session.notes}
              </div>
            )}

            {/* Emargements */}
            <div className="pt-2 text-[9px] grid grid-cols-2 gap-3 text-center">
              <div className="border-t border-slate-300 pt-1">
                <p className="font-bold text-slate-700">Signature Caissier</p>
                <div className="h-8" />
              </div>
              <div className="border-t border-slate-300 pt-1">
                <p className="font-bold text-slate-700">Pharmacien Titulaire</p>
                <div className="h-8" />
              </div>
            </div>

            <p className="text-[9px] text-center text-slate-400 pt-2 border-t border-slate-100">
              Pharmaxy v0.1 • Document comptable officiel
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-bold text-white bg-[#2720ff] hover:bg-[#201ac9] rounded-xl shadow-md shadow-[#2720ff]/20 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer Ticket Z</span>
          </button>
        </div>

        {/* Styles d'impression Thermique 80mm / 58mm */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            #ticket-z-print-area, #ticket-z-print-area * {
              visibility: visible !important;
            }
            #ticket-z-print-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 78mm !important;
              max-width: 78mm !important;
              margin: 0 !important;
              padding: 2mm !important;
            }
          }
        ` }} />
      </div>
    </div>
  );
}

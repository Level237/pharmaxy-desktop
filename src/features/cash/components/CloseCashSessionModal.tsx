// src/features/cash/components/CloseCashSessionModal.tsx
import { useState, useActionState, useEffect } from "react";
import { Lock, X, AlertCircle, CheckCircle, AlertTriangle, Calculator } from "lucide-react";
import { closeSessionAction, fetchSessionSummary } from "../actions/cashActions";
import type { CashSession, CashSessionSummary } from "../types";

interface CloseCashSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: CashSession;
  onSuccess: (closedSession: CashSession, summary: CashSessionSummary) => void;
}

export function CloseCashSessionModal({
  isOpen,
  onClose,
  session,
  onSuccess
}: CloseCashSessionModalProps) {
  const [summary, setSummary] = useState<CashSessionSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [realAmount, setRealAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (isOpen && session) {
      setLoadingSummary(true);
      fetchSessionSummary(session.id)
        .then((s) => {
          setSummary(s);
          setRealAmount(s.expectedCash); // Pré-rempli avec l'attendu par commodité
        })
        .catch((err) => console.error("Erreur chargement résumé caisse:", err))
        .finally(() => setLoadingSummary(false));
    }
  }, [isOpen, session]);

  const expectedCash = summary?.expectedCash ?? session.opening_amount;
  const difference = realAmount - expectedCash;

  const [actionState, formAction, isPending] = useActionState(
    async (_prevState: { error?: string } | null) => {
      if (realAmount < 0) {
        return { error: "Le montant compté ne peut pas être négatif." };
      }

      try {
        const closed = await closeSessionAction(session.id, realAmount, notes);
        if (summary) {
          onSuccess(closed, summary);
        }
        onClose();
        return null;
      } catch (err: unknown) {
        return {
          error: err instanceof Error ? err.message : "Erreur lors de la clôture de la caisse."
        };
      }
    },
    null
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="close-session-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 id="close-session-title" className="text-lg font-bold text-slate-900">
                Clôture Journalière (Ticket Z)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Caissier : <span className="font-semibold text-slate-700">{session.user_name || "Session en cours"}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {loadingSummary ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-500">
              <div className="w-6 h-6 border-2 border-[#2720ff] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold">Calcul des totaux de caisse en cours...</p>
            </div>
          ) : (
            <form action={formAction} className="space-y-5">
              {actionState?.error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionState.error}</span>
                </div>
              )}

              {/* Récapitulatif comptable */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Fond de caisse initial :</span>
                  <span className="font-bold text-slate-800">
                    {(summary?.openingAmount || 0).toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>+ Ventes en Espèces ({summary?.salesCount || 0} ventes) :</span>
                  <span className="font-bold text-emerald-600">
                    +{(summary?.cashSales || 0).toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                {(summary?.deposits || 0) > 0 && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>+ Dépôts complémentaires :</span>
                    <span className="font-bold text-emerald-600">
                      +{(summary?.deposits || 0).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                )}
                {(summary?.withdrawals || 0) > 0 && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>- Décaissements / Sorties d'espèces :</span>
                    <span className="font-bold text-rose-600">
                      -{(summary?.withdrawals || 0).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-900">Total Espèces Attendu :</span>
                  <span className="font-black text-[#2720ff]">
                    {expectedCash.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </div>

              {/* Autres encaissements (hors espèces physiques) */}
              <div className="grid grid-cols-3 gap-2 text-[11px] bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-slate-700">
                <div>
                  <span className="text-slate-400 block">Mobile Money</span>
                  <span className="font-bold text-slate-900">
                    {(summary?.momoSales || 0).toLocaleString("fr-FR")} F
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Cartes</span>
                  <span className="font-bold text-slate-900">
                    {(summary?.cardSales || 0).toLocaleString("fr-FR")} F
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Crédits Accordés</span>
                  <span className="font-bold text-amber-700">
                    {(summary?.creditSales || 0).toLocaleString("fr-FR")} F
                  </span>
                </div>
              </div>

              {/* Champ comptage réel */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-slate-400" />
                  Espèces Réellement Comptées dans le tiroir (FCFA) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={realAmount}
                    onChange={(e) => setRealAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    required
                    className="w-full px-4 py-3 text-2xl font-black text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-[#2720ff] focus:ring-4 focus:ring-[#2720ff]/10 outline-hidden transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    FCFA
                  </span>
                </div>
              </div>

              {/* Affichage de l'Écart */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                difference === 0
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : difference < 0
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}>
                <div className="flex items-center gap-2">
                  {difference === 0 ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : difference < 0 ? (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                  )}
                  <span>
                    {difference === 0
                      ? "Caisse équilibrée (aucun écart)"
                      : difference < 0
                      ? "Déficit / Manquant de caisse"
                      : "Excédent de caisse"}
                  </span>
                </div>
                <span className="text-sm font-black">
                  {difference > 0 ? `+${difference.toLocaleString("fr-FR")}` : difference.toLocaleString("fr-FR")} FCFA
                </span>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Justification d'écart ou note de clôture
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Écart de 50 FCFA sur pièces non rendues..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Clôture en cours...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirmer & Clôturer la Caisse</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

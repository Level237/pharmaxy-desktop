// src/features/cash/components/CashMovementModal.tsx
import { useState, useActionState } from "react";
import { ArrowDownCircle, ArrowUpCircle, X, AlertCircle } from "lucide-react";
import { recordMovementAction } from "../actions/cashActions";

interface CashMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  currentUserId: number;
  onSuccess: () => void;
  defaultType?: 'withdrawal' | 'deposit';
}

const COMMON_WITHDRAWAL_REASONS = [
  "Achat fournitures",
  "Paiement coursier / transport",
  "Avance sur salaire",
  "Frais d'entretien",
  "Remboursement client",
  "Autre dépense"
];

const COMMON_DEPOSIT_REASONS = [
  "Apport complémentaire",
  "Remboursement avance",
  "Erreur de rendu corrigée",
  "Autre apport"
];

export function CashMovementModal({
  isOpen,
  onClose,
  sessionId,
  currentUserId,
  onSuccess,
  defaultType = 'withdrawal'
}: CashMovementModalProps) {
  const [movementType, setMovementType] = useState<'withdrawal' | 'deposit'>(defaultType);
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [actionState, formAction, isPending] = useActionState(
    async (_prevState: { error?: string } | null) => {
      if (amount <= 0) {
        return { error: "Le montant doit être supérieur à 0 FCFA." };
      }
      if (!reason.trim()) {
        return { error: "Le motif du mouvement est obligatoire." };
      }

      try {
        await recordMovementAction(
          sessionId,
          currentUserId,
          movementType,
          amount,
          reason,
          notes
        );
        onSuccess();
        onClose();
        return null;
      } catch (err: unknown) {
        return {
          error: err instanceof Error ? err.message : "Erreur lors de l'enregistrement du mouvement."
        };
      }
    },
    null
  );

  if (!isOpen) return null;

  const isWithdrawal = movementType === 'withdrawal';
  const quickReasons = isWithdrawal ? COMMON_WITHDRAWAL_REASONS : COMMON_DEPOSIT_REASONS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cash-movement-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isWithdrawal ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
            }`}>
              {isWithdrawal ? (
                <ArrowDownCircle className="w-5 h-5" />
              ) : (
                <ArrowUpCircle className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 id="cash-movement-title" className="text-lg font-bold text-slate-900">
                {isWithdrawal ? "Sortie de Caisse (Décaissement)" : "Dépôt d'Espèces (Apport)"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Mouvement comptabilisé sur la session en cours
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
        <form action={formAction} className="p-6 space-y-4">
          {actionState?.error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionState.error}</span>
            </div>
          )}

          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMovementType('withdrawal')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                isWithdrawal
                  ? "bg-white text-rose-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Décaissement</span>
            </button>
            <button
              type="button"
              onClick={() => setMovementType('deposit')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                !isWithdrawal
                  ? "bg-white text-emerald-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>Dépôt / Apport</span>
            </button>
          </div>

          {/* Montant */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Montant (FCFA) *
            </label>
            <div className="relative">
              <input
                type="number"
                min={100}
                step={100}
                value={amount || ""}
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                required
                placeholder="0"
                className="w-full px-4 py-2.5 text-xl font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-[#2720ff] focus:ring-4 focus:ring-[#2720ff]/10 outline-hidden transition-all"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                FCFA
              </span>
            </div>
          </div>

          {/* Motif */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Motif du mouvement *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="Ex: Achat papier pour imprimante ticket"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-colors"
            />

            {/* Suggestions de motifs */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickReasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Bénéficiaire / Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Bénéficiaire / Justificatif (Optionnel)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Reçu n°102 - Coursier Jean"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`px-5 py-2 text-sm font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 ${
                isWithdrawal
                  ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
              }`}
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validation...</span>
                </>
              ) : (
                <span>{isWithdrawal ? "Valider le Décaissement" : "Valider le Dépôt"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

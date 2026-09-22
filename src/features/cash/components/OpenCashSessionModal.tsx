// src/features/cash/components/OpenCashSessionModal.tsx
import { useState, useActionState } from "react";
import { Coins, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { openSessionAction } from "../actions/cashActions";
import type { CashSession } from "../types";

interface OpenCashSessionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentUserId: number;
  currentUserName?: string;
  onSuccess: (session: CashSession) => void;
  canCancel?: boolean;
}

const PRESET_AMOUNTS = [0, 10000, 25000, 50000, 100000];

export function OpenCashSessionModal({
  isOpen,
  onClose,
  currentUserId,
  currentUserName,
  onSuccess,
  canCancel = true
}: OpenCashSessionModalProps) {
  const [openingAmount, setOpeningAmount] = useState<number>(25000);
  const [notes, setNotes] = useState<string>("");

  const [actionState, formAction, isPending] = useActionState(
    async (_prevState: { error?: string } | null) => {
      if (openingAmount < 0) {
        return { error: "Le fond de caisse ne peut pas être négatif." };
      }

      try {
        const session = await openSessionAction(currentUserId, openingAmount, notes);
        onSuccess(session);
        if (onClose) onClose();
        return null;
      } catch (err: unknown) {
        return {
          error: err instanceof Error ? err.message : "Erreur lors de l'ouverture de caisse."
        };
      }
    },
    null
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="open-session-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2720ff]/10 text-[#2720ff] flex items-center justify-center font-bold">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 id="open-session-title" className="text-lg font-bold text-slate-900">
                Ouverture de Caisse
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Caissier : <span className="font-semibold text-slate-700">{currentUserName || "Session Active"}</span>
              </p>
            </div>
          </div>
          {canCancel && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <form action={formAction} className="p-6 space-y-5">
          {actionState?.error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionState.error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Fond de Caisse Initial (FCFA)
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={500}
                value={openingAmount}
                onChange={(e) => setOpeningAmount(Math.max(0, parseInt(e.target.value) || 0))}
                required
                className="w-full px-4 py-3 text-2xl font-black text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-[#2720ff] focus:ring-4 focus:ring-[#2720ff]/10 outline-hidden transition-all"
                placeholder="0"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                FCFA
              </span>
            </div>

            {/* Raccourcis montants */}
            <div className="flex flex-wrap gap-2 pt-1">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setOpeningAmount(val)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                    openingAmount === val
                      ? "bg-[#2720ff] text-white border-[#2720ff] shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {val.toLocaleString("fr-FR")} F
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Notes / Observations (Optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ex: Billets de 10 000 x 2, pièces de 500 x 10..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-colors resize-none"
            />
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-[#2720ff] shrink-0 mt-0.5" />
            <p>
              Le fond de caisse initial sera comptabilisé dans le solde théorique lors de la clôture journalière (Ticket Z).
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {canCancel && onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-[#2720ff] hover:bg-[#201ac9] rounded-xl shadow-md shadow-[#2720ff]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Ouverture en cours...</span>
                </>
              ) : (
                <span>Ouvrir la Caisse</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

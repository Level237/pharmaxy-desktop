// src/features/stock/components/DeleteProductModal.tsx
import { useActionState } from "react";
import { AlertTriangle, X } from "lucide-react";
import type { ProductWithStock } from "../types";
import { deleteProductAction } from "../actions/stockActions";

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithStock | null;
  onSuccess: () => void;
}

export function DeleteProductModal({
  isOpen,
  onClose,
  product,
  onSuccess
}: DeleteProductModalProps) {
  const [actionState, formAction, isPending] = useActionState(
    async (_prevState: { error?: string } | null) => {
      if (!product) return { error: "Aucun produit sélectionné" };

      try {
        await deleteProductAction(product.id);
        onSuccess();
        onClose();
        return null;
      } catch (err: unknown) {
        return {
          error: err instanceof Error ? err.message : "Erreur lors de la suppression du produit."
        };
      }
    },
    null
  );

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            <h3 id="delete-product-title" className="text-lg font-bold text-slate-900">
              Archiver ce médicament ?
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Êtes-vous certain de vouloir archiver{" "}
              <span className="font-bold text-slate-900">{product.name}</span>
              {product.dci && <span> ({product.dci})</span>} ?
            </p>

            <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-800 space-y-1">
              <p className="font-semibold">⚠️ Conséquences de l'archivage :</p>
              <p>• Le médicament ne sera plus proposé à la vente dans le POS.</p>
              <p>• L'historique des ventes antérieures et la traçabilité réglementaire sont conservés.</p>
              {product.total_stock > 0 && (
                <p className="font-bold text-amber-900">
                  • Attention : {product.total_stock} unité(s) encore en stock !
                </p>
              )}
            </div>

            {actionState?.error && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                {actionState.error}
              </div>
            )}
          </div>

          <form action={formAction} className="mt-6 flex items-center justify-end gap-3">
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
              className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Archivage...</span>
                </>
              ) : (
                <span>Archiver le Produit</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

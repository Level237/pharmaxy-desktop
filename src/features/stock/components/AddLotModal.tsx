// src/features/stock/components/AddLotModal.tsx
import { useState, useActionState, useEffect } from "react";
import { X, PlusCircle, AlertCircle, Calendar, Hash, Truck, DollarSign } from "lucide-react";
import type { ProductWithStock } from "../types";
import { createLotAction } from "../actions/stockActions";

interface AddLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithStock | null;
  suppliers: { id: number; name: string }[];
  onSuccess: () => void;
}

export function AddLotModal({
  isOpen,
  onClose,
  product,
  suppliers,
  onSuccess
}: AddLotModalProps) {
  const [lotNumber, setLotNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [supplierId, setSupplierId] = useState<number | null>(null);

  // Initialisation à l'ouverture pour le produit sélectionné
  useEffect(() => {
    if (product && isOpen) {
      const year = new Date().getFullYear();
      setLotNumber(`LOT-${year}-${Math.floor(1000 + Math.random() * 9000)}`);
      
      const defaultExp = new Date();
      defaultExp.setFullYear(defaultExp.getFullYear() + 2);
      setExpiryDate(defaultExp.toISOString().split("T")[0]);
      
      setQuantity(10);
      setPurchasePrice(product.purchase_price || 0);
      setSupplierId(suppliers.length > 0 ? suppliers[0].id : null);
    }
  }, [product, isOpen, suppliers]);

  const [actionState, formAction, isPending] = useActionState(
    async (_prevState: { error?: string } | null, formData: FormData) => {
      if (!product) return { error: "Aucun produit sélectionné" };

      const lotNum = (formData.get("lot_number") as string)?.trim();
      const expDate = formData.get("expiry_date") as string;
      const qty = parseInt(formData.get("quantity") as string, 10);
      const buyPrice = parseFloat(formData.get("purchase_price") as string) || 0;
      const supIdRaw = formData.get("supplier_id") as string;
      const supId = supIdRaw ? parseInt(supIdRaw, 10) : null;

      if (!lotNum) {
        return { error: "Le numéro de lot est obligatoire." };
      }
      if (!expDate) {
        return { error: "La date de péremption est obligatoire." };
      }
      if (isNaN(qty) || qty <= 0) {
        return { error: "La quantité entrée doit être supérieure à 0." };
      }

      try {
        await createLotAction({
          product_id: product.id,
          lot_number: lotNum,
          expiry_date: expDate,
          purchase_price: buyPrice,
          quantity_in_stock: qty,
          supplier_id: supId
        });

        onSuccess();
        onClose();
        return null;
      } catch (err: unknown) {
        return { 
          error: err instanceof Error ? err.message : "Erreur lors de l'ajout du lot." 
        };
      }
    },
    null
  );

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-lot-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2720ff]/10 text-[#2720ff] flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="add-lot-title" className="text-lg font-bold text-slate-900">
                Approvisionner un Lot (FEFO)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {product.name} {product.dosage && `• ${product.dosage}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info rappel produit */}
        <div className="px-6 py-3 bg-blue-50/60 border-b border-blue-100/60 flex items-center justify-between text-xs text-blue-900">
          <div>
            <span className="text-slate-500">Stock actuel : </span>
            <span className="font-bold text-slate-800">{product.total_stock} unités</span>
          </div>
          <div>
            <span className="text-slate-500">Prix Vente : </span>
            <span className="font-bold text-slate-800">{product.selling_price.toLocaleString("fr-FR")} FCFA</span>
          </div>
        </div>

        {/* Formulaire */}
        <form action={formAction} className="p-6 space-y-4">
          {actionState?.error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionState.error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Numéro de Lot */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                N° de Lot *
              </label>
              <input
                type="text"
                name="lot_number"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                placeholder="Ex: LOT-2026-4421"
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-mono focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-colors"
              />
            </div>

            {/* Date de Péremption */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Date Péremption *
              </label>
              <input
                type="date"
                name="expiry_date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantité reçue */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Quantité reçue (Unités) *
              </label>
              <input
                type="number"
                name="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                min={1}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-semibold focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-colors"
              />
            </div>

            {/* Prix d'Achat Unitaire */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Prix Achat Unitaire (FCFA)
              </label>
              <input
                type="number"
                name="purchase_price"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                min={0}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* Fournisseur */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              Fournisseur (Optionnel)
            </label>
            <select
              name="supplier_id"
              value={supplierId ?? ""}
              onChange={(e) => setSupplierId(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-hidden transition-colors"
            >
              <option value="">Sélectionner un fournisseur...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Footer boutons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
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
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#2720ff] hover:bg-[#201ac9] rounded-xl shadow-md shadow-[#2720ff]/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <span>Ajouter au Stock</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

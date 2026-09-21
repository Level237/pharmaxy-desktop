// src/features/stock/components/ProductFormModal.tsx
import { useState, useActionState } from "react";
import { X, Sparkles, AlertTriangle, ShieldAlert } from "lucide-react";
import type { ProductFormData, ProductWithStock } from "../types";
import { createProductAction, updateProductAction } from "../actions/stockActions";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: ProductWithStock | null;
  categories: { id: number; name: string }[];
  suppliers: { id: number; name: string }[];
  onSuccess: () => void;
}

export function ProductFormModal({
  isOpen,
  onClose,
  productToEdit,
  categories,
  suppliers,
  onSuccess
}: ProductFormModalProps) {
  const isEditing = !!productToEdit;

  const [formData, setFormData] = useState<ProductFormData>(() => {
    if (productToEdit) {
      return {
        id: productToEdit.id,
        name: productToEdit.name,
        dci: productToEdit.dci || "",
        form: productToEdit.form || "",
        dosage: productToEdit.dosage || "",
        packaging: productToEdit.packaging || "",
        barcode: productToEdit.barcode || "",
        selling_price: productToEdit.selling_price || 0,
        purchase_price: productToEdit.purchase_price || 0,
        min_stock_alert: productToEdit.min_stock_alert || 5,
        category_id: productToEdit.category_id,
        category: productToEdit.category || "",
        is_narcotic: productToEdit.is_narcotic === 1
      };
    }
    return {
      name: "",
      dci: "",
      form: "Comprimé",
      dosage: "",
      packaging: "Boîte de 30",
      barcode: "",
      selling_price: 0,
      purchase_price: 0,
      min_stock_alert: 5,
      category_id: categories.length > 0 ? categories[0].id : null,
      category: categories.length > 0 ? categories[0].name : "",
      is_narcotic: false,
      initial_lot_number: "LOT-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000),
      initial_expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split("T")[0],
      initial_quantity: 20,
      initial_supplier_id: suppliers.length > 0 ? suppliers[0].id : null
    };
  });

  const [formError, submitAction, isPending] = useActionState(
    async (_prev: string | null): Promise<string | null> => {
      try {
        if (!formData.name.trim()) {
          return "Le nom commercial du médicament est obligatoire.";
        }
        if (formData.selling_price <= 0) {
          return "Le prix de vente public doit être supérieur à 0 FCFA.";
        }

        if (isEditing && formData.id) {
          await updateProductAction(formData.id, formData);
        } else {
          await createProductAction(formData);
        }

        onSuccess();
        onClose();
        return null;
      } catch (err: any) {
        console.error("Erreur enregistrement produit:", err);
        return err?.message || "Erreur lors de l'enregistrement du médicament.";
      }
    },
    null
  );

  const generateRandomBarcode = () => {
    const random13 = "3400" + Math.floor(100000000 + Math.random() * 900000000).toString();
    setFormData(prev => ({ ...prev, barcode: random13 }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* 1. Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              {isEditing ? `Modifier : ${productToEdit?.name}` : "Nouveau Médicament au Catalogue"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing 
                ? "Mise à jour des informations et tarification" 
                : "Enregistrement de la fiche produit et initialisation du stock"
              }
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. Message d'erreur */}
        {formError && (
          <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-xs font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{formError}</span>
          </div>
        )}

        {/* 3. Formulaire */}
        <form action={submitAction} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1 : Informations Générales */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              1. Identité du Médicament
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom Commercial *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: Paracétamol Biogaran, Augmentin..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dénomination Commune (DCI)
                </label>
                <input
                  type="text"
                  value={formData.dci}
                  onChange={(e) => setFormData({ ...formData, dci: e.target.value })}
                  placeholder="ex: Paracétamol, Amoxicilline..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={formData.category_id || ""}
                  onChange={(e) => {
                    const catId = e.target.value ? Number(e.target.value) : null;
                    const cat = categories.find(c => c.id === catId);
                    setFormData({ ...formData, category_id: catId, category: cat?.name || "" });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-none transition-all"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Forme Galénique
                </label>
                <input
                  type="text"
                  value={formData.form}
                  onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                  placeholder="ex: Comprimé, Sirop, Gélule..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dosage & Conditionnement
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="Dosage (ex: 500mg)"
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#2720ff] outline-none"
                  />
                  <input
                    type="text"
                    value={formData.packaging}
                    onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
                    placeholder="Cond. (ex: Bte de 16)"
                    className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-900 focus:bg-white focus:border-[#2720ff] outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Code-barres EAN / GTIN
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Scannez avec la douchette ou saisissez les 13 chiffres..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold font-mono text-slate-900 focus:bg-white focus:border-[#2720ff] outline-none"
                  />
                  <button
                    type="button"
                    onClick={generateRandomBarcode}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#2720ff]" />
                    <span>Générer</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2 : Tarifs & Seuils */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Tarification & Gestion du Stock
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prix de Vente (FCFA) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.selling_price || ""}
                  onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-[#2720ff] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prix d'Achat (FCFA)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.purchase_price || ""}
                  onChange={(e) => setFormData({ ...formData, purchase_price: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:bg-white focus:border-[#2720ff] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seuil Alerte Stock Bas
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.min_stock_alert}
                  onChange={(e) => setFormData({ ...formData, min_stock_alert: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:bg-white focus:border-[#2720ff] outline-none"
                />
              </div>
            </div>

            {/* Checkbox Stupéfiant */}
            <div className="flex items-center gap-2.5 pt-2">
              <input
                type="checkbox"
                id="is_narcotic"
                checked={formData.is_narcotic}
                onChange={(e) => setFormData({ ...formData, is_narcotic: e.target.checked })}
                className="h-4 w-4 text-[#2720ff] rounded border-slate-300 focus:ring-[#2720ff] cursor-pointer"
              />
              <label htmlFor="is_narcotic" className="text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1.5">
                <span>Substance vénéneuse / Stupéfiant réglementé (Tableau A / B)</span>
                <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
              </label>
            </div>
          </div>

          {/* Section 3 : Premier Lot (Uniquement en création) */}
          {!isEditing && (
            <div className="space-y-4 pt-4 border-t border-slate-100 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#2720ff] uppercase tracking-wider">
                  3. Stock Initial (Premier Lot)
                </h4>
                <span className="text-[10px] text-slate-500 font-semibold">Traçabilité FEFO</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    N° de Lot
                  </label>
                  <input
                    type="text"
                    value={formData.initial_lot_number}
                    onChange={(e) => setFormData({ ...formData, initial_lot_number: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-900 focus:border-[#2720ff] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date de Péremption
                  </label>
                  <input
                    type="date"
                    value={formData.initial_expiry_date}
                    onChange={(e) => setFormData({ ...formData, initial_expiry_date: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-900 focus:border-[#2720ff] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quantité en Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.initial_quantity || ""}
                    onChange={(e) => setFormData({ ...formData, initial_quantity: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-900 focus:border-[#2720ff] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fournisseur d'Origine
                  </label>
                  <select
                    value={formData.initial_supplier_id || ""}
                    onChange={(e) => setFormData({ ...formData, initial_supplier_id: e.target.value ? Number(e.target.value) : null })}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-900 focus:border-[#2720ff] outline-none"
                  >
                    <option value="">Sélectionner un fournisseur</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 4. Boutons d'action */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-600 text-xs font-bold transition-all cursor-pointer"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-xl bg-[#2720ff] hover:bg-[#1f19cc] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#2720ff]/20 active:scale-98 disabled:opacity-50"
            >
              {isPending ? "Enregistrement..." : isEditing ? "Enregistrer les modifications" : "Créer le Médicament"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

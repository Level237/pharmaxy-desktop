// src/features/deliveries/components/DeliveryFormModal.tsx
import { useState, useEffect, useTransition } from "react";
import { 
    X, 
    Truck, 
    Plus, 
    Trash2, 
    Package, 
    Calendar, 
    Building2, 
    CheckCircle2, 
    AlertCircle 
} from "lucide-react";
import { 
    SupplierEntity, 
    DeliveryItemInput, 
    DeliveryDetail 
} from "../types";
import { createDeliveryAction, fetchSuppliers } from "../actions/deliveriesActions";
import { fetchStockCatalogue } from "../../stock/actions/stockActions";
import type { ProductWithStock } from "../../../db/productQueries";
import { useAuth } from "../../../shared/context/AuthContext";

interface DeliveryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (delivery: DeliveryDetail) => void;
    onOpenNewSupplier: () => void;
}

export function DeliveryFormModal({
    isOpen,
    onClose,
    onSuccess,
    onOpenNewSupplier
}: DeliveryFormModalProps) {
    const { user } = useAuth();
    const [suppliers, setSuppliers] = useState<SupplierEntity[]>([]);
    const [products, setProducts] = useState<ProductWithStock[]>([]);
    
    // Form fields
    const [supplierId, setSupplierId] = useState<number | "">("");
    const [invoiceNumber, setInvoiceNumber] = useState<string>("");
    const [deliveryDate, setDeliveryDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [notes, setNotes] = useState<string>("");
    
    // Items array
    const [items, setItems] = useState<DeliveryItemInput[]>([
        {
            productId: 0,
            lotNumber: "",
            expiryDate: "",
            quantityReceived: 10,
            purchasePrice: 0
        }
    ]);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (isOpen) {
            fetchSuppliers().then(setSuppliers).catch(console.error);
            fetchStockCatalogue().then(setProducts).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddItemRow = () => {
        setItems(prev => [
            ...prev,
            {
                productId: 0,
                lotNumber: "",
                expiryDate: "",
                quantityReceived: 10,
                purchasePrice: 0
            }
        ]);
    };

    const handleRemoveItemRow = (index: number) => {
        if (items.length <= 1) return;
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof DeliveryItemInput, value: any) => {
        setItems(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };

            // Si changement de produit, pré-remplir le prix d'achat
            if (field === 'productId') {
                const prod = products.find(p => p.id === Number(value));
                if (prod && prod.purchase_price) {
                    next[index].purchasePrice = prod.purchase_price;
                }
            }

            return next;
        });
    };

    const totalAmount = items.reduce((acc, it) => acc + (it.quantityReceived * it.purchasePrice), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!supplierId) {
            setErrorMessage("Veuillez sélectionner un fournisseur.");
            return;
        }

        if (!invoiceNumber.trim()) {
            setErrorMessage("Le numéro de bon de livraison (BL) est obligatoire.");
            return;
        }

        if (items.length === 0) {
            setErrorMessage("Le bon de livraison doit comporter au moins un article.");
            return;
        }

        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            if (!it.productId) {
                setErrorMessage(`Veuillez sélectionner un produit pour la ligne #${i + 1}.`);
                return;
            }
            if (!it.lotNumber.trim()) {
                setErrorMessage(`Le numéro de lot est requis pour la ligne #${i + 1}.`);
                return;
            }
            if (!it.expiryDate) {
                setErrorMessage(`La date de péremption est requise pour la ligne #${i + 1}.`);
                return;
            }
            if (it.quantityReceived <= 0) {
                setErrorMessage(`La quantité reçue doit être supérieure à 0 pour la ligne #${i + 1}.`);
                return;
            }
            if (it.purchasePrice < 0) {
                setErrorMessage(`Le prix d'achat ne peut pas être négatif pour la ligne #${i + 1}.`);
                return;
            }
        }

        startTransition(async () => {
            try {
                const result = await createDeliveryAction({
                    supplierId: Number(supplierId),
                    invoiceNumber: invoiceNumber.trim(),
                    deliveryDate,
                    notes: notes.trim() || undefined,
                    receivedByUserId: user?.id || 1,
                    items
                });

                onSuccess(result);
            } catch (err: any) {
                console.error("Erreur enregistrement BL:", err);
                setErrorMessage(err?.message || "Erreur lors de l'enregistrement de la livraison.");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
                
                {/* 1. Header du modal */}
                <div className="px-6 py-5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#2720ff] text-white flex items-center justify-center shadow-md shadow-[#2720ff]/20">
                            <Truck className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 leading-tight">
                                Réception de Livraison (Entrée de Stock)
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Enregistrement du Bon de Livraison (BL) et création automatique des lots FEFO
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* 2. Formulaire */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 overflow-y-auto space-y-6 flex-1">
                        {/* Section Métadonnées BL */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
                            {/* Fournisseur */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                        Fournisseur *
                                    </label>
                                    <button
                                        type="button"
                                        onClick={onOpenNewSupplier}
                                        className="text-[11px] font-bold text-[#2720ff] hover:underline cursor-pointer"
                                    >
                                        + Nouveau
                                    </button>
                                </div>
                                <select
                                    value={supplierId}
                                    onChange={(e) => setSupplierId(e.target.value ? Number(e.target.value) : "")}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2720ff]/30 focus:border-[#2720ff]"
                                >
                                    <option value="">-- Choisir un répartiteur --</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* N° Bon de Livraison */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    N° Bon de Livraison / Facture *
                                </label>
                                <input
                                    type="text"
                                    value={invoiceNumber}
                                    onChange={(e) => setInvoiceNumber(e.target.value)}
                                    placeholder="ex: BL-LAB-2024-8841"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2720ff]/30 focus:border-[#2720ff]"
                                />
                            </div>

                            {/* Date de réception */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                    Date de Réception *
                                </label>
                                <input
                                    type="date"
                                    value={deliveryDate}
                                    onChange={(e) => setDeliveryDate(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2720ff]/30 focus:border-[#2720ff]"
                                />
                            </div>
                        </div>

                        {/* Section Lignes d'articles reçus */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                    <Package className="h-4 w-4 text-[#2720ff]" />
                                    <span>Articles & Lots Réceptionnés ({items.length})</span>
                                </h4>
                                <button
                                    type="button"
                                    onClick={handleAddItemRow}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#2720ff] hover:bg-[#1f19d4] text-white shadow-sm shadow-[#2720ff]/20 transition-all cursor-pointer"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Ajouter un produit
                                </button>
                            </div>

                            <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                            <tr>
                                                <th className="py-3 px-4 w-[280px]">Produit *</th>
                                                <th className="py-3 px-3 w-[140px]">N° Lot *</th>
                                                <th className="py-3 px-3 w-[140px]">Péremption *</th>
                                                <th className="py-3 px-3 w-[100px]">Quantité *</th>
                                                <th className="py-3 px-3 w-[130px]">P.A. Unitaire (F) *</th>
                                                <th className="py-3 px-3 w-[120px] text-right">Sous-total</th>
                                                <th className="py-3 px-3 w-[50px]"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {items.map((row, index) => {
                                                const lineSubtotal = row.quantityReceived * row.purchasePrice;
                                                return (
                                                    <tr key={index} className="hover:bg-slate-50/50">
                                                        {/* Produit */}
                                                        <td className="py-2.5 px-4">
                                                            <select
                                                                value={row.productId}
                                                                onChange={(e) => handleItemChange(index, 'productId', Number(e.target.value))}
                                                                required
                                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2720ff]"
                                                            >
                                                                <option value="0">-- Choisir un produit --</option>
                                                                {products.map(p => (
                                                                    <option key={p.id} value={p.id}>
                                                                        {p.name} {p.dosage ? `(${p.dosage})` : ""}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>

                                                        {/* N° Lot */}
                                                        <td className="py-2.5 px-3">
                                                            <input
                                                                type="text"
                                                                value={row.lotNumber}
                                                                onChange={(e) => handleItemChange(index, 'lotNumber', e.target.value)}
                                                                placeholder="ex: LT24-001"
                                                                required
                                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2720ff]"
                                                            />
                                                        </td>

                                                        {/* Péremption */}
                                                        <td className="py-2.5 px-3">
                                                            <input
                                                                type="date"
                                                                value={row.expiryDate}
                                                                onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                                                                required
                                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2720ff]"
                                                            />
                                                        </td>

                                                        {/* Quantité */}
                                                        <td className="py-2.5 px-3">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={row.quantityReceived}
                                                                onChange={(e) => handleItemChange(index, 'quantityReceived', parseInt(e.target.value) || 0)}
                                                                required
                                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center focus:outline-none focus:ring-1 focus:ring-[#2720ff]"
                                                            />
                                                        </td>

                                                        {/* Prix d'achat unitaire */}
                                                        <td className="py-2.5 px-3">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={row.purchasePrice}
                                                                onChange={(e) => handleItemChange(index, 'purchasePrice', parseInt(e.target.value) || 0)}
                                                                required
                                                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-right focus:outline-none focus:ring-1 focus:ring-[#2720ff]"
                                                            />
                                                        </td>

                                                        {/* Sous-total */}
                                                        <td className="py-2.5 px-3 text-right font-black text-slate-900">
                                                            {lineSubtotal.toLocaleString()} F
                                                        </td>

                                                        {/* Supprimer ligne */}
                                                        <td className="py-2.5 px-3 text-center">
                                                            {items.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveItemRow(index)}
                                                                    className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Notes additionnelles */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Notes / Observations du bon de livraison (facultatif)
                            </label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="ex: Colis reçu en bon état, vérifié par le pharmacien..."
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2720ff]/30 focus:border-[#2720ff]"
                            />
                        </div>

                        {/* Erreur */}
                        {errorMessage && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-700">
                                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                                <span>{errorMessage}</span>
                            </div>
                        )}
                    </div>

                    {/* 3. Footer du formulaire avec total et validation */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                Total Bon de Livraison
                            </span>
                            <p className="text-xl font-black text-slate-900">
                                {totalAmount.toLocaleString()} <span className="text-xs font-bold text-slate-500">FCFA</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isPending}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isPending || items.length === 0}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#2720ff] hover:bg-[#1f19d4] text-white shadow-lg shadow-[#2720ff]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                {isPending ? (
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                )}
                                <span>Enregistrer & Créer les Lots FEFO</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

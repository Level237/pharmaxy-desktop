// src/features/deliveries/components/DeliveryDetailModal.tsx
import { useEffect, useState } from "react";
import { 
    X, 
    Truck, 
    Printer, 
    Building2, 
    Calendar, 
    User, 
    FileText 
} from "lucide-react";
import { DeliveryDetail } from "../types";
import { fetchDeliveryDetail } from "../actions/deliveriesActions";
import { getPharmacyInfo } from "../../../db/pharmacyQueries";

interface DeliveryDetailModalProps {
    deliveryId: number | null;
    isOpen: boolean;
    onClose: () => void;
}

export function DeliveryDetailModal({
    deliveryId,
    isOpen,
    onClose
}: DeliveryDetailModalProps) {
    const [detail, setDetail] = useState<DeliveryDetail | null>(null);
    const [pharmacy, setPharmacy] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && deliveryId) {
            setIsLoading(true);
            Promise.all([
                fetchDeliveryDetail(deliveryId),
                getPharmacyInfo()
            ]).then(([d, p]) => {
                setDetail(d);
                setPharmacy(p);
            }).finally(() => {
                setIsLoading(false);
            });
        } else {
            setDetail(null);
        }
    }, [isOpen, deliveryId]);

    if (!isOpen || !deliveryId) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* 1. Header & Actions */}
                <div className="px-6 py-5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between no-print">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#2720ff] text-white flex items-center justify-center shadow-md shadow-[#2720ff]/20">
                            <Truck className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 leading-tight">
                                Bon de Réception N° {detail?.invoice_number || `BL-#${deliveryId}`}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Fournisseur : <span className="font-bold text-slate-800">{detail?.supplier_name}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2720ff] hover:bg-[#1f19d4] text-white shadow-sm shadow-[#2720ff]/20 transition-all cursor-pointer"
                        >
                            <Printer className="h-4 w-4" />
                            Imprimer Bordereau
                        </button>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* 2. Contenu détaillé & Format Bordereau Imprimable */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6 printable-area">
                    {isLoading ? (
                        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <div className="h-8 w-8 border-2 border-slate-200 border-t-[#2720ff] rounded-full animate-spin" />
                            <span className="text-xs font-medium">Chargement du bon de réception...</span>
                        </div>
                    ) : detail ? (
                        <>
                            {/* En-tête officiel imprimable */}
                            <div className="text-center border-b border-dashed border-slate-300 pb-4 space-y-1">
                                <p className="font-bold text-[10px] text-slate-500 uppercase tracking-widest">RÉPUBLIQUE DU CAMEROUN</p>
                                <p className="font-bold text-[9px] text-slate-400">MINISTÈRE DE LA SANTÉ PUBLIQUE</p>
                                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mt-1">
                                    {pharmacy?.name || "PHARMACIE CENTRALE"}
                                </h2>
                                <p className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-1 text-[#2720ff]">
                                    BORDEREAU OFFICIEL DE RÉCEPTION DE MÉDICAMENTS (ENTRÉE EN STOCK)
                                </p>
                            </div>

                            {/* Métadonnées Réception */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <Building2 className="h-3 w-3" /> Fournisseur
                                    </span>
                                    <p className="font-bold text-slate-900 mt-1">{detail.supplier_name}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <FileText className="h-3 w-3" /> N° Facture / BL
                                    </span>
                                    <p className="font-bold font-mono text-slate-900 mt-1">{detail.invoice_number}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Date Réception
                                    </span>
                                    <p className="font-bold text-slate-900 mt-1">
                                        {new Date(detail.delivery_date).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <User className="h-3 w-3" /> Réceptionné par
                                    </span>
                                    <p className="font-bold text-slate-900 mt-1">{detail.received_by_name}</p>
                                </div>
                            </div>

                            {/* Tableau des articles reçus */}
                            <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                                        <tr>
                                            <th className="py-3 px-4">Produit & DCI</th>
                                            <th className="py-3 px-3">N° Lot</th>
                                            <th className="py-3 px-3">Péremption</th>
                                            <th className="py-3 px-3 text-center">Quantité</th>
                                            <th className="py-3 px-3 text-right">P.A. Unitaire</th>
                                            <th className="py-3 px-4 text-right">Sous-Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {detail.items.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/50">
                                                <td className="py-3 px-4">
                                                    <span className="font-bold text-slate-900 block">{item.product_name}</span>
                                                    {item.dci && <span className="text-[10px] text-slate-500 italic">{item.dci}</span>}
                                                </td>
                                                <td className="py-3 px-3 font-mono font-bold text-slate-700">
                                                    {item.lot_number}
                                                </td>
                                                <td className="py-3 px-3 font-medium text-slate-600">
                                                    {new Date(item.expiry_date).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="py-3 px-3 text-center font-black text-slate-900">
                                                    {item.quantity_received}
                                                </td>
                                                <td className="py-3 px-3 text-right font-medium text-slate-700">
                                                    {item.purchase_price.toLocaleString()} F
                                                </td>
                                                <td className="py-3 px-4 text-right font-black text-slate-900">
                                                    {item.subtotal.toLocaleString()} F
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50/80 border-t border-slate-200">
                                        <tr>
                                            <td colSpan={5} className="py-3 px-4 font-bold text-slate-700 text-right uppercase text-[11px]">
                                                Total Général Réception :
                                            </td>
                                            <td className="py-3 px-4 text-right font-black text-base text-[#2720ff]">
                                                {detail.total_amount.toLocaleString()} FCFA
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Signatures officielles imprimables */}
                            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200 text-xs">
                                <div className="text-center">
                                    <p className="font-bold text-slate-700">Visa du Magasinier / Réceptionnaire</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">({detail.received_by_name})</p>
                                    <div className="h-16 border-b border-dotted border-slate-300 mt-2" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-slate-700">Visa du Pharmacien Titulaire</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">(Contrôle de conformité FEFO)</p>
                                    <div className="h-16 border-b border-dotted border-slate-300 mt-2" />
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-slate-400 py-8">Bon de livraison introuvable.</p>
                    )}
                </div>

                {/* 3. Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end no-print">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

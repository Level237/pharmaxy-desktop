// src/features/credits/components/DebtReceiptModal.tsx
import { useEffect, useState } from "react";
import { X, Printer, CheckCircle2 } from "lucide-react";
import { RepaymentReceiptData } from "../types";
import { getPharmacyInfo } from "../../../db/pharmacyQueries";

interface DebtReceiptModalProps {
    receipt: RepaymentReceiptData | null;
    debtContract?: {
        receiptNumber: string;
        clientName: string;
        clientPhone: string | null;
        cashierName: string;
        totalAmount: number;
        dueDate: string;
        itemsSummary?: string;
        createdAt: string;
    } | null;
    isOpen: boolean;
    onClose: () => void;
}

export function DebtReceiptModal({
    receipt,
    debtContract,
    isOpen,
    onClose
}: DebtReceiptModalProps) {
    const [pharmacy, setPharmacy] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            getPharmacyInfo().then(setPharmacy).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen || (!receipt && !debtContract)) return null;

    const handlePrint = () => {
        window.print();
    };

    const isRepayment = Boolean(receipt);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col">
                {/* 1. Barre d'actions supérieure */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between no-print">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm font-bold text-slate-800">
                            {isRepayment ? "Reçu de Versement" : "Reconnaissance de Dette"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#2720ff] hover:bg-[#1f19d4] text-white shadow-sm shadow-[#2720ff]/20 transition-all cursor-pointer"
                        >
                            <Printer className="h-3.5 w-3.5" />
                            Imprimer
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* 2. Format thermique Ticket 80mm imprimable */}
                <div className="p-6 bg-white overflow-y-auto max-h-[80vh] font-mono text-xs text-slate-800 printable-area">
                    {/* En-tête officiel */}
                    <div className="text-center border-b border-dashed border-slate-300 pb-4 mb-4 space-y-1">
                        <p className="font-bold text-[10px] text-slate-500 uppercase tracking-widest">RÉPUBLIQUE DU CAMEROUN</p>
                        <p className="font-bold text-[9px] text-slate-400">MINISTÈRE DE LA SANTÉ PUBLIQUE</p>
                        <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mt-1">
                            {pharmacy?.name || "PHARMACIE CENTRALE"}
                        </h2>
                        {pharmacy?.address && <p className="text-[11px] text-slate-600">{pharmacy.address}</p>}
                        {pharmacy?.phone && <p className="text-[11px] text-slate-600">Tél: {pharmacy.phone}</p>}
                        {pharmacy?.tax_id && <p className="text-[10px] text-slate-500">NIU/RC: {pharmacy.tax_id}</p>}
                    </div>

                    {/* Titre du document */}
                    <div className="text-center py-2 mb-3 bg-slate-100 rounded-lg">
                        <p className="font-black text-xs uppercase tracking-wider text-slate-900">
                            {isRepayment ? "★ REÇU DE VERSEMENT CRÉDIT ★" : "⚠️ BORDEREAU DE DETTE CLIENT ⚠️"}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                            N° {isRepayment ? receipt?.receiptNumber : debtContract?.receiptNumber}
                        </p>
                    </div>

                    {/* Informations générales */}
                    <div className="border-b border-dashed border-slate-300 pb-3 mb-3 space-y-1 text-[11px]">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Date & Heure:</span>
                            <span className="font-bold">
                                {new Date(isRepayment ? (receipt?.createdAt || "") : (debtContract?.createdAt || "")).toLocaleString('fr-FR')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Caissier:</span>
                            <span className="font-bold">{isRepayment ? receipt?.cashierName : debtContract?.cashierName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Patient:</span>
                            <span className="font-bold text-slate-900">{isRepayment ? receipt?.clientName : debtContract?.clientName}</span>
                        </div>
                        {(receipt?.clientPhone || debtContract?.clientPhone) && (
                            <div className="flex justify-between">
                                <span className="text-slate-500">Contact:</span>
                                <span>{isRepayment ? receipt?.clientPhone : debtContract?.clientPhone}</span>
                            </div>
                        )}
                    </div>

                    {/* Détails financiers */}
                    {isRepayment ? (
                        <div className="border-b border-dashed border-slate-300 pb-3 mb-3 space-y-1.5 text-xs">
                            <div className="flex justify-between text-slate-600">
                                <span>Ancienne Dette:</span>
                                <span>{receipt?.previousDebt?.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between font-black text-sm text-[#2720ff] py-1 border-y border-slate-200">
                                <span>MONTANT VERSÉ:</span>
                                <span>+{receipt?.amountPaid?.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-900 pt-1">
                                <span>NOUVEAU SOLDE DÛ:</span>
                                <span className={receipt && receipt.remainingDebt > 0 ? "text-red-600" : "text-emerald-600"}>
                                    {receipt?.remainingDebt?.toLocaleString()} FCFA
                                </span>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                                <span>Mode règlement:</span>
                                <span className="uppercase font-bold">
                                    {receipt?.paymentMethod === 'cash' ? 'Espèces' : receipt?.paymentMethod === 'mobile_money' ? (receipt.mobileMoneyProvider || 'Mobile Money') : receipt?.paymentMethod}
                                </span>
                            </div>
                            {receipt?.mobileMoneyRef && (
                                <div className="flex justify-between text-[10px] text-slate-500">
                                    <span>Réf MoMo:</span>
                                    <span className="font-mono">{receipt.mobileMoneyRef}</span>
                                </div>
                            )}
                            {receipt?.notes && (
                                <div className="text-[10px] text-slate-500 italic mt-1">
                                    Obs: {receipt.notes}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="border-b border-dashed border-slate-300 pb-3 mb-3 space-y-2 text-xs">
                            <div className="flex justify-between font-black text-sm text-red-600 py-1 border-y border-slate-200">
                                <span>MONTANT DE LA DETTE:</span>
                                <span>{debtContract?.totalAmount?.toLocaleString()} FCFA</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-slate-700">
                                <span>Date d'échéance max:</span>
                                <span className="text-red-600 font-black">{debtContract?.dueDate}</span>
                            </div>
                            {debtContract?.itemsSummary && (
                                <div className="text-[10px] text-slate-600 pt-1">
                                    <span className="font-bold">Articles: </span>
                                    {debtContract.itemsSummary}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mention légale & Signatures */}
                    <div className="text-[10px] text-slate-500 text-center space-y-2 pt-2">
                        {isRepayment ? (
                            <p className="italic">
                                Ce reçu atteste du versement de la somme indiquée ci-dessus en déduction de la dette contractée. Conservez ce reçu.
                            </p>
                        ) : (
                            <p className="text-[9px] text-slate-600 text-justify leading-tight">
                                « Je soussigné(e), reconnais par la présente devoir la somme de <strong className="text-slate-900">{debtContract?.totalAmount?.toLocaleString()} FCFA</strong> à la pharmacie pour médicaments délivrés ce jour, et m'engage formellement à la régler au plus tard le <strong className="text-slate-900">{debtContract?.dueDate}</strong>. »
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-6 text-[10px] text-slate-700 border-t border-slate-200 mt-4">
                            <div className="text-center">
                                <p className="font-bold">Pour la Pharmacie</p>
                                <div className="h-10 border-b border-dotted border-slate-400 mt-2" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold">Le Débiteur / Patient</p>
                                <div className="h-10 border-b border-dotted border-slate-400 mt-2" />
                            </div>
                        </div>

                        <p className="text-[9px] text-slate-400 pt-3">
                            Pharmaxy v0.1 • Système Officinal Agréé MINSANTE
                        </p>
                    </div>
                </div>

                {/* 3. Footer modal */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between no-print">
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#2720ff] hover:bg-[#1f19d4] text-white shadow-md shadow-[#2720ff]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        <Printer className="h-4 w-4" />
                        Imprimer le Reçu
                    </button>
                </div>
            </div>
        </div>
    );
}

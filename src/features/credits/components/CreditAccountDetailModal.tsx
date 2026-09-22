// src/features/credits/components/CreditAccountDetailModal.tsx
import { useEffect, useState, useTransition } from "react";
import { 
    X, 
    FileText, 
    Clock, 
    Phone, 
    MapPin, 
    CheckCircle2, 
    Receipt, 
    Printer,
    Banknote
} from "lucide-react";
import { CreditClientSummary, ClientCreditLedger, RepaymentReceiptData } from "../types";
import { fetchClientLedgerAction } from "../actions/creditActions";

interface CreditAccountDetailModalProps {
    client: CreditClientSummary | null;
    isOpen: boolean;
    onClose: () => void;
    onOpenRepayment: (client: CreditClientSummary) => void;
    onPrintRepaymentReceipt: (receipt: RepaymentReceiptData) => void;
}

export function CreditAccountDetailModal({
    client,
    isOpen,
    onClose,
    onOpenRepayment,
    onPrintRepaymentReceipt
}: CreditAccountDetailModalProps) {
    const [ledger, setLedger] = useState<ClientCreditLedger | null>(null);
    const [activeTab, setActiveTab] = useState<'sales' | 'repayments'>('sales');
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (isOpen && client) {
            startTransition(async () => {
                const data = await fetchClientLedgerAction(client.id);
                setLedger(data);
            });
        } else {
            setLedger(null);
        }
    }, [isOpen, client]);

    if (!isOpen || !client) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                
                {/* 1. Header du dossier crédit */}
                <div className="px-6 py-5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#2720ff] text-white flex items-center justify-center shadow-md shadow-[#2720ff]/20">
                            <Receipt className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 leading-tight">
                                Relevé de Compte Crédit
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Patient : <span className="font-bold text-slate-800">{client.name}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* 2. Profil & Synthèse financière */}
                <div className="px-6 py-4 bg-slate-100/60 border-b border-slate-200/60 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Coordonnées
                        </span>
                        <p className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            {client.phone || "Non renseigné"}
                        </p>
                        {client.address && (
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                {client.address}
                            </p>
                        )}
                    </div>

                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Plafond Accordé
                        </span>
                        <p className="text-sm font-black text-slate-800 mt-1">
                            {client.max_credit_limit.toLocaleString()} FCFA
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                            {client.debt_balance > 0 
                                ? `${Math.round((client.debt_balance / client.max_credit_limit) * 100)}% utilisé`
                                : "Plafond intact"}
                        </p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3">
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Solde Débiteur
                            </span>
                            <p className={`text-xl font-black mt-0.5 ${
                                client.debt_balance > 0 ? "text-red-600" : "text-emerald-600"
                            }`}>
                                {client.debt_balance.toLocaleString()} <span className="text-xs">FCFA</span>
                            </p>
                        </div>
                        {client.debt_balance > 0 && (
                            <button
                                onClick={() => {
                                    onClose();
                                    onOpenRepayment(client);
                                }}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2720ff] hover:bg-[#1f19d4] text-white shadow-sm shadow-[#2720ff]/20 transition-all cursor-pointer"
                            >
                                Encaisser
                            </button>
                        )}
                    </div>
                </div>

                {/* 3. Navigation par onglets */}
                <div className="px-6 pt-3 border-b border-slate-200 flex gap-4">
                    <button
                        onClick={() => setActiveTab('sales')}
                        className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                            activeTab === 'sales'
                                ? "border-[#2720ff] text-[#2720ff]"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <FileText className="h-4 w-4" />
                        <span>Factures à Crédit ({ledger?.creditSales.length || 0})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('repayments')}
                        className={`pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
                            activeTab === 'repayments'
                                ? "border-[#2720ff] text-[#2720ff]"
                                : "border-transparent text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <Clock className="h-4 w-4" />
                        <span>Historique des Versements ({ledger?.repayments.length || 0})</span>
                    </button>
                </div>

                {/* 4. Corps déroulant */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {isPending ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <div className="h-8 w-8 border-2 border-slate-200 border-t-[#2720ff] rounded-full animate-spin" />
                            <span className="text-xs font-medium">Chargement du relevé de compte...</span>
                        </div>
                    ) : activeTab === 'sales' ? (
                        /* Liste des factures à crédit */
                        ledger?.creditSales && ledger.creditSales.length > 0 ? (
                            <div className="space-y-3">
                                {ledger.creditSales.map((sale) => (
                                    <div
                                        key={sale.sale_id}
                                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-bold text-slate-900">
                                                    {sale.receipt_number}
                                                </span>
                                                <span className="text-xs text-slate-400">•</span>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(sale.created_at).toLocaleDateString('fr-FR', {
                                                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-slate-500">Reste à payer : </span>
                                                <span className={`text-sm font-black ${
                                                    sale.remaining_amount > 0 ? "text-red-600" : "text-emerald-600"
                                                }`}>
                                                    {sale.remaining_amount.toLocaleString()} FCFA
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs font-medium text-slate-600 line-clamp-2">
                                            📦 {sale.items_summary || "Médicaments"}
                                        </p>

                                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1 border-t border-slate-200/60">
                                            <span>Montant total : {sale.total_amount.toLocaleString()} FCFA (Déjà payé : {sale.paid_amount.toLocaleString()} F)</span>
                                            <span>Vendeur : {sale.cashier_name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-slate-400">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-700">Aucune facture à crédit en cours.</p>
                            </div>
                        )
                    ) : (
                        /* Historique des versements d'acomptes */
                        ledger?.repayments && ledger.repayments.length > 0 ? (
                            <div className="space-y-3">
                                {ledger.repayments.map((rep) => (
                                    <div
                                        key={rep.id}
                                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-bold text-slate-900">
                                                    {rep.receipt_number}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
                                                    {rep.payment_method === 'cash' ? 'Espèces' : rep.payment_method === 'mobile_money' ? (rep.mobile_money_provider || 'Mobile Money') : rep.payment_method}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 font-medium">
                                                Encaissé le {new Date(rep.created_at).toLocaleDateString('fr-FR', {
                                                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })} par <span className="font-bold text-slate-700">{rep.cashier_name}</span>
                                            </p>
                                            {rep.notes && (
                                                <p className="text-[11px] text-slate-600 italic">
                                                    Note : {rep.notes}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <span className="text-base font-black text-emerald-600">
                                                    +{rep.amount.toLocaleString()} FCFA
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => onPrintRepaymentReceipt({
                                                    receiptNumber: rep.receipt_number,
                                                    clientName: client.name,
                                                    clientPhone: client.phone,
                                                    cashierName: rep.cashier_name,
                                                    amountPaid: rep.amount,
                                                    previousDebt: 0,
                                                    remainingDebt: client.debt_balance,
                                                    paymentMethod: rep.payment_method,
                                                    mobileMoneyProvider: rep.mobile_money_provider,
                                                    mobileMoneyRef: rep.mobile_money_ref,
                                                    notes: rep.notes,
                                                    createdAt: rep.created_at
                                                })}
                                                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                                                title="Réimprimer le reçu de versement"
                                            >
                                                <Printer className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-slate-400">
                                <Banknote className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-700">Aucun versement enregistré pour ce compte.</p>
                            </div>
                        )
                    )}
                </div>

                {/* 5. Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
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

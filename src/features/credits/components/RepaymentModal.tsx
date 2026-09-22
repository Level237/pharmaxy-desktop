// src/features/credits/components/RepaymentModal.tsx
import { useState, useTransition } from "react";
import { X, CreditCard, Banknote, Smartphone, CheckCircle2, AlertCircle } from "lucide-react";
import { CreditClientSummary, RepaymentReceiptData } from "../types";
import { submitDebtRepaymentAction } from "../actions/creditActions";
import { useAuth } from "../../../shared/context/AuthContext";
import { getActiveCashSession } from "../../../db/cashQueries";

interface RepaymentModalProps {
    client: CreditClientSummary | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (receipt: RepaymentReceiptData) => void;
}

export function RepaymentModal({
    client,
    isOpen,
    onClose,
    onSuccess
}: RepaymentModalProps) {
    const { user } = useAuth();
    const [amount, setAmount] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile_money' | 'card'>('cash');
    const [momoProvider, setMomoProvider] = useState<'Orange Money' | 'MTN MoMo'>('Orange Money');
    const [momoRef, setMomoRef] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    if (!isOpen || !client) return null;

    const currentDebt = client.debt_balance;
    const enteredAmount = parseFloat(amount) || 0;
    const remainingBalance = Math.max(0, currentDebt - enteredAmount);

    const handleQuickAmount = (val: number) => {
        setAmount(Math.min(currentDebt, val).toString());
    };

    const handleSettleFull = () => {
        setAmount(currentDebt.toString());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (enteredAmount <= 0) {
            setErrorMessage("Veuillez saisir un montant supérieur à 0 FCFA.");
            return;
        }

        if (enteredAmount > currentDebt) {
            setErrorMessage(`Le montant saisi (${enteredAmount.toLocaleString()} F) dépasse la dette actuelle (${currentDebt.toLocaleString()} F).`);
            return;
        }

        startTransition(async () => {
            try {
                // Trouver la session de caisse active si existante
                const currentSession = await getActiveCashSession(user?.id);

                const receipt = await submitDebtRepaymentAction({
                    clientId: client.id,
                    amount: enteredAmount,
                    paymentMethod,
                    mobileMoneyProvider: paymentMethod === 'mobile_money' ? momoProvider : undefined,
                    mobileMoneyRef: paymentMethod === 'mobile_money' ? momoRef : undefined,
                    notes: notes.trim() || undefined,
                    userId: user?.id || 1,
                    cashSessionId: currentSession?.id || null
                });

                onSuccess(receipt);
            } catch (err: any) {
                console.error("Erreur enregistrement remboursement:", err);
                setErrorMessage(err?.message || "Une erreur est survenue lors du versement.");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                {/* 1. Header */}
                <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#2720ff] text-white flex items-center justify-center shadow-md shadow-[#2720ff]/20">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Encaisser un Versement</h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Recouvrement créance • <span className="font-bold text-slate-700">{client.name}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* 2. Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Synthèse du solde */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Dette Actuelle
                            </span>
                            <p className="text-2xl font-black text-slate-900 mt-0.5">
                                {currentDebt.toLocaleString()} <span className="text-sm font-bold text-slate-500">FCFA</span>
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Nouveau Solde
                            </span>
                            <p className={`text-2xl font-black mt-0.5 ${
                                remainingBalance === 0 ? "text-emerald-600" : "text-amber-600"
                            }`}>
                                {remainingBalance.toLocaleString()} <span className="text-sm font-bold text-slate-500">FCFA</span>
                            </p>
                        </div>
                    </div>

                    {/* Saisie du montant */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Montant à Encaisser (FCFA) *
                            </label>
                            <button
                                type="button"
                                onClick={handleSettleFull}
                                className="text-xs font-bold text-[#2720ff] hover:underline cursor-pointer"
                            >
                                Tout solder ({currentDebt.toLocaleString()} F)
                            </button>
                        </div>
                        <input
                            type="number"
                            min="1"
                            max={currentDebt}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="ex: 15000"
                            required
                            autoFocus
                            className="w-full px-4 py-3 bg-white border-2 border-slate-200 focus:border-[#2720ff] rounded-2xl text-lg font-black text-slate-900 focus:outline-none transition-all placeholder-slate-300"
                        />

                        {/* Raccourcis montants */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {[5000, 10000, 25000, 50000].map((preset) => {
                                if (preset >= currentDebt) return null;
                                return (
                                    <button
                                        key={preset}
                                        type="button"
                                        onClick={() => handleQuickAmount(preset)}
                                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                    >
                                        +{preset.toLocaleString()} F
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mode de règlement */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Mode de Règlement *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('cash')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                                    paymentMethod === 'cash'
                                        ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm"
                                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                <Banknote className="h-4 w-4" />
                                Espèces
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('mobile_money')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                                    paymentMethod === 'mobile_money'
                                        ? "bg-amber-50 border-amber-500 text-amber-800 shadow-sm"
                                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                <Smartphone className="h-4 w-4" />
                                Mobile Money
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('card')}
                                className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                                    paymentMethod === 'card'
                                        ? "bg-blue-50 border-[#2720ff] text-[#2720ff] shadow-sm"
                                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                            >
                                <CreditCard className="h-4 w-4" />
                                Carte
                            </button>
                        </div>
                    </div>

                    {/* Champs Mobile Money conditionnels */}
                    {paymentMethod === 'mobile_money' && (
                        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3 animate-in fade-in duration-200">
                            <div className="flex gap-2">
                                {(['Orange Money', 'MTN MoMo'] as const).map((prov) => (
                                    <button
                                        key={prov}
                                        type="button"
                                        onClick={() => setMomoProvider(prov)}
                                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                            momoProvider === prov
                                                ? "bg-amber-500 border-amber-600 text-white shadow-sm"
                                                : "bg-white border-amber-200 text-amber-900"
                                        }`}
                                    >
                                        {prov}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={momoRef}
                                onChange={(e) => setMomoRef(e.target.value)}
                                placeholder="Référence / ID Transaction (ex: MP2409...)"
                                className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                        </div>
                    )}

                    {/* Notes additionnelles */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Observations / Notes (facultatif)
                        </label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="ex: Acompte apporté par son fils..."
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2720ff]/30 focus:border-[#2720ff]"
                        />
                    </div>

                    {/* Message d'erreur éventuel */}
                    {errorMessage && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-700">
                            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* Boutons d'action */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
                            disabled={isPending || enteredAmount <= 0}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#2720ff] hover:bg-[#1f19d4] text-white shadow-lg shadow-[#2720ff]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                            {isPending ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4" />
                            )}
                            <span>Valider le Versement</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// src/features/deliveries/components/SupplierFormModal.tsx
import { useState, useTransition } from "react";
import { X, Building2, CheckCircle2, AlertCircle } from "lucide-react";
import { SupplierEntity } from "../types";
import { createSupplierAction } from "../actions/deliveriesActions";

interface SupplierFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (supplier: SupplierEntity) => void;
}

export function SupplierFormModal({
    isOpen,
    onClose,
    onSuccess
}: SupplierFormModalProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!name.trim()) {
            setErrorMessage("Le nom du répartiteur ou laboratoire est obligatoire.");
            return;
        }

        startTransition(async () => {
            try {
                const created = await createSupplierAction({
                    name: name.trim(),
                    phone: phone.trim() || undefined,
                    email: email.trim() || undefined,
                    address: address.trim() || undefined,
                    contactPerson: contactPerson.trim() || undefined
                });

                onSuccess(created);
            } catch (err: any) {
                console.error("Erreur création fournisseur:", err);
                setErrorMessage(err?.message || "Erreur lors de l'enregistrement du fournisseur.");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#2720ff] text-white flex items-center justify-center shadow-md shadow-[#2720ff]/20">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Nouveau Fournisseur</h3>
                            <p className="text-xs text-slate-500 font-medium">Répartiteur, centrale ou laboratoire</p>
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

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Raison Sociale / Nom *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="ex: Laborex Cameroun, CAMEG..."
                            required
                            autoFocus
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2720ff]/30 focus:border-[#2720ff]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Téléphone
                            </label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="ex: +237 233 42 12 80"
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2720ff]/30 focus:border-[#2720ff]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="commandes@fournisseur.cm"
                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2720ff]/30 focus:border-[#2720ff]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Adresse / Localisation
                        </label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="ex: Douala, Bassa, Zone Industrielle"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2720ff]/30 focus:border-[#2720ff]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Contact / Délégué Commercial
                        </label>
                        <input
                            type="text"
                            value={contactPerson}
                            onChange={(e) => setContactPerson(e.target.value)}
                            placeholder="ex: M. Ndongue (Service Répartition)"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2720ff]/30 focus:border-[#2720ff]"
                        />
                    </div>

                    {errorMessage && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-700">
                            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || !name.trim()}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-[#2720ff] hover:bg-[#1f19d4] text-white shadow-md shadow-[#2720ff]/20 disabled:opacity-50 transition-all cursor-pointer"
                        >
                            {isPending ? (
                                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            <span>Enregistrer</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

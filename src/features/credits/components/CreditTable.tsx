// src/features/credits/components/CreditTable.tsx
import { 
    CreditCard, 
    Clock, 
    FileText, 
    Phone, 
    AlertTriangle, 
    ShieldAlert, 
    CheckCircle2, 
    User,
    ArrowUpRight
} from "lucide-react";
import { CreditClientSummary } from "../types";

interface CreditTableProps {
    clients: CreditClientSummary[];
    onOpenRepaymentModal: (client: CreditClientSummary) => void;
    onOpenLedgerModal: (client: CreditClientSummary) => void;
}

export function CreditTable({
    clients,
    onOpenRepaymentModal,
    onOpenLedgerModal
}: CreditTableProps) {
    if (clients.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-sm text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Aucune créance trouvée</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Tous les comptes clients sont à jour ou aucun résultat ne correspond à vos critères de recherche.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <th className="py-4 px-6">Patient / Débiteur</th>
                            <th className="py-4 px-6">Solde Débiteur</th>
                            <th className="py-4 px-6">Plafond Crédit</th>
                            <th className="py-4 px-6">Ancienneté & Retard</th>
                            <th className="py-4 px-6">Factures En Cours</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {clients.map((client) => {
                            const isSettled = client.debt_balance <= 0;
                            const limitPercent = client.max_credit_limit > 0 
                                ? Math.min(100, Math.round((client.debt_balance / client.max_credit_limit) * 100))
                                : 100;

                            let limitColorClass = "bg-emerald-500";
                            if (limitPercent > 85) limitColorClass = "bg-red-500";
                            else if (limitPercent > 60) limitColorClass = "bg-amber-500";

                            return (
                                <tr 
                                    key={client.id}
                                    className="hover:bg-slate-50/60 transition-colors group"
                                >
                                    {/* 1. Patient & Contact */}
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                                                isSettled 
                                                    ? "bg-slate-100 text-slate-600" 
                                                    : client.overdue_status === 'critical'
                                                        ? "bg-red-100 text-red-700"
                                                        : client.overdue_status === 'overdue'
                                                            ? "bg-amber-100 text-amber-800"
                                                            : "bg-blue-50 text-[#2720ff]"
                                            }`}>
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 leading-tight flex items-center gap-2">
                                                    {client.name}
                                                </h4>
                                                {client.phone ? (
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                                                        <Phone className="h-3 w-3 text-slate-400" />
                                                        {client.phone}
                                                    </p>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 italic">Sans téléphone</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* 2. Solde débiteur */}
                                    <td className="py-4 px-6">
                                        <div>
                                            <span className={`text-base font-black tracking-tight ${
                                                isSettled 
                                                    ? "text-emerald-600" 
                                                    : client.overdue_status === 'critical'
                                                        ? "text-red-600"
                                                        : client.overdue_status === 'overdue'
                                                            ? "text-amber-700"
                                                            : "text-slate-900"
                                            }`}>
                                                {client.debt_balance.toLocaleString()} <span className="text-xs font-bold text-slate-500">FCFA</span>
                                            </span>
                                            {client.last_repayment_date && (
                                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                                    Dernier vers. : {new Date(client.last_repayment_date).toLocaleDateString('fr-FR')}
                                                </p>
                                            )}
                                        </div>
                                    </td>

                                    {/* 3. Jauge Plafond Autorisé */}
                                    <td className="py-4 px-6">
                                        <div className="max-w-[160px]">
                                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                                                <span>{limitPercent}% utilisé</span>
                                                <span className="text-slate-400">Max: {client.max_credit_limit.toLocaleString()}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${limitColorClass}`}
                                                    style={{ width: `${limitPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>

                                    {/* 4. Ancienneté & Statut Retard */}
                                    <td className="py-4 px-6">
                                        {isSettled ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Compte Soldé
                                            </span>
                                        ) : client.overdue_status === 'critical' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                                                <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
                                                Critique ({client.days_since_oldest_debt}j)
                                            </span>
                                        ) : client.overdue_status === 'overdue' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                                                En souffrance ({client.days_since_oldest_debt}j)
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                                <Clock className="h-3.5 w-3.5 text-[#2720ff]" />
                                                En cours ({client.days_since_oldest_debt}j)
                                            </span>
                                        )}
                                    </td>

                                    {/* 5. Factures impayées */}
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                            <FileText className="h-4 w-4 text-slate-400" />
                                            <span>{client.unpaid_sales_count} {client.unpaid_sales_count > 1 ? "factures" : "facture"}</span>
                                        </div>
                                    </td>

                                    {/* 6. Actions */}
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Bouton Encaisser (si dette > 0) */}
                                            {!isSettled && (
                                                <button
                                                    onClick={() => onOpenRepaymentModal(client)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#2720ff] hover:bg-[#1f19d4] text-white shadow-sm shadow-[#2720ff]/20 transition-all cursor-pointer"
                                                >
                                                    <CreditCard className="h-3.5 w-3.5" />
                                                    Encaisser
                                                </button>
                                            )}

                                            {/* Bouton Relevé de compte */}
                                            <button
                                                onClick={() => onOpenLedgerModal(client)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                                                title="Consulter l'historique et le relevé de compte"
                                            >
                                                <span>Relevé</span>
                                                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

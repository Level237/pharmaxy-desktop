// src/features/deliveries/components/DeliveriesTable.tsx
import { 
    Building2, 
    FileText, 
    Calendar, 
    Eye, 
    CheckCircle2, 
    User,
    Package
} from "lucide-react";
import { DeliverySummary } from "../types";

interface DeliveriesTableProps {
    deliveries: DeliverySummary[];
    onViewDetail: (deliveryId: number) => void;
}

export function DeliveriesTable({ deliveries, onViewDetail }: DeliveriesTableProps) {
    if (deliveries.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-sm text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Package className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Aucun bon de livraison enregistré</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Utilisez le bouton "Nouvelle Réception (BL)" pour saisir un bon de livraison et approvisionner vos stocks selon la règle FEFO.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                        Historique des Réceptions Fournisseurs
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                        Bons de livraison, lots réceptionnés et valorisation d'achat
                    </p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                    {deliveries.length} {deliveries.length > 1 ? "bons de livraison" : "bon de livraison"}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <tr>
                            <th className="py-4 px-6">Fournisseur</th>
                            <th className="py-4 px-4">N° Facture / BL</th>
                            <th className="py-4 px-4">Date Réception</th>
                            <th className="py-4 px-4">Articles & Lots</th>
                            <th className="py-4 px-4">Montant Total</th>
                            <th className="py-4 px-4">Statut</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {deliveries.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-50/60 transition-colors group">
                                {/* 1. Fournisseur */}
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2720ff] flex items-center justify-center font-bold text-sm shadow-sm">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 leading-tight">
                                                {d.supplier_name}
                                            </h4>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                                                <User className="h-3 w-3 text-slate-400" />
                                                Reçu par {d.received_by_name}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* 2. N° BL */}
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
                                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                                        <span>{d.invoice_number}</span>
                                    </div>
                                </td>

                                {/* 3. Date */}
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                        <span>{new Date(d.delivery_date).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                </td>

                                {/* 4. Articles */}
                                <td className="py-4 px-4">
                                    <div>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-800">
                                            {d.items_count} {d.items_count > 1 ? "articles" : "article"}
                                        </span>
                                        {d.items_summary && (
                                            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px] mt-0.5" title={d.items_summary}>
                                                {d.items_summary}
                                            </p>
                                        )}
                                    </div>
                                </td>

                                {/* 5. Montant */}
                                <td className="py-4 px-4">
                                    <span className="text-sm font-black text-slate-900">
                                        {d.total_amount.toLocaleString()} <span className="text-xs font-bold text-slate-500">FCFA</span>
                                    </span>
                                </td>

                                {/* 6. Statut */}
                                <td className="py-4 px-4">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Reçu & Stocké
                                    </span>
                                </td>

                                {/* 7. Actions */}
                                <td className="py-4 px-6 text-right">
                                    <button
                                        onClick={() => onViewDetail(d.id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-[#2720ff] hover:text-white transition-all cursor-pointer"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        <span>Détails</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

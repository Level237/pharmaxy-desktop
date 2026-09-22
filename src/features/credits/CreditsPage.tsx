// src/features/credits/CreditsPage.tsx
import { useState, useEffect, useTransition, useMemo } from "react";
import { CreditCard, RefreshCw } from "lucide-react";
import { Layout } from "../../shared/components/Layout";
import { 
    fetchCreditClientsAction, 
    fetchCreditKpisAction 
} from "./actions/creditActions";
import { CreditKpisBanner } from "./components/CreditKpisBanner";
import { CreditFilters } from "./components/CreditFilters";
import { CreditTable } from "./components/CreditTable";
import { RepaymentModal } from "./components/RepaymentModal";
import { CreditAccountDetailModal } from "./components/CreditAccountDetailModal";
import { DebtReceiptModal } from "./components/DebtReceiptModal";
import type { 
    CreditClientSummary, 
    CreditKpis, 
    CreditStatusFilter, 
    RepaymentReceiptData 
} from "./types";

export function CreditsPage() {
    const [clients, setClients] = useState<CreditClientSummary[]>([]);
    const [kpis, setKpis] = useState<CreditKpis>({
        totalDebtAmount: 0,
        debtorCount: 0,
        overdueDebtAmount: 0,
        criticalDebtAmount: 0,
        totalRepaidThisMonth: 0
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    // Filtres
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<CreditStatusFilter>('all');

    // Modals
    const [selectedClientForRepayment, setSelectedClientForRepayment] = useState<CreditClientSummary | null>(null);
    const [selectedClientForLedger, setSelectedClientForLedger] = useState<CreditClientSummary | null>(null);
    const [receiptToPrint, setReceiptToPrint] = useState<RepaymentReceiptData | null>(null);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [clientsList, kpiData] = await Promise.all([
                fetchCreditClientsAction(),
                fetchCreditKpisAction()
            ]);
            setClients(clientsList);
            setKpis(kpiData);
        } catch (err) {
            console.error("Erreur chargement données crédits:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filtrage réactif dérivé en direct pendant le rendu (Senior React 19)
    const filteredClients = useMemo(() => {
        const query = search.trim().toLowerCase();

        return clients.filter((c) => {
            // 1. Recherche textuelle
            if (query) {
                const nameMatch = c.name.toLowerCase().includes(query);
                const phoneMatch = (c.phone || "").toLowerCase().includes(query);
                if (!nameMatch && !phoneMatch) return false;
            }

            // 2. Filtre statut
            switch (statusFilter) {
                case 'overdue':
                    return c.debt_balance > 0 && (c.overdue_status === 'overdue' || c.overdue_status === 'critical');
                case 'critical':
                    return c.debt_balance > 0 && c.overdue_status === 'critical';
                case 'settled':
                    return c.debt_balance <= 0;
                case 'all':
                default:
                    return true;
            }
        });
    }, [clients, search, statusFilter]);

    const handleSearchChange = (val: string) => {
        startTransition(() => {
            setSearch(val);
        });
    };

    const handleStatusFilterChange = (val: CreditStatusFilter) => {
        startTransition(() => {
            setStatusFilter(val);
        });
    };

    const handleResetFilters = () => {
        startTransition(() => {
            setSearch("");
            setStatusFilter('all');
        });
    };

    const handleRepaymentSuccess = (receipt: RepaymentReceiptData) => {
        setSelectedClientForRepayment(null);
        setReceiptToPrint(receipt);
        loadData();
    };

    return (
        <Layout>
            <div className="p-8 space-y-6 max-w-7xl mx-auto">
                {/* 1. Header de la page */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#2720ff] text-white flex items-center justify-center shadow-lg shadow-[#2720ff]/20">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                    Crédits Clients & Recouvrement
                                </h1>
                                <p className="text-xs text-slate-500 font-medium">
                                    Suivi de l'encours, gestion des créances en souffrance et quittances de versement
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadData}
                            disabled={isLoading || isPending}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-[#2720ff]" : "text-slate-400"}`} />
                            <span>Actualiser</span>
                        </button>
                    </div>
                </div>

                {/* 2. Bannière KPIs */}
                <CreditKpisBanner 
                    kpis={kpis} 
                    onFilterClick={handleStatusFilterChange}
                />

                {/* 3. Filtres & Barre de recherche */}
                <CreditFilters
                    search={search}
                    onSearchChange={handleSearchChange}
                    statusFilter={statusFilter}
                    onStatusFilterChange={handleStatusFilterChange}
                    onReset={handleResetFilters}
                    totalCount={filteredClients.length}
                />

                {/* 4. Tableau des créances */}
                {isLoading ? (
                    <div className="bg-white rounded-2xl p-16 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center gap-3 text-slate-400">
                        <div className="h-9 w-9 border-2 border-slate-200 border-t-[#2720ff] rounded-full animate-spin" />
                        <p className="text-xs font-medium">Chargement des comptes clients...</p>
                    </div>
                ) : (
                    <CreditTable
                        clients={filteredClients}
                        onOpenRepaymentModal={(c) => setSelectedClientForRepayment(c)}
                        onOpenLedgerModal={(c) => setSelectedClientForLedger(c)}
                    />
                )}

                {/* 5. Modal de versement / remboursement */}
                <RepaymentModal
                    client={selectedClientForRepayment}
                    isOpen={Boolean(selectedClientForRepayment)}
                    onClose={() => setSelectedClientForRepayment(null)}
                    onSuccess={handleRepaymentSuccess}
                />

                {/* 6. Modal de relevé de compte complet */}
                <CreditAccountDetailModal
                    client={selectedClientForLedger}
                    isOpen={Boolean(selectedClientForLedger)}
                    onClose={() => setSelectedClientForLedger(null)}
                    onOpenRepayment={(c) => setSelectedClientForRepayment(c)}
                    onPrintRepaymentReceipt={(receipt) => setReceiptToPrint(receipt)}
                />

                {/* 7. Modal d'impression thermique du reçu de versement */}
                <DebtReceiptModal
                    receipt={receiptToPrint}
                    isOpen={Boolean(receiptToPrint)}
                    onClose={() => setReceiptToPrint(null)}
                />
            </div>
        </Layout>
    );
}

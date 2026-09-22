// src/features/deliveries/DeliveriesPage.tsx
import { useState, useEffect, useTransition, useMemo } from "react";
import { 
    Truck, 
    Plus, 
    Building2, 
    TrendingDown, 
    RefreshCw, 
    Search,
    Filter
} from "lucide-react";
import { Layout } from "../../shared/components/Layout";
import { DeliveriesTable } from "./components/DeliveriesTable";
import { DeliveryStats } from "./components/DeliveryStats";
import { RecentDeliveries } from "./components/RecentDeliveries";
import { StockOptimizationCard } from "./components/StockOptimizationCard";
import { DeliveryFormModal } from "./components/DeliveryFormModal";
import { DeliveryDetailModal } from "./components/DeliveryDetailModal";
import { SupplierFormModal } from "./components/SupplierFormModal";
import { PriceComparatorModal } from "./components/PriceComparatorModal";
import { 
    fetchDeliveries, 
    fetchDeliveryStats, 
    fetchSuppliers 
} from "./actions/deliveriesActions";
import type { 
    DeliverySummary, 
    DeliveryKpis, 
    SupplierEntity, 
    DeliveryDetail 
} from "./types";

export function DeliveriesPage() {
    const [deliveries, setDeliveries] = useState<DeliverySummary[]>([]);
    const [suppliers, setSuppliers] = useState<SupplierEntity[]>([]);
    const [stats, setStats] = useState<DeliveryKpis>({
        monthlyDeliveriesCount: 0,
        monthlyTotalValue: 0,
        activeSuppliersCount: 0,
        totalProductsSupplied: 0
    });

    const [isLoading, setIsLoading] = useState(true);
    const [, startTransition] = useTransition();

    // Filtres
    const [search, setSearch] = useState("");
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | "all">("all");

    // Modals
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [isPriceComparatorOpen, setIsPriceComparatorOpen] = useState(false);
    const [selectedDeliveryId, setSelectedDeliveryId] = useState<number | null>(null);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [delList, statData, supList] = await Promise.all([
                fetchDeliveries(),
                fetchDeliveryStats(),
                fetchSuppliers()
            ]);
            setDeliveries(delList);
            setStats(statData);
            setSuppliers(supList);
        } catch (err) {
            console.error("Erreur chargement livraisons:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filtrage réactif dérivé en direct pendant le rendu (React 19)
    const filteredDeliveries = useMemo(() => {
        const query = search.trim().toLowerCase();

        return deliveries.filter(d => {
            // 1. Filtre recherche textuelle
            if (query) {
                const invoiceMatch = d.invoice_number.toLowerCase().includes(query);
                const supplierMatch = d.supplier_name.toLowerCase().includes(query);
                const itemsMatch = (d.items_summary || "").toLowerCase().includes(query);
                if (!invoiceMatch && !supplierMatch && !itemsMatch) return false;
            }

            // 2. Filtre par fournisseur
            if (selectedSupplierId !== "all" && d.supplier_id !== selectedSupplierId) {
                return false;
            }

            return true;
        });
    }, [deliveries, search, selectedSupplierId]);

    const handleDeliverySuccess = (created: DeliveryDetail) => {
        setIsDeliveryModalOpen(false);
        loadData();
        setSelectedDeliveryId(created.id);
    };

    const handleSupplierSuccess = () => {
        setIsSupplierModalOpen(false);
        loadData();
    };

    return (
        <Layout>
            <div className="p-8 space-y-8 max-w-7xl mx-auto">
                {/* 1. Header de la page */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-[#2720ff] text-white flex items-center justify-center shadow-lg shadow-[#2720ff]/20">
                                <Truck className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                    Livraisons & Réceptions Fournisseurs
                                </h1>
                                <p className="text-xs text-slate-500 font-medium">
                                    Enregistrement des bons de livraison, traçabilité des lots FEFO et comparaison des tarifs d'achat
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Boutons d'actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setIsSupplierModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all cursor-pointer"
                        >
                            <Building2 className="h-4 w-4 text-slate-500" />
                            <span>Nouveau Fournisseur</span>
                        </button>

                        <button
                            onClick={() => setIsPriceComparatorOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all cursor-pointer"
                        >
                            <TrendingDown className="h-4 w-4 text-[#2720ff]" />
                            <span>Comparateur de Tarifs</span>
                        </button>

                        <button
                            onClick={() => setIsDeliveryModalOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2720ff] hover:bg-[#1f19d4] text-white text-xs font-bold shadow-lg shadow-[#2720ff]/25 transition-all cursor-pointer"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Nouvelle Réception (BL)</span>
                        </button>
                    </div>
                </div>

                {/* 2. Barre de filtres et recherche */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {/* Recherche */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    startTransition(() => setSearch(val));
                                }}
                                placeholder="Rechercher par N° BL, fournisseur ou médicament..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2720ff]/30 focus:border-[#2720ff]"
                            />
                        </div>

                        {/* Sélecteur Fournisseur */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                            <select
                                value={selectedSupplierId}
                                onChange={(e) => {
                                    const val = e.target.value === "all" ? "all" : Number(e.target.value);
                                    startTransition(() => setSelectedSupplierId(val));
                                }}
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2720ff]/30 focus:border-[#2720ff]"
                            >
                                <option value="all">Tous les fournisseurs</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={loadData}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer self-end md:self-auto"
                        title="Rafraîchir les données"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-[#2720ff]" : ""}`} />
                        <span>Actualiser</span>
                    </button>
                </div>

                {/* 3. Grille Principale */}
                <div className="grid grid-cols-12 gap-8 items-start">
                    {/* Colonne gauche (8 cols) : Tableau des livraisons */}
                    <div className="col-span-12 lg:col-span-8">
                        {isLoading ? (
                            <div className="bg-white rounded-3xl p-16 border border-slate-200/80 shadow-sm flex flex-col items-center justify-center gap-3 text-slate-400">
                                <div className="h-9 w-9 border-2 border-slate-200 border-t-[#2720ff] rounded-full animate-spin" />
                                <p className="text-xs font-medium">Chargement des réceptions fournisseurs...</p>
                            </div>
                        ) : (
                            <DeliveriesTable 
                                deliveries={filteredDeliveries} 
                                onViewDetail={(id) => setSelectedDeliveryId(id)}
                            />
                        )}
                    </div>

                    {/* Colonne droite (4 cols) : Stats, Derniers bons & Outil d'optimisation */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <DeliveryStats stats={stats} />
                        <RecentDeliveries 
                            deliveries={deliveries} 
                            onViewDetail={(id) => setSelectedDeliveryId(id)}
                        />
                        <StockOptimizationCard 
                            onOpenPriceComparator={() => setIsPriceComparatorOpen(true)}
                        />
                    </div>
                </div>

                {/* 4. Modals */}
                <DeliveryFormModal
                    isOpen={isDeliveryModalOpen}
                    onClose={() => setIsDeliveryModalOpen(false)}
                    onSuccess={handleDeliverySuccess}
                    onOpenNewSupplier={() => {
                        setIsDeliveryModalOpen(false);
                        setIsSupplierModalOpen(true);
                    }}
                />

                <DeliveryDetailModal
                    deliveryId={selectedDeliveryId}
                    isOpen={Boolean(selectedDeliveryId)}
                    onClose={() => setSelectedDeliveryId(null)}
                />

                <SupplierFormModal
                    isOpen={isSupplierModalOpen}
                    onClose={() => setIsSupplierModalOpen(false)}
                    onSuccess={handleSupplierSuccess}
                />

                <PriceComparatorModal
                    isOpen={isPriceComparatorOpen}
                    onClose={() => setIsPriceComparatorOpen(false)}
                />
            </div>
        </Layout>
    );
}

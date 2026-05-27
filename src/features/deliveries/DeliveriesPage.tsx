import { use, Suspense, useState } from "react";
import { Plus, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "../../shared/components/Layout";
import { DeliveriesTable } from "./components/DeliveriesTable";
import { DeliveryStats } from "./components/DeliveryStats";
import { RecentDeliveries } from "./components/RecentDeliveries";
import { StockOptimizationCard } from "./components/StockOptimizationCard";
import { fetchDeliveries, fetchDeliveryStats } from "./actions/deliveriesActions";
import type { Delivery, DeliveryStats as StatsType } from "./types";

function DeliveriesContent({
  deliveriesPromise,
  statsPromise
}: {
  deliveriesPromise: Promise<Delivery[]>,
  statsPromise: Promise<StatsType>
}) {
  const deliveries = use(deliveriesPromise);
  const stats = use(statsPromise);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-10"
    >
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-2">
            <span>Gestion</span>
            <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />
            <span className="text-[#10B981]">Livraisons</span>
          </nav>
          <h2 className="text-4xl font-black text-[#0F172A] tracking-tight">Gestion des Livraisons</h2>
        </div>

        <div className="flex items-center gap-4">
          <button className="bg-white border-2 border-[#E2E8F0] hover:border-[#3B82F6] hover:text-[#3B82F6] text-[#64748B] px-6 py-4 rounded-2xl flex items-center gap-3 font-black transition-all shadow-lg shadow-blue-500/5 cursor-pointer">
            <Plus className="h-5 w-5" />
            <span>Nouveau Fournisseur</span>
          </button>
          <button className="bg-[#3B82F6] hover:bg-[#3B82F6]/80 text-white px-6 py-4 rounded-2xl flex items-center gap-3 font-black transition-all  cursor-pointer">
            <Truck className="h-5 w-5" />
            <span>Nouvelle Livraison</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-stretch">
        {/* Main Table Section */}
        <div className="col-span-12 lg:col-span-8">
          <DeliveriesTable deliveries={deliveries} />
        </div>

        {/* Right Sidebar Section */}
        <div className="col-span-12 lg:col-span-4 space-y-8 flex flex-col">
          <DeliveryStats stats={stats} />
          <RecentDeliveries deliveries={deliveries} />
          <StockOptimizationCard />
        </div>
      </div>
    </motion.div>
  );
}

export function DeliveriesPage() {
  const [promises] = useState(() => ({
    deliveries: fetchDeliveries(),
    stats: fetchDeliveryStats()
  }));

  return (
    <Layout>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-full gap-4 text-[#64748B]">
          <div className="h-12 w-12 border-4 border-[#10B981]/20 border-t-[#10B981] rounded-full animate-spin" />
          <p className="font-bold text-sm animate-pulse">Chargement de l'annuaire des livraisons...</p>
        </div>
      }>
        <DeliveriesContent
          deliveriesPromise={promises.deliveries}
          statsPromise={promises.stats}
        />
      </Suspense>
    </Layout>
  );
}

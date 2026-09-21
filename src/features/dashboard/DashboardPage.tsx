import { use, Suspense, useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Layout } from "../../shared/components/Layout";
import { KpiCards } from "./components/KpiCards";
import { RecentSalesTable } from "./components/RecentSalesTable";
import { AlertBanner } from "./components/AlertBanner";
import { QuickActions } from "./components/QuickActions";
import { InventoryStatus } from "./components/InventoryStatus";
import { fetchPharmacyInfo, fetchRecentSales, fetchDashboardStats } from "./actions/dashboardActions";
import type { Pharmacy, Sale, DashboardStats } from "./types";

function DashboardContent({ 
  pharmacyPromise, 
  salesPromise, 
  statsPromise,
  onRefresh
}: { 
  pharmacyPromise: Promise<Pharmacy | null>;
  salesPromise: Promise<Sale[]>;
  statsPromise: Promise<DashboardStats>;
  onRefresh?: () => void;
}) {
  const pharmacy = use(pharmacyPromise);
  const sales = use(salesPromise);
  const stats = use(statsPromise);

  return (
    <div className="space-y-8">
      {/* Dashboard Title & Date */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A]">
            Tableau de Bord - {pharmacy?.name || "Pharmacie Centrale"}
          </h2>
          <p className="text-[#64748B] text-sm mt-1">Aperçu en temps réel de votre activité.</p>
        </div>
        <div className="bg-[#E2E8F0] px-4 py-2 rounded-lg flex items-center gap-2 text-[#475569]">
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-bold">Aujourd'hui</span>
        </div>
      </div>

      <KpiCards stats={stats} />

      <AlertBanner />

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8">
          <RecentSalesTable sales={sales} onRefresh={onRefresh} />
        </div>
        <div className="col-span-4 space-y-8">
          <QuickActions />
          <InventoryStatus />
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [promises, setPromises] = useState(() => ({
    pharmacy: fetchPharmacyInfo(),
    sales: fetchRecentSales(),
    stats: fetchDashboardStats()
  }));

  const handleRefresh = () => {
    setPromises({
      pharmacy: fetchPharmacyInfo(),
      sales: fetchRecentSales(),
      stats: fetchDashboardStats()
    });
  };

  useEffect(() => {
    const onFocus = () => {
      handleRefresh();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <Layout>
      <Suspense fallback={<div className="flex items-center justify-center h-full text-[#64748B]">Chargement du tableau de bord...</div>}>
        <DashboardContent 
          pharmacyPromise={promises.pharmacy} 
          salesPromise={promises.sales} 
          statsPromise={promises.stats} 
          onRefresh={handleRefresh}
        />
      </Suspense>
    </Layout>
  );
}

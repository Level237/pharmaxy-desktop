import { use, Suspense, useState } from "react";
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
  statsPromise 
}: { 
  pharmacyPromise: Promise<Pharmacy | null>,
  salesPromise: Promise<Sale[]>,
  statsPromise: Promise<DashboardStats>
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
          <span className="text-sm font-bold">Lundi 24 Mai 2024</span>
        </div>
      </div>

      <KpiCards stats={stats} />

      <AlertBanner />

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8">
          <RecentSalesTable sales={sales} />
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
  // On utilise useState pour créer et stabiliser les promises au montage du composant
  // Cela évite de les recréer à chaque rendu (ce qui causerait une boucle avec Suspense)
  // Et cela assure qu'elles ne sont pas créées trop tôt (avant l'initialisation de la DB)
  const [promises] = useState(() => ({
    pharmacy: fetchPharmacyInfo(),
    sales: fetchRecentSales(),
    stats: fetchDashboardStats()
  }));

  return (
    <Layout>
      <Suspense fallback={<div className="flex items-center justify-center h-full text-[#64748B]">Chargement du tableau de bord...</div>}>
        <DashboardContent 
          pharmacyPromise={promises.pharmacy} 
          salesPromise={promises.sales} 
          statsPromise={promises.stats} 
        />
      </Suspense>
    </Layout>
  );
}

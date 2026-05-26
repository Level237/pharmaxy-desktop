import { getPharmacyInfo } from "../../../db/pharmacyQueries";
import type { Pharmacy, Sale, DashboardStats } from "../types";

export async function fetchPharmacyInfo(): Promise<Pharmacy | null> {
  const info = await getPharmacyInfo();
  if (info && info.length > 0) {
    return info[0] as Pharmacy;
  }
  return null;
}

export async function fetchRecentSales(): Promise<Sale[]> {
  // Simuler un appel DB
  return [
    { id: "#TRX-8902", client: "Diallo Mamadou", products: "Augmentin (x2), Vitamine C", amount: "12,500 F", time: "14:25", status: "Payé" },
    { id: "#TRX-8901", client: "Sow Aminata", products: "Doliprane 1000mg", amount: "2,500 F", time: "14:10", status: "Payé" },
    { id: "#TRX-8900", client: "Sylla Ibrahima", products: "Insuline Glargine", amount: "35,000 F", time: "13:45", status: "Crédit" },
    { id: "#TRX-8899", client: "Camara Fatou", products: "Pansements, Bétadine", amount: "4,200 F", time: "13:20", status: "Payé" },
  ];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // Simuler un appel DB
  return {
    todayRevenue: "185,000 FCFA",
    revenueChange: 12,
    clientsServed: 42,
    creditsGranted: "15,000 FCFA",
  };
}

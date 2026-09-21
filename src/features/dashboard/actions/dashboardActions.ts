import { getPharmacyInfo } from "../../../db/pharmacyQueries";
import { getRecentSales } from "../../../db/saleQueries";
import { getDatabase } from "../../../db/database";
import type { Pharmacy, Sale, DashboardStats } from "../types";

export async function fetchPharmacyInfo(): Promise<Pharmacy | null> {
  const info = await getPharmacyInfo();
  if (info && info.length > 0) {
    return info[0] as Pharmacy;
  }
  return null;
}

export async function fetchRecentSales(): Promise<Sale[]> {
  try {
    const rawSales = await getRecentSales(8);
    if (!rawSales || rawSales.length === 0) {
      return [];
    }

    return rawSales.map(s => {
      let timeStr = "";
      try {
        const normalized = s.created_at ? s.created_at.replace(" ", "T") : "";
        const dateObj = new Date(normalized);
        timeStr = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : (s.created_at || "");
      } catch {
        timeStr = s.created_at || "";
      }

      return {
        id: s.receipt_number || `#TRX-${s.id}`,
        saleId: s.id,
        client: s.client_name || "Client Comptant",
        products: s.items_summary || "Médicaments divers",
        amount: `${(s.total_amount || 0).toLocaleString()} FCFA`,
        time: timeStr,
        status: s.status === 'credit' ? 'Crédit' : 'Payé'
      };
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des ventes récentes:", error);
    return [];
  }
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const db = await getDatabase();
    
    // 1. Chiffre d'affaires et clients servis aujourd'hui
    const todayRes = await db.select<{ total: number; count: number }[]>(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total,
        COUNT(id) as count
      FROM sales
      WHERE date(created_at) = date('now')
    `);

    // 2. Chiffre d'affaires d'hier (pour calculer l'évolution en %)
    const yesterdayRes = await db.select<{ total: number }[]>(`
      SELECT COALESCE(SUM(total_amount), 0) as total
      FROM sales
      WHERE date(created_at) = date('now', '-1 day')
    `);

    // 3. Crédits accordés aujourd'hui
    const creditsRes = await db.select<{ total: number }[]>(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM payments
      WHERE method = 'credit' AND date(created_at) = date('now')
    `);

    const todayRev = todayRes[0]?.total || 0;
    const clientsCount = todayRes[0]?.count || 0;
    const yesterdayRev = yesterdayRes[0]?.total || 0;
    const todayCredits = creditsRes[0]?.total || 0;

    let change = 0;
    if (yesterdayRev > 0) {
      change = Math.round(((todayRev - yesterdayRev) / yesterdayRev) * 100);
    } else if (todayRev > 0) {
      change = 100;
    }

    return {
      todayRevenue: `${todayRev.toLocaleString()} FCFA`,
      revenueChange: change,
      clientsServed: clientsCount,
      creditsGranted: `${todayCredits.toLocaleString()} FCFA`
    };
  } catch (error) {
    console.error("Erreur stats dashboard:", error);
    return {
      todayRevenue: "0 FCFA",
      revenueChange: 0,
      clientsServed: 0,
      creditsGranted: "0 FCFA"
    };
  }
}

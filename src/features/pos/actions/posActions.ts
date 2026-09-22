import { getAllProducts } from "../../../db/productQueries";
import { executeSaleTransaction } from "../../../db/saleQueries";
import { getActiveCashSession } from "../../../db/cashQueries";
import type { Product, SalePayload, SaleSuccessData } from "../types";

export async function fetchProducts(searchTerm?: string, category?: string): Promise<Product[]> {
  const products = await getAllProducts({ search: searchTerm, category });
  return products.map(p => ({
    id: p.id,
    uuid: p.uuid,
    name: p.name,
    dci: p.dci || "",
    form: p.form || "",
    dosage: p.dosage || "",
    packaging: p.packaging || "",
    barcode: p.barcode || "",
    selling_price: p.selling_price,
    min_stock_alert: p.min_stock_alert,
    category: p.category || "Tous",
    stock_quantity: p.total_stock
  }));
}

export async function createSaleAction(payload: SalePayload): Promise<SaleSuccessData> {
  let userId = payload.userId;
  if (!userId) {
    try {
      const stored = sessionStorage.getItem("currentUser");
      if (stored) {
        const u = JSON.parse(stored);
        userId = u.id;
      }
    } catch {
      // Fallback
    }
  }

  const validUserId = userId || 1;
  const activeSession = await getActiveCashSession(validUserId);

  return await executeSaleTransaction({
    userId: validUserId,
    cashSessionId: activeSession?.id || null,
    clientId: payload.clientId,
    items: payload.items.map(it => ({
      productId: it.id,
      productName: it.name,
      quantity: it.quantity,
      unitPrice: it.selling_price
    })),
    paymentMethod: payload.paymentMethod,
    amountReceived: payload.amountReceived,
    changeAmount: payload.change,
    discountAmount: payload.discountAmount,
    notes: payload.notes
  });
}

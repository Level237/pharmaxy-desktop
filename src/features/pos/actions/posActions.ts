import { getAllProducts } from "../../../db/productQueries";
import type { Product, SalePayload } from "../types";

export async function fetchProducts(): Promise<Product[]> {
  const products = await getAllProducts();
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

export async function createSaleAction(payload: SalePayload) {
  // Simulation d'une action de vente
  console.log("Vente validée:", payload);
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

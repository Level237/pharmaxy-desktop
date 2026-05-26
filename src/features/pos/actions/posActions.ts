import { getDatabase } from "../../../db/database";
import type { Product, SalePayload } from "../types";

export async function fetchProducts(): Promise<Product[]> {
  const db = await getDatabase();
  // On récupère les produits et on simule/calcule un stock pour le mock
  // Dans une vraie app, on ferait une jointure avec la table 'lots'
  const products = await db.select<Product[]>("SELECT * FROM products ORDER BY name ASC");
  
  return products.map(p => ({
    ...p,
    stock_quantity: Math.floor(Math.random() * 50) + 1 // Mock stock pour l'instant
  }));
}

export async function createSaleAction(payload: SalePayload) {
  // Simulation d'une action de vente
  console.log("Vente validée:", payload);
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

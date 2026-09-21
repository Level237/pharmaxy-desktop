// src/features/stock/types.ts
import type { ProductWithStock, Lot, NewProductInput, NewLotInput } from "../../db/productQueries";

export type StockStatusFilter = 
  | "all" 
  | "in_stock" 
  | "low_stock" 
  | "out_of_stock" 
  | "expiring_soon"
  | "expired";

export interface StockFiltersState {
  search: string;
  category: string;
  status: StockStatusFilter;
  sortBy: "name" | "stock" | "price" | "expiry";
  sortOrder: "asc" | "desc";
}

export interface StockKpis {
  totalReferences: number;
  totalUnits: number;
  totalValueSelling: number;
  totalValuePurchase: number;
  lowStockCount: number;
  outOfStockCount: number;
  expiringCount: number;
}

export interface ProductFormData {
  id?: number;
  name: string;
  dci: string;
  form: string;
  dosage: string;
  packaging: string;
  barcode: string;
  selling_price: number;
  purchase_price: number;
  min_stock_alert: number;
  category_id?: number | null;
  category?: string;
  is_narcotic: boolean;

  // Initialisation de lot (mode création uniquement)
  initial_lot_number?: string;
  initial_expiry_date?: string;
  initial_quantity?: number;
  initial_supplier_id?: number | null;
}

export type { ProductWithStock, Lot, NewProductInput, NewLotInput };

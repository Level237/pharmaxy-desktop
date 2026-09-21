// src/features/stock/actions/stockActions.ts
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  createLot, 
  getProductLots,
  type ProductWithStock,
  type Lot,
  type NewLotInput
} from "../../../db/productQueries";
import { getAllCategories } from "../../../db/categoryQueries";
import { getAllSuppliers, type Supplier } from "../../../db/supplierQueries";
import type { ProductFormData, StockKpis } from "../types";

export async function fetchStockCatalogue(): Promise<ProductWithStock[]> {
  return await getAllProducts();
}

export async function fetchCategoriesList(): Promise<{ id: number; name: string }[]> {
  const cats = await getAllCategories();
  return cats.map(c => ({ id: c.id, name: c.name }));
}

export async function fetchSuppliersList(): Promise<Supplier[]> {
  return await getAllSuppliers();
}

export async function fetchProductLots(productId: number): Promise<Lot[]> {
  return await getProductLots(productId, false);
}

export function calculateStockKpis(products: ProductWithStock[]): StockKpis {
  let totalUnits = 0;
  let totalValueSelling = 0;
  let totalValuePurchase = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let expiringCount = 0;

  const now = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(now.getMonth() + 3);

  for (const p of products) {
    const stock = p.total_stock ?? 0;
    totalUnits += stock;
    totalValueSelling += stock * (p.selling_price || 0);
    totalValuePurchase += stock * (p.purchase_price || 0);

    if (stock <= 0) {
      outOfStockCount++;
    } else if (stock <= (p.min_stock_alert || 5)) {
      lowStockCount++;
    }

    if (p.nearest_expiry) {
      const expDate = new Date(p.nearest_expiry);
      if (!isNaN(expDate.getTime()) && expDate <= threeMonthsFromNow && stock > 0) {
        expiringCount++;
      }
    }
  }

  return {
    totalReferences: products.length,
    totalUnits,
    totalValueSelling,
    totalValuePurchase,
    lowStockCount,
    outOfStockCount,
    expiringCount
  };
}

export async function createProductAction(data: ProductFormData): Promise<number> {
  const productId = await createProduct({
    name: data.name,
    dci: data.dci,
    form: data.form,
    dosage: data.dosage,
    packaging: data.packaging,
    barcode: data.barcode,
    selling_price: data.selling_price,
    purchase_price: data.purchase_price,
    min_stock_alert: data.min_stock_alert,
    category_id: data.category_id,
    category: data.category,
    is_narcotic: data.is_narcotic ? 1 : 0
  });

  // Si un lot initial est fourni avec quantité > 0
  if (data.initial_lot_number && data.initial_expiry_date && (data.initial_quantity || 0) > 0) {
    await createLot({
      product_id: productId,
      lot_number: data.initial_lot_number,
      expiry_date: data.initial_expiry_date,
      purchase_price: data.purchase_price || 0,
      quantity_in_stock: data.initial_quantity || 0,
      supplier_id: data.initial_supplier_id || null
    });
  }

  return productId;
}

export async function updateProductAction(id: number, data: Partial<ProductFormData>): Promise<void> {
  await updateProduct(id, {
    name: data.name,
    dci: data.dci,
    form: data.form,
    dosage: data.dosage,
    packaging: data.packaging,
    barcode: data.barcode,
    selling_price: data.selling_price,
    purchase_price: data.purchase_price,
    min_stock_alert: data.min_stock_alert,
    category_id: data.category_id,
    category: data.category,
    is_narcotic: data.is_narcotic !== undefined ? (data.is_narcotic ? 1 : 0) : undefined
  });
}

export async function deleteProductAction(id: number): Promise<void> {
  await deleteProduct(id);
}

export async function createLotAction(lotData: NewLotInput): Promise<number> {
  return await createLot(lotData);
}

// src/features/stock/utils/stockExport.ts
import type { ProductWithStock } from "../types";

/**
 * Exporte l'état actuel des stocks au format CSV compatible avec Microsoft Excel et LibreOffice (UTF-8 avec BOM)
 */
export function exportStockToCsv(products: ProductWithStock[], filenamePrefix: string = "inventaire_stock"): void {
  if (products.length === 0) return;

  const headers = [
    "Code-barres",
    "Médicament",
    "DCI",
    "Forme",
    "Dosage",
    "Conditionnement",
    "Catégorie",
    "Stock Actuel",
    "Seuil Alerte",
    "Prix Achat (FCFA)",
    "Prix Vente (FCFA)",
    "Valeur Vente (FCFA)",
    "Prochaine Péremption",
    "Statut Stock"
  ];

  const rows = products.map(p => {
    const stock = p.total_stock ?? 0;
    const isOutOfStock = stock <= 0;
    const isLowStock = !isOutOfStock && stock <= (p.min_stock_alert || 5);
    const statusStr = isOutOfStock ? "Rupture" : isLowStock ? "Stock Bas" : "Normal";
    const totalVal = stock * (p.selling_price || 0);

    return [
      `"${p.barcode || ""}"`,
      `"${(p.name || "").replace(/"/g, '""')}"`,
      `"${(p.dci || "").replace(/"/g, '""')}"`,
      `"${(p.form || "").replace(/"/g, '""')}"`,
      `"${(p.dosage || "").replace(/"/g, '""')}"`,
      `"${(p.packaging || "").replace(/"/g, '""')}"`,
      `"${(p.category || "Autre").replace(/"/g, '""')}"`,
      stock,
      p.min_stock_alert || 5,
      p.purchase_price || 0,
      p.selling_price || 0,
      totalVal,
      `"${p.nearest_expiry || "N/A"}"`,
      `"${statusStr}"`
    ].join(";");
  });

  // \uFEFF garantit le bon encodage UTF-8 sous Excel Windows
  const csvContent = "\uFEFF" + headers.join(";") + "\n" + rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const nowStr = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `${filenamePrefix}_${nowStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

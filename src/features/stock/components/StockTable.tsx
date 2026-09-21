// src/features/stock/components/StockTable.tsx
import { useState } from "react";
import { 
  Package, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  ShieldAlert 
} from "lucide-react";
import type { ProductWithStock } from "../types";

interface StockTableProps {
  products: ProductWithStock[];
  onEditProduct: (p: ProductWithStock) => void;
  onAddLot: (p: ProductWithStock) => void;
  onDeleteProduct: (p: ProductWithStock) => void;
}

export function StockTable({
  products,
  onEditProduct,
  onAddLot,
  onDeleteProduct
}: StockTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [copiedBarcode, setCopiedBarcode] = useState<string | null>(null);

  const handleCopyBarcode = (barcode: string) => {
    navigator.clipboard.writeText(barcode);
    setCopiedBarcode(barcode);
    setTimeout(() => setCopiedBarcode(null), 2000);
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(products.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * rowsPerPage;
  const paginatedProducts = products.slice(startIndex, startIndex + rowsPerPage);

  const getExpiryBadge = (nearestExpiry: string | null, stock: number) => {
    if (!nearestExpiry || stock <= 0) {
      return <span className="text-slate-400 text-xs font-semibold">—</span>;
    }

    const now = new Date();
    const expDate = new Date(nearestExpiry);
    if (isNaN(expDate.getTime())) {
      return <span className="text-slate-500 text-xs">{nearestExpiry}</span>;
    }

    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
          Périmé ({nearestExpiry})
        </span>
      );
    } else if (diffDays <= 90) { // Moins de 3 mois
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 w-fit">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>&lt; 3 mois ({nearestExpiry})</span>
        </span>
      );
    } else if (diffDays <= 180) { // Moins de 6 mois
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          &lt; 6 mois ({nearestExpiry})
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          {nearestExpiry}
        </span>
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col font-sans">
      
      {/* 1. Tableau récapitulatif */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-500 text-[11px] font-bold uppercase tracking-wider bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3.5">Code-barres</th>
              <th className="px-5 py-3.5">Médicament</th>
              <th className="px-4 py-3.5">Catégorie</th>
              <th className="px-4 py-3.5">Stock Actuel</th>
              <th className="px-4 py-3.5">Prix Vente</th>
              <th className="px-4 py-3.5">Prochaine Péremption (FEFO)</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  <Package className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700 text-sm">Aucun médicament ne correspond à ces critères.</p>
                  <p className="text-xs text-slate-400 mt-0.5">Essayez de réinitialiser la recherche ou les filtres.</p>
                </td>
              </tr>
            ) : (
              paginatedProducts.map((p) => {
                const stock = p.total_stock ?? 0;
                const isOutOfStock = stock <= 0;
                const isLowStock = !isOutOfStock && stock <= (p.min_stock_alert || 5);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                    
                    {/* Code-barres */}
                    <td className="px-5 py-3.5">
                      {p.barcode ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                            {p.barcode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyBarcode(p.barcode!)}
                            title="Copier le code-barres"
                            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                          >
                            {copiedBarcode === p.barcode ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Non assigné</span>
                      )}
                    </td>

                    {/* Médicament & Détails */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-[#2720ff] transition-colors flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {p.is_narcotic === 1 && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-red-100 text-red-700 border border-red-200 flex items-center gap-0.5" title="Substance stupéfiante réglementée">
                                <ShieldAlert className="h-2.5 w-2.5" />
                                <span>Tableau A</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {p.dci ? `${p.dci} • ` : ""}{p.form || ""}{p.dosage ? ` ${p.dosage}` : ""}{p.packaging ? ` (${p.packaging})` : ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Catégorie */}
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {p.category || "Général"}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm ${
                          isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-600" : "text-slate-900"
                        }`}>
                          {stock}
                        </span>
                        <span className="text-slate-400 text-[10px] font-semibold">/ {p.min_stock_alert || 5} min</span>
                        
                        <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          isOutOfStock 
                            ? "bg-red-100 text-red-700" 
                            : isLowStock 
                              ? "bg-amber-100 text-amber-800" 
                              : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {isOutOfStock ? "Rupture" : isLowStock ? "Bas" : "OK"}
                        </span>
                      </div>
                    </td>

                    {/* Prix Vente */}
                    <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">
                      {p.selling_price.toLocaleString()}{" "}
                      <span className="text-[10px] font-semibold text-slate-500">FCFA</span>
                    </td>

                    {/* Prochaine Péremption */}
                    <td className="px-4 py-3.5">
                      {getExpiryBadge(p.nearest_expiry, stock)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Réapprovisionner / Nouveau Lot */}
                        <button
                          type="button"
                          onClick={() => onAddLot(p)}
                          title="Ajouter un lot (Réapprovisionnement)"
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-[#2720ff] bg-white hover:bg-[#2720ff]/5 text-slate-600 hover:text-[#2720ff] transition-all cursor-pointer"
                        >
                          <PlusCircle className="h-4 w-4" />
                        </button>

                        {/* Modifier fiche produit */}
                        <button
                          type="button"
                          onClick={() => onEditProduct(p)}
                          title="Modifier les détails du médicament"
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        {/* Archiver / Supprimer */}
                        <button
                          type="button"
                          onClick={() => onDeleteProduct(p)}
                          title="Archiver le médicament"
                          className="p-1.5 rounded-lg border border-slate-200 hover:border-red-300 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 2. Barre de pagination */}
      <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 text-xs">
        
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <span>
            Affichage de <strong>{products.length > 0 ? startIndex + 1 : 0}</strong> à <strong>{Math.min(startIndex + rowsPerPage, products.length)}</strong> sur <strong>{products.length}</strong> médicaments
          </span>

          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span>Par page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg py-1 px-2 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-slate-700 font-bold px-2">
            Page {safePage} sur {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

      </div>

    </div>
  );
}

import { ShoppingCart, Package, AlertTriangle, XCircle } from "lucide-react";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const stock = product.stock_quantity ?? 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = !isOutOfStock && stock <= (product.min_stock_alert || 5);

  return (
    <div className={`bg-white p-5 rounded-2xl border transition-all flex flex-col h-full shadow-sm hover:shadow-md ${
      isOutOfStock 
        ? "border-slate-200 opacity-75 bg-slate-50/50" 
        : "border-slate-200 hover:border-[#2720ff]/40"
    }`}>
      {/* En-tête statut */}
      <div className="flex justify-between items-start mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
          isOutOfStock 
            ? "bg-red-50 text-red-500" 
            : isLowStock 
              ? "bg-amber-50 text-amber-600" 
              : "bg-[#2720ff]/10 text-[#2720ff]"
        }`}>
          {isOutOfStock ? (
            <XCircle className="h-5 w-5" />
          ) : isLowStock ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <Package className="h-5 w-5" />
          )}
        </div>

        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
          isOutOfStock 
            ? "bg-red-100 text-red-700" 
            : isLowStock 
              ? "bg-amber-100 text-amber-800" 
              : "bg-emerald-100 text-emerald-700"
        }`}>
          {isOutOfStock ? "Rupture" : isLowStock ? "Stock Bas" : "Disponible"}
        </span>
      </div>

      {/* Détails produit */}
      <div className="flex-1">
        <h3 className="font-bold text-slate-900 leading-snug mb-1 text-base">
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 mb-4 line-clamp-2">
          {product.dci ? `${product.dci} • ` : ""}{product.form || ""}{product.packaging ? ` (${product.packaging})` : ""}
        </p>

        <div className="flex flex-col gap-1 mb-4 mt-auto">
          <p className="text-[11px] font-bold text-slate-500 uppercase">
            Stock : <span className={`font-extrabold ${isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-600" : "text-slate-800"}`}>{stock} unités</span>
          </p>
          <p className="text-xl font-bold text-[#2720ff]">
            {product.selling_price.toLocaleString()}{" "}
            <span className="text-xs font-bold text-slate-700">FCFA</span>
          </p>
        </div>
      </div>

      {/* Bouton d'ajout */}
      <button
        onClick={() => onAdd(product)}
        disabled={isOutOfStock}
        className={`w-full p-3 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-sm ${
          isOutOfStock
            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-[#2720ff] hover:bg-[#1f19cc] text-white shadow-md shadow-[#2720ff]/20 active:scale-95 cursor-pointer"
        }`}
      >
        <ShoppingCart className="h-4 w-4" />
        <span>{isOutOfStock ? "Stock Épuisé" : "Ajouter au Panier"}</span>
      </button>
    </div>
  );
}

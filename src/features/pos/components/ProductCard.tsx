import { ShoppingCart, Package, AlertCircle } from "lucide-react";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const isLowStock = (product.stock_quantity || 0) <= (product.min_stock_alert || 5);
  const isCriticalStock = (product.stock_quantity || 0) <= 2;

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] hover:border-[#10B981] transition-all group flex flex-col h-full shadow-sm hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
          isCriticalStock ? "bg-red-50 text-red-500" : isLowStock ? "bg-orange-50 text-orange-500" : "bg-emerald-50 text-emerald-500"
        }`}>
          {isCriticalStock ? <AlertCircle className="h-5 w-5" /> : <Package className="h-5 w-5" />}
        </div>
        
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
          isCriticalStock ? "bg-red-50 text-red-600" : isLowStock ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"
        }`}>
          {isCriticalStock ? "Critique" : isLowStock ? "Stock Bas" : "En Stock"}
        </span>
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-[#0F172A] leading-tight mb-1">{product.name}</h3>
        <p className="text-xs text-[#64748B] mb-4">{product.dci} - {product.form} - {product.packaging}</p>
        
        <div className="flex flex-col gap-1 mb-4">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Stock: {product.stock_quantity} restants</p>
          <p className="text-xl font-black text-[#10B981]">{product.selling_price.toLocaleString()} <span className="text-xs font-bold">FCFA</span></p>
        </div>
      </div>

      <button 
        onClick={() => onAdd(product)}
        className="w-full bg-[#10B981] hover:bg-[#059669] text-white p-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="text-sm font-bold">Ajouter</span>
      </button>
    </div>
  );
}

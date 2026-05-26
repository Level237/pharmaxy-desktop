import { use, Suspense, useState } from "react";
import { ShoppingBag, Scan } from "lucide-react";
import { Layout } from "../../shared/components/Layout";
import { ProductCard } from "./components/ProductCard";
import { CartSidebar } from "./components/CartSidebar";
import { fetchProducts } from "./actions/posActions";
import { useCart } from "./hooks/useCart";
import type { Product } from "./types";

function PosContent({ productsPromise }: { productsPromise: Promise<Product[]> }) {
  const products = use(productsPromise);
  const { items, addToCart, updateQuantity, totalAmount, totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Tous");

  const categories = ["Tous", "Antibiotiques", "Pédiatrie", "Cardiologie"];

  const filteredProducts = activeCategory === "Tous"
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Catalogue Produits</h2>
          <p className="text-[#64748B] text-sm mt-1">Sélectionnez les articles ou scannez-les.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-[#E2E8F0] p-1 rounded-xl">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeCategory === cat
                  ? "bg-[#587dff] cursor-pointer text-white shadow-md shadow-emerald-500/10"
                  : "text-[#64748B] cursor-pointer hover:bg-slate-50"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-white border border-[#E2E8F0] p-3 rounded-xl hover:border-[#10B981] transition-all group"
          >
            <ShoppingBag className="h-6 w-6 text-[#64748B] group-hover:text-[#10B981]" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#587dff] text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        <div className="bg-slate-50 border-2 border-dashed border-[#CBD5E1] rounded-2xl flex flex-col items-center justify-center p-8 text-[#94A3B8] group hover:border-[#587dff] hover:text-[#587dff] transition-all cursor-pointer">
          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
            <Scan className="h-8 w-8" />
          </div>
          <p className="font-bold text-sm">Scanner un produit</p>
          <p className="text-[10px] mt-1 text-center">Utilisez le lecteur code-barres</p>
        </div>

        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={addToCart}
          />
        ))}
      </div>

      <CartSidebar
        items={items}
        onUpdateQuantity={updateQuantity}
        totalAmount={totalAmount}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}

export function PosPage() {
  // On crée la promise ici pour qu'elle ne soit lancée que quand le composant est monté
  // et donc après que GlobalGuard ait initialisé la base de données.
  const [productsPromise] = useState(() => fetchProducts());

  return (
    <Layout>
      <Suspense fallback={<div className="flex items-center justify-center h-full text-[#64748B]">Chargement du catalogue...</div>}>
        <PosContent productsPromise={productsPromise} />
      </Suspense>
    </Layout>
  );
}

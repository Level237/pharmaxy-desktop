import { use, Suspense, useState, useTransition, useEffect, useRef } from "react";
import { ShoppingBag, Search, Barcode, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Layout } from "../../shared/components/Layout";
import { ProductCard } from "./components/ProductCard";
import { CartSidebar } from "./components/CartSidebar";
import { SaleReceiptModal } from "./components/SaleReceiptModal";
import { fetchProducts } from "./actions/posActions";
import { useCart } from "./hooks/useCart";
import type { Product, SaleSuccessData } from "./types";

function PosContent({ 
  productsPromise,
  onSaleSuccess,
  onOpenReceipt
}: { 
  productsPromise: Promise<Product[]>;
  onSaleSuccess: (saleData: SaleSuccessData) => void;
  onOpenReceipt: (saleId: number) => void;
}) {
  const products = use(productsPromise);
  const {
    items,
    cartError,
    clearError,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount,
    totalItems
  } = useCart();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [scanNotification, setScanNotification] = useState<string | null>(null);

  const [isSearching, startSearchTransition] = useTransition();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSaleCompleted = (saleData: SaleSuccessData) => {
    setIsCartOpen(false);
    clearCart();
    onSaleSuccess(saleData);
  };

  // Catégories dynamiques dérivées des produits disponibles
  const categories = ["Tous", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    const el = categoriesScrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 5);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, [categories]);

  const scrollCategories = (direction: "left" | "right") => {
    const el = categoriesScrollRef.current;
    if (el) {
      const scrollAmount = 260;
      el.scrollBy({ left: direction === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
      setTimeout(checkScrollability, 300);
    }
  };

  const handleCategoriesWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = categoriesScrollRef.current;
    if (el && e.deltaY !== 0) {
      el.scrollLeft += e.deltaY;
      checkScrollability();
    }
  };

  // Gestion du champ de recherche non bloquant (React 19 Concurrent)
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    startSearchTransition(() => {
      setFilterQuery(val.toLowerCase().trim());
    });
  };

  // Filtrage combiné (Recherche Nom/DCI/Barcode + Catégorie)
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "Tous" || p.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!filterQuery) return true;
    const nameMatch = p.name.toLowerCase().includes(filterQuery);
    const dciMatch = p.dci?.toLowerCase().includes(filterQuery);
    const barcodeMatch = p.barcode?.includes(filterQuery);
    return nameMatch || dciMatch || barcodeMatch;
  });

  // Support automatique du lecteur de code-barres USB (Douchette physique)
  // Les douchettes USB agissent comme un clavier ultra-rapide terminant par "Enter"
  useEffect(() => {
    let buffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ne pas intercepter si l'utilisateur est déjà dans un champ texte standard
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") {
        return;
      }

      const currentTime = Date.now();
      const char = e.key;

      // Si le délai entre deux frappes dépasse 60ms, ce n'est pas un scanner de code-barres
      if (currentTime - lastKeyTime > 60) {
        buffer = "";
      }
      lastKeyTime = currentTime;

      if (char === "Enter") {
        if (buffer.length >= 4) {
          const scannedCode = buffer.trim();
          const matched = products.find(p => p.barcode === scannedCode);

          if (matched) {
            const added = addToCart(matched);
            if (added) {
              setScanNotification(`Scanné : ${matched.name}`);
              setTimeout(() => setScanNotification(null), 3000);
            }
          } else {
            setScanNotification(`Code-barres inconnu : ${scannedCode}`);
            setTimeout(() => setScanNotification(null), 3000);
          }
          buffer = "";
        }
      } else if (char.length === 1) {
        buffer += char;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [products, addToCart]);

  return (
    <div className="flex flex-col h-full relative font-sans">
      
      {/* Toast de scan douchette */}
      {scanNotification && (
        <div className="fixed top-24 right-8 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <Barcode className="h-5 w-5 text-[#2720ff]" />
          <span className="text-sm font-bold">{scanNotification}</span>
        </div>
      )}

      {/* Barre d'outils supérieure */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Comptoir de Vente (POS)</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Sélectionnez les médicaments ou utilisez la douchette code-barres.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Champ de recherche rapide */}
          <div className="relative w-72 sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Nom, DCI ou code-barres..."
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#2720ff] focus:ring-2 focus:ring-[#2720ff]/20 shadow-sm"
            />
            {isSearching && (
              <RefreshCw className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 animate-spin" />
            )}
          </div>

          {/* Bouton Panier flottant */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-[#2720ff] hover:bg-[#1f19cc] text-white p-3 rounded-xl shadow-lg shadow-[#2720ff]/25 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs font-bold hidden sm:inline">Panier</span>
            {totalItems > 0 && (
              <span className="bg-white text-[#2720ff] text-[11px] font-extrabold h-5 min-w-5 px-1 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sélecteur de catégories : défilant sur place de manière fluide sans impacter le layout */}
      <div className="relative w-full max-w-full min-w-0 mb-6 flex items-center group">
        {/* Flèche Défilement Gauche */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollCategories("left")}
            className="absolute left-0 z-20 h-9 w-9 -ml-2 rounded-full bg-white/95 shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#2720ff] hover:scale-105 transition-all cursor-pointer"
            title="Défiler vers la gauche"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Conteneur défilant sur place */}
        <div
          ref={categoriesScrollRef}
          onScroll={checkScrollability}
          onWheel={handleCategoriesWheel}
          className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5 px-1 w-full min-w-0 scroll-smooth select-none"
        >
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#2720ff] text-white shadow-md shadow-[#2720ff]/25 scale-100"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Flèche Défilement Droite */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollCategories("right")}
            className="absolute right-0 z-20 h-9 w-9 -mr-2 rounded-full bg-white/95 shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#2720ff] hover:scale-105 transition-all cursor-pointer"
            title="Défiler vers la droite"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Grille des produits */}
      {filteredProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-center">
          <Search className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-800 text-lg">Aucun médicament trouvé</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            Aucun produit ne correspond à votre recherche "{searchTerm}".
          </p>
          <button
            onClick={() => { setSearchTerm(""); setFilterQuery(""); setSelectedCategory("Tous"); }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pb-24 overflow-y-auto">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={addToCart}
            />
          ))}
        </div>
      )}

      {/* Sidebar Latérale du Panier & Encaissement */}
      <CartSidebar
        items={items}
        cartError={cartError}
        onClearError={clearError}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        totalAmount={totalAmount}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onSaleSuccess={handleSaleCompleted}
        onOpenReceipt={(id) => {
          setIsCartOpen(false);
          onOpenReceipt(id);
        }}
      />
    </div>
  );
}

export function PosPage() {
  const [productsPromise, setProductsPromise] = useState(() => fetchProducts());
  const [receiptSaleId, setReceiptSaleId] = useState<number | null>(null);

  const handleSaleSuccess = (saleData: SaleSuccessData) => {
    setReceiptSaleId(saleData.saleId);
    // Rafraîchissement des produits avec décrémentation des stocks FEFO
    setProductsPromise(fetchProducts());
  };

  const handleNewSale = () => {
    setReceiptSaleId(null);
  };

  return (
    <Layout>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
          <div className="h-10 w-10 border-4 border-[#2720ff]/20 border-t-[#2720ff] rounded-full animate-spin" />
          <p className="font-bold text-sm">Chargement du catalogue officinal...</p>
        </div>
      }>
        <PosContent 
          productsPromise={productsPromise} 
          onSaleSuccess={handleSaleSuccess}
          onOpenReceipt={(id) => setReceiptSaleId(id)}
        />
      </Suspense>

      {/* Modal Reçu de Caisse Officiel & Impression ESC/POS */}
      <SaleReceiptModal
        saleId={receiptSaleId}
        isOpen={receiptSaleId !== null}
        onClose={() => setReceiptSaleId(null)}
        onNewSale={handleNewSale}
      />
    </Layout>
  );
}

// src/features/stock/StockPage.tsx
import { useState, useEffect, useTransition, useMemo } from "react";
import { Package, RefreshCw } from "lucide-react";
import { 
  fetchStockCatalogue, 
  fetchCategoriesList, 
  fetchSuppliersList, 
  calculateStockKpis 
} from "./actions/stockActions";
import { exportStockToCsv } from "./utils/stockExport";
import { Layout } from "../../shared/components/Layout";
import { StockKpiBanner } from "./components/StockKpiBanner";
import { StockFilters } from "./components/StockFilters";
import { StockTable } from "./components/StockTable";
import { ProductFormModal } from "./components/ProductFormModal";
import { AddLotModal } from "./components/AddLotModal";
import { DeleteProductModal } from "./components/DeleteProductModal";
import type { 
  ProductWithStock, 
  StockFiltersState, 
  StockStatusFilter 
} from "./types";
import type { Supplier } from "../../db/supplierQueries";

export function StockPage() {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [categoryObjects, setCategoryObjects] = useState<{ id: number; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // État des filtres
  const [filters, setFilters] = useState<StockFiltersState>({
    search: "",
    category: "Tous",
    status: "all",
    sortBy: "name",
    sortOrder: "asc"
  });

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductWithStock | null>(null);
  const [lotProduct, setLotProduct] = useState<ProductWithStock | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductWithStock | null>(null);

  // Chargement des données
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [prods, cats, sups] = await Promise.all([
        fetchStockCatalogue(),
        fetchCategoriesList(),
        fetchSuppliersList()
      ]);
      setProducts(prods);
      setCategoryObjects(cats);
      setSuppliers(sups);
    } catch (err) {
      console.error("Erreur lors du chargement des données de stock :", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Liste des noms de catégories
  const categoryNames = useMemo(() => {
    return categoryObjects.map(c => c.name);
  }, [categoryObjects]);

  // KPIs globaux (calculés à la volée, non stockés dans un useEffect)
  const kpis = useMemo(() => {
    return calculateStockKpis(products);
  }, [products]);

  // Filtrage des produits (dérivé pendant le rendu)
  const filteredProducts = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const now = new Date();
    const threeMonths = new Date();
    threeMonths.setMonth(now.getMonth() + 3);

    return products.filter(p => {
      // 1. Filtre par recherche textuelle (Nom, DCI, Code-barres)
      if (query) {
        const nameMatch = p.name.toLowerCase().includes(query);
        const dciMatch = (p.dci || "").toLowerCase().includes(query);
        const barcodeMatch = (p.barcode || "").toLowerCase().includes(query);
        if (!nameMatch && !dciMatch && !barcodeMatch) return false;
      }

      // 2. Filtre par catégorie
      if (filters.category !== "Tous") {
        if (p.category !== filters.category) return false;
      }

      // 3. Filtre par statut de stock
      const stock = p.total_stock ?? 0;
      const minAlert = p.min_stock_alert || 5;

      switch (filters.status) {
        case "in_stock":
          return stock > minAlert;
        case "low_stock":
          return stock > 0 && stock <= minAlert;
        case "out_of_stock":
          return stock <= 0;
        case "expiring_soon": {
          if (!p.nearest_expiry || stock <= 0) return false;
          const expDate = new Date(p.nearest_expiry);
          return !isNaN(expDate.getTime()) && expDate <= threeMonths;
        }
        case "expired": {
          if (!p.nearest_expiry || stock <= 0) return false;
          const expDate = new Date(p.nearest_expiry);
          return !isNaN(expDate.getTime()) && expDate <= now;
        }
        case "all":
        default:
          return true;
      }
    });
  }, [products, filters]);

  // Handlers avec transitions fluides React 19
  const handleSearchChange = (val: string) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, search: val }));
    });
  };

  const handleCategoryChange = (cat: string) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, category: cat }));
    });
  };

  const handleStatusChange = (status: StockStatusFilter) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, status }));
    });
  };

  // Export CSV
  const handleExportCsv = () => {
    exportStockToCsv(filteredProducts);
  };

  // Gestion de l'édition
  const handleEditProduct = (p: ProductWithStock) => {
    setProductToEdit(p);
    setIsProductModalOpen(true);
  };

  // Gestion du réapprovisionnement de lot
  const handleAddLot = (p: ProductWithStock) => {
    setLotProduct(p);
  };

  // Gestion de l'archivage
  const handleDeleteProduct = (p: ProductWithStock) => {
    setProductToDelete(p);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête de la page */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2720ff] text-white flex items-center justify-center shadow-lg shadow-[#2720ff]/20">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                Stock & Inventaire
              </h1>
              <p className="text-xs text-slate-500 font-semibold">
                Gestion du catalogue, traçabilité des lots FEFO et alertes de péremption
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-2xs"
              title="Actualiser les données"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#2720ff]" : ""}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Bannière des KPIs */}
        <StockKpiBanner kpis={kpis} />

        {/* Barre de filtres et d'actions */}
        <StockFilters
          filters={filters}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onStatusChange={handleStatusChange}
          categories={categoryNames}
          onOpenNewProductModal={() => {
            setProductToEdit(null);
            setIsProductModalOpen(true);
          }}
          onExportCsv={handleExportCsv}
        />

        {/* Tableau du Stock */}
        <div className={`transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}>
          <StockTable
            products={filteredProducts}
            onEditProduct={handleEditProduct}
            onAddLot={handleAddLot}
            onDeleteProduct={handleDeleteProduct}
          />
        </div>

        {/* Modals */}
        {isProductModalOpen && (
          <ProductFormModal
            isOpen={isProductModalOpen}
            onClose={() => {
              setIsProductModalOpen(false);
              setProductToEdit(null);
            }}
            productToEdit={productToEdit}
            categories={categoryObjects}
            suppliers={suppliers.map(s => ({ id: s.id, name: s.name }))}
            onSuccess={loadData}
          />
        )}

        {lotProduct && (
          <AddLotModal
            isOpen={!!lotProduct}
            onClose={() => setLotProduct(null)}
            product={lotProduct}
            suppliers={suppliers.map(s => ({ id: s.id, name: s.name }))}
            onSuccess={loadData}
          />
        )}

        {productToDelete && (
          <DeleteProductModal
            isOpen={!!productToDelete}
            onClose={() => setProductToDelete(null)}
            product={productToDelete}
            onSuccess={loadData}
          />
        )}
      </div>
    </Layout>
  );
}

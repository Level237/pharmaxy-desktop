import { useState } from "react";
import Database from "@tauri-apps/plugin-sql";

// On définit le type d'un produit (Power de TypeScript)
interface Product {
  id: number;
  uuid: string;
  name: string;
  dci: string;
  selling_price: number;
}

function App() {
  const [dbStatus, setDbStatus] = useState<string>("Non initialisé");
  const [products, setProducts] = useState<Product[]>([]);

  // 1. Fonction pour créer la table et insérer un test
  const initDatabase = async () => {
    try {
      // Connexion au fichier pharmaxy.db local
      const db = await Database.load("sqlite:pharmaxy.db");

      // Création de la table basée sur notre schéma
      await db.execute(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uuid TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          dci TEXT,
          form TEXT,
          dosage TEXT,
          packaging TEXT,
          barcode TEXT UNIQUE,
          selling_price REAL NOT NULL,
          min_stock_alert INTEGER DEFAULT 5,
          category TEXT,
          sync_status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // On insère un faux médicament pour prouver que ça marche
      await db.execute(`
        INSERT OR IGNORE INTO products (uuid, name, dci, selling_price) 
        VALUES ('test-uuid-001', 'Doliprane 1000mg', 'Paracétamol', 1500.0)
      `);

      setDbStatus("✅ Base de données créée et médicament test inséré !");
    } catch (error) {
      console.error(error);
      // On affiche le vrai message d'erreur sur l'interface !
      const errorMsg = error instanceof Error ? error.message : String(error);
      setDbStatus(`❌ Erreur SQL : ${errorMsg}`);
    }
  };

  // 2. Fonction pour lire les produits depuis le fichier local
  const fetchProducts = async () => {
    try {
      const db = await Database.load("sqlite:pharmaxy.db");
      // On lit le tableau SQL et on le force dans le type TypeScript "Product"
      const result = await db.select<Product[]>("SELECT * FROM products");
      setProducts(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    // Interface Tailwind CSS
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg w-full border border-gray-100">
        <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">
          PHARMAXY V1
        </h1>
        <p className="text-gray-500 text-center mb-8">Module Hors-Ligne (SQLite Local)</p>

        <div className="mb-6 p-4 bg-gray-100 rounded-lg text-center font-mono text-sm">
          {dbStatus}
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={initDatabase}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            1. Créer la Base
          </button>
          <button
            onClick={fetchProducts}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            2. Lire les Produits
          </button>
        </div>

        {/* Affichage du résultat de la base de données */}
        {products.length > 0 && (
          <div className="border-t pt-6">
            <h2 className="text-lg font-bold mb-3 text-gray-800">Stock Local :</h2>
            <ul className="space-y-3">
              {products.map((p) => (
                <li key={p.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div>
                    <p className="font-bold text-gray-800">{p.name}</p>
                    <p className="text-sm text-gray-500">DCI: {p.dci}</p>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{p.selling_price} FCFA</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
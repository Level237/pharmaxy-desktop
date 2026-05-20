// src/db/initializeDatabase.ts
import { getDatabase } from "./database";

export const initializeAppDatabase = async () => {
    const db = await getDatabase();

    // 1. Activer les contraintes de clés étrangères
    await db.execute("PRAGMA foreign_keys = ON;");

    // 2. Création des tables dans le bon ordre de dépendance
    
    // Table 1 : pharmacies
    await db.execute(`
        CREATE TABLE IF NOT EXISTS pharmacies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            address TEXT,
            phone TEXT,
            owner_name TEXT,
            license_number TEXT,
            api_token TEXT,
            is_registered INTEGER DEFAULT 0,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Table 2 : users
    await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            pin_code TEXT NOT NULL,
            role TEXT CHECK(role IN ('admin', 'cashier')) NOT NULL,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Table 3 : products
    await db.execute(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            dci TEXT,
            form TEXT,
            dosage TEXT,
            packaging TEXT,
            barcode TEXT,
            selling_price INTEGER NOT NULL,
            min_stock_alert INTEGER DEFAULT 5,
            category TEXT,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Table 4 : suppliers
    await db.execute(`
        CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Table 5 : clients
    await db.execute(`
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            debt_balance INTEGER DEFAULT 0,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Table 6 : lots (dépend de products et suppliers)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS lots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            product_id INTEGER NOT NULL,
            lot_number TEXT NOT NULL,
            expiry_date TEXT NOT NULL,
            purchase_price INTEGER NOT NULL,
            quantity_in_stock INTEGER NOT NULL CHECK(quantity_in_stock >= 0),
            supplier_id INTEGER,
            entry_date TEXT NOT NULL,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
            FOREIGN KEY(supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
        );
    `);

    // Table 7 : sales (dépend de users et clients)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            client_id INTEGER,
            total_amount INTEGER NOT NULL,
            status TEXT CHECK(status IN ('completed', 'cancelled')) DEFAULT 'completed',
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(client_id) REFERENCES clients(id)
        );
    `);

    // Table 8 : sale_lines (dépend de sales, products, lots)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS sale_lines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            sale_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            lot_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL CHECK(quantity > 0),
            unit_price INTEGER NOT NULL,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE,
            FOREIGN KEY(product_id) REFERENCES products(id),
            FOREIGN KEY(lot_id) REFERENCES lots(id)
        );
    `);

    // Table 9 : payments (dépend de sales et clients)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            sale_id INTEGER,
            client_id INTEGER,
            amount INTEGER NOT NULL,
            method TEXT CHECK(method IN ('cash', 'mobile_money', 'credit')) NOT NULL,
            mobile_money_ref TEXT,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(sale_id) REFERENCES sales(id),
            FOREIGN KEY(client_id) REFERENCES clients(id)
        );
    `);

    // Table 10 : stock_adjustments (dépend de lots et users)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS stock_adjustments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            lot_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            reason TEXT CHECK(reason IN ('broken', 'theft', 'expired', 'other')) NOT NULL,
            note TEXT,
            user_id INTEGER NOT NULL,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(lot_id) REFERENCES lots(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

    // 3. Création des Index d'optimisation
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_products_dci ON products(dci);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_lots_product_expiry ON lots(product_id, expiry_date);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_sale_lines_sale ON sale_lines(sale_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_sales_client ON sales(client_id);`);

    console.log("Base de données PHARMAXY et ses index initialisés avec succès.");
};
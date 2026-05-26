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

    // 4. Insertion des données de test (Mock Data)
    const checkProducts = await db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM products");
    if (checkProducts[0].count === 0) {
        const mockProducts = [
            { name: "Amoxicilline 500mg", dci: "Amoxicilline", form: "Gélule", dosage: "500mg", packaging: "Boîte de 12", barcode: "3400930000018", price: 1500, min: 10, cat: "Antibiotique" },
            { name: "Paracétamol 1g", dci: "Paracétamol", form: "Comprimé", dosage: "1g", packaging: "Boîte de 8", barcode: "3400930000025", price: 500, min: 20, cat: "Analgésique" },
            { name: "Ibuprofène 400mg", dci: "Ibuprofène", form: "Comprimé", dosage: "400mg", packaging: "Boîte de 10", barcode: "3400930000032", price: 1200, min: 15, cat: "Anti-inflammatoire" },
            { name: "Doliprane 1000mg", dci: "Paracétamol", form: "Comprimé", dosage: "1000mg", packaging: "Boîte de 8", barcode: "3400930000049", price: 800, min: 20, cat: "Analgésique" },
            { name: "Augmentin 1g", dci: "Amoxicilline/Acide clavulanique", form: "Sachet", dosage: "1g/125mg", packaging: "Boîte de 12", barcode: "3400930000056", price: 4500, min: 5, cat: "Antibiotique" },
            { name: "Spasfon", dci: "Phloroglucinol", form: "Comprimé", dosage: "80mg", packaging: "Boîte de 30", barcode: "3400930000063", price: 2500, min: 10, cat: "Antispasmodique" },
            { name: "Gaviscon", dci: "Sodium alginate", form: "Suspension buvable", dosage: "250ml", packaging: "Flacon", barcode: "3400930000070", price: 3000, min: 5, cat: "Anti-acide" },
            { name: "Ventoline", dci: "Salbutamol", form: "Inhalateur", dosage: "100µg", packaging: "200 doses", barcode: "3400930000087", price: 3500, min: 5, cat: "Bronchodilatateur" },
            { name: "Aerius 5mg", dci: "Desloratadine", form: "Comprimé", dosage: "5mg", packaging: "Boîte de 30", barcode: "3400930000094", price: 4000, min: 10, cat: "Antihistaminique" },
            { name: "Inexium 40mg", dci: "Esoméprazole", form: "Comprimé", dosage: "40mg", packaging: "Boîte de 28", barcode: "3400930000100", price: 6500, min: 5, cat: "Inhibiteur de la pompe à protons" },
            { name: "Dafalgan Codéine", dci: "Paracétamol/Codéine", form: "Comprimé", dosage: "500mg/30mg", packaging: "Boîte de 16", barcode: "3400930000117", price: 1800, min: 10, cat: "Analgésique" },
            { name: "Voltarène 50mg", dci: "Diclofénac", form: "Comprimé", dosage: "50mg", packaging: "Boîte de 30", barcode: "3400930000124", price: 2200, min: 10, cat: "Anti-inflammatoire" },
            { name: "Clamoxyl 500mg", dci: "Amoxicilline", form: "Gélule", dosage: "500mg", packaging: "Boîte de 12", barcode: "3400930000131", price: 1600, min: 10, cat: "Antibiotique" },
            { name: "Zyrtec 10mg", dci: "Cétirizine", form: "Comprimé", dosage: "10mg", packaging: "Boîte de 15", barcode: "3400930000148", price: 2000, min: 10, cat: "Antihistaminique" },
            { name: "Maalox", dci: "Hydroxyde d'aluminium/magnésium", form: "Comprimé", dosage: "400mg/400mg", packaging: "Boîte de 40", barcode: "3400930000155", price: 2800, min: 10, cat: "Anti-acide" },
            { name: "Smecta", dci: "Diosmectite", form: "Poudre", dosage: "3g", packaging: "Boîte de 30", barcode: "3400930000162", price: 3200, min: 10, cat: "Antidiarrhéique" },
            { name: "Bétadine dermique", dci: "Povidone iodée", form: "Solution", dosage: "10%", packaging: "Flacon 125ml", barcode: "3400930000179", price: 2500, min: 5, cat: "Antiseptique" },
            { name: "Biafine", dci: "Trolamine", form: "Emulsion", dosage: "Tube 93g", packaging: "Tube", barcode: "3400930000186", price: 3800, min: 5, cat: "Protecteur cutané" },
            { name: "Mopral 20mg", dci: "Oméprazole", form: "Gélule", dosage: "20mg", packaging: "Boîte de 14", barcode: "3400930000193", price: 4200, min: 5, cat: "Inhibiteur de la pompe à protons" },
            { name: "Lasilix 40mg", dci: "Furosémide", form: "Comprimé", dosage: "40mg", packaging: "Boîte de 30", barcode: "3400930000209", price: 1500, min: 10, cat: "Diurétique" }
        ];

        for (const p of mockProducts) {
            await db.execute(`
                INSERT INTO products (uuid, name, dci, form, dosage, packaging, barcode, selling_price, min_stock_alert, category)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [crypto.randomUUID(), p.name, p.dci, p.form, p.dosage, p.packaging, p.barcode, p.price, p.min, p.cat]);
        }
        console.log("20 médicaments de test insérés avec succès.");
    }

    console.log("Base de données PHARMAXY et ses index initialisés avec succès.");
};
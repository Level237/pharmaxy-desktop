import Database from "@tauri-apps/plugin-sql";
import { getDatabase } from "./database";

/**
 * Fonction d'auto-migration non-destructive :
 * Vérifie et ajoute les colonnes manquantes dans les tables existantes (pour éviter les erreurs après mise à jour du schéma).
 */
async function addColumnIfNotExists(db: Database, table: string, column: string, definition: string) {
    try {
        const columns = await db.select<{ name: string }[]>(`PRAGMA table_info(${table});`);
        const exists = columns.some((c: { name: string }) => c.name.toLowerCase() === column.toLowerCase());
        if (!exists) {
            await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
            console.log(`[Migration] Colonne "${column}" ajoutée avec succès à la table "${table}".`);
        }
    } catch (e) {
        console.warn(`[Migration] Avertissement lors de l'ajout de ${column} sur ${table}:`, e);
    }
}

export const initializeAppDatabase = async () => {
    const db = await getDatabase();

    // 1. Activer les contraintes de clés étrangères
    await db.execute("PRAGMA foreign_keys = ON;");

    // 2. Création des tables dans le bon ordre de dépendance (idempotent)

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
            is_active INTEGER DEFAULT 1,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Table 3 : categories
    await db.execute(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
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
            email TEXT,
            address TEXT,
            contact_person TEXT,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Table 5 : clients (patients)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            birth_date TEXT,
            allergies TEXT,
            pathologies TEXT,
            debt_balance INTEGER DEFAULT 0,
            max_credit_limit INTEGER DEFAULT 50000,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Table 6 : products
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
            purchase_price INTEGER DEFAULT 0,
            min_stock_alert INTEGER DEFAULT 5,
            category_id INTEGER,
            category TEXT,
            is_narcotic INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
        );
    `);

    // Table 7 : lots (traçabilité FEFO & valorisation stock)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS lots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            product_id INTEGER NOT NULL,
            lot_number TEXT NOT NULL,
            expiry_date TEXT NOT NULL,
            purchase_price INTEGER NOT NULL,
            quantity_in_stock INTEGER NOT NULL CHECK(quantity_in_stock >= 0),
            initial_quantity INTEGER DEFAULT 0,
            supplier_id INTEGER,
            entry_date TEXT NOT NULL,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
            FOREIGN KEY(supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
        );
    `);

    // Table 8 : deliveries (réception de commande / entrées stock)
    await db.execute(`
        CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            supplier_id INTEGER NOT NULL,
            invoice_number TEXT NOT NULL,
            delivery_date TEXT NOT NULL,
            total_amount INTEGER NOT NULL,
            status TEXT CHECK(status IN ('received', 'partial', 'pending', 'cancelled')) DEFAULT 'received',
            received_by_user_id INTEGER,
            notes TEXT,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(supplier_id) REFERENCES suppliers(id),
            FOREIGN KEY(received_by_user_id) REFERENCES users(id)
        );
    `);

    // Table 9 : delivery_items
    await db.execute(`
        CREATE TABLE IF NOT EXISTS delivery_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            delivery_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            lot_number TEXT NOT NULL,
            expiry_date TEXT NOT NULL,
            quantity_received INTEGER NOT NULL CHECK(quantity_received > 0),
            purchase_price INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE,
            FOREIGN KEY(product_id) REFERENCES products(id)
        );
    `);

    // Table 10 : sales
    await db.execute(`
        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            receipt_number TEXT UNIQUE,
            user_id INTEGER NOT NULL,
            client_id INTEGER,
            subtotal INTEGER DEFAULT 0,
            discount_amount INTEGER DEFAULT 0,
            total_amount INTEGER NOT NULL,
            paid_amount INTEGER DEFAULT 0,
            change_amount INTEGER DEFAULT 0,
            status TEXT CHECK(status IN ('completed', 'cancelled', 'credit')) DEFAULT 'completed',
            notes TEXT,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(client_id) REFERENCES clients(id)
        );
    `);

    // Table 11 : sale_lines
    await db.execute(`
        CREATE TABLE IF NOT EXISTS sale_lines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            sale_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            lot_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL CHECK(quantity > 0),
            unit_price INTEGER NOT NULL,
            purchase_price INTEGER DEFAULT 0,
            subtotal INTEGER DEFAULT 0,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(sale_id) REFERENCES sales(id) ON DELETE CASCADE,
            FOREIGN KEY(product_id) REFERENCES products(id),
            FOREIGN KEY(lot_id) REFERENCES lots(id)
        );
    `);

    // Table 12 : payments
    await db.execute(`
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            sale_id INTEGER,
            client_id INTEGER,
            amount INTEGER NOT NULL,
            method TEXT CHECK(method IN ('cash', 'mobile_money', 'credit', 'card')) NOT NULL,
            mobile_money_provider TEXT,
            mobile_money_ref TEXT,
            notes TEXT,
            user_id INTEGER,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(sale_id) REFERENCES sales(id),
            FOREIGN KEY(client_id) REFERENCES clients(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

    // Table 13 : cash_sessions
    await db.execute(`
        CREATE TABLE IF NOT EXISTS cash_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            opening_amount INTEGER NOT NULL,
            closing_amount_expected INTEGER,
            closing_amount_real INTEGER,
            difference INTEGER,
            total_cash_sales INTEGER DEFAULT 0,
            total_momo_sales INTEGER DEFAULT 0,
            total_credit_sales INTEGER DEFAULT 0,
            total_withdrawals INTEGER DEFAULT 0,
            status TEXT CHECK(status IN ('open', 'closed')) DEFAULT 'open',
            opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            closed_at DATETIME,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

    // Table 14 : stock_adjustments
    await db.execute(`
        CREATE TABLE IF NOT EXISTS stock_adjustments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            lot_id INTEGER NOT NULL,
            product_id INTEGER,
            quantity INTEGER NOT NULL,
            reason TEXT CHECK(reason IN ('broken', 'theft', 'expired', 'inventory_gap', 'other')) NOT NULL,
            note TEXT,
            user_id INTEGER NOT NULL,
            sync_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(lot_id) REFERENCES lots(id),
            FOREIGN KEY(product_id) REFERENCES products(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

    // Table 15 : narcotic_logs
    await db.execute(`
        CREATE TABLE IF NOT EXISTS narcotic_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE NOT NULL,
            product_id INTEGER NOT NULL,
            lot_id INTEGER,
            movement_type TEXT CHECK(movement_type IN ('entry', 'exit', 'destruction')) NOT NULL,
            quantity INTEGER NOT NULL,
            stock_after INTEGER NOT NULL,
            prescriber_name TEXT,
            prescriber_phone TEXT,
            patient_name TEXT,
            patient_phone TEXT,
            prescription_ref TEXT,
            supplier_name TEXT,
            invoice_ref TEXT,
            user_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(product_id) REFERENCES products(id),
            FOREIGN KEY(lot_id) REFERENCES lots(id),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

    // Table 16 : settings
    await db.execute(`
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 3. MIGRATIONS AUTOMATIQUES (Ajout des colonnes si la base existait déjà)
    await addColumnIfNotExists(db, "sales", "receipt_number", "TEXT");
    await addColumnIfNotExists(db, "sales", "subtotal", "INTEGER DEFAULT 0");
    await addColumnIfNotExists(db, "sales", "discount_amount", "INTEGER DEFAULT 0");
    await addColumnIfNotExists(db, "sales", "paid_amount", "INTEGER DEFAULT 0");
    await addColumnIfNotExists(db, "sales", "change_amount", "INTEGER DEFAULT 0");
    await addColumnIfNotExists(db, "sales", "notes", "TEXT");

    await addColumnIfNotExists(db, "sale_lines", "purchase_price", "INTEGER DEFAULT 0");
    await addColumnIfNotExists(db, "sale_lines", "subtotal", "INTEGER DEFAULT 0");

    await addColumnIfNotExists(db, "products", "purchase_price", "INTEGER DEFAULT 0");
    await addColumnIfNotExists(db, "products", "category_id", "INTEGER");
    await addColumnIfNotExists(db, "products", "is_narcotic", "INTEGER DEFAULT 0");
    await addColumnIfNotExists(db, "products", "is_active", "INTEGER DEFAULT 1");

    await addColumnIfNotExists(db, "lots", "initial_quantity", "INTEGER DEFAULT 0");
    await addColumnIfNotExists(db, "lots", "supplier_id", "INTEGER");
    await addColumnIfNotExists(db, "lots", "entry_date", "TEXT DEFAULT CURRENT_DATE");

    await addColumnIfNotExists(db, "clients", "birth_date", "TEXT");
    await addColumnIfNotExists(db, "clients", "allergies", "TEXT");
    await addColumnIfNotExists(db, "clients", "pathologies", "TEXT");
    await addColumnIfNotExists(db, "clients", "email", "TEXT");
    await addColumnIfNotExists(db, "clients", "max_credit_limit", "INTEGER DEFAULT 50000");

    await addColumnIfNotExists(db, "users", "is_active", "INTEGER DEFAULT 1");
    await addColumnIfNotExists(db, "payments", "mobile_money_provider", "TEXT");
    await addColumnIfNotExists(db, "payments", "notes", "TEXT");
    await addColumnIfNotExists(db, "payments", "user_id", "INTEGER");

    // 4. Index d'optimisation
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_products_dci ON products(dci);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_lots_product_expiry ON lots(product_id, expiry_date);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_lots_expiry ON lots(expiry_date);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_sale_lines_sale ON sale_lines(sale_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_sales_client ON sales(client_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_sales_receipt ON sales(receipt_number);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_deliveries_supplier ON deliveries(supplier_id);`);
    await db.execute(`CREATE INDEX IF NOT EXISTS idx_narcotic_product ON narcotic_logs(product_id);`);

    // 5. Garantir un utilisateur administrateur dans la base
    const checkUsers = await db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM users");
    if (checkUsers[0].count === 0) {
        await db.execute(`
            INSERT INTO users (uuid, name, pin_code, role, is_active)
            VALUES ($1, 'Administrateur', '1234', 'admin', 1)
        `, [crypto.randomUUID()]);
        console.log("[Seeding] Utilisateur administrateur par défaut créé (PIN: 1234).");
    }

    // 6. Catégories initiales si manquantes
    const checkCategories = await db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM categories");
    if (checkCategories[0].count === 0) {
        const defaultCategories = [
            { name: "Antibiotiques", description: "Anti-infectieux bactériens" },
            { name: "Analgésiques", description: "Antidouleurs et antipyrétiques" },
            { name: "Anti-inflammatoires", description: "AINS et corticoïdes" },
            { name: "Antispasmodiques", description: "Douleurs viscérales et digestives" },
            { name: "Anti-acides", description: "Pansements gastriques et anti-reflux" },
            { name: "Bronchodilatateurs", description: "Traitement des voies respiratoires" },
            { name: "Antihistaminiques", description: "Traitement des allergies" },
            { name: "Inhibiteurs pompe à protons", description: "Ulcères et reflux gastro-œsophagien" },
            { name: "Antidiarrhéiques", description: "Ralentisseurs du transit et absorbants" },
            { name: "Antiseptiques", description: "Désinfection locale et soins cutanés" },
            { name: "Protecteurs cutanés", description: "Pommade cicatrisante et brûlures" },
            { name: "Diurétiques", description: "Hypertension et rétention d'eau" },
            { name: "Pédiatrie", description: "Formes pédiatriques et sirops nourrissons" },
            { name: "Cardiologie", description: "Médicaments cardiovasculaires et tensionnels" },
            { name: "Stupéfiants & Psychotropes", description: "Substances vénéneuses sous contrôle MINSANTE" },
        ];

        for (const cat of defaultCategories) {
            await db.execute(
                "INSERT OR IGNORE INTO categories (uuid, name, description) VALUES ($1, $2, $3)",
                [crypto.randomUUID(), cat.name, cat.description]
            );
        }
    }

    // 7. Fournisseurs initiaux si manquants
    const checkSuppliers = await db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM suppliers");
    if (checkSuppliers[0].count === 0) {
        const defaultSuppliers = [
            { name: "CENAME / CAMEG", phone: "+237 222 23 10 50", address: "Yaoundé, Centre", contact: "Service Commandes Publiques" },
            { name: "Laborex Cameroun", phone: "+237 233 42 12 80", address: "Douala, Bassa", contact: "Direction Commerciale" },
            { name: "UCPA Cameroun", phone: "+237 233 40 33 00", address: "Douala, Akwa", contact: "Département Répartition" },
            { name: "Cephac Distribution", phone: "+237 233 43 55 12", address: "Douala, Bonabéri", contact: "Service Logistique" },
            { name: "PCT Pharma", phone: "+237 699 00 11 22", address: "Yaoundé, Bastos", contact: "Responsable Approvisionnement" },
        ];

        for (const sup of defaultSuppliers) {
            await db.execute(
                "INSERT INTO suppliers (uuid, name, phone, address, contact_person) VALUES ($1, $2, $3, $4, $5)",
                [crypto.randomUUID(), sup.name, sup.phone, sup.address, sup.contact]
            );
        }
    }

    // 8. Produits initiaux si manquants
    const checkProducts = await db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM products");
    if (checkProducts[0].count === 0) {
        const categoriesList = await db.select<{ id: number; name: string }[]>("SELECT id, name FROM categories");
        const getCatId = (name: string) => categoriesList.find(c => c.name.toLowerCase() === name.toLowerCase())?.id || null;

        const mockProducts = [
            { name: "Amoxicilline 500mg", dci: "Amoxicilline", form: "Gélule", dosage: "500mg", packaging: "Boîte de 12", barcode: "3400930000018", price: 1500, purchasePrice: 900, min: 10, cat: "Antibiotiques", isNarcotic: 0 },
            { name: "Paracétamol 1g", dci: "Paracétamol", form: "Comprimé", dosage: "1g", packaging: "Boîte de 8", barcode: "3400930000025", price: 500, purchasePrice: 250, min: 20, cat: "Analgésiques", isNarcotic: 0 },
            { name: "Ibuprofène 400mg", dci: "Ibuprofène", form: "Comprimé", dosage: "400mg", packaging: "Boîte de 10", barcode: "3400930000032", price: 1200, purchasePrice: 700, min: 15, cat: "Anti-inflammatoires", isNarcotic: 0 },
            { name: "Doliprane 1000mg", dci: "Paracétamol", form: "Comprimé", dosage: "1000mg", packaging: "Boîte de 8", barcode: "3400930000049", price: 800, purchasePrice: 450, min: 20, cat: "Analgésiques", isNarcotic: 0 },
            { name: "Augmentin 1g", dci: "Amoxicilline/Acide clavulanique", form: "Sachet", dosage: "1g/125mg", packaging: "Boîte de 12", barcode: "3400930000056", price: 4500, purchasePrice: 3100, min: 5, cat: "Antibiotiques", isNarcotic: 0 },
            { name: "Spasfon", dci: "Phloroglucinol", form: "Comprimé", dosage: "80mg", packaging: "Boîte de 30", barcode: "3400930000063", price: 2500, purchasePrice: 1600, min: 10, cat: "Antispasmodiques", isNarcotic: 0 },
            { name: "Gaviscon", dci: "Sodium alginate", form: "Suspension buvable", dosage: "250ml", packaging: "Flacon", barcode: "3400930000070", price: 3000, purchasePrice: 2000, min: 5, cat: "Anti-acides", isNarcotic: 0 },
            { name: "Ventoline", dci: "Salbutamol", form: "Inhalateur", dosage: "100µg", packaging: "200 doses", barcode: "3400930000087", price: 3500, purchasePrice: 2400, min: 5, cat: "Bronchodilatateurs", isNarcotic: 0 },
            { name: "Aerius 5mg", dci: "Desloratadine", form: "Comprimé", dosage: "5mg", packaging: "Boîte de 30", barcode: "3400930000094", price: 4000, purchasePrice: 2700, min: 10, cat: "Antihistaminiques", isNarcotic: 0 },
            { name: "Inexium 40mg", dci: "Esoméprazole", form: "Comprimé", dosage: "40mg", packaging: "Boîte de 28", barcode: "3400930000100", price: 6500, purchasePrice: 4800, min: 5, cat: "Inhibiteurs pompe à protons", isNarcotic: 0 },
            { name: "Dafalgan Codéine", dci: "Paracétamol/Codéine", form: "Comprimé", dosage: "500mg/30mg", packaging: "Boîte de 16", barcode: "3400930000117", price: 1800, purchasePrice: 1100, min: 10, cat: "Stupéfiants & Psychotropes", isNarcotic: 1 },
            { name: "Voltarène 50mg", dci: "Diclofénac", form: "Comprimé", dosage: "50mg", packaging: "Boîte de 30", barcode: "3400930000124", price: 2200, purchasePrice: 1400, min: 10, cat: "Anti-inflammatoires", isNarcotic: 0 },
            { name: "Clamoxyl 500mg", dci: "Amoxicilline", form: "Gélule", dosage: "500mg", packaging: "Boîte de 12", barcode: "3400930000131", price: 1600, purchasePrice: 1000, min: 10, cat: "Antibiotiques", isNarcotic: 0 },
            { name: "Zyrtec 10mg", dci: "Cétirizine", form: "Comprimé", dosage: "10mg", packaging: "Boîte de 15", barcode: "3400930000148", price: 2000, purchasePrice: 1300, min: 10, cat: "Antihistaminiques", isNarcotic: 0 },
            { name: "Maalox", dci: "Hydroxyde d'aluminium/magnésium", form: "Comprimé", dosage: "400mg/400mg", packaging: "Boîte de 40", barcode: "3400930000155", price: 2800, purchasePrice: 1800, min: 10, cat: "Anti-acides", isNarcotic: 0 },
            { name: "Smecta", dci: "Diosmectite", form: "Poudre", dosage: "3g", packaging: "Boîte de 30", barcode: "3400930000162", price: 3200, purchasePrice: 2100, min: 10, cat: "Antidiarrhéiques", isNarcotic: 0 },
            { name: "Bétadine dermique", dci: "Povidone iodée", form: "Solution", dosage: "10%", packaging: "Flacon 125ml", barcode: "3400930000179", price: 2500, purchasePrice: 1600, min: 5, cat: "Antiseptiques", isNarcotic: 0 },
            { name: "Biafine", dci: "Trolamine", form: "Emulsion", dosage: "Tube 93g", packaging: "Tube", barcode: "3400930000186", price: 3800, purchasePrice: 2500, min: 5, cat: "Protecteurs cutanés", isNarcotic: 0 },
            { name: "Mopral 20mg", dci: "Oméprazole", form: "Gélule", dosage: "20mg", packaging: "Boîte de 14", barcode: "3400930000193", price: 4200, purchasePrice: 2800, min: 5, cat: "Inhibiteurs pompe à protons", isNarcotic: 0 },
            { name: "Lasilix 40mg", dci: "Furosémide", form: "Comprimé", dosage: "40mg", packaging: "Boîte de 30", barcode: "3400930000209", price: 1500, purchasePrice: 950, min: 10, cat: "Diurétiques", isNarcotic: 0 }
        ];

        for (const p of mockProducts) {
            const catId = getCatId(p.cat);
            await db.execute(`
                INSERT INTO products (uuid, name, dci, form, dosage, packaging, barcode, selling_price, purchase_price, min_stock_alert, category_id, category, is_narcotic)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `, [crypto.randomUUID(), p.name, p.dci, p.form, p.dosage, p.packaging, p.barcode, p.price, p.purchasePrice, p.min, catId, p.cat, p.isNarcotic]);
        }
    }

    // 9. GARANTIR DU STOCK RÉEL DANS LES LOTS POUR TOUS LES PRODUITS
    // Si un produit existe mais n'a aucun lot ou 0 stock, on lui associe un lot immédiatement
    const productsWithoutStock = await db.select<{ id: number; selling_price: number }[]>(`
        SELECT p.id, p.selling_price
        FROM products p
        WHERE (SELECT COALESCE(SUM(quantity_in_stock), 0) FROM lots WHERE product_id = p.id) = 0
    `);

    if (productsWithoutStock.length > 0) {
        console.log(`[Seeding] Initialisation des lots de stock pour ${productsWithoutStock.length} produits sans stock...`);
        for (let i = 0; i < productsWithoutStock.length; i++) {
            const p = productsWithoutStock[i];
            const expiryDate = i === 0 ? "2026-11-15" : "2027-12-31";
            const initialQty = 35 + (i * 2) % 30;

            await db.execute(`
                INSERT INTO lots (uuid, product_id, lot_number, expiry_date, purchase_price, quantity_in_stock, initial_quantity, entry_date)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                crypto.randomUUID(),
                p.id,
                `LOT-2026-${(1000 + i).toString()}`,
                expiryDate,
                Math.round(p.selling_price * 0.6),
                initialQty,
                initialQty,
                "2026-01-01"
            ]);
        }
        console.log("[Seeding] Stocks réels garantis avec succès.");
    }

    console.log("Base de données PHARMAXY initialisée et auto-migrée avec succès.");
};
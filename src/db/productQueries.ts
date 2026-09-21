// src/db/productQueries.ts
import { getDatabase } from "./database";

export interface Product {
    id: number;
    uuid: string;
    name: string;
    dci: string | null;
    form: string | null;
    dosage: string | null;
    packaging: string | null;
    barcode: string | null;
    selling_price: number;
    purchase_price: number;
    min_stock_alert: number;
    category_id: number | null;
    category: string | null;
    is_narcotic: number;
    is_active: number;
    created_at: string;
    updated_at: string;
}

export interface Lot {
    id: number;
    uuid: string;
    product_id: number;
    lot_number: string;
    expiry_date: string;
    purchase_price: number;
    quantity_in_stock: number;
    initial_quantity: number;
    supplier_id: number | null;
    entry_date: string;
    created_at: string;
    updated_at: string;
}

export interface ProductWithStock extends Product {
    total_stock: number;
    nearest_expiry: string | null;
    lots_count: number;
}

export interface NewProductInput {
    name: string;
    dci?: string;
    form?: string;
    dosage?: string;
    packaging?: string;
    barcode?: string;
    selling_price: number;
    purchase_price?: number;
    min_stock_alert?: number;
    category_id?: number | null;
    category?: string;
    is_narcotic?: number;
}

export interface NewLotInput {
    product_id: number;
    lot_number: string;
    expiry_date: string;
    purchase_price: number;
    quantity_in_stock: number;
    supplier_id?: number | null;
    entry_date?: string;
}

/**
 * Récupère tous les produits avec leur stock total calculé et la date de péremption la plus proche (FEFO).
 */
export async function getAllProducts(options?: {
    search?: string;
    categoryId?: number;
    category?: string;
    onlyLowStock?: boolean;
}): Promise<ProductWithStock[]> {
    const db = await getDatabase();

    let query = `
        SELECT 
            p.*,
            COALESCE(SUM(l.quantity_in_stock), 0) as total_stock,
            MIN(CASE WHEN l.quantity_in_stock > 0 THEN l.expiry_date ELSE NULL END) as nearest_expiry,
            COUNT(DISTINCT CASE WHEN l.quantity_in_stock > 0 THEN l.id ELSE NULL END) as lots_count
        FROM products p
        LEFT JOIN lots l ON l.product_id = p.id
        WHERE p.is_active = 1
    `;

    const params: (string | number)[] = [];

    if (options?.search && options.search.trim() !== "") {
        params.push(`%${options.search.trim()}%`);
        query += ` AND (p.name LIKE $${params.length} OR p.dci LIKE $${params.length} OR p.barcode LIKE $${params.length})`;
    }

    if (options?.categoryId !== undefined && options.categoryId !== null) {
        params.push(options.categoryId);
        query += ` AND p.category_id = $${params.length}`;
    } else if (options?.category && options.category !== "Tous") {
        params.push(options.category);
        query += ` AND p.category = $${params.length}`;
    }

    query += ` GROUP BY p.id`;

    if (options?.onlyLowStock) {
        query += ` HAVING total_stock <= p.min_stock_alert`;
    }

    query += ` ORDER BY p.name ASC`;

    return await db.select<ProductWithStock[]>(query, params);
}

/**
 * Recherche instantanée de produits (par nom, DCI ou code-barres)
 */
export async function searchProducts(term: string): Promise<ProductWithStock[]> {
    return getAllProducts({ search: term });
}

/**
 * Récupère un produit par son ID
 */
export async function getProductById(id: number): Promise<ProductWithStock | null> {
    const db = await getDatabase();
    const result = await db.select<ProductWithStock[]>(`
        SELECT 
            p.*,
            COALESCE(SUM(l.quantity_in_stock), 0) as total_stock,
            MIN(CASE WHEN l.quantity_in_stock > 0 THEN l.expiry_date ELSE NULL END) as nearest_expiry,
            COUNT(DISTINCT CASE WHEN l.quantity_in_stock > 0 THEN l.id ELSE NULL END) as lots_count
        FROM products p
        LEFT JOIN lots l ON l.product_id = p.id
        WHERE p.id = $1
        GROUP BY p.id
        LIMIT 1
    `, [id]);

    return result.length > 0 ? result[0] : null;
}

/**
 * Récupère un produit par son code-barres (idéal pour le scanner de caisse)
 */
export async function getProductByBarcode(barcode: string): Promise<ProductWithStock | null> {
    const db = await getDatabase();
    const result = await db.select<ProductWithStock[]>(`
        SELECT 
            p.*,
            COALESCE(SUM(l.quantity_in_stock), 0) as total_stock,
            MIN(CASE WHEN l.quantity_in_stock > 0 THEN l.expiry_date ELSE NULL END) as nearest_expiry,
            COUNT(DISTINCT CASE WHEN l.quantity_in_stock > 0 THEN l.id ELSE NULL END) as lots_count
        FROM products p
        LEFT JOIN lots l ON l.product_id = p.id
        WHERE p.barcode = $1 AND p.is_active = 1
        GROUP BY p.id
        LIMIT 1
    `, [barcode]);

    return result.length > 0 ? result[0] : null;
}

/**
 * Crée un nouveau médicament dans le catalogue
 */
export async function createProduct(input: NewProductInput): Promise<number> {
    const db = await getDatabase();
    const uuid = crypto.randomUUID();

    const result = await db.execute(`
        INSERT INTO products (
            uuid, name, dci, form, dosage, packaging, 
            barcode, selling_price, purchase_price, 
            min_stock_alert, category_id, category, is_narcotic
        ) VALUES (
            $1, $2, $3, $4, $5, $6, 
            $7, $8, $9, 
            $10, $11, $12, $13
        )
    `, [
        uuid,
        input.name.trim(),
        input.dci?.trim() || null,
        input.form?.trim() || null,
        input.dosage?.trim() || null,
        input.packaging?.trim() || null,
        input.barcode?.trim() || null,
        Math.round(input.selling_price),
        Math.round(input.purchase_price || 0),
        input.min_stock_alert ?? 5,
        input.category_id || null,
        input.category || null,
        input.is_narcotic ? 1 : 0
    ]);

    return result.lastInsertId ?? 0;
}

/**
 * Met à jour un produit existant
 */
export async function updateProduct(id: number, input: Partial<NewProductInput>): Promise<void> {
    const db = await getDatabase();

    const fields: string[] = [];
    const params: (string | number | null)[] = [];

    if (input.name !== undefined) {
        params.push(input.name.trim());
        fields.push(`name = $${params.length}`);
    }
    if (input.dci !== undefined) {
        params.push(input.dci ? input.dci.trim() : null);
        fields.push(`dci = $${params.length}`);
    }
    if (input.form !== undefined) {
        params.push(input.form ? input.form.trim() : null);
        fields.push(`form = $${params.length}`);
    }
    if (input.dosage !== undefined) {
        params.push(input.dosage ? input.dosage.trim() : null);
        fields.push(`dosage = $${params.length}`);
    }
    if (input.packaging !== undefined) {
        params.push(input.packaging ? input.packaging.trim() : null);
        fields.push(`packaging = $${params.length}`);
    }
    if (input.barcode !== undefined) {
        params.push(input.barcode ? input.barcode.trim() : null);
        fields.push(`barcode = $${params.length}`);
    }
    if (input.selling_price !== undefined) {
        params.push(Math.round(input.selling_price));
        fields.push(`selling_price = $${params.length}`);
    }
    if (input.purchase_price !== undefined) {
        params.push(Math.round(input.purchase_price));
        fields.push(`purchase_price = $${params.length}`);
    }
    if (input.min_stock_alert !== undefined) {
        params.push(input.min_stock_alert);
        fields.push(`min_stock_alert = $${params.length}`);
    }
    if (input.category_id !== undefined) {
        params.push(input.category_id);
        fields.push(`category_id = $${params.length}`);
    }
    if (input.category !== undefined) {
        params.push(input.category);
        fields.push(`category = $${params.length}`);
    }
    if (input.is_narcotic !== undefined) {
        params.push(input.is_narcotic ? 1 : 0);
        fields.push(`is_narcotic = $${params.length}`);
    }

    if (fields.length === 0) return;

    fields.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);

    await db.execute(`
        UPDATE products 
        SET ${fields.join(", ")}
        WHERE id = $${params.length}
    `, params);
}

/**
 * Supprime (désactive) un produit
 */
export async function deleteProduct(id: number): Promise<void> {
    const db = await getDatabase();
    // Soft-delete pour préserver l'intégrité de l'historique des ventes
    await db.execute(
        "UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [id]
    );
}

/**
 * Récupère tous les lots d'un produit (triés selon la règle FEFO : date de péremption la plus proche d'abord)
 */
export async function getProductLots(productId: number, onlyAvailable: boolean = true): Promise<Lot[]> {
    const db = await getDatabase();
    let query = "SELECT * FROM lots WHERE product_id = $1";
    if (onlyAvailable) {
        query += " AND quantity_in_stock > 0";
    }
    query += " ORDER BY expiry_date ASC, id ASC";

    return await db.select<Lot[]>(query, [productId]);
}

/**
 * Ajoute un nouveau lot de stock pour un produit
 */
export async function createLot(input: NewLotInput): Promise<number> {
    const db = await getDatabase();
    const uuid = crypto.randomUUID();
    const entryDate = input.entry_date || new Date().toISOString().split("T")[0];

    const result = await db.execute(`
        INSERT INTO lots (
            uuid, product_id, lot_number, expiry_date, 
            purchase_price, quantity_in_stock, initial_quantity, 
            supplier_id, entry_date
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
    `, [
        uuid,
        input.product_id,
        input.lot_number.trim(),
        input.expiry_date,
        Math.round(input.purchase_price),
        input.quantity_in_stock,
        input.quantity_in_stock,
        input.supplier_id || null,
        entryDate
    ]);

    return result.lastInsertId ?? 0;
}

/**
 * Récupère les alertes de péremption imminente
 */
export async function getExpiringLots(monthsThreshold: number = 3): Promise<(Lot & { product_name: string; barcode: string | null })[]> {
    const db = await getDatabase();
    return await db.select<(Lot & { product_name: string; barcode: string | null })[]>(`
        SELECT 
            l.*,
            p.name as product_name,
            p.barcode
        FROM lots l
        JOIN products p ON p.id = l.product_id
        WHERE l.quantity_in_stock > 0
          AND date(l.expiry_date) <= date('now', '+' || $1 || ' months')
        ORDER BY l.expiry_date ASC
    `, [monthsThreshold]);
}

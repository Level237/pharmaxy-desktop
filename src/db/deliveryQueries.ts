// src/db/deliveryQueries.ts
import { getDatabase } from "./database";

export interface SupplierEntity {
    id: number;
    uuid: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    contact_person: string | null;
    total_deliveries: number;
    total_spent: number;
    last_delivery_date: string | null;
    created_at: string;
}

export interface DeliveryItemInput {
    productId: number;
    productName?: string;
    lotNumber: string;
    expiryDate: string;
    quantityReceived: number;
    purchasePrice: number;
}

export interface CreateDeliveryInput {
    supplierId: number;
    invoiceNumber: string;
    deliveryDate: string;
    items: DeliveryItemInput[];
    notes?: string;
    receivedByUserId: number;
}

export interface DeliverySummary {
    id: number;
    uuid: string;
    invoice_number: string;
    supplier_id: number;
    supplier_name: string;
    delivery_date: string;
    total_amount: number;
    items_count: number;
    status: 'received' | 'partial' | 'pending' | 'cancelled';
    received_by_user_id: number | null;
    received_by_name: string;
    notes: string | null;
    created_at: string;
    items_summary?: string;
}

export interface DeliveryDetail extends DeliverySummary {
    items: {
        id: number;
        product_id: number;
        product_name: string;
        dci: string | null;
        form: string | null;
        dosage: string | null;
        lot_number: string;
        expiry_date: string;
        quantity_received: number;
        purchase_price: number;
        subtotal: number;
    }[];
}

export interface DeliveryKpis {
    monthlyDeliveriesCount: number;
    monthlyTotalValue: number;
    activeSuppliersCount: number;
    totalProductsSupplied: number;
}

export interface SupplierProductPriceComparison {
    productId: number;
    productName: string;
    dci: string | null;
    form: string | null;
    dosage: string | null;
    sellingPrice: number;
    pricesBySupplier: {
        supplierId: number;
        supplierName: string;
        purchasePrice: number;
        lastDeliveryDate: string;
        lotNumber: string;
    }[];
    lowestPrice: number;
    highestPrice: number;
    bestSupplierName: string;
    potentialMargin: number;
}

/**
 * Récupère tous les fournisseurs avec leurs statistiques d'achat.
 */
export async function getSuppliers(): Promise<SupplierEntity[]> {
    const db = await getDatabase();
    return await db.select<SupplierEntity[]>(`
        SELECT 
            s.id,
            s.uuid,
            s.name,
            s.phone,
            s.email,
            s.address,
            s.contact_person,
            s.created_at,
            (SELECT COUNT(*) FROM deliveries d WHERE d.supplier_id = s.id) as total_deliveries,
            (SELECT COALESCE(SUM(d.total_amount), 0) FROM deliveries d WHERE d.supplier_id = s.id) as total_spent,
            (SELECT MAX(d.delivery_date) FROM deliveries d WHERE d.supplier_id = s.id) as last_delivery_date
        FROM suppliers s
        ORDER BY s.name ASC
    `);
}

/**
 * Ajoute un nouveau fournisseur.
 */
export async function createSupplier(data: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    contactPerson?: string;
}): Promise<SupplierEntity> {
    if (!data.name.trim()) {
        throw new Error("Le nom du fournisseur est obligatoire.");
    }

    const db = await getDatabase();
    const uuid = crypto.randomUUID();

    const res = await db.execute(`
        INSERT INTO suppliers (uuid, name, phone, email, address, contact_person)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, [
        uuid,
        data.name.trim(),
        data.phone?.trim() || null,
        data.email?.trim() || null,
        data.address?.trim() || null,
        data.contactPerson?.trim() || null
    ]);

    const insertedId = res.lastInsertId ?? 0;
    const list = await db.select<SupplierEntity[]>(`
        SELECT 
            s.*,
            0 as total_deliveries,
            0 as total_spent,
            NULL as last_delivery_date
        FROM suppliers s 
        WHERE s.id = $1
    `, [insertedId]);

    return list[0];
}

/**
 * Récupère la liste des bons de livraison avec filtres.
 */
export async function getDeliveries(filters?: {
    supplierId?: number;
    search?: string;
    status?: string;
}): Promise<DeliverySummary[]> {
    const db = await getDatabase();

    let query = `
        SELECT 
            d.id,
            d.uuid,
            d.invoice_number,
            d.supplier_id,
            s.name as supplier_name,
            d.delivery_date,
            d.total_amount,
            d.status,
            d.received_by_user_id,
            COALESCE(u.name, 'Magasinier') as received_by_name,
            d.notes,
            d.created_at,
            (SELECT COUNT(*) FROM delivery_items di WHERE di.delivery_id = d.id) as items_count,
            (
                SELECT GROUP_CONCAT(p.name || ' (' || di.quantity_received || ')', ', ')
                FROM delivery_items di
                JOIN products p ON p.id = di.product_id
                WHERE di.delivery_id = d.id
            ) as items_summary
        FROM deliveries d
        JOIN suppliers s ON s.id = d.supplier_id
        LEFT JOIN users u ON u.id = d.received_by_user_id
        WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (filters?.supplierId) {
        query += ` AND d.supplier_id = $${params.length + 1}`;
        params.push(filters.supplierId);
    }

    if (filters?.search && filters.search.trim()) {
        const s = `%${filters.search.trim()}%`;
        query += ` AND (d.invoice_number LIKE $${params.length + 1} OR s.name LIKE $${params.length + 1})`;
        params.push(s);
    }

    if (filters?.status && filters.status !== 'all') {
        query += ` AND d.status = $${params.length + 1}`;
        params.push(filters.status);
    }

    query += ` ORDER BY d.delivery_date DESC, d.id DESC`;

    return await db.select<DeliverySummary[]>(query, params);
}

/**
 * Récupère le détail complet d'un bon de livraison avec ses lignes d'articles.
 */
export async function getDeliveryById(id: number): Promise<DeliveryDetail | null> {
    const db = await getDatabase();
    const safeId = Math.floor(Number(id));

    const deliveries = await db.select<any[]>(`
        SELECT 
            d.*,
            s.name as supplier_name,
            s.phone as supplier_phone,
            s.address as supplier_address,
            COALESCE(u.name, 'Magasinier') as received_by_name,
            (SELECT COUNT(*) FROM delivery_items di WHERE di.delivery_id = d.id) as items_count
        FROM deliveries d
        JOIN suppliers s ON s.id = d.supplier_id
        LEFT JOIN users u ON u.id = d.received_by_user_id
        WHERE d.id = $1
        LIMIT 1
    `, [safeId]);

    if (deliveries.length === 0) return null;
    const delivery = deliveries[0];

    const items = await db.select<any[]>(`
        SELECT 
            di.id,
            di.product_id,
            p.name as product_name,
            p.dci,
            p.form,
            p.dosage,
            di.lot_number,
            di.expiry_date,
            di.quantity_received,
            di.purchase_price,
            (di.quantity_received * di.purchase_price) as subtotal
        FROM delivery_items di
        JOIN products p ON p.id = di.product_id
        WHERE di.delivery_id = $1
        ORDER BY di.id ASC
    `, [safeId]);

    return {
        ...delivery,
        items
    };
}

/**
 * Enregistre une livraison complète avec création/incrémentation des lots FEFO et mise à jour du prix d'achat.
 */
export async function createDeliveryTransaction(input: CreateDeliveryInput): Promise<DeliveryDetail> {
    if (!input.items || input.items.length === 0) {
        throw new Error("Le bon de livraison doit comporter au moins un article.");
    }
    if (!input.invoiceNumber.trim()) {
        throw new Error("Le numéro de bon de livraison (facture BL) est obligatoire.");
    }

    const db = await getDatabase();
    const deliveryUuid = crypto.randomUUID();
    const totalAmount = input.items.reduce((acc, it) => acc + (it.quantityReceived * it.purchasePrice), 0);

    // 1. Insertion dans la table deliveries
    const delRes = await db.execute(`
        INSERT INTO deliveries (
            uuid, supplier_id, invoice_number, delivery_date, total_amount,
            status, received_by_user_id, notes
        ) VALUES (
            $1, $2, $3, $4, $5, 'received', $6, $7
        )
    `, [
        deliveryUuid,
        input.supplierId,
        input.invoiceNumber.trim(),
        input.deliveryDate || new Date().toISOString().slice(0, 10),
        totalAmount,
        input.receivedByUserId,
        input.notes?.trim() || null
    ]);

    const deliveryId = delRes.lastInsertId ?? 0;

    // 2. Traitement des lignes d'articles & Création des lots FEFO
    for (const item of input.items) {
        if (item.quantityReceived <= 0) {
            throw new Error(`Quantité invalide (${item.quantityReceived}) pour le lot ${item.lotNumber}.`);
        }
        if (!item.lotNumber.trim()) {
            throw new Error(`Numéro de lot manquant pour le produit #${item.productId}.`);
        }
        if (!item.expiryDate) {
            throw new Error(`Date de péremption manquante pour le lot ${item.lotNumber}.`);
        }

        // 2a. Insertion dans delivery_items
        await db.execute(`
            INSERT INTO delivery_items (
                uuid, delivery_id, product_id, lot_number,
                expiry_date, quantity_received, purchase_price
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7
            )
        `, [
            crypto.randomUUID(),
            deliveryId,
            item.productId,
            item.lotNumber.trim(),
            item.expiryDate,
            item.quantityReceived,
            item.purchasePrice
        ]);

        // 2b. Vérifier si un lot identique existe déjà (même produit, même numéro de lot et même date de péremption)
        const existingLots = await db.select<{ id: number }[]>(`
            SELECT id FROM lots 
            WHERE product_id = $1 AND lot_number = $2 AND expiry_date = $3
            LIMIT 1
        `, [item.productId, item.lotNumber.trim(), item.expiryDate]);

        if (existingLots.length > 0) {
            // Incrémenter le stock du lot existant
            await db.execute(`
                UPDATE lots 
                SET quantity_in_stock = quantity_in_stock + $1,
                    initial_quantity = initial_quantity + $1,
                    purchase_price = $2,
                    supplier_id = $3,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
            `, [item.quantityReceived, item.purchasePrice, input.supplierId, existingLots[0].id]);
        } else {
            // Créer un nouveau lot pour traçabilité FEFO stricte
            await db.execute(`
                INSERT INTO lots (
                    uuid, product_id, lot_number, expiry_date,
                    purchase_price, quantity_in_stock, initial_quantity,
                    supplier_id, entry_date
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9
                )
            `, [
                crypto.randomUUID(),
                item.productId,
                item.lotNumber.trim(),
                item.expiryDate,
                item.purchasePrice,
                item.quantityReceived,
                item.quantityReceived,
                input.supplierId,
                input.deliveryDate || new Date().toISOString().slice(0, 10)
            ]);
        }

        // 2c. Mettre à jour le prix d'achat du produit de référence
        await db.execute(`
            UPDATE products 
            SET purchase_price = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2
        `, [item.purchasePrice, item.productId]);
    }

    const fullDetail = await getDeliveryById(deliveryId);
    if (!fullDetail) {
        throw new Error("Impossible de recharger le bon de livraison créé.");
    }
    return fullDetail;
}

/**
 * Calcule les indicateurs clés logistiques.
 */
export async function getDeliveryStats(): Promise<DeliveryKpis> {
    const db = await getDatabase();

    // Réceptions du mois en cours
    const monthlyRes = await db.select<{ count: number; total: number }[]>(`
        SELECT 
            COUNT(*) as count,
            COALESCE(SUM(total_amount), 0) as total
        FROM deliveries
        WHERE strftime('%Y-%m', delivery_date) = strftime('%Y-%m', 'now')
    `);

    // Fournisseurs actifs (ayant au moins une livraison)
    const supRes = await db.select<{ count: number }[]>(`
        SELECT COUNT(DISTINCT supplier_id) as count FROM deliveries
    `);

    // Nombre total de produits approvisionnés
    const prodRes = await db.select<{ count: number }[]>(`
        SELECT COUNT(DISTINCT product_id) as count FROM delivery_items
    `);

    return {
        monthlyDeliveriesCount: monthlyRes[0]?.count || 0,
        monthlyTotalValue: monthlyRes[0]?.total || 0,
        activeSuppliersCount: supRes[0]?.count || 0,
        totalProductsSupplied: prodRes[0]?.count || 0
    };
}

/**
 * Compare les tarifs d'achat entre fournisseurs pour un produit ou l'ensemble du catalogue.
 */
export async function getPriceComparison(productId?: number): Promise<SupplierProductPriceComparison[]> {
    const db = await getDatabase();

    let query = `
        SELECT 
            p.id as product_id,
            p.name as product_name,
            p.dci,
            p.form,
            p.dosage,
            p.selling_price
        FROM products p
        WHERE p.is_active = 1
    `;
    const params: number[] = [];

    if (productId) {
        query += " AND p.id = $1";
        params.push(productId);
    }

    query += " ORDER BY p.name ASC";

    const products = await db.select<any[]>(query, params);
    const results: SupplierProductPriceComparison[] = [];

    for (const prod of products) {
        // Trouver tous les prix d'achat pratiqués par chaque fournisseur pour ce produit
        const priceRows = await db.select<any[]>(`
            SELECT 
                s.id as supplier_id,
                s.name as supplier_name,
                di.purchase_price,
                d.delivery_date,
                di.lot_number
            FROM delivery_items di
            JOIN deliveries d ON d.id = di.delivery_id
            JOIN suppliers s ON s.id = d.supplier_id
            WHERE di.product_id = $1
            ORDER BY di.purchase_price ASC, d.delivery_date DESC
        `, [prod.product_id]);

        if (priceRows.length === 0) continue;

        // Dédupliquer par fournisseur pour garder le dernier prix pratiqué
        const supplierMap = new Map<number, any>();
        for (const row of priceRows) {
            if (!supplierMap.has(row.supplier_id)) {
                supplierMap.set(row.supplier_id, {
                    supplierId: row.supplier_id,
                    supplierName: row.supplier_name,
                    purchasePrice: row.purchase_price,
                    lastDeliveryDate: row.delivery_date,
                    lotNumber: row.lot_number
                });
            }
        }

        const prices = Array.from(supplierMap.values());
        if (prices.length === 0) continue;

        const purchasePrices = prices.map(p => p.purchasePrice);
        const lowestPrice = Math.min(...purchasePrices);
        const highestPrice = Math.max(...purchasePrices);
        const bestSupplier = prices.find(p => p.purchasePrice === lowestPrice);

        results.push({
            productId: prod.product_id,
            productName: prod.product_name,
            dci: prod.dci,
            form: prod.form,
            dosage: prod.dosage,
            sellingPrice: prod.selling_price,
            pricesBySupplier: prices,
            lowestPrice,
            highestPrice,
            bestSupplierName: bestSupplier?.supplierName || "N/A",
            potentialMargin: prod.selling_price - lowestPrice
        });
    }

    return results;
}

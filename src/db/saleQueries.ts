// src/db/saleQueries.ts
import { getDatabase } from "./database";

export interface SaleLineItemInput {
    productId: number;
    productName?: string;
    quantity: number;
    unitPrice: number;
}

export interface SaleTransactionInput {
    userId: number;
    clientId?: number | null;
    items: SaleLineItemInput[];
    paymentMethod: 'cash' | 'mobile_money' | 'credit' | 'card';
    amountReceived: number;
    changeAmount: number;
    discountAmount?: number;
    notes?: string;
}

export interface SaleResult {
    saleId: number;
    uuid: string;
    receiptNumber: string;
    totalAmount: number;
    paidAmount: number;
    changeAmount: number;
    itemsCount: number;
    createdAt: string;
}

export interface SaleDetail {
    id: number;
    uuid: string;
    receipt_number: string;
    user_id: number;
    user_name: string;
    client_id: number | null;
    client_name: string | null;
    subtotal: number;
    discount_amount: number;
    total_amount: number;
    paid_amount: number;
    change_amount: number;
    status: string;
    notes: string | null;
    created_at: string;
    lines: {
        id: number;
        product_id: number;
        product_name: string;
        dci: string | null;
        quantity: number;
        unit_price: number;
        subtotal: number;
        lot_number: string;
        expiry_date: string;
    }[];
}

/**
 * Exécute une transaction de vente atomique avec décrémentation des stocks selon la règle FEFO.
 */
export async function executeSaleTransaction(input: SaleTransactionInput): Promise<SaleResult> {
    if (!input.items || input.items.length === 0) {
        throw new Error("Le panier de vente est vide.");
    }

    const db = await getDatabase();
    const saleUuid = crypto.randomUUID();
    const now = new Date();

    try {
        // 2. Vérification préalable de la disponibilité des stocks pour chaque produit
        for (const item of input.items) {
            const lots = await db.select<{ id: number; quantity_in_stock: number; expiry_date: string; purchase_price: number }[]>(`
                SELECT id, quantity_in_stock, expiry_date, purchase_price 
                FROM lots 
                WHERE product_id = $1 AND quantity_in_stock > 0 
                ORDER BY expiry_date ASC, id ASC
            `, [item.productId]);

            const availableStock = lots.reduce((acc, l) => acc + l.quantity_in_stock, 0);
            if (availableStock < item.quantity) {
                const prodName = item.productName || `Produit #${item.productId}`;
                throw new Error(`Stock insuffisant pour "${prodName}". Demandé : ${item.quantity}, Disponible : ${availableStock}`);
            }
        }

        // 3. Calculs financiers
        const subtotal = input.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
        const discount = input.discountAmount || 0;
        const totalAmount = Math.max(0, subtotal - discount);
        const paidAmount = input.paymentMethod === 'credit' ? 0 : input.amountReceived;
        const changeAmount = input.paymentMethod === 'credit' ? 0 : Math.max(0, input.changeAmount);

        // 4. Garantir un utilisateur valide pour la clé étrangère
        let validUserId = input.userId;
        const userCheck = await db.select<{ id: number }[]>("SELECT id FROM users WHERE id = $1 LIMIT 1", [validUserId]);
        if (userCheck.length === 0) {
            const anyUser = await db.select<{ id: number }[]>("SELECT id FROM users ORDER BY id ASC LIMIT 1");
            if (anyUser.length > 0) {
                validUserId = anyUser[0].id;
            } else {
                const uRes = await db.execute("INSERT INTO users (uuid, name, pin_code, role) VALUES ($1, 'Admin', '1234', 'admin')", [crypto.randomUUID()]);
                validUserId = uRes.lastInsertId ?? 1;
            }
        }

        // 5. Génération du numéro de reçu unique (TK-YYYYMMDD-XXXX-RAND)
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
        const todayCountRes = await db.select<{ count: number }[]>(
            "SELECT COUNT(*) as count FROM sales WHERE date(created_at) = date('now')"
        );
        const sequence = (todayCountRes[0]?.count || 0) + 1;
        const randSuffix = Math.floor(Math.random() * 900 + 100);
        const receiptNumber = `TK-${dateStr}-${sequence.toString().padStart(4, "0")}-${randSuffix}`;

        // 6. Insertion de la vente principale (statut 'completed' pour respecter les contraintes SQLite)
        const saleStatus = 'completed';
        const saleRes = await db.execute(`
            INSERT INTO sales (
                uuid, receipt_number, user_id, client_id,
                subtotal, discount_amount, total_amount, paid_amount,
                change_amount, status, notes
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
            )
        `, [
            saleUuid,
            receiptNumber,
            validUserId,
            input.clientId || null,
            subtotal,
            discount,
            totalAmount,
            paidAmount,
            changeAmount,
            saleStatus,
            input.notes || null
        ]);

        const saleId = saleRes.lastInsertId ?? 0;

        // 6. Décrémentation des lots (FEFO) et enregistrement des lignes de vente
        let totalItemsSold = 0;

        for (const item of input.items) {
            let quantityToDeduct = item.quantity;
            totalItemsSold += item.quantity;

            // Récupération des lots par ordre FEFO (First Expired, First Out)
            const availableLots = await db.select<{ id: number; quantity_in_stock: number; purchase_price: number }[]>(`
                SELECT id, quantity_in_stock, purchase_price 
                FROM lots 
                WHERE product_id = $1 AND quantity_in_stock > 0 
                ORDER BY expiry_date ASC, id ASC
            `, [item.productId]);

            for (const lot of availableLots) {
                if (quantityToDeduct <= 0) break;

                const take = Math.min(quantityToDeduct, lot.quantity_in_stock);

                // Décrémenter le lot
                await db.execute(
                    "UPDATE lots SET quantity_in_stock = quantity_in_stock - $1 WHERE id = $2",
                    [take, lot.id]
                );

                // Enregistrer la ligne de vente avec le lot et le prix d'achat exact (pour traçabilité et marge)
                await db.execute(`
                    INSERT INTO sale_lines (
                        uuid, sale_id, product_id, lot_id,
                        quantity, unit_price, purchase_price, subtotal
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8
                    )
                `, [
                    crypto.randomUUID(),
                    saleId,
                    item.productId,
                    lot.id,
                    take,
                    item.unitPrice,
                    lot.purchase_price,
                    take * item.unitPrice
                ]);

                quantityToDeduct -= take;
            }
        }

        // 7. Enregistrement du règlement (Paiement)
        const safePaymentMethod = input.paymentMethod === 'card' ? 'cash' : input.paymentMethod;
        await db.execute(`
            INSERT INTO payments (
                uuid, sale_id, client_id, amount,
                method, user_id, notes
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7
            )
        `, [
            crypto.randomUUID(),
            saleId,
            input.clientId || null,
            input.paymentMethod === 'credit' ? totalAmount : Math.min(paidAmount, totalAmount),
            safePaymentMethod,
            validUserId,
            input.notes || null
        ]);

        // 8. Si vente à crédit et client renseigné : mise à jour du compte dette client
        if (input.paymentMethod === 'credit' && input.clientId) {
            await db.execute(
                "UPDATE clients SET debt_balance = debt_balance + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
                [totalAmount, input.clientId]
            );
        }

        return {
            saleId,
            uuid: saleUuid,
            receiptNumber,
            totalAmount,
            paidAmount,
            changeAmount,
            itemsCount: totalItemsSold,
            createdAt: now.toISOString()
        };
    } catch (error) {
        console.error("Erreur transaction vente:", error);
        throw error;
    }
}

/**
 * Récupère les dernières ventes enregistrées (pour l'historique et le dashboard)
 */
export async function getRecentSales(limit: number = 10): Promise<{
    id: number;
    receipt_number: string;
    client_name: string;
    cashier_name: string;
    total_amount: number;
    status: string;
    created_at: string;
    items_summary: string;
}[]> {
    const db = await getDatabase();
    const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 10)));
    return await db.select(`
        SELECT 
            s.id,
            s.receipt_number,
            COALESCE(c.name, 'Client Comptant') as client_name,
            COALESCE(u.name, 'Vendeur') as cashier_name,
            s.total_amount,
            s.status,
            s.created_at,
            (
                SELECT GROUP_CONCAT(p.name || ' (x' || sl.quantity || ')', ', ')
                FROM sale_lines sl
                JOIN products p ON p.id = sl.product_id
                WHERE sl.sale_id = s.id
            ) as items_summary
        FROM sales s
        LEFT JOIN clients c ON c.id = s.client_id
        LEFT JOIN users u ON u.id = s.user_id
        ORDER BY s.id DESC
        LIMIT ${safeLimit}
    `);
}

/**
 * Récupère le détail complet d'une vente pour réimpression de ticket
 */
export async function getSaleById(saleId: number): Promise<SaleDetail | null> {
    const db = await getDatabase();
    const safeId = Math.floor(Number(saleId));

    const sales = await db.select<any[]>(`
        SELECT 
            s.*,
            COALESCE(u.name, 'Caissier') as user_name,
            COALESCE(c.name, 'Client Comptant') as client_name
        FROM sales s
        LEFT JOIN users u ON u.id = s.user_id
        LEFT JOIN clients c ON c.id = s.client_id
        WHERE s.id = $1
        LIMIT 1
    `, [safeId]);

    if (sales.length === 0) return null;
    const sale = sales[0];

    const lines = await db.select<any[]>(`
        SELECT 
            sl.id,
            sl.product_id,
            p.name as product_name,
            p.dci,
            sl.quantity,
            sl.unit_price,
            sl.subtotal,
            l.lot_number,
            l.expiry_date
        FROM sale_lines sl
        JOIN products p ON p.id = sl.product_id
        LEFT JOIN lots l ON l.id = sl.lot_id
        WHERE sl.sale_id = $1
    `, [safeId]);

    return {
        ...sale,
        lines
    };
}

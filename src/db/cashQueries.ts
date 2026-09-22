// src/db/cashQueries.ts
import { getDatabase } from "./database";

export interface CashSession {
    id: number;
    uuid: string;
    user_id: number;
    user_name?: string;
    opening_amount: number;
    closing_amount_expected: number | null;
    closing_amount_real: number | null;
    difference: number | null;
    total_cash_sales: number;
    total_momo_sales: number;
    total_credit_sales: number;
    total_withdrawals: number;
    status: 'open' | 'closed';
    opened_at: string;
    closed_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface CashMovement {
    id: number;
    uuid: string;
    cash_session_id: number;
    user_id: number;
    user_name?: string;
    type: 'withdrawal' | 'deposit';
    amount: number;
    reason: string;
    notes: string | null;
    created_at: string;
}

export interface CashSessionSummary {
    session: CashSession;
    openingAmount: number;
    cashSales: number;
    momoSales: number;
    cardSales: number;
    creditSales: number;
    totalSales: number;
    salesCount: number;
    withdrawals: number;
    deposits: number;
    expectedCash: number;
    movements: CashMovement[];
}

/**
 * Récupère la session de caisse actuellement ouverte.
 * Si userId est fourni, privilégie la session de cet utilisateur.
 */
export async function getActiveCashSession(userId?: number): Promise<CashSession | null> {
    const db = await getDatabase();
    
    let query = `
        SELECT cs.*, u.name as user_name
        FROM cash_sessions cs
        JOIN users u ON cs.user_id = u.id
        WHERE cs.status = 'open'
    `;
    const params: (number | string)[] = [];

    if (userId) {
        query += " AND cs.user_id = $1";
        params.push(userId);
    }

    query += " ORDER BY cs.opened_at DESC LIMIT 1";

    const results = await db.select<CashSession[]>(query, params);
    if (results.length > 0) {
        return results[0];
    }

    // Fallback si on cherchait pour un user précis mais qu'une session générale est ouverte
    if (userId) {
        const anyOpen = await db.select<CashSession[]>(`
            SELECT cs.*, u.name as user_name
            FROM cash_sessions cs
            JOIN users u ON cs.user_id = u.id
            WHERE cs.status = 'open'
            ORDER BY cs.opened_at DESC LIMIT 1
        `);
        return anyOpen.length > 0 ? anyOpen[0] : null;
    }

    return null;
}

/**
 * Ouvre une nouvelle session de caisse avec un fond initial.
 */
export async function openCashSession(
    userId: number, 
    openingAmount: number, 
    notes?: string
): Promise<CashSession> {
    const db = await getDatabase();

    // Vérifier si une session est déjà ouverte
    const existing = await getActiveCashSession(userId);
    if (existing) {
        return existing;
    }

    const uuid = crypto.randomUUID();
    const res = await db.execute(`
        INSERT INTO cash_sessions (
            uuid, user_id, opening_amount, status, notes
        ) VALUES (
            $1, $2, $3, 'open', $4
        )
    `, [uuid, userId, Math.max(0, openingAmount), notes || null]);

    const insertedId = res.lastInsertId ?? 0;
    const session = await db.select<CashSession[]>(`
        SELECT cs.*, u.name as user_name
        FROM cash_sessions cs
        JOIN users u ON cs.user_id = u.id
        WHERE cs.id = $1
    `, [insertedId]);

    return session[0];
}

/**
 * Enregistre un mouvement de caisse (décaissement ou apport d'espèces).
 */
export async function recordCashMovement(
    sessionId: number,
    userId: number,
    type: 'withdrawal' | 'deposit',
    amount: number,
    reason: string,
    notes?: string
): Promise<CashMovement> {
    if (amount <= 0) {
        throw new Error("Le montant du mouvement doit être strictement positif.");
    }
    if (!reason.trim()) {
        throw new Error("Le motif du mouvement est obligatoire.");
    }

    const db = await getDatabase();
    const uuid = crypto.randomUUID();

    const res = await db.execute(`
        INSERT INTO cash_movements (
            uuid, cash_session_id, user_id, type, amount, reason, notes
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7
        )
    `, [uuid, sessionId, userId, type, amount, reason.trim(), notes || null]);

    // Mettre à jour le total_withdrawals dans cash_sessions si c'est un retrait
    if (type === 'withdrawal') {
        await db.execute(`
            UPDATE cash_sessions 
            SET total_withdrawals = total_withdrawals + $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
        `, [amount, sessionId]);
    }

    const insertedId = res.lastInsertId ?? 0;
    const movement = await db.select<CashMovement[]>(`
        SELECT cm.*, u.name as user_name
        FROM cash_movements cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.id = $1
    `, [insertedId]);

    return movement[0];
}

/**
 * Calcule en temps réel le résumé financier complet d'une session de caisse.
 */
export async function getCashSessionSummary(sessionId: number): Promise<CashSessionSummary> {
    const db = await getDatabase();

    const sessionRes = await db.select<CashSession[]>(`
        SELECT cs.*, u.name as user_name
        FROM cash_sessions cs
        JOIN users u ON cs.user_id = u.id
        WHERE cs.id = $1
    `, [sessionId]);

    if (sessionRes.length === 0) {
        throw new Error(`Session de caisse introuvable (ID: ${sessionId}).`);
    }
    const session = sessionRes[0];

    // Récupérer les totaux par mode de règlement
    const paymentsAgg = await db.select<{ method: string; total: number; count: number }[]>(`
        SELECT method, SUM(amount) as total, COUNT(*) as count
        FROM payments
        WHERE cash_session_id = $1
        GROUP BY method
    `, [sessionId]);

    let cashSales = 0;
    let momoSales = 0;
    let cardSales = 0;
    let creditSales = 0;

    for (const p of paymentsAgg) {
        if (p.method === 'cash') cashSales = p.total || 0;
        else if (p.method === 'mobile_money') momoSales = p.total || 0;
        else if (p.method === 'card') cardSales = p.total || 0;
        else if (p.method === 'credit') creditSales = p.total || 0;
    }

    // Nombre de ventes uniques
    const salesCountRes = await db.select<{ count: number }[]>(`
        SELECT COUNT(DISTINCT id) as count
        FROM sales
        WHERE cash_session_id = $1
    `, [sessionId]);
    const salesCount = salesCountRes[0]?.count || 0;

    // Récupérer les mouvements de caisse (sorties / dépôts)
    const movements = await db.select<CashMovement[]>(`
        SELECT cm.*, u.name as user_name
        FROM cash_movements cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.cash_session_id = $1
        ORDER BY cm.created_at DESC
    `, [sessionId]);

    let withdrawals = 0;
    let deposits = 0;

    for (const m of movements) {
        if (m.type === 'withdrawal') withdrawals += m.amount;
        else if (m.type === 'deposit') deposits += m.amount;
    }

    const openingAmount = session.opening_amount || 0;
    const expectedCash = openingAmount + cashSales + deposits - withdrawals;
    const totalSales = cashSales + momoSales + cardSales + creditSales;

    return {
        session,
        openingAmount,
        cashSales,
        momoSales,
        cardSales,
        creditSales,
        totalSales,
        salesCount,
        withdrawals,
        deposits,
        expectedCash,
        movements
    };
}

/**
 * Clôture une session de caisse avec comptage réel et calcul automatique de l'écart.
 */
export async function closeCashSession(
    sessionId: number,
    closingAmountReal: number,
    notes?: string
): Promise<CashSession> {
    const summary = await getCashSessionSummary(sessionId);
    const db = await getDatabase();

    const expectedCash = summary.expectedCash;
    const difference = closingAmountReal - expectedCash;

    await db.execute(`
        UPDATE cash_sessions
        SET 
            closing_amount_expected = $1,
            closing_amount_real = $2,
            difference = $3,
            total_cash_sales = $4,
            total_momo_sales = $5,
            total_credit_sales = $6,
            total_withdrawals = $7,
            status = 'closed',
            closed_at = CURRENT_TIMESTAMP,
            notes = COALESCE($8, notes),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
    `, [
        expectedCash,
        closingAmountReal,
        difference,
        summary.cashSales,
        summary.momoSales,
        summary.creditSales,
        summary.withdrawals,
        notes || null,
        sessionId
    ]);

    const updated = await db.select<CashSession[]>(`
        SELECT cs.*, u.name as user_name
        FROM cash_sessions cs
        JOIN users u ON cs.user_id = u.id
        WHERE cs.id = $1
    `, [sessionId]);

    return updated[0];
}

/**
 * Récupère l'historique des sessions de caisse clôturées.
 */
export async function getCashSessionsHistory(limit: number = 50): Promise<CashSession[]> {
    const db = await getDatabase();
    return await db.select<CashSession[]>(`
        SELECT cs.*, u.name as user_name
        FROM cash_sessions cs
        JOIN users u ON cs.user_id = u.id
        WHERE cs.status = 'closed'
        ORDER BY cs.closed_at DESC
        LIMIT $1
    `, [limit]);
}

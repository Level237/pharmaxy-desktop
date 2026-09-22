// src/db/creditQueries.ts
import { getDatabase } from "./database";

export interface CreditClientSummary {
    id: number;
    uuid: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    debt_balance: number;
    max_credit_limit: number;
    oldest_credit_date: string | null;
    days_since_oldest_debt: number;
    overdue_status: 'normal' | 'overdue' | 'critical' | 'settled';
    unpaid_sales_count: number;
    last_repayment_date: string | null;
}

export interface CreditKpis {
    totalDebtAmount: number;
    debtorCount: number;
    overdueDebtAmount: number;
    criticalDebtAmount: number;
    totalRepaidThisMonth: number;
}

export interface ClientCreditSaleItem {
    sale_id: number;
    receipt_number: string;
    created_at: string;
    credit_due_date: string | null;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    status: string;
    cashier_name: string;
    items_summary: string;
}

export interface ClientRepaymentItem {
    id: number;
    uuid: string;
    receipt_number: string;
    amount: number;
    payment_method: string;
    mobile_money_provider: string | null;
    mobile_money_ref: string | null;
    cashier_name: string;
    notes: string | null;
    created_at: string;
}

export interface ClientCreditLedger {
    client: {
        id: number;
        name: string;
        phone: string | null;
        address: string | null;
        debt_balance: number;
        max_credit_limit: number;
    };
    creditSales: ClientCreditSaleItem[];
    repayments: ClientRepaymentItem[];
}

export interface RecordRepaymentInput {
    clientId: number;
    amount: number;
    paymentMethod: 'cash' | 'mobile_money' | 'card' | 'bank_transfer';
    mobileMoneyProvider?: string;
    mobileMoneyRef?: string;
    notes?: string;
    userId: number;
    cashSessionId?: number | null;
}

export interface RepaymentReceiptData {
    receiptNumber: string;
    clientName: string;
    clientPhone: string | null;
    cashierName: string;
    amountPaid: number;
    previousDebt: number;
    remainingDebt: number;
    paymentMethod: string;
    mobileMoneyProvider?: string | null;
    mobileMoneyRef?: string | null;
    notes?: string | null;
    createdAt: string;
}

/**
 * Récupère la liste des clients ayant un compte crédit ou une dette active.
 */
export async function getCreditClients(filters?: {
    search?: string;
    statusFilter?: 'all' | 'overdue' | 'critical' | 'settled';
}): Promise<CreditClientSummary[]> {
    const db = await getDatabase();

    let query = `
        SELECT 
            c.id,
            c.uuid,
            c.name,
            c.phone,
            c.email,
            c.address,
            COALESCE(c.debt_balance, 0) as debt_balance,
            COALESCE(c.max_credit_limit, 50000) as max_credit_limit,
            (
                SELECT MIN(s.created_at)
                FROM sales s
                WHERE s.client_id = c.id AND (s.status = 'credit' OR s.paid_amount < s.total_amount)
            ) as oldest_credit_date,
            (
                SELECT COUNT(*)
                FROM sales s
                WHERE s.client_id = c.id AND (s.status = 'credit' OR s.paid_amount < s.total_amount)
            ) as unpaid_sales_count,
            (
                SELECT MAX(dr.created_at)
                FROM debt_repayments dr
                WHERE dr.client_id = c.id
            ) as last_repayment_date
        FROM clients c
        WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (filters?.search && filters.search.trim()) {
        const s = `%${filters.search.trim()}%`;
        query += ` AND (c.name LIKE $${params.length + 1} OR c.phone LIKE $${params.length + 1})`;
        params.push(s);
    }

    query += ` ORDER BY c.debt_balance DESC, c.name ASC`;

    const rawClients = await db.select<any[]>(query, params);
    const nowMs = Date.now();

    const formatted: CreditClientSummary[] = rawClients.map(c => {
        const debt = Number(c.debt_balance) || 0;
        let daysSinceOldest = 0;
        let overdueStatus: 'normal' | 'overdue' | 'critical' | 'settled' = 'settled';

        if (debt > 0) {
            if (c.oldest_credit_date) {
                const oldestDate = new Date(c.oldest_credit_date).getTime();
                daysSinceOldest = Math.max(0, Math.floor((nowMs - oldestDate) / (1000 * 60 * 60 * 24)));
            } else {
                daysSinceOldest = 1;
            }

            if (daysSinceOldest > 60) {
                overdueStatus = 'critical';
            } else if (daysSinceOldest > 30) {
                overdueStatus = 'overdue';
            } else {
                overdueStatus = 'normal';
            }
        }

        return {
            id: c.id,
            uuid: c.uuid,
            name: c.name,
            phone: c.phone,
            email: c.email,
            address: c.address,
            debt_balance: debt,
            max_credit_limit: Number(c.max_credit_limit) || 50000,
            oldest_credit_date: c.oldest_credit_date,
            days_since_oldest_debt: daysSinceOldest,
            overdue_status: overdueStatus,
            unpaid_sales_count: Number(c.unpaid_sales_count) || 0,
            last_repayment_date: c.last_repayment_date
        };
    });

    // Filtrage après calcul des statuts
    if (filters?.statusFilter) {
        if (filters.statusFilter === 'overdue') {
            return formatted.filter(c => c.debt_balance > 0 && (c.overdue_status === 'overdue' || c.overdue_status === 'critical'));
        } else if (filters.statusFilter === 'critical') {
            return formatted.filter(c => c.debt_balance > 0 && c.overdue_status === 'critical');
        } else if (filters.statusFilter === 'settled') {
            return formatted.filter(c => c.debt_balance === 0);
        } else {
            // 'all' : afficher les personnes avec dettes ou historique de remboursement
            return formatted.filter(c => c.debt_balance > 0 || c.last_repayment_date !== null);
        }
    }

    return formatted;
}

/**
 * Calcule les indicateurs clés (KPIs) du portefeuille crédit.
 */
export async function getCreditKpis(): Promise<CreditKpis> {
    const db = await getDatabase();

    // 1. Total dette et nombre de débiteurs
    const debtRes = await db.select<{ total: number; count: number }[]>(`
        SELECT 
            COALESCE(SUM(debt_balance), 0) as total,
            COUNT(*) as count
        FROM clients
        WHERE debt_balance > 0
    `);

    const totalDebtAmount = debtRes[0]?.total || 0;
    const debtorCount = debtRes[0]?.count || 0;

    // 2. Calcul des créances en souffrance (>30j et >60j)
    const allDebtors = await getCreditClients({ statusFilter: 'all' });
    let overdueDebtAmount = 0;
    let criticalDebtAmount = 0;

    for (const d of allDebtors) {
        if (d.overdue_status === 'critical') {
            criticalDebtAmount += d.debt_balance;
            overdueDebtAmount += d.debt_balance;
        } else if (d.overdue_status === 'overdue') {
            overdueDebtAmount += d.debt_balance;
        }
    }

    // 3. Total remboursé ce mois-ci
    const repaidRes = await db.select<{ total: number }[]>(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM debt_repayments
        WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
    `);
    const totalRepaidThisMonth = repaidRes[0]?.total || 0;

    return {
        totalDebtAmount,
        debtorCount,
        overdueDebtAmount,
        criticalDebtAmount,
        totalRepaidThisMonth
    };
}

/**
 * Récupère le relevé de compte complet d'un client (historique des crédits + versements).
 */
export async function getClientCreditLedger(clientId: number): Promise<ClientCreditLedger | null> {
    const db = await getDatabase();
    const safeId = Math.floor(Number(clientId));

    const clientRes = await db.select<any[]>(`
        SELECT id, name, phone, address, debt_balance, max_credit_limit
        FROM clients
        WHERE id = $1
        LIMIT 1
    `, [safeId]);

    if (clientRes.length === 0) return null;
    const client = clientRes[0];

    // Ventes associées au client
    const salesRes = await db.select<any[]>(`
        SELECT 
            s.id as sale_id,
            s.receipt_number,
            s.created_at,
            s.credit_due_date,
            s.total_amount,
            s.paid_amount,
            (s.total_amount - s.paid_amount) as remaining_amount,
            s.status,
            COALESCE(u.name, 'Vendeur') as cashier_name,
            (
                SELECT GROUP_CONCAT(p.name || ' (x' || sl.quantity || ')', ', ')
                FROM sale_lines sl
                JOIN products p ON p.id = sl.product_id
                WHERE sl.sale_id = s.id
            ) as items_summary
        FROM sales s
        LEFT JOIN users u ON u.id = s.user_id
        WHERE s.client_id = $1 AND (s.status = 'credit' OR s.paid_amount < s.total_amount)
        ORDER BY s.id DESC
    `, [safeId]);

    // Versements effectués par le client
    const repaymentsRes = await db.select<any[]>(`
        SELECT 
            dr.id,
            dr.uuid,
            dr.receipt_number,
            dr.amount,
            dr.payment_method,
            dr.mobile_money_provider,
            dr.mobile_money_ref,
            COALESCE(u.name, 'Caissier') as cashier_name,
            dr.notes,
            dr.created_at
        FROM debt_repayments dr
        LEFT JOIN users u ON u.id = dr.user_id
        WHERE dr.client_id = $1
        ORDER BY dr.id DESC
    `, [safeId]);

    return {
        client: {
            id: client.id,
            name: client.name,
            phone: client.phone,
            address: client.address,
            debt_balance: client.debt_balance || 0,
            max_credit_limit: client.max_credit_limit || 50000
        },
        creditSales: salesRes.map(s => ({
            ...s,
            remaining_amount: Math.max(0, s.remaining_amount)
        })),
        repayments: repaymentsRes
    };
}

/**
 * Enregistre un remboursement ou acompte de dette client.
 */
export async function recordDebtRepayment(input: RecordRepaymentInput): Promise<RepaymentReceiptData> {
    if (input.amount <= 0) {
        throw new Error("Le montant du versement doit être strictement supérieur à 0 FCFA.");
    }

    const db = await getDatabase();
    const safeClientId = Math.floor(Number(input.clientId));

    // 1. Vérifier le client et son solde actuel
    const clientRes = await db.select<{ id: number; name: string; phone: string | null; debt_balance: number }[]>(`
        SELECT id, name, phone, debt_balance
        FROM clients
        WHERE id = $1
        LIMIT 1
    `, [safeClientId]);

    if (clientRes.length === 0) {
        throw new Error("Client introuvable.");
    }

    const client = clientRes[0];
    const previousDebt = client.debt_balance || 0;

    if (previousDebt <= 0) {
        throw new Error(`Le patient ${client.name} n'a aucune dette en cours.`);
    }

    const paymentAmount = Math.min(input.amount, previousDebt);
    const remainingDebt = Math.max(0, previousDebt - paymentAmount);

    // 2. Générer le numéro de reçu officiel (RC-YYYYMMDD-XXXX-RAND)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const countRes = await db.select<{ count: number }[]>(`
        SELECT COUNT(*) as count FROM debt_repayments WHERE date(created_at) = date('now')
    `);
    const seq = (countRes[0]?.count || 0) + 1;
    const rand = Math.floor(Math.random() * 900 + 100);
    const receiptNumber = `RC-${dateStr}-${seq.toString().padStart(4, "0")}-${rand}`;
    const repaymentUuid = crypto.randomUUID();

    // 3. Décrémenter le solde de la table clients
    await db.execute(`
        UPDATE clients 
        SET debt_balance = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
    `, [remainingDebt, safeClientId]);

    // 4. Enregistrer dans la table debt_repayments
    await db.execute(`
        INSERT INTO debt_repayments (
            uuid, receipt_number, client_id, cash_session_id, user_id,
            amount, payment_method, mobile_money_provider, mobile_money_ref,
            notes, created_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP
        )
    `, [
        repaymentUuid,
        receiptNumber,
        safeClientId,
        input.cashSessionId || null,
        input.userId,
        paymentAmount,
        input.paymentMethod,
        input.mobileMoneyProvider || null,
        input.mobileMoneyRef || null,
        input.notes || null
    ]);

    // 5. Insérer dans la table payments pour intégration dans la clôture de caisse active
    const paymentMethodForRegister = input.paymentMethod === 'card' ? 'cash' : input.paymentMethod;
    await db.execute(`
        INSERT INTO payments (
            uuid, client_id, amount, method, mobile_money_provider,
            mobile_money_ref, notes, user_id, cash_session_id, created_at
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP
        )
    `, [
        crypto.randomUUID(),
        safeClientId,
        paymentAmount,
        paymentMethodForRegister,
        input.mobileMoneyProvider || null,
        input.mobileMoneyRef || null,
        `Remboursement dette (${receiptNumber})`,
        input.userId,
        input.cashSessionId || null
    ]);

    // 6. Imputation automatique sur les factures de vente à crédit impayées
    let toAllocate = paymentAmount;
    const unpaidSales = await db.select<{ id: number; total_amount: number; paid_amount: number }[]>(`
        SELECT id, total_amount, paid_amount
        FROM sales
        WHERE client_id = $1 AND (status = 'credit' OR paid_amount < total_amount)
        ORDER BY created_at ASC, id ASC
    `, [safeClientId]);

    for (const sale of unpaidSales) {
        if (toAllocate <= 0) break;

        const unpaidOnSale = sale.total_amount - sale.paid_amount;
        const alloc = Math.min(toAllocate, unpaidOnSale);
        const newPaidAmount = sale.paid_amount + alloc;
        const newStatus = newPaidAmount >= sale.total_amount ? 'completed' : 'credit';

        await db.execute(`
            UPDATE sales 
            SET paid_amount = $1, status = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
        `, [newPaidAmount, newStatus, sale.id]);

        toAllocate -= alloc;
    }

    // 7. Récupérer le nom du caissier
    const userRes = await db.select<{ name: string }[]>(`
        SELECT name FROM users WHERE id = $1 LIMIT 1
    `, [input.userId]);
    const cashierName = userRes[0]?.name || "Caissier";

    return {
        receiptNumber,
        clientName: client.name,
        clientPhone: client.phone,
        cashierName,
        amountPaid: paymentAmount,
        previousDebt,
        remainingDebt,
        paymentMethod: input.paymentMethod,
        mobileMoneyProvider: input.mobileMoneyProvider,
        mobileMoneyRef: input.mobileMoneyRef,
        notes: input.notes,
        createdAt: now.toISOString()
    };
}

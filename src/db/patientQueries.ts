// src/db/patientQueries.ts
import { getDatabase } from "./database";

export interface Patient {
    id: number;
    uuid: string;
    name: string;
    phone: string | null;
    email: string | null;
    birth_date: string | null;
    gender: 'M' | 'F' | 'other' | null;
    address: string | null;
    allergies: string | null;
    pathologies: string | null;
    debt_balance: number;
    max_credit_limit: number;
    created_at: string;
    updated_at: string;
}

export interface NewPatientInput {
    name: string;
    phone?: string | null;
    email?: string | null;
    birth_date?: string | null;
    gender?: 'M' | 'F' | 'other' | null;
    address?: string | null;
    allergies?: string | null;
    pathologies?: string | null;
    max_credit_limit?: number;
}

export interface PatientPurchaseLine {
    product_id: number;
    product_name: string;
    dci: string | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
    lot_number: string;
    expiry_date: string;
}

export interface PatientPurchase {
    id: number;
    uuid: string;
    receipt_number: string;
    created_at: string;
    total_amount: number;
    paid_amount: number;
    change_amount: number;
    status: string;
    payment_method: string | null;
    lines: PatientPurchaseLine[];
}

export interface PatientStats {
    totalPatients: number;
    patientsWithAllergies: number;
    patientsWithPathologies: number;
    patientsWithDebt: number;
    totalDebtAmount: number;
}

/**
 * Récupère tous les patients avec recherche textuelle optionnelle.
 */
export async function getAllPatients(search?: string): Promise<Patient[]> {
    const db = await getDatabase();
    const cleanSearch = search?.trim();

    if (!cleanSearch) {
        return await db.select<Patient[]>(`
            SELECT * FROM clients 
            ORDER BY name ASC
        `);
    }

    const pattern = `%${cleanSearch}%`;
    return await db.select<Patient[]>(`
        SELECT * FROM clients 
        WHERE name LIKE $1 
           OR phone LIKE $2 
           OR allergies LIKE $3 
           OR pathologies LIKE $4
        ORDER BY name ASC
    `, [pattern, pattern, pattern, pattern]);
}

/**
 * Récupère un patient par son ID.
 */
export async function getPatientById(id: number): Promise<Patient | null> {
    const db = await getDatabase();
    const rows = await db.select<Patient[]>(`
        SELECT * FROM clients WHERE id = $1 LIMIT 1
    `, [id]);
    return rows.length > 0 ? rows[0] : null;
}

/**
 * Crée un nouveau patient dans l'annuaire.
 */
export async function createPatient(input: NewPatientInput): Promise<number> {
    if (!input.name.trim()) {
        throw new Error("Le nom complet du patient est obligatoire.");
    }

    const db = await getDatabase();
    const uuid = crypto.randomUUID();

    const res = await db.execute(`
        INSERT INTO clients (
            uuid, name, phone, email, birth_date, gender, address,
            allergies, pathologies, max_credit_limit
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
    `, [
        uuid,
        input.name.trim(),
        input.phone?.trim() || null,
        input.email?.trim() || null,
        input.birth_date || null,
        input.gender || null,
        input.address?.trim() || null,
        input.allergies?.trim() || null,
        input.pathologies?.trim() || null,
        input.max_credit_limit !== undefined ? Math.max(0, input.max_credit_limit) : 50000
    ]);

    return res.lastInsertId ?? 0;
}

/**
 * Met à jour les informations d'un patient.
 */
export async function updatePatient(id: number, input: Partial<NewPatientInput>): Promise<void> {
    const db = await getDatabase();
    
    await db.execute(`
        UPDATE clients
        SET 
            name = COALESCE($1, name),
            phone = COALESCE($2, phone),
            email = COALESCE($3, email),
            birth_date = COALESCE($4, birth_date),
            gender = COALESCE($5, gender),
            address = COALESCE($6, address),
            allergies = COALESCE($7, allergies),
            pathologies = COALESCE($8, pathologies),
            max_credit_limit = COALESCE($9, max_credit_limit),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
    `, [
        input.name?.trim() ?? null,
        input.phone?.trim() ?? null,
        input.email?.trim() ?? null,
        input.birth_date ?? null,
        input.gender ?? null,
        input.address?.trim() ?? null,
        input.allergies?.trim() ?? null,
        input.pathologies?.trim() ?? null,
        input.max_credit_limit !== undefined ? Math.max(0, input.max_credit_limit) : null,
        id
    ]);
}

/**
 * Supprime un patient s'il ne possède aucun historique d'achats.
 */
export async function deletePatient(id: number): Promise<void> {
    const db = await getDatabase();

    // Vérifier l'existence de ventes associées
    const salesCount = await db.select<{ count: number }[]>(`
        SELECT COUNT(*) as count FROM sales WHERE client_id = $1
    `, [id]);

    if (salesCount[0]?.count > 0) {
        throw new Error(
            `Ce patient possède ${salesCount[0].count} vente(s) enregistrée(s). Pour préserver l'historique légal, la suppression est bloquée.`
        );
    }

    await db.execute("DELETE FROM clients WHERE id = $1", [id]);
}

/**
 * Récupère l'historique complet des achats et ordonnances d'un patient.
 */
export async function getPatientPurchases(clientId: number): Promise<PatientPurchase[]> {
    const db = await getDatabase();

    // 1. Récupérer les ventes du client
    const sales = await db.select<{
        id: number;
        uuid: string;
        receipt_number: string;
        created_at: string;
        total_amount: number;
        paid_amount: number;
        change_amount: number;
        status: string;
        payment_method: string | null;
    }[]>(`
        SELECT 
            s.id,
            s.uuid,
            s.receipt_number,
            s.created_at,
            s.total_amount,
            s.paid_amount,
            s.change_amount,
            s.status,
            p.method as payment_method
        FROM sales s
        LEFT JOIN payments p ON p.sale_id = s.id
        WHERE s.client_id = $1
        ORDER BY s.created_at DESC
    `, [clientId]);

    if (sales.length === 0) return [];

    const saleIds = sales.map(s => s.id);
    const placeholders = saleIds.map((_, i) => `$${i + 1}`).join(",");

    // 2. Récupérer toutes les lignes de vente associées
    const lines = await db.select<{
        sale_id: number;
        product_id: number;
        product_name: string;
        dci: string | null;
        quantity: number;
        unit_price: number;
        subtotal: number;
        lot_number: string;
        expiry_date: string;
    }[]>(`
        SELECT 
            sl.sale_id,
            sl.product_id,
            p.name as product_name,
            p.dci,
            sl.quantity,
            sl.unit_price,
            sl.subtotal,
            COALESCE(l.lot_number, 'N/A') as lot_number,
            COALESCE(l.expiry_date, 'N/A') as expiry_date
        FROM sale_lines sl
        JOIN products p ON sl.product_id = p.id
        LEFT JOIN lots l ON sl.lot_id = l.id
        WHERE sl.sale_id IN (${placeholders})
        ORDER BY sl.id ASC
    `, saleIds);

    // 3. Regrouper les lignes par vente
    const linesBySale = new Map<number, PatientPurchaseLine[]>();
    for (const line of lines) {
        if (!linesBySale.has(line.sale_id)) {
            linesBySale.set(line.sale_id, []);
        }
        linesBySale.get(line.sale_id)!.push({
            product_id: line.product_id,
            product_name: line.product_name,
            dci: line.dci,
            quantity: line.quantity,
            unit_price: line.unit_price,
            subtotal: line.subtotal,
            lot_number: line.lot_number,
            expiry_date: line.expiry_date
        });
    }

    return sales.map(s => ({
        id: s.id,
        uuid: s.uuid,
        receipt_number: s.receipt_number,
        created_at: s.created_at,
        total_amount: s.total_amount,
        paid_amount: s.paid_amount,
        change_amount: s.change_amount,
        status: s.status,
        payment_method: s.payment_method,
        lines: linesBySale.get(s.id) || []
    }));
}

/**
 * Calcule les statistiques globales du registre des patients.
 */
export async function getPatientStats(): Promise<PatientStats> {
    const db = await getDatabase();

    const patients = await db.select<Patient[]>("SELECT * FROM clients");

    let patientsWithAllergies = 0;
    let patientsWithPathologies = 0;
    let patientsWithDebt = 0;
    let totalDebtAmount = 0;

    for (const p of patients) {
        if (p.allergies && p.allergies.trim().length > 0) {
            patientsWithAllergies++;
        }
        if (p.pathologies && p.pathologies.trim().length > 0) {
            patientsWithPathologies++;
        }
        if (p.debt_balance > 0) {
            patientsWithDebt++;
            totalDebtAmount += p.debt_balance;
        }
    }

    return {
        totalPatients: patients.length,
        patientsWithAllergies,
        patientsWithPathologies,
        patientsWithDebt,
        totalDebtAmount
    };
}

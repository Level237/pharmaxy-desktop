// src/db/supplierQueries.ts
import { getDatabase } from "./database";

export interface Supplier {
    id: number;
    uuid: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    contact_person: string | null;
    deliveries_count?: number;
    created_at: string;
    updated_at: string;
}

export interface NewSupplierInput {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    contact_person?: string;
}

/**
 * Récupère tous les fournisseurs avec leur nombre de livraisons
 */
export async function getAllSuppliers(): Promise<Supplier[]> {
    const db = await getDatabase();
    return await db.select<Supplier[]>(`
        SELECT 
            s.*,
            COUNT(d.id) as deliveries_count
        FROM suppliers s
        LEFT JOIN deliveries d ON d.supplier_id = s.id
        GROUP BY s.id
        ORDER BY s.name ASC
    `);
}

/**
 * Récupère un fournisseur par son ID
 */
export async function getSupplierById(id: number): Promise<Supplier | null> {
    const db = await getDatabase();
    const result = await db.select<Supplier[]>(
        "SELECT * FROM suppliers WHERE id = $1 LIMIT 1",
        [id]
    );
    return result.length > 0 ? result[0] : null;
}

/**
 * Crée un nouveau fournisseur
 */
export async function createSupplier(input: NewSupplierInput): Promise<number> {
    const db = await getDatabase();
    const uuid = crypto.randomUUID();

    const result = await db.execute(`
        INSERT INTO suppliers (uuid, name, phone, email, address, contact_person)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, [
        uuid,
        input.name.trim(),
        input.phone?.trim() || null,
        input.email?.trim() || null,
        input.address?.trim() || null,
        input.contact_person?.trim() || null
    ]);

    return result.lastInsertId ?? 0;
}

/**
 * Met à jour un fournisseur existant
 */
export async function updateSupplier(id: number, input: Partial<NewSupplierInput>): Promise<void> {
    const db = await getDatabase();
    const fields: string[] = [];
    const params: (string | number | null)[] = [];

    if (input.name !== undefined) {
        params.push(input.name.trim());
        fields.push(`name = $${params.length}`);
    }
    if (input.phone !== undefined) {
        params.push(input.phone ? input.phone.trim() : null);
        fields.push(`phone = $${params.length}`);
    }
    if (input.email !== undefined) {
        params.push(input.email ? input.email.trim() : null);
        fields.push(`email = $${params.length}`);
    }
    if (input.address !== undefined) {
        params.push(input.address ? input.address.trim() : null);
        fields.push(`address = $${params.length}`);
    }
    if (input.contact_person !== undefined) {
        params.push(input.contact_person ? input.contact_person.trim() : null);
        fields.push(`contact_person = $${params.length}`);
    }

    if (fields.length === 0) return;

    fields.push("updated_at = CURRENT_TIMESTAMP");
    params.push(id);

    await db.execute(`
        UPDATE suppliers 
        SET ${fields.join(", ")}
        WHERE id = $${params.length}
    `, params);
}

/**
 * Supprime un fournisseur s'il n'a pas de livraisons bloquantes
 */
export async function deleteSupplier(id: number): Promise<void> {
    const db = await getDatabase();
    await db.execute("DELETE FROM suppliers WHERE id = $1", [id]);
}

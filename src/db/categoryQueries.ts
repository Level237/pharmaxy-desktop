// src/db/categoryQueries.ts
import { getDatabase } from "./database";

export interface Category {
    id: number;
    uuid: string;
    name: string;
    description: string | null;
    products_count?: number;
    created_at: string;
    updated_at: string;
}

/**
 * Récupère toutes les catégories de médicaments avec le nombre de produits associés
 */
export async function getAllCategories(): Promise<Category[]> {
    const db = await getDatabase();
    return await db.select<Category[]>(`
        SELECT 
            c.*,
            COUNT(p.id) as products_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
        GROUP BY c.id
        ORDER BY c.name ASC
    `);
}

/**
 * Crée une nouvelle catégorie
 */
export async function createCategory(name: string, description?: string): Promise<number> {
    const db = await getDatabase();
    const uuid = crypto.randomUUID();
    const result = await db.execute(`
        INSERT INTO categories (uuid, name, description)
        VALUES ($1, $2, $3)
    `, [uuid, name.trim(), description?.trim() || null]);

    return result.lastInsertId ?? 0;
}

/**
 * Met à jour une catégorie
 */
export async function updateCategory(id: number, name: string, description?: string): Promise<void> {
    const db = await getDatabase();
    await db.execute(`
        UPDATE categories
        SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
    `, [name.trim(), description?.trim() || null, id]);
}

/**
 * Supprime une catégorie (délie les produits associés sans les supprimer)
 */
export async function deleteCategory(id: number): Promise<void> {
    const db = await getDatabase();
    // 1. Délier les produits
    await db.execute("UPDATE products SET category_id = NULL WHERE category_id = $1", [id]);
    // 2. Supprimer la catégorie
    await db.execute("DELETE FROM categories WHERE id = $1", [id]);
}

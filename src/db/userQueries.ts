import { getDatabase } from "./database";

export interface User {
    id: number;
    uuid: string;
    name: string;
    pin_code: string;
    role: 'admin' | 'cashier';
    sync_status: 'pending' | 'synced';
    created_at: string;
    updated_at: string;
}

// Enregistrer ou mettre à jour un utilisateur localement (sécurisé)
export const saveUserLocally = async (data: {
    uuid: string;
    name: string;
    pin_code: string;
    role: 'admin' | 'cashier';
}) => {
    const db = await getDatabase();
    await db.execute(`
        INSERT OR REPLACE INTO users (uuid, name, pin_code, role, sync_status)
        VALUES ($1, $2, $3, $4, 'pending')
    `, [data.uuid, data.name, data.pin_code, data.role]);
};

// Vérifier si un code PIN correspond à un utilisateur
export const verifyUserPin = async (pinCode: string): Promise<User | null> => {
    const db = await getDatabase();
    const result = await db.select<User[]>(
        "SELECT * FROM users WHERE pin_code = $1 LIMIT 1",
        [pinCode]
    );
    return result.length > 0 ? result[0] : null;
};

// Récupérer la liste de tous les utilisateurs
export const getAllUsers = async (): Promise<User[]> => {
    const db = await getDatabase();
    return await db.select<User[]>("SELECT * FROM users ORDER BY name ASC");
};

// Vérifier s'il y a au moins un administrateur dans la base
export const hasAdminUser = async (): Promise<boolean> => {
    const db = await getDatabase();
    const result = await db.select<{ count: number }[]>(
        "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
    );
    return result.length > 0 && result[0].count > 0;
};

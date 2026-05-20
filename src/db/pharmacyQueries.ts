import { getDatabase } from "./database";

// 1. Création de la table (déplacée à l'initialisation centrale, conservée pour rétro-compatibilité)
export const createPharmacyTable = async () => {
    const db = await getDatabase();
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
      is_registered INTEGER DEFAULT 0, -- 0 = false, 1 = true (Spécifique à SQLite)
      sync_status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// 2. Vérifier si la pharmacie est déjà enregistrée
export const checkIfRegistered = async (): Promise<boolean> => {
    try {
        const db = await getDatabase();
        const result = await db.select<{ is_registered: number }[]>(
            "SELECT is_registered FROM pharmacies LIMIT 1"
        );
        return result.length > 0 && result[0].is_registered === 1;
    } catch (error) {
        console.error("Erreur lors de la vérification de l'enregistrement de la pharmacie:", error);
        return false;
    }
};

// 3. Récupérer les infos de la pharmacie
export const getPharmacyInfo = async () => {
    const db = await getDatabase();
    return await db.select<any[]>("SELECT * FROM pharmacies LIMIT 1");
};

// 4. Enregistrer la pharmacie (avec liaison sécurisée de paramètres)
export const savePharmacyLocally = async (data: {
    uuid: string;
    name: string;
    address: string;
    phone: string;
    owner_name: string;
    license_number: string;
    api_token: string;
}) => {
    const db = await getDatabase();
    await db.execute(`
        INSERT OR REPLACE INTO pharmacies (uuid, name, address, phone, owner_name, license_number, api_token, is_registered, sync_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 1, 'synced')
    `, [
        data.uuid,
        data.name,
        data.address,
        data.phone,
        data.owner_name,
        data.license_number,
        data.api_token
    ]);
};

// 5. Mettre à jour le token
export const updatePharmacyToken = async (token: string) => {
    const db = await getDatabase();
    await db.execute(`
        UPDATE pharmacies SET api_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1
    `, [token]);
};
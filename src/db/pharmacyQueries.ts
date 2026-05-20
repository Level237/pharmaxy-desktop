import { getDatabase } from "./database";

// 1. Création de la table COMPLÈTE
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
    const db = await getDatabase();
    const result = await db.select<{ is_registered: number }[]>(
        "SELECT is_registered FROM pharmacies LIMIT 1"
    );
    // On vérifie que le tableau n'est pas vide ET que la valeur est bien 1 (true)
    return result.length > 0 && result[0].is_registered === 1;
};

// 3. Récupérer les infos de la pharmacie (pour afficher le nom sur l'écran PIN par ex)
export const getPharmacyInfo = async () => {
    const db = await getDatabase();
    return await db.select("* FROM pharmacies LIMIT 1");
};

// 4. Enregistrer la pharmacie (Appelé quand l'utilisateur clique sur "Enregistrer")
// Note : on fait un INSERT OR REPLACE au cas où l'utilisateur refait l'enregistrement
export const savePharmacyLocally = async (data: {
    uuid: string;
    name: string;
    address: string;
    phone: string;
    owner_name: string;
    license_number: string;
    api_token: string; // Ce token viendra de Laravel plus tard
}) => {
    const db = await getDatabase();
    await db.execute(`
    INSERT OR REPLACE INTO pharmacies (uuid, name, address, phone, owner_name, license_number, api_token, is_registered, sync_status)
    VALUES ('${data.uuid}', '${data.name}', '${data.address}', '${data.phone}', '${data.owner_name}', '${data.license_number}', '${data.api_token}', 1, 'synced')
  `);
};

// 5. Mettre à jour le token (Utile si Laravel demande de le rafraîchir un jour)
export const updatePharmacyToken = async (token: string) => {
    const db = await getDatabase();
    await db.execute(`
    UPDATE pharmacies SET api_token = '${token}', updated_at = CURRENT_TIMESTAMP WHERE id = 1
  `);
};
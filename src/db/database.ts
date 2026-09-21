import Database from "@tauri-apps/plugin-sql";

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
    if (!dbInstance) {
        dbInstance = await Database.load("sqlite:pharmaxy.db");
        // Configuration indispensable SQLite pour environnement concurrent (Tauri v2 / IPC)
        await dbInstance.execute("PRAGMA journal_mode = WAL;");
        await dbInstance.execute("PRAGMA busy_timeout = 5000;");
        await dbInstance.execute("PRAGMA synchronous = NORMAL;");
        await dbInstance.execute("PRAGMA foreign_keys = ON;");
    }
    return dbInstance;
}
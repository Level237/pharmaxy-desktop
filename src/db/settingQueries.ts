import { getDatabase } from "./database";

export const getSetting = async (key: string): Promise<string | null> => {
    const db = await getDatabase();
    const result = await db.select<{ value: string }[]>("SELECT value FROM settings WHERE key = $1", [key]);
    return result.length > 0 ? result[0].value : null;
};

export const updateSetting = async (key: string, value: string) => {
    const db = await getDatabase();
    await db.execute(
        "INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP",
        [key, value]
    );
};

export const getTheme = async (): Promise<"light"> => {
    return "light";
};

export const setTheme = async (_theme: "light" | "dark") => {
    // Theme is now forced to light, no need to save to DB
};

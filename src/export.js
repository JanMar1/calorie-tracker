export async function exportJson(storage) {
    const entries = await storage.all();
    return JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), entries }, null, 2);
}
export async function exportJson(storage) {
    const entries = await storage.all();
    return JSON.stringify(
        { schemaVersion: 1, exportedAt: new Date().toISOString(), entries },
        null,
        2
    );
}

export async function importJson(storage, text) {
    const data = JSON.parse(text);
    if (data.schemaVersion !== 1 || !Array.isArray(data.entries)) {
        throw new Error("Unknown file format");
    }
    const entries = data.entries
        .filter((e) => !Number.isNaN(Date.parse(e.timestamp)))
        .map((e) => ({
            id: e.id,
            timestamp: e.timestamp,
            kcal: Number(e.kcal) || 0,
            protein: Number(e.protein) || 0,
        }));
    await storage.replaceAll(entries);
    return entries.length;
}
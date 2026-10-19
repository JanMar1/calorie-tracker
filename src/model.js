export function createEntry({ kcal = 0, protein = 0, timestamp = new Date() }) {
    return {
        id: crypto.randomUUID(),
        timestamp: timestamp.toISOString(),
        kcal: Number(kcal),
        protein: Number(protein),
    };
}
export function createEntry({ kcal = 0, protein = 0, note = "", timestamp = new Date() }) {
    return {
        timestamp: timestamp.toISOString(),
        kcal: Number(kcal),
        protein: Number(protein),
        note: typeof note === "string" ? note.trim() : "",
    };
}
import Dexie from "dexie";

export class IndexedDbStorage {
    constructor() {
        this.db = new Dexie("calorie-tracker-v2");
        this.db.version(1).stores({ entries: "++id, timestamp" });
    }
    add(entry)            { return this.db.entries.add(entry); }
    remove(id)            { return this.db.entries.delete(id); }
    between(fromIso, toIso) {
        return this.db.entries.where("timestamp").between(fromIso, toIso).toArray();
    }
    all()                 { return this.db.entries.toArray(); }
    replaceAll(entries)   { return this.db.transaction("rw", this.db.entries, async () => {
        await this.db.entries.clear();
        await this.db.entries.bulkAdd(entries);
    }); }
}
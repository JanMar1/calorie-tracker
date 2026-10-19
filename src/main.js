import { createEntry } from "./model.js";
import { IndexedDbStorage } from "./storage/indexeddb.js";

const storage = new IndexedDbStorage();

const $ = (id) => document.getElementById(id);

function todayRange() {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);
    return [start.toISOString(), end.toISOString()];
}

async function render() {
    const entries = await storage.between(...todayRange());
    entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    $("total-kcal").textContent = entries.reduce((s, e) => s + e.kcal, 0);
    $("total-protein").textContent = entries.reduce((s, e) => s + e.protein, 0);

    const list = $("entries");
    list.replaceChildren(...entries.map((e) => {
        const li = document.createElement("li");
        const time = new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        li.textContent = `${time}  ·  ${e.kcal} kcal  ·  ${e.protein} g`;
        const del = document.createElement("button");
        del.textContent = "✕";
        del.onclick = async () => { await storage.remove(e.id); render(); };
        li.append(del);
        return li;
    }));
}

$("add-btn").onclick = async () => {
    const kcal = $("kcal").value, protein = $("protein").value;
    if (!kcal && !protein) return;
    await storage.add(createEntry({ kcal, protein }));
    $("kcal").value = $("protein").value = "";
    render();
};

render();
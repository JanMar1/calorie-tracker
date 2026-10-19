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

const DEFAULT_KCAL = 550;
const DEFAULT_PROTEIN = 20;

$("kcal").addEventListener("input", () => {
    $("kcal-value").textContent = $("kcal").value;
});

$("protein").addEventListener("input", () => {
    $("protein-value").textContent = $("protein").value;
});


$("add-btn").onclick = async () => {
    const kcal = Number($("kcal").value);
    const protein = Number($("protein").value);
    if (kcal === 0 || protein === 0) return;

    await storage.add(createEntry({ kcal, protein }));

    $("kcal").value = DEFAULT_KCAL;
    $("protein").value = DEFAULT_PROTEIN;
    $("kcal-value").textContent = DEFAULT_KCAL;
    $("protein-value").textContent = DEFAULT_PROTEIN;
    render();
};
render();
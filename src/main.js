import { createEntry } from "./model.js";
import { IndexedDbStorage } from "./storage/indexeddb.js";
import { exportJson, importJson } from "./export.js";

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
        li.textContent = `${time}  ·  ${e.kcal} kcal  ·  ${e.protein} g` + (e.note ? `  ·  ${e.note}` : "");
        const del = document.createElement("button");
        del.textContent = "✕";
        del.onclick = async () => { await storage.remove(e.id); render(); };
        li.append(del);
        return li;
    }));
}

const DEFAULT_KCAL = 550;
const DEFAULT_PROTEIN = 0;

$("kcal").addEventListener("input", () => {
    $("kcal-value").textContent = $("kcal").value;
});

$("protein").addEventListener("input", () => {
    $("protein-value").textContent = $("protein").value;
});


$("add-btn").onclick = async () => {
    const kcal = Number($("kcal").value);
    const protein = Number($("protein").value);
    const note = $("note").value;

    if (kcal === null || protein === null) return;

    await storage.add(createEntry({ kcal, protein, note }));

    $("note").value = "";
    $("kcal").value = DEFAULT_KCAL;
    $("protein").value = DEFAULT_PROTEIN;
    $("kcal-value").textContent = DEFAULT_KCAL;
    $("protein-value").textContent = DEFAULT_PROTEIN;
    render();
};

// --- menu ---
const toggle = $("menu-toggle");
function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    $("drawer").inert = !open;
    toggle.setAttribute("aria-expanded", String(open));
}
toggle.onclick = () => setMenu(!document.body.classList.contains("menu-open"));
$("backdrop").onclick = () => setMenu(false);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// --- menu actions ---
$("export-btn").onclick = async () => {
    setMenu(false);
    const json = await exportJson(storage);
    const name = `calorie-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    const file = new File([json], name, { type: "application/json" });

    // phones/tablets: share sheet (Save to Files, AirDrop, ...)
    const isTouch = matchMedia("(pointer: coarse)").matches;
    if (isTouch && navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({ files: [file] });
            return;
        } catch (e) {
            if (e.name === "AbortError") return;   // user closed the sheet
            // other errors: fall through to the download
        }
    }

    // desktop: normal download
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

$("import-btn").onclick = () => $("import-file").click();
$("import-file").onchange = async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    setMenu(false);
    try {
        if (!confirm("This replaces all current entries. Continue?")) return;
        alert(`Imported ${await importJson(storage, await file.text())} entries`);
        render();
    } catch (e) {
        alert("Import failed: " + e.message);
    } finally {
        ev.target.value = "";
    }
};
render();
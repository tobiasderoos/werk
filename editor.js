import { Editor } from "https://cdn.jsdelivr.net/npm/@tiptap/core@2.10.4/+esm";
import StarterKit from "https://cdn.jsdelivr.net/npm/@tiptap/starter-kit@2.10.4/+esm";
import Underline from "https://cdn.jsdelivr.net/npm/@tiptap/extension-underline@2.10.4/+esm";
import { generateHTML } from "https://cdn.jsdelivr.net/npm/@tiptap/html@2.10.4/+esm";

// ---------- Extensions (single source of truth) ----------
const extensions = [
    StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false
    }),
    Underline,
];

// ---------- Demo data ----------
const pad2 = (n) => String(n).padStart(2, "0");
const pad3 = (n) => String(n).padStart(3, "0");

const INITIAL_ROWS = [
  {
    begin: "00:00:02.710",
    end: "00:00:05.230",
    speaker: "Spreker 2",
    begin_ms: 2710,
    end_ms: 5230,
    doc: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Hé heb je zin in poffertjes?" }] }] },
    html: null,
  },
  {
    begin: "00:00:05.590",
    end: "00:00:09.110",
    speaker: "Spreker 3",
    begin_ms: 5590,
    end_ms: 9110,
    doc: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Ja lekker ik lust wel poffertjes, waar wil je heen?" }] }] },
    html: null,
  },
  {
    begin: "00:00:09.990",
    end: "00:00:14.350",
    speaker: "Spreker 2",
    begin_ms: 9990,
    end_ms: 14350,
    doc: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Er is een nieuwe kraam op de markt. Ik heb gehoord dat ze daar lekkere poffertjes hebben." }] }] },
    html: null,
  },
  {
    begin: "00:00:14.750",
    end: "00:00:18.550",
    speaker: "Spreker 3",
    begin_ms: 14750,
    end_ms: 18550,
    doc: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Dat klinkt goed, Ik ga mee. Hoeveel poffertjes wil je?" }] }] },
    html: null,
  },
  {
    begin: "00:00:19.630",
    end: "00:00:21.590",
    speaker: "Spreker 2",
    begin_ms: 19630,
    end_ms: 21590,
    doc: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Ik denk 10 en jij?" }] }] },
    html: null,
  },
  {
    begin: "00:00:22.230",
    end: "00:00:25.790",
    speaker: "Spreker 3",
    begin_ms: 22230,
    end_ms: 25790,
    doc: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Ik ook en stroop nemen we stroop mee." }] }] },
    html: null,
  },
  {
    begin: "00:00:26.110",
    end: "00:00:29.390",
    speaker: "Spreker 2",
    begin_ms: 26110,
    end_ms: 29390,
    doc: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Ja, Dat is een goed idee. Ik pak even de stroop." }] }] },
    html: null,
  },
  {
    begin: "00:00:30.070",
    end: "00:00:32.870",
    speaker: "Spreker 3",
    begin_ms: 30070,
    end_ms: 32870,
    doc: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "OK ik betaal ga jij alvast naar de kraam?" }] }] },
    html: null,
  },
  {
    begin: "00:00:33.470",
    end: "00:00:34.470",
    speaker: "Spreker 2",
    begin_ms: 33470,
    end_ms: 34470,
    doc: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Zal mij benieuwen?" }] }] },
    html: null,
  },
];

function makeRowsFromInitial() {
    return INITIAL_ROWS.map(row => ({
        timestamp: row.begin,
        speaker: row.speaker,
        begin_ms: row.begin_ms,
        end_ms: row.end_ms,
        doc: JSON.parse(JSON.stringify(row.doc)),
        html: null
    }));
}

// Generate HTML from doc, with caching
function getRowHTML(row) {
    if (!row.html) {
        row.html = generateHTML(row.doc, extensions);
    }
    return row.html;
}

// Create rows from initial data
const rows = makeRowsFromInitial();

// ---------- Rendering ----------
const gridBody = document.getElementById("gridBody");

function renderRow(i) {
    const row = rows[i];

    const rowEl = document.createElement("div");
    rowEl.className = "row";
    rowEl.dataset.index = String(i);
    rowEl.dataset.speaker = row.speaker;

    const ts = document.createElement("div");
    ts.className = "cell timestamp-cell";
    ts.textContent = row.timestamp;

    const sp = document.createElement("div");
    sp.className = "cell speaker-cell";
    sp.textContent = row.speaker;

    const tx = document.createElement("div");
    tx.className = "cell text-cell";
    tx.dataset.index = String(i);

    const display = document.createElement("div");
    display.className = "display";
    display.innerHTML = getRowHTML(row);
    tx.appendChild(display);

    tx.addEventListener("click", (e) => {
        e.stopPropagation();
        activateEditor(i, tx);
    });

    rowEl.appendChild(ts);
    rowEl.appendChild(sp);
    rowEl.appendChild(tx);

    return rowEl;
}

// initial render
for (let i = 0; i < rows.length; i++) {
    gridBody.appendChild(renderRow(i));
}

// ---------- TipTap single active editor ----------
let currentEditor = null;
let currentIndex = null;
let currentCell = null;

function activateEditor(index, cell) {
    if (currentIndex === index && currentEditor) {
        currentEditor.commands.focus();
        return;
    }
    if (currentEditor) deactivateEditor();

    currentIndex = index;
    currentCell = cell;

    // replace display with editor host
    cell.classList.add("editing");
    cell.innerHTML = ""; // remove display
    const row = rows[index];

    const editor = new Editor({
        element: cell,
        extensions,
        content: row.doc,  // Load from JSON document
        onUpdate({ editor }) {
            // Update the document model (source of truth)
            row.doc = editor.getJSON();
            row.html = null;  // Invalidate HTML cache
        }
    });

    currentEditor = editor;

    editor.on("selectionUpdate", updateToolbarState);
    editor.on("transaction", updateToolbarState);

    setTimeout(() => {
        editor.commands.focus("end");
        updateToolbarState();
    }, 0);
}

function deactivateEditor() {
    if (!currentEditor || currentIndex === null || !currentCell) return;

    const row = rows[currentIndex];
    // Save the document model (source of truth)
    row.doc = currentEditor.getJSON();
    row.html = null;  // Invalidate HTML cache

    currentEditor.destroy();
    currentEditor = null;

    // restore display
    currentCell.classList.remove("editing");
    const display = document.createElement("div");
    display.className = "display";
    display.innerHTML = getRowHTML(row);
    currentCell.innerHTML = "";
    currentCell.appendChild(display);

    currentIndex = null;
    currentCell = null;
}

// click outside to deactivate
document.addEventListener("click", (e) => {
    if (!e.target.closest(".text-cell") && !e.target.closest(".global-toolbar")) {
        deactivateEditor();
    }
});

// ---------- Toolbar ----------
function updateToolbarState() {
    if (!currentEditor) return;
    document.getElementById("btnBold").classList.toggle("active", currentEditor.isActive("bold"));
    document.getElementById("btnItalic").classList.toggle("active", currentEditor.isActive("italic"));
    document.getElementById("btnUnderline").classList.toggle("active", currentEditor.isActive("underline"));
}

// prevent toolbar stealing focus
document.querySelectorAll(".global-toolbar button").forEach(btn => {
    btn.addEventListener("mousedown", (e) => e.preventDefault());
});

document.getElementById("btnBold").addEventListener("click", (e) => {
    e.stopPropagation(); if (!currentEditor) return;
    currentEditor.chain().focus().toggleBold().run();
    updateToolbarState();
});

document.getElementById("btnItalic").addEventListener("click", (e) => {
    e.stopPropagation(); if (!currentEditor) return;
    currentEditor.chain().focus().toggleItalic().run();
    updateToolbarState();
});

document.getElementById("btnUnderline").addEventListener("click", (e) => {
    e.stopPropagation(); if (!currentEditor) return;
    currentEditor.chain().focus().toggleUnderline().run();
    updateToolbarState();
});

document.getElementById("btnUndo").addEventListener("click", (e) => {
    e.stopPropagation(); if (!currentEditor) return;
    currentEditor.commands.undo();
    setTimeout(() => { currentEditor.commands.focus(); updateToolbarState(); }, 0);
});

document.getElementById("btnRedo").addEventListener("click", (e) => {
    e.stopPropagation(); if (!currentEditor) return;
    currentEditor.commands.redo();
    setTimeout(() => { currentEditor.commands.focus(); updateToolbarState(); }, 0);
});

// ---------- Copy with formatting ----------
function htmlToText(html) {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return (div.textContent || "").trim();
}

document.getElementById("btnCopy").addEventListener("click", async (e) => {
    e.stopPropagation();
    try {
        let formattedText = "";
        let htmlContent = "";

        // Speaker color mapping
        const speakerColors = {
            "Spreker 1": "#5c6bc0",
            "Spreker 2": "#8d6e63",
            "Spreker 3": "#26a69a",
            "Spreker 4": "#ec407a"
        };

        rows.forEach((row) => {
            const html = getRowHTML(row);
            const plain = htmlToText(html);
            formattedText += `${row.timestamp} - ${row.speaker}: ${plain}\n`;
            const speakerColor = speakerColors[row.speaker] || "#1a1a1a";
            htmlContent += `
                <div style="margin:0 0 6px 0;">
  ${row.timestamp} - <span style="color:${speakerColor};font-weight:600;">${row.speaker}</span>:
  ${html}
</div>`;
        });

        await navigator.clipboard.write([
            new ClipboardItem({
                "text/html": new Blob([htmlContent], { type: "text/html" }),
                "text/plain": new Blob([formattedText], { type: "text/plain" }),
            })
        ]);

        alert("Transcript copied with formatting!");
    } catch (err) {
        console.error("Failed to copy:", err);
        alert("Failed to copy. Please try again.");
    }
});

console.log("Grid rendered with", rows.length, "rows");

// ---------- Fake timer with row highlighting ----------
let currentMs = 0;
let highlightedRow = null;

function updateTimer() {
    // Increment time by 100ms for smoother updates
    currentMs += 100;

    // Convert to timestamp format
    const totalSeconds = Math.floor(currentMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = currentMs % 1000;

    const timeString = `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}.${pad3(ms)}`;
    document.getElementById("currentTime").textContent = timeString;

    // Find the row that should be highlighted based on current time
    // Use begin_ms and end_ms for precise matching
    let rowToHighlight = null;
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.begin_ms !== undefined && row.end_ms !== undefined) {
            if (currentMs >= row.begin_ms && currentMs < row.end_ms) {
                rowToHighlight = i;
                break;
            }
        }
    }

    // Update highlighting
    if (rowToHighlight !== highlightedRow) {
        // Remove old highlight
        if (highlightedRow !== null) {
            const oldRow = gridBody.querySelector(`.row[data-index="${highlightedRow}"]`);
            if (oldRow) oldRow.classList.remove("highlight");
        }

        // Add new highlight
        if (rowToHighlight !== null) {
            const newRow = gridBody.querySelector(`.row[data-index="${rowToHighlight}"]`);
            if (newRow) {
                newRow.classList.add("highlight");
                // Scroll into view
                newRow.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }

        highlightedRow = rowToHighlight;
    }
}

// Start the timer (100ms intervals for smoother highlighting)
setInterval(updateTimer, 100);

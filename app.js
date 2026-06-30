let historyStack = [];
let selectedWords = [];
let participant = "";
let currentPage = "Закуски";

let timeOffset = 0;

/* =========================
   INIT SAFE
========================= */

document.addEventListener("DOMContentLoaded", () => {

    /* ===== TIME SELECT ===== */

    const timeSelect = document.getElementById("timeOffsetSelect");

    timeOffset = parseInt(localStorage.getItem("timeOffset") || "0", 10);

    if (timeSelect) {

        timeSelect.value = String(timeOffset);

        timeSelect.addEventListener("change", () => {

            timeOffset = parseInt(timeSelect.value, 10);

            localStorage.setItem("timeOffset", timeOffset);

            /* лёгкий "упор" */
            timeSelect.classList.add("bump");

            setTimeout(() => {
                timeSelect.classList.remove("bump");
            }, 160);

            updateReceiptPreview();

        });

    }

    renderPage("Закуски");
    updateReceiptPreview();

});

/* =========================
   PARTICIPANT
========================= */

function applyParticipant() {

    const input = document.getElementById("participantInput");

    participant = input ? input.value.trim() : "";

    updateReceiptPreview();

}

/* =========================
   DATA
========================= */

const pages = {
    Закуски:["Сырное","Рулетики","Мясная","Сморчки","Острые","Раки","Мидии"],
    Мясо:["Пикантная","Бифштекс","Хаггис","Перепела","Дичь"],
    Супы:["Биск","Деревенский","Харчо","Пивной","Диетический"],
    Основные:["Хинкали","Паста","Долма","Буррито","Плов"],
    Рыбный:["Дорадо","Палтус","Белуга","Хек","Пангасиус"],
    Булки:["Пампушка","Пражская","Кекс","Плетенка","Крендель"],
    Хлеб:["Португальский","Пури","Калач","Пшенично","Кумач"],
    Пироги:["Пирожное Н","Картофельный","Карибский","Пирожное М","Кляфути"],
    Десерты:["Карамельный","Птичье","Профитроли","Кулич","Круассан"],
    Кофе:["Какао","Двойное какао","Латте","Имбирный Чай","Облепиховый Чай"],
    Прохладительные:["Лимонад","Вода","Добрый","Сок","Смузи"]
};

const transition = {
    Закуски:{"Сырное":"Супы","Рулетики":"Рыбный","Мясная":"Мясо","Сморчки":"Супы","Острые":"Основные","Раки":"Рыбный","Мидии":"Мясо"}
};

/* =========================
   RENDER
========================= */

function renderPage(page){

    const list = document.getElementById("list");
    const title = document.getElementById("title");

    if (!list || !title) return;

    currentPage = page;

    list.innerHTML = "";
    title.textContent = page;

    (pages[page] || []).forEach(item => {

        const div = document.createElement("div");

        div.className = "item";

        div.textContent = item;

        if (selectedWords.includes(item)) {
            div.classList.add("selected");
        }

        div.onclick = () => selectItem(page, item);

        list.appendChild(div);

    });

}

/* =========================
   TIME
========================= */

function getReceiptTime() {

    return new Date(Date.now() + timeOffset * 60000);

}

/* =========================
   CANVAS
========================= */

function renderReceiptToCanvas({ download = false } = {}) {

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const width = 300;

    canvas.width = width;
    canvas.height = 400;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, 400);

    ctx.fillStyle = "#000";
    ctx.font = "16px monospace";

    let y = 40;

    selectedWords.forEach(w => {

        ctx.fillText(w, 10, y);

        y += 24;

    });

    const t = getReceiptTime();

    ctx.fillText(
        t.toLocaleTimeString(),
        10,
        y + 40
    );

    if (!download) {

        document.getElementById("preview").innerHTML =
            `<img src="${canvas.toDataURL()}">`;

    }

}

/* =========================
   UPDATE
========================= */

function updateReceiptPreview() {
    renderReceiptToCanvas();
}

/* =========================
   SELECT
========================= */

function selectItem(page, item) {

    selectedWords.push(item);

    updateReceiptPreview();

    const next = transition[page]?.[item];

    if (next) {
        historyStack.push(page);
        renderPage(next);
    }

}

/* =========================
   BACK
========================= */

function goBack() {

    selectedWords.pop();

    const prev = historyStack.pop();

    if (prev) renderPage(prev);

}

/* =========================
   RESET
========================= */

function resetPage() {

    selectedWords = [];
    historyStack = [];

    renderPage("Закуски");

}

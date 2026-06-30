/* =========================
   STATE
========================= */

let historyStack = [];
let selectedWords = [];
let participant = "";
let currentPage = "Закуски";

/* =========================
   TIME OFFSET (NEW FEATURE)
========================= */

let timeOffset = parseInt(localStorage.getItem("timeOffset") || "0", 10);

const timeSelect = document.getElementById("timeOffsetSelect");

/* восстановление выбора */
if (timeSelect) {
    timeSelect.value = String(timeOffset);

    timeSelect.addEventListener("change", () => {

        timeOffset = parseInt(timeSelect.value, 10);

        localStorage.setItem("timeOffset", timeOffset);

        /* маленькая "вибрация" */
        timeSelect.classList.add("bump");

        setTimeout(() => {
            timeSelect.classList.remove("bump");
        }, 160);

        updateReceiptPreview();
    });
}

/* =========================
   PARTICIPANT
========================= */

function applyParticipant() {

    const val = document.getElementById("participantInput").value.trim();

    participant = val;

    updateReceiptPreview();
}

/* =========================
   KEYBOARD
========================= */

document.addEventListener("keydown", (e) => {

    const el = document.activeElement;

    if (el && el.id === "participantInput" && e.key === "Enter") {

        e.preventDefault();

        applyParticipant();

    }

});

/* =========================
   MENU DATA (оставляем как есть)
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
    Закуски:{"Сырное":"Супы","Рулетики":"Рыбный","Мясная":"Мясо","Сморчки":"Супы","Острые":"Основные","Раки":"Рыбный","Мидии":"Мясо"},
    Мясо:{"Пикантная":"Пироги","Бифштекс":"Булки","Хаггис":"Хлеб","Перепела":"Пироги","Дичь":"Десерты"},
    Супы:{"Биск":"Булки","Деревенский":"Десерты","Харчо":"Хлеб","Пивной":"Пироги","Диетический":"Десерты"},
    Основные:{"Хинкали":"Хлеб","Паста":"Пироги","Долма":"Десерты","Буррито":"Булки","Плов":"Пироги"},
    Рыбный:{"Дорадо":"Десерты","Палтус":"Пироги","Белуга":"Булки","Хек":"Хлеб","Пангасиус":"Пироги"},
    Булки:{"Пампушка":"Прохладительные","Пражская":"Прохладительные","Кекс":"Кофе","Плетенка":"Прохладительные","Крендель":"Кофе"},
    Хлеб:{"Португальский":"Прохладительные","Пури":"Прохладительные","Калач":"Кофе","Пшенично":"Прохладительные","Кумач":"Кофе"},
    Пироги:{"Пирожное Н":"Прохладительные","Картофельный":"Кофе","Карибский":"Кофе","Пирожное М":"Прохладительные","Кляфути":"Кофе"},
    Десерты:{"Карамельный":"Кофе","Птичье":"Прохладительные","Профитроли":"Прохладительные","Кулич":"Кофе","Круассан":"Кофе"},
    Кофе:{},
    Прохладительные:{}
};

/* =========================
   FULL NAMES + PRICES (оставляем как есть)
========================= */

const fullNames = {
    "Сырное":"Сырное ассорти",
    "Рулетики":"Рулетики",
    "Мясная":"Мясная тарелка",
    "Сморчки":"Сморчки",
    "Острые":"Острые креветки",
    "Раки":"Раки",
    "Мидии":"Мидии"
    /* ... остальные оставь как у тебя ... */
};

const prices = {
    "Сырное":1600,
    "Рулетики":1850
    /* ... остальные ... */
};

/* =========================
   PAGE RENDER
========================= */

function renderPage(page){

    setFinalMode(false);

    currentPage = page;

    const listDiv = document.getElementById("list");

    listDiv.innerHTML = "";

    document.getElementById("title").textContent = page;

    (pages[page] || []).forEach(item => {

        const div = document.createElement("div");

        div.className = "item";

        div.textContent = fullNames[item] || item;

        if(selectedWords.includes(item)) div.classList.add("selected");

        div.onclick = () => selectItem(page, item);

        listDiv.appendChild(div);

    });

    updateReceiptPreview();
}

/* =========================
   RECEIPT TIME (FIXED)
========================= */

function getReceiptTime(){

    const now = new Date();

    return new Date(now.getTime() + timeOffset * 60000);

}

/* =========================
   CANVAS RECEIPT
========================= */

function renderReceiptToCanvas({ download = false } = {}){

    const canvas = document.getElementById("canvas");

    const ctx = canvas.getContext("2d");

    const scale = download ? 2 : 1;

    const width = 300;

    const lineHeight = 28;

    const height = 500 + selectedWords.length * 28;

    canvas.width = width * scale;

    canvas.height = height * scale;

    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    ctx.fillStyle = "#fff";

    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#000";

    ctx.font = "16px monospace";

    let y = 40;

    selectedWords.forEach(item => {

        const text = fullNames[item] || item;

        const price = prices[item] || 0;

        ctx.fillText(`${text} ... ${price}₽`, 10, y);

        y += lineHeight;

    });

    y += 20;

    const now = getReceiptTime();

    ctx.textAlign = "center";

    ctx.fillText(
        now.toLocaleString(),
        width / 2,
        y
    );

    if(download){

        const link = document.createElement("a");

        link.download = "receipt.jpg";

        link.href = canvas.toDataURL("image/jpeg", 0.95);

        link.click();

    } else {

        document.getElementById("preview").innerHTML =
            `<img src="${canvas.toDataURL("image/jpeg")}" />`;

    }
}

/* =========================
   UPDATE PREVIEW
========================= */

function updateReceiptPreview(){

    renderReceiptToCanvas();

}

/* =========================
   SELECT ITEM
========================= */

function selectItem(page, item){

    selectedWords.push(item);

    updateReceiptPreview();

    const next = transition[page]?.[item];

    if(next){

        historyStack.push(page);

        renderPage(next);

    }
}

/* =========================
   BACK
========================= */

function goBack(){

    selectedWords.pop();

    const prev = historyStack.pop();

    if(prev){

        renderPage(prev);

    }

}

/* =========================
   RESET
========================= */

function resetPage(){

    selectedWords = [];

    historyStack = [];

    participant = "";

    renderPage("Закуски");

}

/* =========================
   INIT
========================= */

renderPage("Закуски");

updateReceiptPreview();
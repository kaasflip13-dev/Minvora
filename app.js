```javascript
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const TILE = 40;

const COLS = Math.floor(canvas.width / TILE);
const ROWS = Math.floor(canvas.height / TILE);

let running = false;
let keys = {};
let lastTime = 0;
let mineCooldown = 0;


/* =========================
   SPELER
========================= */

const player = {
    x: 4,
    y: 4,
    speed: 4
};


/* =========================
   INVENTORY
========================= */

const inventory = {
    ore: 0,
    wood: 0,
    crystal: 0,
    stone: 0,

    pickaxe: 0,
    torch: 0,
    bomb: 0
};


/* =========================
   BLOKKEN
========================= */

const blockTypes = [

    {
        name: "stone",
        color: "#303844",
        hp: 2,
        drops: ["stone"]
    },

    {
        name: "ore",
        color: "#795c35",
        hp: 3,
        drops: ["ore"]
    },

    {
        name: "wood",
        color: "#62432d",
        hp: 2,
        drops: ["wood"]
    },

    {
        name: "crystal",
        color: "#5d347a",
        hp: 4,
        drops: ["crystal"]
    }
];


const blocks = [];


/* =========================
   WERELD MAKEN
========================= */

function randomBlock() {

    const r = Math.random();

    if (r < 0.07) {
        return 3;
    }

    if (r < 0.18) {
        return 1;
    }

    if (r < 0.28) {
        return 2;
    }

    return 0;
}


for (let y = 0; y < ROWS; y++) {

    blocks[y] = [];

    for (let x = 0; x < COLS; x++) {

        // Spawngebied vrijhouden
        if (x < 7 && y < 7) {

            blocks[y][x] = -1;

        } else {

            blocks[y][x] = randomBlock();
        }
    }
}


/* =========================
   START GAME
========================= */

document.getElementById("startBtn").addEventListener("click", () => {

    document.getElementById("menu").classList.add("hidden");

    document.getElementById("game").classList.remove("hidden");

    running = true;

    requestAnimationFrame(loop);
});


/* =========================
   KEYBOARD
========================= */

document.addEventListener("keydown", (event) => {

    keys[event.key.toLowerCase()] = true;

    if (event.key.toLowerCase() === "e") {

        craft("pickaxe");
    }
});


document.addEventListener("keyup", (event) => {

    keys[event.key.toLowerCase()] = false;
});


/* =========================
   KLIKKEN = MINEN
========================= */

canvas.addEventListener("click", (event) => {

    if (!running || mineCooldown > 0) {
        return;
    }

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX =
        (event.clientX - rect.left) * scaleX;

    const mouseY =
        (event.clientY - rect.top) * scaleY;

    const tileX = Math.floor(mouseX / TILE);
    const tileY = Math.floor(mouseY / TILE);

    const distance =
        Math.hypot(
            tileX - player.x,
            tileY - player.y
        );

    if (distance > 3) {

        showMessage("Dat blok is te ver weg!");

        return;
    }

    mine(tileX, tileY);

    mineCooldown = 8;
});


/* =========================
   MINEN
========================= */

function mine(x, y) {

    if (!blocks[y]) {
        return;
    }

    if (blocks[y][x] === undefined) {
        return;
    }

    const typeIndex = blocks[y][x];

    if (typeIndex < 0) {

        showMessage("Hier kun je niet minen!");

        return;
    }

    const type = blockTypes[typeIndex];

    type.hp--;

    if (type.hp > 0) {

        showMessage("⛏️ Nog een keer!");

        return;
    }

    const drop =
        type.drops[
            Math.floor(
                Math.random() *
                type.drops.length
            )
        ];

    inventory[drop]++;

    blocks[y][x] = -1;

    if (drop === "ore") {
        showMessage("⛏️ +1 Erts");
    }

    else if (drop === "wood") {
        showMessage("🪵 +1 Hout");
    }

    else if (drop === "crystal") {
        showMessage("💎 +1 Kristal");
    }

    else {
        showMessage("🧱 +1 Steen");
    }

    updateUI();
}


/* =========================
   CRAFTING
========================= */

function craft(item) {

    if (item === "pickaxe") {

        if (
            inventory.ore >= 10 &&
            inventory.wood >= 5
        ) {

            inventory.ore -= 10;
            inventory.wood -= 5;

            inventory.pickaxe++;

            player.speed = 5;

            showMessage(
                "⛏️ IJZEREN PICKAXE GEMAAKT!"
            );

        } else {

            showMessage(
                "Je hebt 10 erts en 5 hout nodig."
            );
        }
    }


    if (item === "torch") {

        if (
            inventory.wood >= 3 &&
            inventory.ore >= 1
        ) {

            inventory.wood -= 3;
            inventory.ore--;

            inventory.torch += 5;

            showMessage(
                "🔥 5 fakkels gemaakt!"
            );

        } else {

            showMessage(
                "Je hebt 3 hout en 1 erts nodig."
            );
        }
    }


    if (item === "crystal") {

        if (
            inventory.crystal >= 5 &&
            inventory.ore >= 5
        ) {

            inventory.crystal -= 5;
            inventory.ore -= 5;

            inventory.bomb++;

            showMessage(
                "💎 KRISTALBOM GEMAAKT!"
            );

        } else {

            showMessage(
                "Je hebt 5 kristallen en 5 erts nodig."
            );
        }
    }

    updateUI();
}


/* =========================
   CRAFT KNOPPEN
========================= */

document.querySelectorAll(".craft").forEach(button => {

    button.addEventListener("click", () => {

        craft(button.dataset.item);

    });

});


/* =========================
   SPELER BEWEGEN
========================= */

function updatePlayer(dt) {

    let dx = 0;
    let dy = 0;

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {
        dy--;
    }

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {
        dy++;
    }

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {
        dx--;
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {
        dx++;
    }


    if (dx !== 0 || dy !== 0) {

        const length =
            Math.hypot(dx, dy);

        dx /= length;
        dy /= length;

        player.x +=
            dx *
            player.speed *
            dt / 16;

        player.y +=
            dy *
            player.speed *
            dt / 16;
    }


    player.x =
        Math.max(
            0.5,
            Math.min(
                COLS - 0.5,
                player.x
            )
        );

    player.y =
        Math.max(
            0.5,
            Math.min(
                ROWS - 0.5,
                player.y
            )
        );
}


/* =========================
   TEKENEN
========================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Achtergrond

    ctx.fillStyle = "#0b1018";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Blokken

    for (let y = 0; y < ROWS; y++) {

        for (let x = 0; x < COLS; x++) {

            const block =
                blocks[y][x];


            if (block === -1) {

                ctx.fillStyle =
                    "#101923";

                ctx.fillRect(
                    x * TILE,
                    y * TILE,
                    TILE,
                    TILE
                );

            } else {

                const type =
                    blockTypes[block];

                ctx.fillStyle =
                    type.color;

                ctx.fillRect(
                    x * TILE + 1,
                    y * TILE + 1,
                    TILE - 2,
                    TILE - 2
                );


                // Details

                ctx.fillStyle =
                    "rgba(255,255,255,.08)";

                ctx.fillRect(
                    x * TILE + 6,
                    y * TILE + 6,
                    8,
                    8
                );


                // Erts

                if (type.name === "ore") {

                    ctx.fillStyle =
                        "#e2a94f";

                    ctx.fillRect(
                        x * TILE + 14,
                        y * TILE + 18,
                        6,
                        6
                    );

                    ctx.fillRect(
                        x * TILE + 26,
                        y * TILE + 10,
                        5,
                        5
                    );
                }


                // Kristal

                if (type.name === "crystal") {

                    ctx.fillStyle =
                        "#d889ff";

                    ctx.beginPath();

                    ctx.moveTo(
                        x * TILE + 20,
                        y * TILE + 7
                    );

                    ctx.lineTo(
                        x * TILE + 29,
                        y * TILE + 20
                    );

                    ctx.lineTo(
                        x * TILE + 20,
                        y * TILE + 33
                    );

                    ctx.lineTo(
                        x * TILE + 11,
                        y * TILE + 20
                    );

                    ctx.closePath();

                    ctx.fill();
                }
            }
        }
    }


    // Speler

    const px =
        player.x * TILE;

    const py =
        player.y * TILE;


    ctx.fillStyle =
        "#57d8ff";

    ctx.beginPath();

    ctx.arc(
        px,
        py,
        13,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Ogen

    ctx.fillStyle =
        "#ffffff";

    ctx.beginPath();

    ctx.arc(
        px - 4,
        py - 3,
        3,
        0,
        Math.PI * 2
    );

    ctx.arc(
        px + 4,
        py - 3,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Mijnbereik

    ctx.strokeStyle =
        "rgba(87,216,255,.16)";

    ctx.beginPath();

    ctx.arc(
        px,
        py,
        TILE * 3,
        0,
        Math.PI * 2
    );

    ctx.stroke();
}


/* =========================
   GAME LOOP
========================= */

function loop(time) {

    if (!running) {
        return;
    }

    const dt =
        Math.min(
            32,
            time - lastTime || 16
        );

    lastTime = time;

    updatePlayer(dt);

    mineCooldown =
        Math.max(
            0,
            mineCooldown - dt / 16
        );

    draw();

    requestAnimationFrame(loop);
}


/* =========================
   UI
========================= */

function updateUI() {

    document.getElementById("ore").textContent =
        inventory.ore;

    document.getElementById("wood").textContent =
        inventory.wood;

    document.getElementById("crystal").textContent =
        inventory.crystal;


    document.getElementById("invOre").textContent =
        inventory.ore;

    document.getElementById("invWood").textContent =
        inventory.wood;

    document.getElementById("invCrystal").textContent =
        inventory.crystal;

    document.getElementById("invStone").textContent =
        inventory.stone;
}


/* =========================
   MELDING
========================= */

let messageTimer;

function showMessage(text) {

    const message =
        document.getElementById("message");

    message.textContent = text;

    message.classList.add("show");

    clearTimeout(messageTimer);

    messageTimer =
        setTimeout(() => {

            message.classList.remove("show");

        }, 1200);
}


updateUI();
```


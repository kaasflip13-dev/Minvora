```javascript
// =====================================================
// MINVORA - FIRST PERSON
// =====================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const game = document.getElementById("game");
const startButton = document.getElementById("startBtn");


// =====================================================
// CANVAS
// =====================================================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


// =====================================================
// SPELER
// =====================================================

const player = {

    x: 0,
    z: 0,

    rotation: 0,

    speed: 0.08
};


// =====================================================
// INVENTORY
// =====================================================

const inventory = {

    wood: 0,
    stone: 0,
    ore: 0,
    crystal: 0
};


// =====================================================
// WERELD
// =====================================================

const objects = [];


// Bomen

for (let i = 0; i < 45; i++) {

    objects.push({

        type: "tree",

        x: Math.random() * 80 - 40,
        z: Math.random() * 100 + 8,

        size: 1.5
    });
}


// Stenen

for (let i = 0; i < 35; i++) {

    objects.push({

        type: "stone",

        x: Math.random() * 80 - 40,
        z: Math.random() * 100 + 8,

        size: 1
    });
}


// Erts

for (let i = 0; i < 18; i++) {

    objects.push({

        type: "ore",

        x: Math.random() * 80 - 40,
        z: Math.random() * 100 + 8,

        size: 0.8
    });
}


// Kristallen

for (let i = 0; i < 8; i++) {

    objects.push({

        type: "crystal",

        x: Math.random() * 80 - 40,
        z: Math.random() * 100 + 8,

        size: 1
    });
}


// =====================================================
// START GAME
// =====================================================

startButton.addEventListener("click", function () {

    menu.style.display = "none";

    game.classList.remove("hidden");

    document.body.requestPointerLock();

    running = true;

    lastTime = performance.now();

    requestAnimationFrame(loop);
});


// =====================================================
// POINTER LOCK
// =====================================================

document.addEventListener("click", function () {

    if (running) {

        document.body.requestPointerLock();
    }
});


// =====================================================
// MUIS KIJKEN
// =====================================================

document.addEventListener(
    "mousemove",
    function(event) {

        if (!running) {
            return;
        }

        if (
            document.pointerLockElement !== document.body
        ) {
            return;
        }

        player.rotation +=
            event.movementX * 0.0025;
    }
);


// =====================================================
// TOETSEN
// =====================================================

const keys = {};

document.addEventListener("keydown", function(event) {

    keys[event.key.toLowerCase()] = true;

});

document.addEventListener("keyup", function(event) {

    keys[event.key.toLowerCase()] = false;

});


// =====================================================
// BEWEGEN
// =====================================================

function updatePlayer() {

    let forward = 0;
    let sideways = 0;


    if (keys["w"]) {
        forward += 1;
    }

    if (keys["s"]) {
        forward -= 1;
    }

    if (keys["a"]) {
        sideways -= 1;
    }

    if (keys["d"]) {
        sideways += 1;
    }


    if (
        forward === 0 &&
        sideways === 0
    ) {
        return;
    }


    const sin =
        Math.sin(player.rotation);

    const cos =
        Math.cos(player.rotation);


    player.x +=
        (
            sideways * cos -
            forward * sin
        ) * player.speed;


    player.z +=
        (
            sideways * sin +
            forward * cos
        ) * player.speed;
}


// =====================================================
// MINEN
// =====================================================

canvas.addEventListener("click", function() {

    if (!running) {
        return;
    }

    mineObject();

});


// =====================================================
// OBJECT VOOR DE SPELER VINDEN
// =====================================================

function mineObject() {

    let closest = null;

    let closestDistance = Infinity;


    for (const object of objects) {

        const dx =
            object.x - player.x;

        const dz =
            object.z - player.z;


        const distance =
            Math.sqrt(
                dx * dx +
                dz * dz
            );


        if (distance > 5) {
            continue;
        }


        let angle =
            Math.atan2(dx, dz) -
            player.rotation;


        while (angle > Math.PI) {
            angle -= Math.PI * 2;
        }

        while (angle < -Math.PI) {
            angle += Math.PI * 2;
        }


        // Alleen wat ongeveer
        // recht voor de speler staat

        if (Math.abs(angle) < 0.18) {

            if (
                distance <
                closestDistance
            ) {

                closest =
                    object;

                closestDistance =
                    distance;
            }
        }
    }


    if (!closest) {

        showMessage(
            "Er staat niets voor je!"
        );

        return;
    }


    // Boom

    if (closest.type === "tree") {

        inventory.wood += 3;

        showMessage(
            "🌲 +3 HOUT"
        );
    }


    // Steen

    if (closest.type === "stone") {

        inventory.stone += 2;

        showMessage(
            "🪨 +2 STEEN"
        );
    }


    // Erts

    if (closest.type === "ore") {

        inventory.ore += 2;

        showMessage(
            "⛏️ +2 ERTS"
        );
    }


    // Kristal

    if (closest.type === "crystal") {

        inventory.crystal += 1;

        showMessage(
            "💎 +1 KRISTAL"
        );
    }


    // Object verwijderen

    const index =
        objects.indexOf(closest);

    objects.splice(index, 1);


    updateUI();

    animateTool();
}


// =====================================================
// TOOL ANIMATIE
// =====================================================

function animateTool() {

    const tool =
        document.getElementById("tool");

    tool.classList.remove("swing");

    void tool.offsetWidth;

    tool.classList.add("swing");
}


// =====================================================
// 3D OBJECT TEKENEN
// =====================================================

function drawObject(object) {

    const dx =
        object.x - player.x;

    const dz =
        object.z - player.z;


    const distance =
        Math.sqrt(
            dx * dx +
            dz * dz
        );


    if (distance < 0.5) {
        return;
    }


    let angle =
        Math.atan2(dx, dz) -
        player.rotation;


    while (angle > Math.PI) {
        angle -= Math.PI * 2;
    }

    while (angle < -Math.PI) {
        angle += Math.PI * 2;
    }


    const fov =
        Math.PI / 3;


    if (
        angle < -fov / 2 ||
        angle > fov / 2
    ) {
        return;
    }


    const screenX =
        canvas.width / 2 +
        (angle / fov) *
        canvas.width;


    const scale =
        600 / distance;


    const size =
        object.size * scale;


    const bottom =
        canvas.height / 2 +
        120;


    // =========================
    // BOOM
    // =========================

    if (object.type === "tree") {

        // Stam

        ctx.fillStyle = "#704525";

        ctx.fillRect(
            screenX - size * 0.13,
            bottom - size * 0.55,
            size * 0.26,
            size * 0.55
        );


        // Bladeren

        ctx.fillStyle = "#24733a";

        ctx.beginPath();

        ctx.arc(
            screenX,
            bottom - size * 0.75,
            size * 0.42,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle = "#35934b";

        ctx.beginPath();

        ctx.arc(
            screenX - size * 0.2,
            bottom - size * 0.82,
            size * 0.25,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.beginPath();

        ctx.arc(
            screenX + size * 0.2,
            bottom - size * 0.82,
            size * 0.25,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    // =========================
    // STEEN
    // =========================

    if (object.type === "stone") {

        ctx.fillStyle = "#777f88";

        ctx.beginPath();

        ctx.moveTo(
            screenX - size * 0.4,
            bottom
        );

        ctx.lineTo(
            screenX - size * 0.3,
            bottom - size * 0.5
        );

        ctx.lineTo(
            screenX,
            bottom - size * 0.7
        );

        ctx.lineTo(
            screenX + size * 0.4,
            bottom - size * 0.45
        );

        ctx.lineTo(
            screenX + size * 0.35,
            bottom
        );

        ctx.closePath();

        ctx.fill();
    }


    // =========================
    // ERTS
    // =========================

    if (object.type === "ore") {

        ctx.fillStyle = "#55565d";

        ctx.fillRect(
            screenX - size * 0.4,
            bottom - size * 0.55,
            size * 0.8,
            size * 0.55
        );


        ctx.fillStyle = "#e5a52f";

        ctx.beginPath();

        ctx.arc(
            screenX - size * 0.18,
            bottom - size * 0.3,
            size * 0.12,
            0,
            Math.PI * 2
        );

        ctx.arc(
            screenX + size * 0.2,
            bottom - size * 0.45,
            size * 0.1,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    // =========================
    // KRISTAL
    // =========================

    if (object.type === "crystal") {

        ctx.fillStyle = "#d06cff";

        ctx.beginPath();

        ctx.moveTo(
            screenX,
            bottom - size
        );

        ctx.lineTo(
            screenX + size * 0.35,
            bottom - size * 0.35
        );

        ctx.lineTo(
            screenX,
            bottom
        );

        ctx.lineTo(
            screenX - size * 0.35,
            bottom - size * 0.35
        );

        ctx.closePath();

        ctx.fill();
    }
}


// =====================================================
// WERELD TEKENEN
// =====================================================

function drawWorld() {

    // Lucht

    const sky =
        ctx.createLinearGradient(
            0,
            0,
            0,
            canvas.height
        );

    sky.addColorStop(
        0,
        "#67a8d4"
    );

    sky.addColorStop(
        0.55,
        "#b8d9e8"
    );

    sky.addColorStop(
        0.56,
        "#304b2d"
    );

    sky.addColorStop(
        1,
        "#162216"
    );


    ctx.fillStyle = sky;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Horizon

    ctx.fillStyle = "#304b2d";

    ctx.fillRect(
        0,
        canvas.height * 0.55,
        canvas.width,
        canvas.height * 0.45
    );


    // Objecten sorteren
    // zodat verre objecten eerst komen

    const sorted =
        [...objects].sort(
            (a, b) => {

                const da =
                    Math.hypot(
                        a.x - player.x,
                        a.z - player.z
                    );

                const db =
                    Math.hypot(
                        b.x - player.x,
                        b.z - player.z
                    );

                return db - da;
            }
        );


    for (const object of sorted) {

        drawObject(object);
    }
}


// =====================================================
// HUD
// =====================================================

function updateUI() {

    document.getElementById("wood").textContent =
        inventory.wood;

    document.getElementById("stone").textContent =
        inventory.stone;

    document.getElementById("ore").textContent =
        inventory.ore;

    document.getElementById("crystal").textContent =
        inventory.crystal;
}


// =====================================================
// MELDING
// =====================================================

let messageTimer;

function showMessage(text) {

    const message =
        document.getElementById("message");

    message.textContent = text;

    message.classList.add("show");


    clearTimeout(messageTimer);


    messageTimer =
        setTimeout(function() {

            message.classList.remove(
                "show"
            );

        }, 1200);
}


// =====================================================
// TOOL
// =====================================================

const tool =
    document.getElementById("tool");


// =====================================================
// GAME LOOP
// =====================================================

let running = false;
let lastTime = 0;


function loop(time) {

    if (!running) {
        return;
    }


    updatePlayer();


    drawWorld();


    requestAnimationFrame(loop);
}


// =====================================================
// BEGIN
// =====================================================

updateUI();
```

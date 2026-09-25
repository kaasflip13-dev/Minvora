// ==========================================
// MINVORA - COMPLETE APP.JS
// ==========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// MENU
const menu = document.getElementById("menu");
const startButton = document.getElementById("startButton");

// GAME
const game = document.getElementById("game");
const restartButton = document.getElementById("restartButton");
const gameOverScreen = document.getElementById("gameOver");

// HUD
const woodText = document.getElementById("wood");
const stoneText = document.getElementById("stone");
const oreText = document.getElementById("ore");
const crystalText = document.getElementById("crystal");
const blockText = document.getElementById("block");

const healthBar = document.getElementById("health");
const healthText = document.getElementById("healthText");

const info = document.getElementById("info");
const message = document.getElementById("message");

const crafting = document.getElementById("crafting");
const craftButtons = document.querySelectorAll(".craftButton");

// ==========================================
// CANVAS GROOTTE
// ==========================================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

// ==========================================
// SPELER
// ==========================================

const player = {
    x: 1500,
    y: 1500,
    size: 18,
    speed: 3,
    health: 100,
    maxHealth: 100
};

// ==========================================
// INVENTORY
// ==========================================

const inventory = {
    wood: 0,
    stone: 0,
    ore: 0,
    crystal: 0,
    block: 0,

    axe: false,
    pickaxe: false,
    lantern: false
};

// ==========================================
// WERELD
// ==========================================

const world = {
    width: 3000,
    height: 3000
};

let objects = [];
let enemies = [];

let gameRunning = false;
let gameEnded = false;

let keys = {};

let camera = {
    x: 0,
    y: 0
};

// ==========================================
// BOUWMODUS
// ==========================================

let buildMode = false;

let mouseX = 0;
let mouseY = 0;

let mouseWorldX = 0;
let mouseWorldY = 0;

// ==========================================
// TIJD
// ==========================================

let worldTime = 0;

// ==========================================
// MESSAGE TIMER
// ==========================================

let messageTimer = 0;

// ==========================================
// RANDOM
// ==========================================

function random(min, max) {
    return Math.random() * (max - min) + min;
}

// ==========================================
// AFSTAND
// ==========================================

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

// ==========================================
// MESSAGE
// ==========================================

function showMessage(text) {

    if (!message) return;

    message.textContent = text;
    message.style.opacity = "1";

    messageTimer = 180;
}

// ==========================================
// UI BIJWERKEN
// ==========================================

function updateUI() {

    if (woodText) {
        woodText.textContent = inventory.wood;
    }

    if (stoneText) {
        stoneText.textContent = inventory.stone;
    }

    if (oreText) {
        oreText.textContent = inventory.ore;
    }

    if (crystalText) {
        crystalText.textContent = inventory.crystal;
    }

    if (blockText) {
        blockText.textContent = inventory.block;
    }

    if (healthBar) {

        const percentage =
            Math.max(
                0,
                player.health / player.maxHealth * 100
            );

        healthBar.style.width =
            percentage + "%";
    }

    if (healthText) {

        healthText.textContent =
            Math.max(
                0,
                Math.floor(player.health)
            ) + " / " + player.maxHealth;
    }

    if (info) {

        if (buildMode) {

            info.innerHTML =
                "BOUWMODUS<br>" +
                "Klik = blok plaatsen<br>" +
                "B = bouwmodus stoppen";

        } else {

            info.innerHTML =
                "WASD = bewegen<br>" +
                "Klik = verzamelen<br>" +
                "B = bouwen<br>" +
                "E = crafting";
        }
    }
}

// ==========================================
// INVENTORY RESET
// ==========================================

function resetInventory() {

    inventory.wood = 0;
    inventory.stone = 0;
    inventory.ore = 0;
    inventory.crystal = 0;
    inventory.block = 0;

    inventory.axe = false;
    inventory.pickaxe = false;
    inventory.lantern = false;
}

// ==========================================
// WERELD MAKEN
// ==========================================

function createWorld() {

    objects = [];
    enemies = [];

    // BOMEN
    for (let i = 0; i < 130; i++) {

        const x = random(
            70,
            world.width - 70
        );

        const y = random(
            70,
            world.height - 70
        );

        if (
            distance(
                x,
                y,
                player.x,
                player.y
            ) < 250
        ) {
            i--;
            continue;
        }

        objects.push({
            type: "tree",
            x: x,
            y: y,
            size: 35,
            hp: 3,
            alive: true
        });
    }

    // STENEN
    for (let i = 0; i < 100; i++) {

        objects.push({
            type: "stone",
            x: random(70, world.width - 70),
            y: random(70, world.height - 70),
            size: 28,
            hp: 2,
            alive: true
        });
    }

    // ERTS
    for (let i = 0; i < 70; i++) {

        objects.push({
            type: "ore",
            x: random(70, world.width - 70),
            y: random(70, world.height - 70),
            size: 25,
            hp: 2,
            alive: true
        });
    }

    // KRISTALLEN
    for (let i = 0; i < 35; i++) {

        objects.push({
            type: "crystal",
            x: random(70, world.width - 70),
            y: random(70, world.height - 70),
            size: 22,
            hp: 1,
            alive: true
        });
    }

    // VIJANDEN
    for (let i = 0; i < 18; i++) {

        let x = random(
            150,
            world.width - 150
        );

        let y = random(
            150,
            world.height - 150
        );

        if (
            distance(
                x,
                y,
                player.x,
                player.y
            ) < 500
        ) {
            i--;
            continue;
        }

        enemies.push({
            x: x,
            y: y,
            size: 22,
            speed: 0.5,
            health: 30,
            attackCooldown: 0
        });
    }
}

// ==========================================
// GAME STARTEN
// ==========================================

function startGame() {

    gameRunning = true;
    gameEnded = false;

    player.x = world.width / 2;
    player.y = world.height / 2;

    player.health = 100;

    resetInventory();

    buildMode = false;

    createWorld();

    if (menu) {
        menu.style.display = "none";
    }

    if (game) {
        game.style.display = "block";
    }

    if (gameOverScreen) {
        gameOverScreen.style.display = "none";
    }

    updateUI();

    showMessage(
        "Welkom in MINVORA!"
    );

    requestAnimationFrame(gameLoop);
}

// ==========================================
// GAME OVER
// ==========================================

function endGame() {

    gameRunning = false;
    gameEnded = true;
    buildMode = false;

    if (gameOverScreen) {
        gameOverScreen.style.display = "flex";
    }

    showMessage(
        "GAME OVER"
    );
}

// ==========================================
// OPNIEUW
// ==========================================

function restartGame() {

    if (gameOverScreen) {
        gameOverScreen.style.display = "none";
    }

    startGame();
}

// ==========================================
// TOETSEN
// ==========================================

window.addEventListener(
    "keydown",
    function(event) {

        const key =
            event.key.toLowerCase();

        keys[key] = true;

        // B = bouwen
        if (
            key === "b" &&
            gameRunning
        ) {

            buildMode = !buildMode;

            if (buildMode) {

                showMessage(
                    "Bouwmodus aan!"
                );

            } else {

                showMessage(
                    "Bouwmodus uit."
                );
            }

            updateUI();
        }

        // E = crafting
        if (
            key === "e" &&
            gameRunning
        ) {

            if (!crafting) return;

            if (
                crafting.style.display === "none" ||
                crafting.style.display === ""
            ) {

                crafting.style.display =
                    "block";

            } else {

                crafting.style.display =
                    "none";
            }
        }
    }
);

window.addEventListener(
    "keyup",
    function(event) {

        keys[
            event.key.toLowerCase()
        ] = false;
    }
);

// ==========================================
// SPELER BEWEGEN
// ==========================================

function movePlayer() {

    let dx = 0;
    let dy = 0;

    if (keys["w"]) {
        dy--;
    }

    if (keys["s"]) {
        dy++;
    }

    if (keys["a"]) {
        dx--;
    }

    if (keys["d"]) {
        dx++;
    }

    if (dx !== 0 || dy !== 0) {

        const length =
            Math.hypot(dx, dy);

        dx /= length;
        dy /= length;

        player.x +=
            dx * player.speed;

        player.y +=
            dy * player.speed;
    }

    // Grenzen
    player.x = Math.max(
        player.size,
        Math.min(
            world.width - player.size,
            player.x
        )
    );

    player.y = Math.max(
        player.size,
        Math.min(
            world.height - player.size,
            player.y
        )
    );
}

// ==========================================
// CAMERA
// ==========================================

function updateCamera() {

    camera.x =
        player.x -
        canvas.width / 2;

    camera.y =
        player.y -
        canvas.height / 2;

    camera.x = Math.max(
        0,
        Math.min(
            world.width - canvas.width,
            camera.x
        )
    );

    camera.y = Math.max(
        0,
        Math.min(
            world.height - canvas.height,
            camera.y
        )
    );
}

// ==========================================
// MUIS BEWEGING
// ==========================================

canvas.addEventListener(
    "mousemove",
    function(event) {

        const rect =
            canvas.getBoundingClientRect();

        mouseX =
            event.clientX - rect.left;

        mouseY =
            event.clientY - rect.top;

        mouseWorldX =
            mouseX + camera.x;

        mouseWorldY =
            mouseY + camera.y;
    }
);

// ==========================================
// MUIS KLIK
// ==========================================

canvas.addEventListener(
    "click",
    function() {

        if (!gameRunning) return;

        if (buildMode) {

            placeBlock(
                mouseWorldX,
                mouseWorldY
            );

        } else {

            collectObject(
                mouseWorldX,
                mouseWorldY
            );
        }
    }
);

// ==========================================
// BLOK PLAATSEN
// ==========================================

function placeBlock(x, y) {

    if (inventory.block <= 0) {

        showMessage(
            "Je hebt geen bouwblokken!"
        );

        return;
    }

    const d =
        distance(
            player.x,
            player.y,
            x,
            y
        );

    if (d > 220) {

        showMessage(
            "Dat is te ver weg!"
        );

        return;
    }

    if (d < 45) {

        showMessage(
            "Je staat te dichtbij!"
        );

        return;
    }

    // Raster
    const grid = 40;

    const blockX =
        Math.round(x / grid) * grid;

    const blockY =
        Math.round(y / grid) * grid;

    // Controleren op andere objecten
    for (const object of objects) {

        if (!object.alive) continue;

        if (
            distance(
                object.x,
                object.y,
                blockX,
                blockY
            ) < 35
        ) {

            showMessage(
                "Hier staat al iets!"
            );

            return;
        }
    }

    // Blok maken
    objects.push({
        type: "block",
        x: blockX,
        y: blockY,
        size: 40,
        hp: 999,
        alive: true
    });

    inventory.block--;

    updateUI();

    showMessage(
        "Bouwblok geplaatst!"
    );
}

// ==========================================
// VERZAMELEN
// ==========================================

function collectObject(x, y) {

    let selected = null;
    let selectedDistance = Infinity;

    for (const object of objects) {

        if (!object.alive) continue;

        if (object.type === "block") {
            continue;
        }

        const playerDistance =
            distance(
                player.x,
                player.y,
                object.x,
                object.y
            );

        if (playerDistance > 130) {
            continue;
        }

        const clickDistance =
            distance(
                x,
                y,
                object.x,
                object.y
            );

        if (
            clickDistance <
            selectedDistance
        ) {

            selected = object;
            selectedDistance =
                clickDistance;
        }
    }

    // Vijand aanvallen
    for (const enemy of enemies) {

        const playerDistance =
            distance(
                player.x,
                player.y,
                enemy.x,
                enemy.y
            );

        if (playerDistance > 130) {
            continue;
        }

        const clickDistance =
            distance(
                x,
                y,
                enemy.x,
                enemy.y
            );

        if (
            clickDistance <
            selectedDistance
        ) {

            enemy.health -= 10;

            showMessage(
                "Vijand geraakt!"
            );

            if (enemy.health <= 0) {

                enemies.splice(
                    enemies.indexOf(enemy),
                    1
                );

                showMessage(
                    "Vijand verslagen!"
                );
            }

            return;
        }
    }

    if (!selected) {

        showMessage(
            "Er is hier niets om te verzamelen."
        );

        return;
    }

    // Boom
    if (selected.type === "tree") {

        selected.hp--;

        const amount =
            inventory.axe ? 5 : 3;

        inventory.wood += amount;

        showMessage(
            "+" + amount + " hout"
        );
    }

    // Steen
    if (selected.type === "stone") {

        selected.hp--;

        const amount =
            inventory.pickaxe ? 4 : 2;

        inventory.stone += amount;

        showMessage(
            "+" + amount + " steen"
        );
    }

    // Erts
    if (selected.type === "ore") {

        selected.hp--;

        const amount =
            inventory.pickaxe ? 4 : 2;

        inventory.ore += amount;

        showMessage(
            "+" + amount + " erts"
        );
    }

    // Kristal
    if (selected.type === "crystal") {

        selected.hp--;

        inventory.crystal++;

        showMessage(
            "+1 kristal"
        );
    }

    if (selected.hp <= 0) {

        selected.alive = false;
    }

    updateUI();
}

// ==========================================
// RECHTSKLIK = BLOK TERUGPAKKEN
// ==========================================

canvas.addEventListener(
    "contextmenu",
    function(event) {

        event.preventDefault();

        if (!gameRunning) return;
        if (!buildMode) return;

        const rect =
            canvas.getBoundingClientRect();

        const x =
            event.clientX -
            rect.left +
            camera.x;

        const y =
            event.clientY -
            rect.top +
            camera.y;

        for (const object of objects) {

            if (!object.alive) continue;

            if (object.type !== "block") {
                continue;
            }

            if (
                distance(
                    x,
                    y,
                    object.x,
                    object.y
                ) < 30
            ) {

                if (
                    distance(
                        player.x,
                        player.y,
                        object.x,
                        object.y
                    ) > 220
                ) {

                    showMessage(
                        "Te ver weg!"
                    );

                    return;
                }

                object.alive = false;

                inventory.block++;

                updateUI();

                showMessage(
                    "Bouwblok teruggepakt!"
                );

                return;
            }
        }
    }
);

// ==========================================
// VIJANDEN UPDATE
// ==========================================

function updateEnemies() {

    for (const enemy of enemies) {

        const d =
            distance(
                enemy.x,
                enemy.y,
                player.x,
                player.y
            );

        if (
            d < 500 &&
            d > 35
        ) {

            const dx =
                (player.x - enemy.x) / d;

            const dy =
                (player.y - enemy.y) / d;

            enemy.x +=
                dx * enemy.speed;

            enemy.y +=
                dy * enemy.speed;
        }

        if (d < 35) {

            if (
                enemy.attackCooldown <= 0
            ) {

                player.health -= 5;

                enemy.attackCooldown = 60;

                updateUI();

                showMessage(
                    "-5 gezondheid"
                );

                if (
                    player.health <= 0
                ) {

                    player.health = 0;

                    updateUI();

                    endGame();

                    return;
                }
            }
        }

        if (
            enemy.attackCooldown > 0
        ) {

            enemy.attackCooldown--;
        }
    }
}

// ==========================================
// TIJD
// ==========================================

function updateTime() {

    worldTime += 0.0015;

    if (
        worldTime >
        Math.PI * 2
    ) {

        worldTime = 0;
    }
}

// ==========================================
// GROND TEKENEN
// ==========================================

function drawGround() {

    ctx.fillStyle = "#18351f";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const gridSize = 50;

    const startX =
        -camera.x % gridSize;

    const startY =
        -camera.y % gridSize;

    ctx.strokeStyle =
        "rgba(255,255,255,0.025)";

    ctx.lineWidth = 1;

    for (
        let x = startX;
        x < canvas.width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);

        ctx.stroke();
    }

    for (
        let y = startY;
        y < canvas.height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);

        ctx.stroke();
    }
}

// ==========================================
// OBJECT TEKENEN
// ==========================================

function drawObject(object) {

    if (!object.alive) return;

    const x =
        object.x - camera.x;

    const y =
        object.y - camera.y;

    // ======================================
    // BOOM
    // ======================================

    if (object.type === "tree") {

        // Schaduw
        ctx.fillStyle =
            "rgba(0,0,0,0.25)";

        ctx.beginPath();

        ctx.ellipse(
            x,
            y + 18,
            25,
            12,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();

        // Stam
        ctx.fillStyle = "#70452a";

        ctx.fillRect(
            x - 7,
            y - 3,
            14,
            30
        );

        // Bladeren
        ctx.fillStyle = "#26733a";

        ctx.beginPath();

        ctx.arc(
            x,
            y - 12,
            25,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#338c48";

        ctx.beginPath();

        ctx.arc(
            x - 10,
            y - 18,
            15,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#1d5f31";

        ctx.beginPath();

        ctx.arc(
            x + 12,
            y - 14,
            14,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    // ======================================
    // STEEN
    // ======================================

    if (object.type === "stone") {

        ctx.fillStyle = "#777";

        ctx.beginPath();

        ctx.moveTo(x - 18, y + 8);
        ctx.lineTo(x - 12, y - 12);
        ctx.lineTo(x + 5, y - 18);
        ctx.lineTo(x + 20, y - 5);
        ctx.lineTo(x + 13, y + 14);
        ctx.lineTo(x - 8, y + 17);

        ctx.closePath();

        ctx.fill();

        ctx.strokeStyle = "#aaa";

        ctx.stroke();
    }

    // ======================================
    // ERTS
    // ======================================

    if (object.type === "ore") {

        ctx.fillStyle = "#454545";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            18,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#d58b35";

        ctx.fillRect(
            x - 9,
            y - 5,
            6,
            6
        );

        ctx.fillRect(
            x + 2,
            y + 4,
            7,
            5
        );

        ctx.fillRect(
            x + 5,
            y - 9,
            5,
            5
        );
    }

    // ======================================
    // KRISTAL
    // ======================================

    if (object.type === "crystal") {

        ctx.fillStyle = "#7ee7ff";

        ctx.beginPath();

        ctx.moveTo(x, y - 22);
        ctx.lineTo(x + 12, y);
        ctx.lineTo(x + 4, y + 20);
        ctx.lineTo(x - 8, y + 12);
        ctx.lineTo(x - 13, y - 5);

        ctx.closePath();

        ctx.fill();

        ctx.strokeStyle = "#d8fbff";

        ctx.stroke();
    }

    // ======================================
    // BOUWBLOK
    // ======================================

    if (object.type === "block") {

        const size = 40;

        // Schaduw
        ctx.fillStyle =
            "rgba(0,0,0,0.3)";

        ctx.fillRect(
            x - 15,
            y - 15,
            size,
            size
        );

        // Blok
        ctx.fillStyle = "#8a6544";

        ctx.fillRect(
            x - 20,
            y - 20,
            size,
            size
        );

        // Bovenkant
        ctx.fillStyle = "#b58a5c";

        ctx.fillRect(
            x - 20,
            y - 20,
            size,
            8
        );

        // Rand
        ctx.strokeStyle = "#5d402b";
        ctx.lineWidth = 2;

        ctx.strokeRect(
            x - 20,
            y - 20,
            size,
            size
        );

        // Middenlijn
        ctx.beginPath();

        ctx.moveTo(
            x - 20,
            y
        );

        ctx.lineTo(
            x + 20,
            y
        );

        ctx.stroke();
    }
}

// ==========================================
// VIJAND TEKENEN
// ==========================================

function drawEnemy(enemy) {

    const x =
        enemy.x - camera.x;

    const y =
        enemy.y - camera.y;

    // Schaduw
    ctx.fillStyle =
        "rgba(0,0,0,0.3)";

    ctx.beginPath();

    ctx.ellipse(
        x,
        y + 14,
        17,
        8,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Lichaam
    ctx.fillStyle = "#8c3f8f";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        enemy.size,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Ogen
    ctx.fillStyle = "white";

    ctx.beginPath();

    ctx.arc(
        x - 7,
        y - 4,
        4,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 7,
        y - 4,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Pupillen
    ctx.fillStyle = "#111";

    ctx.beginPath();

    ctx.arc(
        x - 7,
        y - 4,
        2,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 7,
        y - 4,
        2,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Healthbar
    ctx.fillStyle = "#222";

    ctx.fillRect(
        x - 18,
        y - 31,
        36,
        5
    );

    ctx.fillStyle = "#e74c3c";

    ctx.fillRect(
        x - 18,
        y - 31,
        36 *
        Math.max(
            0,
            enemy.health / 30
        ),
        5
    );
}

// ==========================================
// SPELER TEKENEN
// ==========================================

function drawPlayer() {

    const x =
        player.x - camera.x;

    const y =
        player.y - camera.y;

    // Schaduw
    ctx.fillStyle =
        "rgba(0,0,0,0.35)";

    ctx.beginPath();

    ctx.ellipse(
        x,
        y + 12,
        18,
        9,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Lichaam
    ctx.fillStyle = "#3d8cff";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        player.size,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Rand
    ctx.strokeStyle = "#b9dcff";
    ctx.lineWidth = 2;

    ctx.stroke();

    // Hoofd
    ctx.fillStyle = "#ffd0a6";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 5,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();

    // Pet / haar
    ctx.fillStyle = "#222";

    ctx.fillRect(
        x - 6,
        y - 14,
        12,
        5
    );
}

// ==========================================
// BOUWPREVIEW
// ==========================================

function drawBuildPreview() {

    if (!buildMode) return;

    if (inventory.block <= 0) return;

    const grid = 40;

    const x =
        Math.round(
            mouseWorldX / grid
        ) * grid;

    const y =
        Math.round(
            mouseWorldY / grid
        ) * grid;

    const screenX =
        x - camera.x;

    const screenY =
        y - camera.y;

    let canBuild = true;

    if (
        distance(
            player.x,
            player.y,
            x,
            y
        ) > 220
    ) {
        canBuild = false;
    }

    if (
        distance(
            player.x,
            player.y,
            x,
            y
        ) < 45
    ) {
        canBuild = false;
    }

    for (const object of objects) {

        if (!object.alive) continue;

        if (
            distance(
                object.x,
                object.y,
                x,
                y
            ) < 35
        ) {

            canBuild = false;
            break;
        }
    }

    ctx.globalAlpha = 0.45;

    ctx.fillStyle =
        canBuild
            ? "#c8945c"
            : "#d34b4b";

    ctx.fillRect(
        screenX - 20,
        screenY - 20,
        40,
        40
    );

    ctx.globalAlpha = 1;

    ctx.strokeStyle =
        canBuild
            ? "white"
            : "#ffaaaa";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        screenX - 20,
        screenY - 20,
        40,
        40
    );
}

// ==========================================
// DAG / NACHT
// ==========================================

function drawDayNight() {

    const darkness =
        (Math.sin(worldTime) + 1) / 2;

    const alpha =
        darkness * 0.4;

    ctx.fillStyle =
        "rgba(5,10,35," +
        alpha +
        ")";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}

// ==========================================
// TEKENEN
// ==========================================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawGround();

    // Objecten
    for (const object of objects) {
        drawObject(object);
    }

    // Vijanden
    for (const enemy of enemies) {
        drawEnemy(enemy);
    }

    // Speler
    drawPlayer();

    // Bouwpreview
    drawBuildPreview();

    // Nacht
    drawDayNight();
}

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop() {

    if (!gameRunning) return;

    if (gameEnded) return;

    movePlayer();

    updateEnemies();

    updateCamera();

    updateTime();

    if (messageTimer > 0) {

        messageTimer--;

        if (
            messageTimer <= 0 &&
            message
        ) {

            message.style.opacity =
                "0";
        }
    }

    draw();

    requestAnimationFrame(
        gameLoop
    );
}

// ==========================================
// CRAFTING
// ==========================================

craftButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                // JUISTE HTML:
                // data-craft="..."

                const item =
                    button.dataset.craft;

                // --------------------------
                // BIJL
                // --------------------------

                if (item === "axe") {

                    if (inventory.axe) {

                        showMessage(
                            "Je hebt al een bijl."
                        );

                        return;
                    }

                    if (
                        inventory.wood >= 8 &&
                        inventory.stone >= 4
                    ) {

                        inventory.wood -= 8;
                        inventory.stone -= 4;

                        inventory.axe = true;

                        showMessage(
                            "🪓 Bijl gemaakt!"
                        );

                    } else {

                        showMessage(
                            "Je hebt 8 hout + 4 steen nodig."
                        );
                    }
                }

                // --------------------------
                // PIKHOUWEEL
                // --------------------------

                if (item === "pickaxe") {

                    if (inventory.pickaxe) {

                        showMessage(
                            "Je hebt al een pikhouweel."
                        );

                        return;
                    }

                    if (
                        inventory.stone >= 10 &&
                        inventory.ore >= 5
                    ) {

                        inventory.stone -= 10;
                        inventory.ore -= 5;

                        inventory.pickaxe = true;

                        showMessage(
                            "⛏️ Pikhouweel gemaakt!"
                        );

                    } else {

                        showMessage(
                            "Je hebt 10 steen + 5 erts nodig."
                        );
                    }
                }

                // --------------------------
                // LANTAARN
                // --------------------------

                if (item === "lantern") {

                    if (inventory.lantern) {

                        showMessage(
                            "Je hebt al een lantaarn."
                        );

                        return;
                    }

                    if (
                        inventory.wood >= 5 &&
                        inventory.ore >= 2
                    ) {

                        inventory.wood -= 5;
                        inventory.ore -= 2;

                        inventory.lantern = true;

                        showMessage(
                            "🏮 Lantaarn gemaakt!"
                        );

                    } else {

                        showMessage(
                            "Je hebt 5 hout + 2 erts nodig."
                        );
                    }
                }

                // --------------------------
                // BOUWBLOK
                // --------------------------

                if (item === "block") {

                    if (
                        inventory.wood >= 5 &&
                        inventory.stone >= 5
                    ) {

                        inventory.wood -= 5;
                        inventory.stone -= 5;

                        inventory.block++;

                        showMessage(
                            "🧱 Bouwblok gemaakt! Druk B."
                        );

                    } else {

                        showMessage(
                            "Je hebt 5 hout + 5 steen nodig."
                        );
                    }
                }

                updateUI();
            }
        );
    }
);

// ==========================================
// START KNOP
// ==========================================

if (startButton) {

    startButton.addEventListener(
        "click",
        startGame
    );
}

// ==========================================
// OPNIEUW KNOP
// ==========================================

if (restartButton) {

    restartButton.addEventListener(
        "click",
        restartGame
    );
}

// ==========================================
// BEGINSTATUS
// ==========================================

if (game) {
    game.style.display = "none";
}

if (menu) {
    menu.style.display = "flex";
}

if (gameOverScreen) {
    gameOverScreen.style.display = "none";
}

if (crafting) {
    crafting.style.display = "none";
}

updateUI();

console.log(
    "MINVORA app.js is geladen!"
);

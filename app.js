// ========================================
// MINVORA - APP.JS
// Top-down survival / mining / crafting game
// ========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startMenu = document.getElementById("startMenu");
const game = document.getElementById("game");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const woodText = document.getElementById("wood");
const stoneText = document.getElementById("stone");
const oreText = document.getElementById("ore");
const crystalText = document.getElementById("crystal");
const blockText = document.getElementById("block");

const healthBar = document.getElementById("health");
const healthText = document.getElementById("healthText");

const message = document.getElementById("message");
const info = document.getElementById("info");

const craftButtons = document.querySelectorAll(".craftButton");

// ========================================
// CANVAS
// ========================================

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ========================================
// SPELER
// ========================================

const player = {
    x: 1500,
    y: 1500,
    size: 18,
    speed: 3.2,
    health: 100,
    maxHealth: 100
};

// ========================================
// INVENTORY
// ========================================

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

// ========================================
// WERELD
// ========================================

const world = {
    width: 3000,
    height: 3000
};

let objects = [];
let enemies = [];

let gameRunning = false;
let gameOver = false;

let keys = {};

let camera = {
    x: 0,
    y: 0
};

// ========================================
// BOUWMODUS
// ========================================

let buildMode = false;

let mouseX = 0;
let mouseY = 0;

let mouseWorldX = 0;
let mouseWorldY = 0;

// ========================================
// DAG / NACHT
// ========================================

let dayTime = 0;

// ========================================
// MESSAGE
// ========================================

let messageTimer = 0;

function showMessage(text) {
    if (!message) return;

    message.textContent = text;
    message.style.opacity = "1";

    messageTimer = 180;
}

// ========================================
// RANDOM GETAL
// ========================================

function random(min, max) {
    return Math.random() * (max - min) + min;
}

// ========================================
// AFSTAND
// ========================================

function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

// ========================================
// WERELD MAKEN
// ========================================

function createWorld() {
    objects = [];
    enemies = [];

    // ----------------------------
    // BOMEN
    // ----------------------------

    for (let i = 0; i < 130; i++) {
        let x = random(80, world.width - 80);
        let y = random(80, world.height - 80);

        if (distance(x, y, player.x, player.y) < 250) {
            i--;
            continue;
        }

        objects.push({
            type: "tree",
            x: x,
            y: y,
            size: 35,
            hp: 3,
            maxHp: 3,
            alive: true
        });
    }

    // ----------------------------
    // STENEN
    // ----------------------------

    for (let i = 0; i < 100; i++) {
        let x = random(60, world.width - 60);
        let y = random(60, world.height - 60);

        if (distance(x, y, player.x, player.y) < 250) {
            i--;
            continue;
        }

        objects.push({
            type: "stone",
            x: x,
            y: y,
            size: 28,
            hp: 2,
            maxHp: 2,
            alive: true
        });
    }

    // ----------------------------
    // ERTS
    // ----------------------------

    for (let i = 0; i < 70; i++) {
        let x = random(60, world.width - 60);
        let y = random(60, world.height - 60);

        objects.push({
            type: "ore",
            x: x,
            y: y,
            size: 25,
            hp: 2,
            maxHp: 2,
            alive: true
        });
    }

    // ----------------------------
    // KRISTALLEN
    // ----------------------------

    for (let i = 0; i < 35; i++) {
        let x = random(70, world.width - 70);
        let y = random(70, world.height - 70);

        objects.push({
            type: "crystal",
            x: x,
            y: y,
            size: 22,
            hp: 1,
            maxHp: 1,
            alive: true
        });
    }

    // ----------------------------
    // VIJANDEN
    // ----------------------------

    for (let i = 0; i < 18; i++) {
        let x = random(200, world.width - 200);
        let y = random(200, world.height - 200);

        if (distance(x, y, player.x, player.y) < 500) {
            i--;
            continue;
        }

        enemies.push({
            x: x,
            y: y,
            size: 22,
            speed: random(0.4, 0.8),
            health: 30,
            attackCooldown: 0
        });
    }
}

// ========================================
// INVENTORY RESETTEN
// ========================================

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

// ========================================
// UI
// ========================================

function updateUI() {
    if (woodText) woodText.textContent = inventory.wood;
    if (stoneText) stoneText.textContent = inventory.stone;
    if (oreText) oreText.textContent = inventory.ore;
    if (crystalText) crystalText.textContent = inventory.crystal;
    if (blockText) blockText.textContent = inventory.block;

    if (healthBar) {
        const healthPercent =
            Math.max(0, player.health / player.maxHealth * 100);

        healthBar.style.width = healthPercent + "%";
    }

    if (healthText) {
        healthText.textContent =
            Math.max(0, Math.floor(player.health)) + " / " + player.maxHealth;
    }

    if (info) {
        if (buildMode) {
            info.textContent =
                "BOUWMODUS: klik om een blok te plaatsen • B = stoppen";
        } else {
            info.textContent =
                "WASD = bewegen • Klik = verzamelen • B = bouwen • E = crafting";
        }
    }
}

// ========================================
// START GAME
// ========================================

function startGame() {
    gameRunning = true;
    gameOver = false;

    player.x = world.width / 2;
    player.y = world.height / 2;
    player.health = player.maxHealth;

    resetInventory();
    createWorld();

    buildMode = false;

    if (startMenu) {
        startMenu.style.display = "none";
    }

    if (game) {
        game.style.display = "block";
    }

    updateUI();

    showMessage("Welkom in Minvora!");

    requestAnimationFrame(gameLoop);
}

// ========================================
// GAME OVER
// ========================================

function endGame() {
    gameRunning = false;
    gameOver = true;

    buildMode = false;

    const gameOverScreen =
        document.getElementById("gameOver");

    if (gameOverScreen) {
        gameOverScreen.style.display = "flex";
    }

    showMessage("Je bent verslagen!");
}

// ========================================
// RESTART
// ========================================

function restartGame() {
    const gameOverScreen =
        document.getElementById("gameOver");

    if (gameOverScreen) {
        gameOverScreen.style.display = "none";
    }

    startGame();
}

// ========================================
// TOETSEN
// ========================================

window.addEventListener("keydown", function (event) {

    keys[event.key.toLowerCase()] = true;

    // B = bouwmodus
    if (event.key.toLowerCase() === "b" && gameRunning) {
        buildMode = !buildMode;

        if (buildMode) {
            showMessage("Bouwmodus aan! Klik waar je een blok wilt plaatsen.");
        } else {
            showMessage("Bouwmodus uit.");
        }

        updateUI();
    }

    // E = crafting
    if (event.key.toLowerCase() === "e" && gameRunning) {
        const crafting =
            document.getElementById("crafting");

        if (crafting) {

            if (
                crafting.style.display === "none" ||
                crafting.style.display === ""
            ) {
                crafting.style.display = "block";
            } else {
                crafting.style.display = "none";
            }
        }
    }
});

window.addEventListener("keyup", function (event) {
    keys[event.key.toLowerCase()] = false;
});

// ========================================
// SPELER BEWEGEN
// ========================================

function movePlayer() {

    let dx = 0;
    let dy = 0;

    if (keys["w"]) dy -= 1;
    if (keys["s"]) dy += 1;
    if (keys["a"]) dx -= 1;
    if (keys["d"]) dx += 1;

    // Diagonaal niet sneller maken
    if (dx !== 0 || dy !== 0) {

        const length = Math.hypot(dx, dy);

        dx /= length;
        dy /= length;

        player.x += dx * player.speed;
        player.y += dy * player.speed;
    }

    // Binnen de wereld houden
    player.x = Math.max(
        player.size,
        Math.min(world.width - player.size, player.x)
    );

    player.y = Math.max(
        player.size,
        Math.min(world.height - player.size, player.y)
    );
}

// ========================================
// CAMERA
// ========================================

function updateCamera() {

    camera.x =
        player.x - canvas.width / 2;

    camera.y =
        player.y - canvas.height / 2;

    camera.x = Math.max(
        0,
        Math.min(world.width - canvas.width, camera.x)
    );

    camera.y = Math.max(
        0,
        Math.min(world.height - canvas.height, camera.y)
    );
}

// ========================================
// MUIS
// ========================================

canvas.addEventListener("mousemove", function (event) {

    const rect = canvas.getBoundingClientRect();

    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    mouseWorldX = mouseX + camera.x;
    mouseWorldY = mouseY + camera.y;
});

// ========================================
// KLIKKEN
// ========================================

canvas.addEventListener("click", function () {

    if (!gameRunning || gameOver) return;

    // ------------------------------------
    // BOUWMODUS
    // ------------------------------------

    if (buildMode) {
        placeBlock(mouseWorldX, mouseWorldY);
        return;
    }

    // ------------------------------------
    // NORMALE VERZAMELMODUS
    // ------------------------------------

    collectObject(mouseWorldX, mouseWorldY);
});

// ========================================
// BLOK PLAATSEN
// ========================================

function placeBlock(x, y) {

    if (inventory.block <= 0) {
        showMessage("Je hebt geen bouwblokken!");
        return;
    }

    const buildDistance =
        distance(player.x, player.y, x, y);

    if (buildDistance > 220) {
        showMessage("Dat is te ver weg!");
        return;
    }

    // Raster
    const grid = 40;

    const snappedX =
        Math.round(x / grid) * grid;

    const snappedY =
        Math.round(y / grid) * grid;

    // Niet bovenop de speler bouwen
    if (
        distance(
            player.x,
            player.y,
            snappedX,
            snappedY
        ) < 45
    ) {
        showMessage("Je kunt hier niet bouwen.");
        return;
    }

    // Controleren of er al iets staat
    for (const object of objects) {

        if (!object.alive) continue;

        if (
            distance(
                object.x,
                object.y,
                snappedX,
                snappedY
            ) < 35
        ) {
            showMessage("Hier staat al iets.");
            return;
        }
    }

    // Blok toevoegen
    objects.push({
        type: "block",
        x: snappedX,
        y: snappedY,
        size: 40,
        hp: 9999,
        maxHp: 9999,
        alive: true
    });

    inventory.block--;

    updateUI();

    showMessage("Bouwblok geplaatst!");
}

// ========================================
// OBJECT VERZAMELEN
// ========================================

function collectObject(x, y) {

    let closest = null;
    let closestDistance = Infinity;

    for (const object of objects) {

        if (!object.alive) continue;

        if (object.type === "block") continue;

        const d =
            distance(player.x, player.y, object.x, object.y);

        if (d > 130) continue;

        const clickDistance =
            distance(x, y, object.x, object.y);

        if (clickDistance < closestDistance) {

            closest = object;
            closestDistance = clickDistance;
        }
    }

    // Vijanden controleren
    for (const enemy of enemies) {

        const d =
            distance(player.x, player.y, enemy.x, enemy.y);

        if (d <= 130) {

            const clickDistance =
                distance(x, y, enemy.x, enemy.y);

            if (clickDistance < closestDistance) {

                enemy.health -= 10;

                showMessage("Je valt de vijand aan!");

                if (enemy.health <= 0) {

                    enemies.splice(
                        enemies.indexOf(enemy),
                        1
                    );

                    showMessage("Vijand verslagen!");
                }

                return;
            }
        }
    }

    if (!closest) {
        showMessage("Niets dichtbij.");
        return;
    }

    closest.hp--;

    // ------------------------------------
    // BOOM
    // ------------------------------------

    if (closest.type === "tree") {

        const amount =
            inventory.axe ? 5 : 3;

        inventory.wood += amount;

        showMessage(
            "+" + amount + " hout"
        );
    }

    // ------------------------------------
    // STEEN
    // ------------------------------------

    if (closest.type === "stone") {

        const amount =
            inventory.pickaxe ? 4 : 2;

        inventory.stone += amount;

        showMessage(
            "+" + amount + " steen"
        );
    }

    // ------------------------------------
    // ERTS
    // ------------------------------------

    if (closest.type === "ore") {

        const amount =
            inventory.pickaxe ? 4 : 2;

        inventory.ore += amount;

        showMessage(
            "+" + amount + " erts"
        );
    }

    // ------------------------------------
    // KRISTAL
    // ------------------------------------

    if (closest.type === "crystal") {

        inventory.crystal++;

        showMessage("+1 kristal");
    }

    if (closest.hp <= 0) {
        closest.alive = false;
    }

    updateUI();
}

// ========================================
// RECHTSKLIK = BLOK VERWIJDEREN
// ========================================

canvas.addEventListener("contextmenu", function (event) {

    event.preventDefault();

    if (!gameRunning) return;

    if (!buildMode) return;

    const rect = canvas.getBoundingClientRect();

    const x =
        event.clientX - rect.left + camera.x;

    const y =
        event.clientY - rect.top + camera.y;

    let found = null;

    for (const object of objects) {

        if (!object.alive) continue;

        if (object.type !== "block") continue;

        if (
            distance(
                x,
                y,
                object.x,
                object.y
            ) < 30
        ) {
            found = object;
            break;
        }
    }

    if (!found) return;

    if (
        distance(
            player.x,
            player.y,
            found.x,
            found.y
        ) > 220
    ) {
        showMessage("Dit blok is te ver weg.");
        return;
    }

    found.alive = false;

    inventory.block++;

    updateUI();

    showMessage("Bouwblok teruggepakt!");
});

// ========================================
// VIJANDEN
// ========================================

function updateEnemies() {

    for (const enemy of enemies) {

        const d =
            distance(
                enemy.x,
                enemy.y,
                player.x,
                player.y
            );

        // Vijand volgt speler
        if (d < 450 && d > 35) {

            const dx =
                (player.x - enemy.x) / d;

            const dy =
                (player.y - enemy.y) / d;

            enemy.x += dx * enemy.speed;
            enemy.y += dy * enemy.speed;
        }

        // Aanvallen
        if (d < 35) {

            if (enemy.attackCooldown <= 0) {

                player.health -= 5;

                enemy.attackCooldown = 50;

                updateUI();

                showMessage("-5 gezondheid");

                if (player.health <= 0) {
                    player.health = 0;
                    updateUI();
                    endGame();
                }
            }
        }

        if (enemy.attackCooldown > 0) {
            enemy.attackCooldown--;
        }
    }
}

// ========================================
// DAG / NACHT
// ========================================

function updateDayNight() {
    dayTime += 0.0015;

    if (dayTime > Math.PI * 2) {
        dayTime = 0;
    }
}

// ========================================
// GROND TEKENEN
// ========================================

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

    ctx.strokeStyle = "rgba(255,255,255,0.025)";
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

// ========================================
// OBJECTEN TEKENEN
// ========================================

function drawObject(object) {

    if (!object.alive) return;

    const x =
        object.x - camera.x;

    const y =
        object.y - camera.y;

    // Buiten beeld
    if (
        x < -100 ||
        x > canvas.width + 100 ||
        y < -100 ||
        y > canvas.height + 100
    ) {
        return;
    }

    // ====================================
    // BOOM
    // ====================================

    if (object.type === "tree") {

        // Schaduw
        ctx.fillStyle = "rgba(0,0,0,0.25)";

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

    // ====================================
    // STEEN
    // ====================================

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

    // ====================================
    // ERTS
    // ====================================

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

        ctx.fillRect(x - 9, y - 5, 6, 6);
        ctx.fillRect(x + 2, y + 4, 7, 5);
        ctx.fillRect(x + 5, y - 9, 5, 5);
    }

    // ====================================
    // KRISTAL
    // ====================================

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

    // ====================================
    // BOUWBLOK
    // ====================================

    if (object.type === "block") {

        const size = object.size;

        // Schaduw
        ctx.fillStyle = "rgba(0,0,0,0.3)";

        ctx.fillRect(
            x - size / 2 + 5,
            y - size / 2 + 5,
            size,
            size
        );

        // Blok
        ctx.fillStyle = "#8a6544";

        ctx.fillRect(
            x - size / 2,
            y - size / 2,
            size,
            size
        );

        // Bovenkant
        ctx.fillStyle = "#b58a5c";

        ctx.fillRect(
            x - size / 2,
            y - size / 2,
            size,
            8
        );

        // Baksteenlijnen
        ctx.strokeStyle = "#65452e";
        ctx.lineWidth = 2;

        ctx.strokeRect(
            x - size / 2,
            y - size / 2,
            size,
            size
        );

        ctx.beginPath();

        ctx.moveTo(x - size / 2, y);
        ctx.lineTo(x + size / 2, y);

        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(x, y - size / 2);
        ctx.lineTo(x, y);

        ctx.stroke();
    }
}

// ========================================
// VIJAND TEKENEN
// ========================================

function drawEnemy(enemy) {

    const x =
        enemy.x - camera.x;

    const y =
        enemy.y - camera.y;

    if (
        x < -50 ||
        x > canvas.width + 50 ||
        y < -50 ||
        y > canvas.height + 50
    ) {
        return;
    }

    // Schaduw
    ctx.fillStyle = "rgba(0,0,0,0.3)";

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

    // Vijand
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
    ctx.fillStyle = "#fff";

    ctx.beginPath();
    ctx.arc(x - 7, y - 4, 4, 0, Math.PI * 2);
    ctx.arc(x + 7, y - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#111";

    ctx.beginPath();
    ctx.arc(x - 7, y - 4, 2, 0, Math.PI * 2);
    ctx.arc(x + 7, y - 4, 2, 0, Math.PI * 2);
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
        36 * (enemy.health / 30),
        5
    );
}

// ========================================
// SPELER TEKENEN
// ========================================

function drawPlayer() {

    const x =
        player.x - camera.x;

    const y =
        player.y - camera.y;

    // Schaduw
    ctx.fillStyle = "rgba(0,0,0,0.35)";

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

    // Richting
    ctx.fillStyle = "#222";

    ctx.fillRect(
        x - 3,
        y - 19,
        6,
        7
    );
}

// ========================================
// BOUWPREVIEW
// ========================================

function drawBuildPreview() {

    if (!buildMode) return;

    if (inventory.block <= 0) return;

    const grid = 40;

    const snappedX =
        Math.round(mouseWorldX / grid) * grid;

    const snappedY =
        Math.round(mouseWorldY / grid) * grid;

    const screenX =
        snappedX - camera.x;

    const screenY =
        snappedY - camera.y;

    const d =
        distance(
            player.x,
            player.y,
            snappedX,
            snappedY
        );

    let canBuild = true;

    if (d > 220) {
        canBuild = false;
    }

    if (
        d < 45
    ) {
        canBuild = false;
    }

    for (const object of objects) {

        if (!object.alive) continue;

        if (
            distance(
                object.x,
                object.y,
                snappedX,
                snappedY
            ) < 35
        ) {
            canBuild = false;
            break;
        }
    }

    ctx.globalAlpha = 0.45;

    ctx.fillStyle =
        canBuild ? "#c8945c" : "#d34b4b";

    ctx.fillRect(
        screenX - 20,
        screenY - 20,
        40,
        40
    );

    ctx.globalAlpha = 1;

    ctx.strokeStyle =
        canBuild ? "#fff" : "#ffaaaa";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        screenX - 20,
        screenY - 20,
        40,
        40
    );
}

// ========================================
// DAG/NACHT EFFECT
// ========================================

function drawDayNight() {

    const darkness =
        (Math.sin(dayTime) + 1) / 2;

    const alpha =
        darkness * 0.45;

    ctx.fillStyle =
        "rgba(10,15,40," + alpha + ")";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}

// ========================================
// GAME TEKENEN
// ========================================

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

// ========================================
// GAME LOOP
// ========================================

function gameLoop() {

    if (!gameRunning || gameOver) return;

    movePlayer();

    updateEnemies();

    updateCamera();

    updateDayNight();

    if (messageTimer > 0) {

        messageTimer--;

        if (
            messageTimer <= 0 &&
            message
        ) {
            message.style.opacity = "0";
        }
    }

    draw();

    requestAnimationFrame(gameLoop);
}

// ========================================
// CRAFTING
// ========================================

craftButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const item =
            button.dataset.item;

        // AXE
        if (item === "axe") {

            if (inventory.axe) {
                showMessage("Je hebt al een bijl.");
                return;
            }

            if (
                inventory.wood >= 8 &&
                inventory.stone >= 4
            ) {

                inventory.wood -= 8;
                inventory.stone -= 4;

                inventory.axe = true;

                showMessage("Bijl gemaakt!");
            } else {
                showMessage(
                    "Je hebt 8 hout en 4 steen nodig."
                );
            }
        }

        // PICKAXE
        if (item === "pickaxe") {

            if (inventory.pickaxe) {
                showMessage("Je hebt al een pikhouweel.");
                return;
            }

            if (
                inventory.stone >= 10 &&
                inventory.ore >= 5
            ) {

                inventory.stone -= 10;
                inventory.ore -= 5;

                inventory.pickaxe = true;

                showMessage("Pikhouweel gemaakt!");
            } else {
                showMessage(
                    "Je hebt 10 steen en 5 erts nodig."
                );
            }
        }

        // LANTAARN
        if (item === "lantern") {

            if (inventory.lantern) {
                showMessage("Je hebt al een lantaarn.");
                return;
            }

            if (
                inventory.wood >= 5 &&
                inventory.ore >= 2
            ) {

                inventory.wood -= 5;
                inventory.ore -= 2;

                inventory.lantern = true;

                showMessage("Lantaarn gemaakt!");
            } else {
                showMessage(
                    "Je hebt 5 hout en 2 erts nodig."
                );
            }
        }

        // BOUWBLOK
        if (item === "block") {

            if (
                inventory.wood >= 5 &&
                inventory.stone >= 5
            ) {

                inventory.wood -= 5;
                inventory.stone -= 5;

                inventory.block++;

                showMessage(
                    "Bouwblok gemaakt! Druk op B om te bouwen."
                );
            } else {
                showMessage(
                    "Je hebt 5 hout en 5 steen nodig."
                );
            }
        }

        updateUI();
    });
});

// ========================================
// START BUTTON
// ========================================

if (startButton) {
    startButton.addEventListener(
        "click",
        startGame
    );
}

// ========================================
// RESTART BUTTON
// ========================================

if (restartButton) {
    restartButton.addEventListener(
        "click",
        restartGame
    );
}

// ========================================
// STARTSTATUS
// ========================================

if (game) {
    game.style.display = "none";
}

if (startMenu) {
    startMenu.style.display = "flex";
}

updateUI();

console.log("Minvora geladen!");

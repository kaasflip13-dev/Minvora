// ==========================================
// MINVORA
// SURVIVAL • MINING • CRAFTING • BUILDING
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
const machineText = document.getElementById("machine");

const healthBar = document.getElementById("health");
const healthText = document.getElementById("healthText");

const info = document.getElementById("info");
const message = document.getElementById("message");

const crafting = document.getElementById("crafting");
const craftButtons = document.querySelectorAll(".craftButton");

// ==========================================
// CANVAS
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
    machine: 0,

    axe: false,
    pickaxe: false,
    lantern: false,

    furnace: 0,
    workbench: 0,
    miner: 0,
    generator: 0
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

// Wat bouwen?
let selectedBuild = null;

// Muis
let mouseX = 0;
let mouseY = 0;

let mouseWorldX = 0;
let mouseWorldY = 0;

// ==========================================
// TIJD
// ==========================================

let worldTime = 0;

// ==========================================
// MESSAGE
// ==========================================

let messageTimer = 0;

function showMessage(text) {

    if (!message) return;

    message.textContent = text;
    message.style.opacity = "1";

    messageTimer = 180;
}

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
// INVENTORY RESET
// ==========================================

function resetInventory() {

    inventory.wood = 0;
    inventory.stone = 0;
    inventory.ore = 0;
    inventory.crystal = 0;

    inventory.block = 0;
    inventory.machine = 0;

    inventory.axe = false;
    inventory.pickaxe = false;
    inventory.lantern = false;

    inventory.furnace = 0;
    inventory.workbench = 0;
    inventory.miner = 0;
    inventory.generator = 0;
}

// ==========================================
// UI
// ==========================================

function updateUI() {

    if (woodText)
        woodText.textContent = inventory.wood;

    if (stoneText)
        stoneText.textContent = inventory.stone;

    if (oreText)
        oreText.textContent = inventory.ore;

    if (crystalText)
        crystalText.textContent = inventory.crystal;

    if (blockText)
        blockText.textContent = inventory.block;

    if (machineText)
        machineText.textContent = inventory.machine;

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
            ) +
            " / " +
            player.maxHealth;
    }

    if (info) {

        if (buildMode) {

            let selectedText =
                selectedBuild
                    ? selectedBuild.toUpperCase()
                    : "NIETS";

            info.innerHTML =
                "BOUWMODUS: " +
                selectedText +
                "<br>" +
                "Klik = plaatsen<br>" +
                "B = stoppen";

        } else {

            info.innerHTML =
                "WASD = bewegen<br>" +
                "Klik = verzamelen<br>" +
                "E = bouwmenu<br>" +
                "B = bouwen";
        }
    }
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
            alive: true,
            solid: true
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
            alive: true,
            solid: true
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
            alive: true,
            solid: true
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
            alive: true,
            solid: true
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
// START GAME
// ==========================================

function startGame() {

    gameRunning = true;
    gameEnded = false;

    player.x = world.width / 2;
    player.y = world.height / 2;

    player.health = 100;

    resetInventory();

    objects = [];
    enemies = [];

    buildMode = false;
    selectedBuild = null;

    createWorld();

    if (menu)
        menu.style.display = "none";

    if (game)
        game.style.display = "block";

    if (gameOverScreen)
        gameOverScreen.style.display = "none";

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
    selectedBuild = null;

    if (gameOverScreen)
        gameOverScreen.style.display = "flex";

    showMessage("GAME OVER");
}

// ==========================================
// RESTART
// ==========================================

function restartGame() {

    if (gameOverScreen)
        gameOverScreen.style.display = "none";

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

        // B = bouwmodus
        if (
            key === "b" &&
            gameRunning
        ) {

            buildMode = !buildMode;

            if (buildMode) {

                showMessage(
                    "Bouwmodus aan! Kies iets uit het menu."
                );

            } else {

                selectedBuild = null;

                showMessage(
                    "Bouwmodus uit."
                );
            }

            updateUI();
        }

        // E = bouwmenu
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
// COLLISION MET GEBOUWEN
// ==========================================

function isBlocked(x, y, radius) {

    for (const object of objects) {

        if (!object.alive) continue;

        if (!object.solid) continue;

        const objectRadius =
            object.type === "block"
                ? 20
                : object.type === "machine"
                    ? 24
                    : object.size / 2;

        const d =
            distance(
                x,
                y,
                object.x,
                object.y
            );

        if (
            d <
            radius + objectRadius
        ) {
            return true;
        }
    }

    return false;
}

// ==========================================
// SPELER BEWEGEN
// ==========================================

function movePlayer() {

    let dx = 0;
    let dy = 0;

    if (keys["w"])
        dy--;

    if (keys["s"])
        dy++;

    if (keys["a"])
        dx--;

    if (keys["d"])
        dx++;

    if (dx !== 0 || dy !== 0) {

        const length =
            Math.hypot(dx, dy);

        dx /= length;
        dy /= length;

        const nextX =
            player.x +
            dx * player.speed;

        const nextY =
            player.y +
            dy * player.speed;

        // Horizontale beweging
        if (
            !isBlocked(
                nextX,
                player.y,
                player.size
            )
        ) {
            player.x = nextX;
        }

        // Verticale beweging
        if (
            !isBlocked(
                player.x,
                nextY,
                player.size
            )
        ) {
            player.y = nextY;
        }
    }

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
// MUIS
// ==========================================

canvas.addEventListener(
    "mousemove",
    function(event) {

        const rect =
            canvas.getBoundingClientRect();

        mouseX =
            event.clientX -
            rect.left;

        mouseY =
            event.clientY -
            rect.top;

        mouseWorldX =
            mouseX + camera.x;

        mouseWorldY =
            mouseY + camera.y;
    }
);

// ==========================================
// KLIKKEN
// ==========================================

canvas.addEventListener(
    "click",
    function() {

        if (!gameRunning)
            return;

        if (buildMode) {

            placeSelectedObject(
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
// MACHINE / BLOK PLAATSEN
// ==========================================

function placeSelectedObject(x, y) {

    if (!selectedBuild) {

        showMessage(
            "Kies eerst iets in het bouwmenu."
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

    if (d < 50) {

        showMessage(
            "Je staat te dichtbij!"
        );

        return;
    }

    const grid = 40;

    const blockX =
        Math.round(x / grid) * grid;

    const blockY =
        Math.round(y / grid) * grid;

    // ======================================
    // CONTROLEREN OF PLEK VRIJ IS
    // ======================================

    if (
        isBlocked(
            blockX,
            blockY,
            20
        )
    ) {

        showMessage(
            "Hier staat al iets!"
        );

        return;
    }

    // ======================================
    // GEWOON BLOK
    // ======================================

    if (selectedBuild === "block") {

        if (inventory.block <= 0) {

            showMessage(
                "Je hebt geen bouwblokken!"
            );

            return;
        }

        objects.push({

            type: "block",

            x: blockX,
            y: blockY,

            size: 40,

            hp: 999,

            alive: true,

            solid: true
        });

        inventory.block--;

        showMessage(
            "🧱 Bouwblok geplaatst!"
        );
    }

    // ======================================
    // OVEN
    // ======================================

    if (selectedBuild === "furnace") {

        if (inventory.furnace <= 0) {

            showMessage(
                "Je hebt geen oven!"
            );

            return;
        }

        objects.push({

            type: "machine",

            machineType: "furnace",

            x: blockX,
            y: blockY,

            size: 44,

            hp: 999,

            alive: true,

            solid: true
        });

        inventory.furnace--;

        showMessage(
            "🔥 Oven geplaatst!"
        );
    }

    // ======================================
    // WERKBANK
    // ======================================

    if (selectedBuild === "workbench") {

        if (inventory.workbench <= 0) {

            showMessage(
                "Je hebt geen werkbank!"
            );

            return;
        }

        objects.push({

            type: "machine",

            machineType: "workbench",

            x: blockX,
            y: blockY,

            size: 44,

            hp: 999,

            alive: true,

            solid: true
        });

        inventory.workbench--;

        showMessage(
            "🛠️ Werkbank geplaatst!"
        );
    }

    // ======================================
    // MIJN MACHINE
    // ======================================

    if (selectedBuild === "miner") {

        if (inventory.miner <= 0) {

            showMessage(
                "Je hebt geen mijnmachine!"
            );

            return;
        }

        objects.push({

            type: "machine",

            machineType: "miner",

            x: blockX,
            y: blockY,

            size: 44,

            hp: 999,

            alive: true,

            solid: true,

            timer: 0
        });

        inventory.miner--;

        showMessage(
            "⛏️ Mijnmachine geplaatst!"
        );
    }

    // ======================================
    // GENERATOR
    // ======================================

    if (selectedBuild === "generator") {

        if (inventory.generator <= 0) {

            showMessage(
                "Je hebt geen generator!"
            );

            return;
        }

        objects.push({

            type: "machine",

            machineType: "generator",

            x: blockX,
            y: blockY,

            size: 44,

            hp: 999,

            alive: true,

            solid: true,

            timer: 0
        });

        inventory.generator--;

        showMessage(
            "⚡ Generator geplaatst!"
        );
    }

    updateUI();
}

// ==========================================
// OBJECT VERZAMELEN
// ==========================================

function collectObject(x, y) {

    let selected = null;
    let selectedDistance = Infinity;

    for (const object of objects) {

        if (!object.alive)
            continue;

        if (
            object.type === "block" ||
            object.type === "machine"
        ) {
            continue;
        }

        const playerDistance =
            distance(
                player.x,
                player.y,
                object.x,
                object.y
            );

        if (playerDistance > 130)
            continue;

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

    // VIJAND AANVALLEN
    for (const enemy of enemies) {

        const playerDistance =
            distance(
                player.x,
                player.y,
                enemy.x,
                enemy.y
            );

        if (playerDistance > 130)
            continue;

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

    // BOOM
    if (selected.type === "tree") {

        selected.hp--;

        const amount =
            inventory.axe ? 5 : 3;

        inventory.wood += amount;

        showMessage(
            "+" + amount + " hout"
        );
    }

    // STEEN
    if (selected.type === "stone") {

        selected.hp--;

        const amount =
            inventory.pickaxe ? 4 : 2;

        inventory.stone += amount;

        showMessage(
            "+" + amount + " steen"
        );
    }

    // ERTS
    if (selected.type === "ore") {

        selected.hp--;

        const amount =
            inventory.pickaxe ? 4 : 2;

        inventory.ore += amount;

        showMessage(
            "+" + amount + " erts"
        );
    }

    // KRISTAL
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
// RECHTSKLIK BLOK / MACHINE OPHALEN
// ==========================================

canvas.addEventListener(
    "contextmenu",
    function(event) {

        event.preventDefault();

        if (!gameRunning)
            return;

        if (!buildMode)
            return;

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

            if (!object.alive)
                continue;

            if (
                object.type !== "block" &&
                object.type !== "machine"
            ) {
                continue;
            }

            if (
                distance(
                    x,
                    y,
                    object.x,
                    object.y
                ) > 35
            ) {
                continue;
            }

            if (
                distance(
                    player.x,
                    player.y,
                    object.x,
                    object.y
                ) > 220
            ) {

                showMessage(
                    "Dat is te ver weg!"
                );

                return;
            }

            object.alive = false;

            if (object.type === "block") {

                inventory.block++;

                showMessage(
                    "🧱 Bouwblok teruggepakt!"
                );

            } else {

                inventory[
                    object.machineType
                ]++;

                showMessage(
                    "⚙️ Machine teruggepakt!"
                );
            }

            updateUI();

            return;
        }
    }
);

// ==========================================
// VIJAND COLLISION
// ==========================================

function enemyBlocked(enemy, nextX, nextY) {

    for (const object of objects) {

        if (!object.alive)
            continue;

        if (!object.solid)
            continue;

        const radius =
            object.type === "block"
                ? 23
                : object.type === "machine"
                    ? 25
                    : object.size / 2;

        const d =
            distance(
                nextX,
                nextY,
                object.x,
                object.y
            );

        if (
            d <
            enemy.size + radius
        ) {
            return true;
        }
    }

    return false;
}

// ==========================================
// VIJANDEN
// ==========================================

function updateEnemies() {

    for (const enemy of enemies) {

        const dx =
            player.x - enemy.x;

        const dy =
            player.y - enemy.y;

        const d =
            Math.hypot(dx, dy);

        // ==================================
        // NAAR SPELER LOPEN
        // ==================================

        if (
            d < 600 &&
            d > 35
        ) {

            const dirX =
                dx / d;

            const dirY =
                dy / d;

            const nextX =
                enemy.x +
                dirX * enemy.speed;

            const nextY =
                enemy.y +
                dirY * enemy.speed;

            // Eerst recht vooruit
            if (
                !enemyBlocked(
                    enemy,
                    nextX,
                    nextY
                )
            ) {

                enemy.x = nextX;
                enemy.y = nextY;

            } else {

                // ==================================
                // OM HET BLOK HEEN LOPEN
                // ==================================

                const sideX =
                    -dirY;

                const sideY =
                    dirX;

                const sideAmount =
                    enemy.speed * 1.8;

                const option1X =
                    enemy.x +
                    sideX * sideAmount;

                const option1Y =
                    enemy.y +
                    sideY * sideAmount;

                const option2X =
                    enemy.x -
                    sideX * sideAmount;

                const option2Y =
                    enemy.y -
                    sideY * sideAmount;

                if (
                    !enemyBlocked(
                        enemy,
                        option1X,
                        option1Y
                    )
                ) {

                    enemy.x = option1X;
                    enemy.y = option1Y;

                } else if (
                    !enemyBlocked(
                        enemy,
                        option2X,
                        option2Y
                    )
                ) {

                    enemy.x = option2X;
                    enemy.y = option2Y;
                }
            }
        }

        // ==================================
        // AANVALLEN
        // ==================================

        const newDistance =
            distance(
                enemy.x,
                enemy.y,
                player.x,
                player.y
            );

        if (newDistance < 35) {

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
// MACHINES UPDATEN
// ==========================================

function updateMachines() {

    for (const object of objects) {

        if (!object.alive)
            continue;

        if (object.type !== "machine")
            continue;

        if (
            object.machineType === "miner"
        ) {

            object.timer++;

            // Elke 10 seconden
            if (object.timer >= 600) {

                object.timer = 0;

                inventory.ore += 1;

                showMessage(
                    "⛏️ Mijnmachine vond 1 erts!"
                );

                updateUI();
            }
        }

        if (
            object.machineType === "generator"
        ) {

            object.timer++;

            // Elke 15 seconden
            if (object.timer >= 900) {

                object.timer = 0;

                inventory.crystal += 1;

                showMessage(
                    "⚡ Generator maakte 1 kristal!"
                );

                updateUI();
            }
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
// GROND
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
// OBJECTEN TEKENEN
// ==========================================

function drawObject(object) {

    if (!object.alive)
        return;

    const x =
        object.x - camera.x;

    const y =
        object.y - camera.y;

    // ======================================
    // BOOM
    // ======================================

    if (object.type === "tree") {

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

        ctx.fillStyle = "#70452a";

        ctx.fillRect(
            x - 7,
            y - 3,
            14,
            30
        );

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

        ctx.fillStyle =
            "rgba(0,0,0,0.3)";

        ctx.fillRect(
            x - 15,
            y - 15,
            40,
            40
        );

        ctx.fillStyle = "#8a6544";

        ctx.fillRect(
            x - 20,
            y - 20,
            40,
            40
        );

        ctx.fillStyle = "#b58a5c";

        ctx.fillRect(
            x - 20,
            y - 20,
            40,
            8
        );

        ctx.strokeStyle = "#5d402b";
        ctx.lineWidth = 2;

        ctx.strokeRect(
            x - 20,
            y - 20,
            40,
            40
        );

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

    // ======================================
    // MACHINES
    // ======================================

    if (object.type === "machine") {

        drawMachine(
            object,
            x,
            y
        );
    }
}

// ==========================================
// MACHINES TEKENEN
// ==========================================

function drawMachine(object, x, y) {

    const size = 44;

    // Schaduw
    ctx.fillStyle =
        "rgba(0,0,0,0.35)";

    ctx.fillRect(
        x - 18,
        y - 14,
        size,
        size
    );

    // Basis
    ctx.fillStyle = "#39434d";

    ctx.fillRect(
        x - 22,
        y - 22,
        size,
        size
    );

    ctx.strokeStyle = "#171b20";
    ctx.lineWidth = 3;

    ctx.strokeRect(
        x - 22,
        y - 22,
        size,
        size
    );

    // ======================================
    // OVEN
    // ======================================

    if (
        object.machineType === "furnace"
    ) {

        ctx.fillStyle = "#222";

        ctx.beginPath();

        ctx.arc(
            x,
            y + 5,
            12,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#ff7b22";

        ctx.beginPath();

        ctx.arc(
            x,
            y + 5,
            7,
            0,
            Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#ffd45a";

        ctx.beginPath();

        ctx.arc(
            x,
            y + 5,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    // ======================================
    // WERKBANK
    // ======================================

    if (
        object.machineType === "workbench"
    ) {

        ctx.fillStyle = "#9a6538";

        ctx.fillRect(
            x - 18,
            y - 13,
            36,
            10
        );

        ctx.fillRect(
            x - 15,
            y - 3,
            7,
            20
        );

        ctx.fillRect(
            x + 8,
            y - 3,
            7,
            20
        );

        ctx.strokeStyle = "#d69a5c";

        ctx.strokeRect(
            x - 18,
            y - 13,
            36,
            10
        );
    }

    // ======================================
    // MIJN MACHINE
    // ======================================

    if (
        object.machineType === "miner"
    ) {

        ctx.fillStyle = "#555";

        ctx.fillRect(
            x - 15,
            y - 8,
            30,
            18
        );

        ctx.fillStyle = "#aaa";

        ctx.fillRect(
            x - 5,
            y - 18,
            10,
            15
        );

        ctx.strokeStyle = "#e2b84b";
        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.moveTo(
            x,
            y - 15
        );

        ctx.lineTo(
            x + 18,
            y - 25
        );

        ctx.stroke();
    }

    // ======================================
    // GENERATOR
    // ======================================

    if (
        object.machineType === "generator"
    ) {

        ctx.fillStyle = "#263b4a";

        ctx.fillRect(
            x - 17,
            y - 17,
            34,
            34
        );

        ctx.fillStyle = "#7ee7ff";

        ctx.beginPath();

        ctx.moveTo(
            x + 3,
            y - 15
        );

        ctx.lineTo(
            x - 5,
            y + 1
        );

        ctx.lineTo(
            x + 3,
            y + 1
        );

        ctx.lineTo(
            x - 3,
            y + 15
        );

        ctx.lineTo(
            x + 10,
            y - 4
        );

        ctx.lineTo(
            x + 2,
            y - 4
        );

        ctx.closePath();

        ctx.fill();
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

    ctx.strokeStyle = "#b9dcff";
    ctx.lineWidth = 2;

    ctx.stroke();

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

    ctx.fillStyle = "#222";

    ctx.fillRect(
        x - 6,
        y - 14,
        12,
        5
    );
}

// ==========================================
// BOUW PREVIEW
// ==========================================

function drawBuildPreview() {

    if (!buildMode)
        return;

    if (!selectedBuild)
        return;

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
        ) < 50
    ) {
        canBuild = false;
    }

    if (
        isBlocked(
            x,
            y,
            20
        )
    ) {
        canBuild = false;
    }

    ctx.globalAlpha = 0.5;

    if (
        selectedBuild === "block"
    ) {

        ctx.fillStyle =
            canBuild
                ? "#c8945c"
                : "#d34b4b";

    } else {

        ctx.fillStyle =
            canBuild
                ? "#668899"
                : "#d34b4b";
    }

    ctx.fillRect(
        screenX - 22,
        screenY - 22,
        44,
        44
    );

    ctx.globalAlpha = 1;

    ctx.strokeStyle =
        canBuild
            ? "white"
            : "#ffaaaa";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        screenX - 22,
        screenY - 22,
        44,
        44
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

    for (const object of objects) {
        drawObject(object);
    }

    for (const enemy of enemies) {
        drawEnemy(enemy);
    }

    drawPlayer();

    drawBuildPreview();

    drawDayNight();
}

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop() {

    if (!gameRunning)
        return;

    if (gameEnded)
        return;

    movePlayer();

    updateEnemies();

    updateMachines();

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

                const item =
                    button.dataset.craft;

                // ==================================
                // BIJL
                // ==================================

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
                            "8 hout + 4 steen nodig."
                        );
                    }
                }

                // ==================================
                // PIKHOUWEEL
                // ==================================

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
                            "10 steen + 5 erts nodig."
                        );
                    }
                }

                // ==================================
                // LANTAARN
                // ==================================

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
                            "5 hout + 2 erts nodig."
                        );
                    }
                }

                // ==================================
                // BOUWBLOK
                // ==================================

                if (item === "block") {

                    if (
                        inventory.wood >= 5 &&
                        inventory.stone >= 5
                    ) {

                        inventory.wood -= 5;
                        inventory.stone -= 5;

                        inventory.block++;

                        showMessage(
                            "🧱 Bouwblok gemaakt!"
                        );

                    } else {

                        showMessage(
                            "5 hout + 5 steen nodig."
                        );
                    }
                }

                // ==================================
                // OVEN
                // ==================================

                if (item === "furnace") {

                    if (
                        inventory.stone >= 12 &&
                        inventory.ore >= 4
                    ) {

                        inventory.stone -= 12;
                        inventory.ore -= 4;

                        inventory.furnace++;
                        inventory.machine++;

                        showMessage(
                            "🔥 Oven gemaakt!"
                        );

                    } else {

                        showMessage(
                            "12 steen + 4 erts nodig."
                        );
                    }
                }

                // ==================================
                // WERKBANK
                // ==================================

                if (item === "workbench") {

                    if (
                        inventory.wood >= 10 &&
                        inventory.stone >= 6
                    ) {

                        inventory.wood -= 10;
                        inventory.stone -= 6;

                        inventory.workbench++;
                        inventory.machine++;

                        showMessage(
                            "🛠️ Werkbank gemaakt!"
                        );

                    } else {

                        showMessage(
                            "10 hout + 6 steen nodig."
                        );
                    }
                }

                // ==================================
                // MIJN MACHINE
                // ==================================

                if (item === "miner") {

                    if (
                        inventory.stone >= 15 &&
                        inventory.ore >= 10 &&
                        inventory.crystal >= 2
                    ) {

                        inventory.stone -= 15;
                        inventory.ore -= 10;
                        inventory.crystal -= 2;

                        inventory.miner++;
                        inventory.machine++;

                        showMessage(
                            "⛏️ Mijnmachine gemaakt!"
                        );

                    } else {

                        showMessage(
                            "15 steen + 10 erts + 2 kristal nodig."
                        );
                    }
                }

                // ==================================
                // GENERATOR
                // ==================================

                if (item === "generator") {

                    if (
                        inventory.ore >= 10 &&
                        inventory.crystal >= 5
                    ) {

                        inventory.ore -= 10;
                        inventory.crystal -= 5;

                        inventory.generator++;
                        inventory.machine++;

                        showMessage(
                            "⚡ Generator gemaakt!"
                        );

                    } else {

                        showMessage(
                            "10 erts + 5 kristal nodig."
                        );
                    }
                }

                updateUI();
            }
        );
    }
);

// ==========================================
// MACHINE KIEZEN VIA BOUWMENU
// ==========================================

craftButtons.forEach(
    function(button) {

        button.addEventListener(
            "dblclick",
            function() {

                const item =
                    button.dataset.craft;

                if (
                    item === "block" ||
                    item === "furnace" ||
                    item === "workbench" ||
                    item === "miner" ||
                    item === "generator"
                ) {

                    buildMode = true;

                    selectedBuild = item;

                    if (crafting) {
                        crafting.style.display =
                            "none";
                    }

                    showMessage(
                        "Gekozen: " +
                        item +
                        ". Klik om te plaatsen!"
                    );

                    updateUI();
                }
            }
        );
    }
);

// ==========================================
// GEWONE KLIK OP CRAFTKNOP:
// NA MAKEN DIRECT SELECTEREN
// ==========================================

craftButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const item =
                    button.dataset.craft;

                if (
                    item === "block" &&
                    inventory.block > 0
                ) {

                    selectedBuild = "block";
                    buildMode = true;

                    showMessage(
                        "🧱 Bouwblok geselecteerd. Klik om te plaatsen!"
                    );

                    updateUI();
                }

                if (
                    item === "furnace" &&
                    inventory.furnace > 0
                ) {

                    selectedBuild = "furnace";
                    buildMode = true;

                    showMessage(
                        "🔥 Oven geselecteerd. Klik om te plaatsen!"
                    );

                    updateUI();
                }

                if (
                    item === "workbench" &&
                    inventory.workbench > 0
                ) {

                    selectedBuild = "workbench";
                    buildMode = true;

                    showMessage(
                        "🛠️ Werkbank geselecteerd. Klik om te plaatsen!"
                    );

                    updateUI();
                }

                if (
                    item === "miner" &&
                    inventory.miner > 0
                ) {

                    selectedBuild = "miner";
                    buildMode = true;

                    showMessage(
                        "⛏️ Mijnmachine geselecteerd. Klik om te plaatsen!"
                    );

                    updateUI();
                }

                if (
                    item === "generator" &&
                    inventory.generator > 0
                ) {

                    selectedBuild = "generator";
                    buildMode = true;

                    showMessage(
                        "⚡ Generator geselecteerd. Klik om te plaatsen!"
                    );

                    updateUI();
                }
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
// RESTART
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

if (game)
    game.style.display = "none";

if (menu)
    menu.style.display = "flex";

if (gameOverScreen)
    gameOverScreen.style.display = "none";

if (crafting)
    crafting.style.display = "none";

updateUI();

console.log(
    "MINVORA - alles geladen!"
);

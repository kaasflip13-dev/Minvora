/* =========================================================
   MINVORA
   SCI-FI SURVIVAL GAME
   ========================================================= */


/* ================= CANVAS ================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let W = window.innerWidth;
let H = window.innerHeight;

function resizeCanvas() {
    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = W;
    canvas.height = H;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();


/* ================= GAME STATE ================= */

const WORLD_SIZE = 3000;

let gameRunning = false;
let gameOver = false;

let camera = {
    x: 0,
    y: 0
};

let keys = {};

let mouse = {
    x: 0,
    y: 0
};

let selectedBuild = null;


/* ================= PLAYER ================= */

let player;


/* ================= INVENTORY ================= */

let inventory;


/* ================= WORLD ================= */

let trees = [];
let stones = [];
let ores = [];
let crystals = [];

let enemies = [];

let buildings = [];

let particles = [];

let enemyBullets = [];


/* ================= TIME ================= */

let worldTime = 0;


/* ================= SAVE ================= */

const SAVE_PREFIX = "minvora_save_";


/* =========================================================
   ACHIEVEMENTS
   ========================================================= */

const achievementDefinitions = [

    {
        id: "first_resource",
        icon: "◆",
        name: "Eerste vondst",
        description: "Verzamel je eerste grondstof."
    },

    {
        id: "collector",
        icon: "◈",
        name: "Verzamelaar",
        description: "Verzamel 25 grondstoffen."
    },

    {
        id: "builder",
        icon: "■",
        name: "Bouwer",
        description: "Plaats je eerste gebouw."
    },

    {
        id: "machine",
        icon: "⚙",
        name: "Ingenieur",
        description: "Plaats je eerste machine."
    },

    {
        id: "hunter",
        icon: "✦",
        name: "Jager",
        description: "Versla je eerste monster."
    },

    {
        id: "hunter5",
        icon: "☄",
        name: "Monsterjager",
        description: "Versla 5 monsters."
    },

    {
        id: "miner",
        icon: "⛏",
        name: "Diepgraver",
        description: "Verzamel 20 erts."
    },

    {
        id: "crystal",
        icon: "◇",
        name: "Kristalzoeker",
        description: "Verzamel 10 kristallen."
    },

    {
        id: "explorer",
        icon: "◎",
        name: "Ontdekker",
        description: "Loop ver van je startpunt."
    },

    {
        id: "survivor",
        icon: "▲",
        name: "Overlever",
        description: "Overleef 5 minuten."
    }

];


let achievements = {};


function resetAchievements() {

    achievements = {};

    achievementDefinitions.forEach(a => {
        achievements[a.id] = false;
    });

    saveAchievements();
}


function loadAchievements() {

    const saved = localStorage.getItem("minvora_achievements");

    if (saved) {

        try {
            achievements = JSON.parse(saved);
        }

        catch {
            resetAchievements();
        }

    }

    else {
        resetAchievements();
    }

}


function saveAchievements() {

    localStorage.setItem(
        "minvora_achievements",
        JSON.stringify(achievements)
    );

}


function unlockAchievement(id) {

    if (!achievements[id]) {

        achievements[id] = true;

        saveAchievements();

        const achievement =
            achievementDefinitions.find(a => a.id === id);

        if (achievement) {

            showMessage(
                "🏆 ACHIEVEMENT: " + achievement.name
            );

        }

        renderAchievements();

    }

}


function renderAchievements() {

    const list =
        document.getElementById("achievementList");

    if (!list) return;

    list.innerHTML = "";

    achievementDefinitions.forEach(a => {

        const unlocked = !!achievements[a.id];

        const div = document.createElement("div");

        div.className =
            "achievement " +
            (unlocked ? "unlocked" : "locked");

        div.innerHTML = `

            <div class="achievementIcon">
                ${a.icon}
            </div>

            <div class="achievementInfo">

                <div class="achievementName">
                    ${a.name}
                </div>

                <div class="achievementDescription">
                    ${a.description}
                </div>

            </div>

            <div class="status">
                ${unlocked ? "ONTGRENDELD" : "VERGRENDELD"}
            </div>

        `;

        list.appendChild(div);

    });

}


/* =========================================================
   INITIAL PLAYER
   ========================================================= */

function createNewPlayer() {

    player = {

        x: WORLD_SIZE / 2,
        y: WORLD_SIZE / 2,

        startX: WORLD_SIZE / 2,
        startY: WORLD_SIZE / 2,

        size: 18,

        speed: 2.8,
        sprintSpeed: 5,

        health: 100,
        maxHealth: 100,

        attackCooldown: 0,

        survivalTime: 0

    };

}


/* =========================================================
   INITIAL INVENTORY
   ========================================================= */

function createNewInventory() {

    inventory = {

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

}


/* =========================================================
   WORLD GENERATION
   ========================================================= */

function randomPosition() {

    return {

        x: 100 + Math.random() * (WORLD_SIZE - 200),
        y: 100 + Math.random() * (WORLD_SIZE - 200)

    };

}


function generateWorld() {

    trees = [];
    stones = [];
    ores = [];
    crystals = [];
    enemies = [];
    buildings = [];
    particles = [];
    enemyBullets = [];


    for (let i = 0; i < 130; i++) {

        const p = randomPosition();

        trees.push({

            x: p.x,
            y: p.y,

            size: 25 + Math.random() * 15

        });

    }


    for (let i = 0; i < 100; i++) {

        const p = randomPosition();

        stones.push({

            x: p.x,
            y: p.y,

            size: 15 + Math.random() * 10

        });

    }


    for (let i = 0; i < 70; i++) {

        const p = randomPosition();

        ores.push({

            x: p.x,
            y: p.y,

            size: 13

        });

    }


    for (let i = 0; i < 35; i++) {

        const p = randomPosition();

        crystals.push({

            x: p.x,
            y: p.y,

            size: 12

        });

    }


    for (let i = 0; i < 18; i++) {

        const p = randomPosition();

        enemies.push({

            x: p.x,
            y: p.y,

            size: 20,

            health: 40,
            maxHealth: 40,

            speed: 0.65 + Math.random() * .3,

            attackCooldown: Math.random() * 100,

            dir: Math.random() * Math.PI * 2

        });

    }

}


/* =========================================================
   START GAME
   ========================================================= */

function startNewGame() {

    createNewPlayer();

    createNewInventory();

    generateWorld();

    worldTime = 0;

    gameOver = false;

    selectedBuild = null;

    gameRunning = true;

    document.getElementById("menu").style.display = "none";

    document.getElementById("achievementScreen")
        .classList.remove("active");

    document.getElementById("saveScreen")
        .classList.remove("active");

    document.getElementById("game")
        .classList.add("active");

    document.getElementById("gameOver")
        .classList.remove("active");

    document.getElementById("crafting")
        .classList.remove("active");

    document.getElementById("buildMenu")
        .classList.remove("active");

    showMessage("Nieuwe expeditie gestart");

    updateHUD();

}


/* =========================================================
   CONTINUE AFTER DEATH
   ========================================================= */

function continueAfterDeath() {

    gameOver = false;

    player.health = player.maxHealth;

    player.x = player.startX;
    player.y = player.startY;

    enemyBullets = [];

    document.getElementById("gameOver")
        .classList.remove("active");

    showMessage("Je bent teruggekeerd naar de frontier");

}


/* =========================================================
   MOVEMENT
   ========================================================= */

document.addEventListener("keydown", e => {

    keys[e.key.toLowerCase()] = true;

    if (
        ["w", "a", "s", "d", "shift"].includes(
            e.key.toLowerCase()
        )
    ) {
        e.preventDefault();
    }


    if (e.key.toLowerCase() === "e") {

        if (!gameOver) {

            document.getElementById("crafting")
                .classList.toggle("active");

        }

    }


    if (e.key.toLowerCase() === "b") {

        if (!gameOver) {

            document.getElementById("buildMenu")
                .classList.toggle("active");

        }

    }


    if (e.key === "Escape") {

        document.getElementById("crafting")
            .classList.remove("active");

        document.getElementById("buildMenu")
            .classList.remove("active");

    }

});


document.addEventListener("keyup", e => {

    keys[e.key.toLowerCase()] = false;

});


/* =========================================================
   MOUSE
   ========================================================= */

canvas.addEventListener("mousemove", e => {

    const rect = canvas.getBoundingClientRect();

    mouse.x =
        (e.clientX - rect.left) *
        canvas.width / rect.width;

    mouse.y =
        (e.clientY - rect.top) *
        canvas.height / rect.height;

});


canvas.addEventListener("click", e => {

    if (!gameRunning || gameOver) return;

    const worldX = mouse.x + camera.x;
    const worldY = mouse.y + camera.y;

    if (selectedBuild) {

        placeSelectedObject(worldX, worldY);

        return;

    }

    collectOrAttack(worldX, worldY);

});


canvas.addEventListener("contextmenu", e => {

    e.preventDefault();

    if (!gameRunning || gameOver) return;

    const worldX = mouse.x + camera.x;
    const worldY = mouse.y + camera.y;

    removeBuilding(worldX, worldY);

});


/* =========================================================
   COLLECT / ATTACK
   ========================================================= */

function distance(a, b) {

    return Math.hypot(
        a.x - b.x,
        a.y - b.y
    );

}


function collectOrAttack(x, y) {

    const target = {
        x,
        y
    };


    /* TREES */

    for (let i = trees.length - 1; i >= 0; i--) {

        const t = trees[i];

        if (
            distance(player, t) < 90 &&
            distance(target, t) < 70
        ) {

            trees.splice(i, 1);

            inventory.wood += 3;

            checkAchievements();

            showMessage("+3 hout");

            return;

        }

    }


    /* STONE */

    for (let i = stones.length - 1; i >= 0; i--) {

        const s = stones[i];

        if (
            distance(player, s) < 90 &&
            distance(target, s) < 60
        ) {

            stones.splice(i, 1);

            inventory.stone += 2;

            checkAchievements();

            showMessage("+2 steen");

            return;

        }

    }


    /* ORE */

    for (let i = ores.length - 1; i >= 0; i--) {

        const o = ores[i];

        if (
            distance(player, o) < 90 &&
            distance(target, o) < 55
        ) {

            ores.splice(i, 1);

            inventory.ore += 1;

            checkAchievements();

            showMessage("+1 erts");

            return;

        }

    }


    /* CRYSTAL */

    for (let i = crystals.length - 1; i >= 0; i--) {

        const c = crystals[i];

        if (
            distance(player, c) < 90 &&
            distance(target, c) < 55
        ) {

            crystals.splice(i, 1);

            inventory.crystal += 1;

            checkAchievements();

            showMessage("+1 kristal");

            return;

        }

    }


    /* ENEMY */

    for (let i = enemies.length - 1; i >= 0; i--) {

        const enemy = enemies[i];

        if (
            distance(player, enemy) < 110 &&
            distance(target, enemy) < 70
        ) {

            enemy.health -= 20;

            createParticles(
                enemy.x,
                enemy.y,
                "#ffcc66"
            );

            if (enemy.health <= 0) {

                enemies.splice(i, 1);

                inventory.ore += 1;

                showMessage("Monster verslagen +1 erts");

                checkAchievements();

            }

            return;

        }

    }

}


/* =========================================================
   CRAFTING
   ========================================================= */

document.querySelectorAll(".craftButton")
    .forEach(button => {

        button.addEventListener("click", () => {

            craft(button.dataset.craft);

        });

    });


function hasResources(cost) {

    return Object.keys(cost).every(key => {

        return inventory[key] >= cost[key];

    });

}


function removeResources(cost) {

    Object.keys(cost).forEach(key => {

        inventory[key] -= cost[key];

    });

}


function craft(type) {


    const recipes = {

        axe: {
            wood: 8,
            stone: 4
        },

        pickaxe: {
            stone: 10,
            ore: 5
        },

        lantern: {
            wood: 5,
            ore: 2
        },

        block: {
            wood: 5,
            stone: 5
        },

        furnace: {
            stone: 12,
            ore: 8
        },

        workbench: {
            wood: 10,
            stone: 10
        },

        miner: {
            stone: 15,
            ore: 12,
            crystal: 2
        },

        generator: {
            ore: 10,
            crystal: 5
        }

    };


    const recipe = recipes[type];

    if (!recipe) return;


    if (!hasResources(recipe)) {

        showMessage("Niet genoeg grondstoffen");

        return;

    }


    removeResources(recipe);


    if (type === "axe") {

        inventory.axe = true;

        showMessage("Scavenger Tool gemaakt");

    }


    else if (type === "pickaxe") {

        inventory.pickaxe = true;

        showMessage("Mining Tool gemaakt");

    }


    else if (type === "lantern") {

        inventory.lantern = true;

        showMessage("Energy Lamp gemaakt");

    }


    else if (type === "block") {

        inventory.block++;

        showMessage("Wall Panel gemaakt");

    }


    else {

        inventory[type]++;

        inventory.machine++;

        showMessage("Machine gemaakt: " + type);

        document.getElementById("buildMenu")
            .classList.add("active");

    }


    updateHUD();

}


/* =========================================================
   BUILD MENU
   ========================================================= */

document.querySelectorAll(".buildButton")
    .forEach(button => {

        button.addEventListener("click", () => {

            selectedBuild =
                button.dataset.build;

            document.querySelectorAll(".buildButton")
                .forEach(b => b.classList.remove("selected"));

            button.classList.add("selected");

            showMessage(
                "Plaats: " +
                selectedBuild +
                " — klik op de grond"
            );

        });

    });


function getBuildingSize(type) {

    if (type === "block") return 38;

    return 48;

}


function placeSelectedObject(x, y) {

    if (!selectedBuild) return;


    const inventoryKey = selectedBuild;


    if (!inventory[inventoryKey] ||
        inventory[inventoryKey] <= 0) {

        showMessage("Je hebt dit niet");

        return;

    }


    const size =
        getBuildingSize(selectedBuild);


    const grid = 40;

    const bx =
        Math.floor(x / grid) * grid + grid / 2;

    const by =
        Math.floor(y / grid) * grid + grid / 2;


    if (
        distance(player, {
            x: bx,
            y: by
        }) < 55
    ) {

        showMessage("Te dicht bij jezelf");

        return;

    }


    if (
        isSolidAt(
            bx,
            by,
            size / 2
        )
    ) {

        showMessage("Deze plek is bezet");

        return;

    }


    buildings.push({

        x: bx,
        y: by,

        type: selectedBuild,

        size

    });


    inventory[inventoryKey]--;

    inventory.machine =
        Math.max(
            0,
            inventory.machine -
            (
                selectedBuild === "block"
                    ? 0
                    : 1
            )
        );


    createParticles(
        bx,
        by,
        "#54e0a3"
    );


    unlockAchievement("builder");


    if ([
        "furnace",
        "workbench",
        "miner",
        "generator"
    ].includes(selectedBuild)) {

        unlockAchievement("machine");

    }


    updateHUD();

    showMessage(
        selectedBuild + " geplaatst"
    );

}


/* =========================================================
   REMOVE BUILDING
   ========================================================= */

function removeBuilding(x, y) {

    for (
        let i = buildings.length - 1;
        i >= 0;
        i--
    ) {

        const b = buildings[i];

        if (
            Math.abs(x - b.x) <
            b.size / 2 &&
            Math.abs(y - b.y) <
            b.size / 2
        ) {

            buildings.splice(i, 1);

            inventory[b.type]++;

            if (b.type !== "block") {

                inventory.machine++;

            }

            updateHUD();

            showMessage(
                b.type + " verwijderd"
            );

            return;

        }

    }

}


/* =========================================================
   COLLISION
   ========================================================= */

function isSolidAt(x, y, radius = 15) {

    for (const b of buildings) {

        if (
            Math.abs(x - b.x) <
            b.size / 2 + radius &&
            Math.abs(y - b.y) <
            b.size / 2 + radius
        ) {

            return true;

        }

    }

    return false;

}


function canMoveTo(x, y) {

    if (
        x < 20 ||
        y < 20 ||
        x > WORLD_SIZE - 20 ||
        y > WORLD_SIZE - 20
    ) {

        return false;

    }


    if (
        isSolidAt(
            x,
            y,
            player.size
        )
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   ENEMY COLLISION
   ========================================================= */

function enemyBlocked(enemy, newX, newY) {

    if (
        isSolidAt(
            newX,
            newY,
            enemy.size
        )
    ) {

        return true;

    }


    return false;

}


/* =========================================================
   UPDATE PLAYER
   ========================================================= */

function updatePlayer() {

    if (gameOver) return;


    let dx = 0;
    let dy = 0;


    if (keys["w"]) dy -= 1;
    if (keys["s"]) dy += 1;
    if (keys["a"]) dx -= 1;
    if (keys["d"]) dx += 1;


    if (dx !== 0 || dy !== 0) {

        const length =
            Math.hypot(dx, dy);

        dx /= length;
        dy /= length;


        const sprint =
            keys["shift"];


        const speed =
            sprint
                ? player.sprintSpeed
                : player.speed;


        const newX =
            player.x + dx * speed;

        const newY =
            player.y + dy * speed;


        if (canMoveTo(newX, player.y)) {

            player.x = newX;

        }


        if (canMoveTo(player.x, newY)) {

            player.y = newY;

        }

    }


    player.survivalTime += 1 / 60;

    checkAchievements();

}


/* =========================================================
   UPDATE ENEMIES
   ========================================================= */

function updateEnemies() {

    if (gameOver) return;


    for (const enemy of enemies) {

        const dx =
            player.x - enemy.x;

        const dy =
            player.y - enemy.y;

        const dist =
            Math.hypot(dx, dy);


        if (dist < 550) {

            const nx = dx / dist;
            const ny = dy / dist;


            let newX =
                enemy.x +
                nx * enemy.speed;

            let newY =
                enemy.y +
                ny * enemy.speed;


            if (
                !enemyBlocked(
                    enemy,
                    newX,
                    enemy.y
                )
            ) {

                enemy.x = newX;

            }

            else {

                newX =
                    enemy.x -
                    ny * enemy.speed;

                if (
                    !enemyBlocked(
                        enemy,
                        newX,
                        enemy.y
                    )
                ) {

                    enemy.x = newX;

                }

            }


            if (
                !enemyBlocked(
                    enemy,
                    enemy.x,
                    newY
                )
            ) {

                enemy.y = newY;

            }

        }


        enemy.attackCooldown--;


        if (
            dist < 35 &&
            enemy.attackCooldown <= 0
        ) {

            player.health -= 8;

            enemy.attackCooldown = 80;

            createParticles(
                player.x,
                player.y,
                "#ff8d66"
            );


            if (player.health <= 0) {

                player.health = 0;

                die();

            }

        }

    }

}


/* =========================================================
   MACHINES
   ========================================================= */

function updateMachines() {

    for (const b of buildings) {

        if (b.type === "miner") {

            b.timer =
                (b.timer || 0) + 1;

            if (b.timer > 600) {

                b.timer = 0;

                inventory.ore++;

                showMessage(
                    "Auto Miner: +1 erts"
                );

            }

        }


        if (b.type === "generator") {

            b.timer =
                (b.timer || 0) + 1;

            if (b.timer > 900) {

                b.timer = 0;

                inventory.crystal++;

                showMessage(
                    "Generator: +1 kristal"
                );

            }

        }

    }

}


/* =========================================================
   CAMERA
   ========================================================= */

function updateCamera() {

    camera.x =
        player.x -
        W / 2;

    camera.y =
        player.y -
        H / 2;


    camera.x =
        Math.max(
            0,
            Math.min(
                camera.x,
                WORLD_SIZE - W
            )
        );


    camera.y =
        Math.max(
            0,
            Math.min(
                camera.y,
                WORLD_SIZE - H
            )
        );

}


/* =========================================================
   PARTICLES
   ========================================================= */

function createParticles(x, y, color) {

    for (let i = 0; i < 8; i++) {

        particles.push({

            x,
            y,

            vx:
                (Math.random() - .5) * 3,

            vy:
                (Math.random() - .5) * 3,

            life: 30,

            color

        });

    }

}


function updateParticles() {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        p.life--;

        if (p.life <= 0) {

            particles.splice(i, 1);

        }

    }

}


/* =========================================================
   DRAW WORLD
   ========================================================= */

function drawWorld() {

    ctx.fillStyle = "#08100e";

    ctx.fillRect(
        0,
        0,
        W,
        H
    );


    /* GRID */

    ctx.strokeStyle =
        "rgba(70,130,105,.08)";

    ctx.lineWidth = 1;

    const grid = 80;

    const startX =
        -(camera.x % grid);

    const startY =
        -(camera.y % grid);


    for (
        let x = startX;
        x < W;
        x += grid
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);

        ctx.stroke();

    }


    for (
        let y = startY;
        y < H;
        y += grid
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);
        ctx.lineTo(W, y);

        ctx.stroke();

    }


    /* RESOURCES */

    drawTrees();
    drawStones();
    drawOres();
    drawCrystals();


    /* BUILDINGS */

    drawBuildings();


    /* ENEMIES */

    drawEnemies();


    /* PLAYER */

    drawPlayer();


    /* PARTICLES */

    drawParticles();


    /* NIGHT */

    drawNight();

}


/* =========================================================
   DRAW TREES
   ========================================================= */

function drawTrees() {

    for (const t of trees) {

        const x =
            t.x - camera.x;

        const y =
            t.y - camera.y;


        if (
            x < -50 ||
            y < -50 ||
            x > W + 50 ||
            y > H + 50
        ) continue;


        ctx.fillStyle = "#162f27";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            t.size,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.strokeStyle = "#3b8063";

        ctx.lineWidth = 2;

        ctx.stroke();


        ctx.fillStyle = "#4ba078";

        ctx.beginPath();

        ctx.arc(
            x - 5,
            y - 5,
            t.size * .35,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

}


/* =========================================================
   DRAW STONES
   ========================================================= */

function drawStones() {

    for (const s of stones) {

        const x =
            s.x - camera.x;

        const y =
            s.y - camera.y;


        ctx.fillStyle = "#374441";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            s.size,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.strokeStyle = "#63706c";

        ctx.stroke();

    }

}


/* =========================================================
   DRAW ORE
   ========================================================= */

function drawOres() {

    for (const o of ores) {

        const x =
            o.x - camera.x;

        const y =
            o.y - camera.y;


        ctx.fillStyle = "#70543c";

        ctx.beginPath();

        ctx.moveTo(x, y - 14);
        ctx.lineTo(x + 13, y);
        ctx.lineTo(x, y + 14);
        ctx.lineTo(x - 13, y);
        ctx.closePath();

        ctx.fill();


        ctx.fillStyle = "#d28c55";

        ctx.fillRect(
            x - 3,
            y - 3,
            6,
            6
        );

    }

}


/* =========================================================
   DRAW CRYSTALS
   ========================================================= */

function drawCrystals() {

    for (const c of crystals) {

        const x =
            c.x - camera.x;

        const y =
            c.y - camera.y;


        ctx.shadowBlur = 15;
        ctx.shadowColor = "#64d9ff";

        ctx.fillStyle = "#52bfdc";

        ctx.beginPath();

        ctx.moveTo(x, y - 15);
        ctx.lineTo(x + 10, y);
        ctx.lineTo(x, y + 15);
        ctx.lineTo(x - 10, y);
        ctx.closePath();

        ctx.fill();

        ctx.shadowBlur = 0;

    }

}


/* =========================================================
   DRAW BUILDINGS
   ========================================================= */

function drawBuildings() {

    for (const b of buildings) {

        const x =
            b.x - camera.x;

        const y =
            b.y - camera.y;


        let color = "#273b35";


        if (b.type === "furnace")
            color = "#754d35";

        if (b.type === "workbench")
            color = "#465e54";

        if (b.type === "miner")
            color = "#375b61";

        if (b.type === "generator")
            color = "#394d70";


        ctx.fillStyle = color;

        ctx.fillRect(
            x - b.size / 2,
            y - b.size / 2,
            b.size,
            b.size
        );


        ctx.strokeStyle = "#73b59c";

        ctx.strokeRect(
            x - b.size / 2,
            y - b.size / 2,
            b.size,
            b.size
        );


        ctx.fillStyle = "#bdebd7";

        ctx.font = "12px Arial";

        ctx.textAlign = "center";

        const symbols = {

            block: "■",
            furnace: "◆",
            workbench: "⬡",
            miner: "⛏",
            generator: "⚡"

        };


        ctx.fillText(
            symbols[b.type] || "?",
            x,
            y + 4
        );

    }

}


/* =========================================================
   DRAW ENEMIES
   ========================================================= */

function drawEnemies() {

    for (const e of enemies) {

        const x =
            e.x - camera.x;

        const y =
            e.y - camera.y;


        ctx.fillStyle = "#9b4858";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            e.size,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.strokeStyle = "#e17a89";

        ctx.lineWidth = 2;

        ctx.stroke();


        ctx.fillStyle = "#161015";

        ctx.beginPath();

        ctx.arc(
            x - 6,
            y - 3,
            3,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 6,
            y - 3,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* health */

        ctx.fillStyle = "#25161a";

        ctx.fillRect(
            x - 20,
            y - 30,
            40,
            4
        );


        ctx.fillStyle = "#e66b7d";

        ctx.fillRect(
            x - 20,
            y - 30,
            40 * (
                e.health / e.maxHealth
            ),
            4
        );

    }

}


/* =========================================================
   DRAW PLAYER
   ========================================================= */

function drawPlayer() {

    const x =
        player.x - camera.x;

    const y =
        player.y - camera.y;


    ctx.shadowBlur = 20;
    ctx.shadowColor = "#58e1aa";

    ctx.fillStyle = "#7ce4b5";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        player.size,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.shadowBlur = 0;


    ctx.fillStyle = "#0a1611";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 3,
        6,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* sprint indicator */

    if (keys["shift"]) {

        ctx.strokeStyle =
            "rgba(100,255,190,.35)";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            26,
            0,
            Math.PI * 2
        );

        ctx.stroke();

    }

}


/* =========================================================
   DRAW PARTICLES
   ========================================================= */

function drawParticles() {

    for (const p of particles) {

        ctx.globalAlpha =
            p.life / 30;

        ctx.fillStyle = p.color;

        ctx.fillRect(
            p.x - camera.x,
            p.y - camera.y,
            4,
            4
        );

    }

    ctx.globalAlpha = 1;

}


/* =========================================================
   NIGHT
   ========================================================= */

function drawNight() {

    const cycle =
        worldTime % 60;

    if (cycle > 40) {

        const darkness =
            Math.min(
                .5,
                (cycle - 40) / 20 * .5
            );

        ctx.fillStyle =
            `rgba(3,7,14,${darkness})`;

        ctx.fillRect(
            0,
            0,
            W,
            H
        );

    }

}


/* =========================================================
   HUD
   ========================================================= */

function updateHUD() {

    if (!player || !inventory)
        return;


    document.getElementById("wood")
        .textContent = inventory.wood;

    document.getElementById("stone")
        .textContent = inventory.stone;

    document.getElementById("ore")
        .textContent = inventory.ore;

    document.getElementById("crystal")
        .textContent = inventory.crystal;

    document.getElementById("block")
        .textContent = inventory.block;


    document.getElementById("machine")
        .textContent =
            inventory.furnace +
            inventory.workbench +
            inventory.miner +
            inventory.generator;


    const healthPercent =
        Math.max(
            0,
            player.health /
            player.maxHealth *
            100
        );


    document.getElementById("health")
        .style.width =
            healthPercent + "%";


    document.getElementById("healthText")
        .textContent =
            Math.ceil(player.health) +
            " / " +
            player.maxHealth;


    document.getElementById("buildBlockCount")
        .textContent =
            inventory.block;

    document.getElementById("buildFurnaceCount")
        .textContent =
            inventory.furnace;

    document.getElementById("buildWorkbenchCount")
        .textContent =
            inventory.workbench;

    document.getElementById("buildMinerCount")
        .textContent =
            inventory.miner;

    document.getElementById("buildGeneratorCount")
        .textContent =
            inventory.generator;

}


/* =========================================================
   ACHIEVEMENT CHECK
   ========================================================= */

function checkAchievements() {

    if (!player || !inventory)
        return;


    const totalResources =
        inventory.wood +
        inventory.stone +
        inventory.ore +
        inventory.crystal;


    if (totalResources >= 1) {

        unlockAchievement(
            "first_resource"
        );

    }


    if (totalResources >= 25) {

        unlockAchievement(
            "collector"
        );

    }


    if (inventory.ore >= 20) {

        unlockAchievement(
            "miner"
        );

    }


    if (inventory.crystal >= 10) {

        unlockAchievement(
            "crystal"
        );

    }


    if (player.survivalTime >= 300) {

        unlockAchievement(
            "survivor"
        );

    }


    if (
        Math.hypot(
            player.x - player.startX,
            player.y - player.startY
        ) > 1000
    ) {

        unlockAchievement(
            "explorer"
        );

    }


    if (
        achievements.builder &&
        buildings.some(b =>
            b.type !== "block"
        )
    ) {

        unlockAchievement(
            "machine"
        );

    }

}


/* =========================================================
   DEATH
   ========================================================= */

function die() {

    gameOver = true;

    document.getElementById("gameOver")
        .classList.add("active");

}


/* =========================================================
   MESSAGE
   ========================================================= */

let messageTimer = null;

function showMessage(text) {

    const message =
        document.getElementById("message");

    message.textContent = text;

    message.classList.add("show");


    clearTimeout(messageTimer);


    messageTimer =
        setTimeout(() => {

            message.classList.remove("show");

        }, 1800);

}


/* =========================================================
   SAVE SYSTEM
   ========================================================= */

function saveGame(slot) {

    if (!player || !inventory) {

        showMessage("Geen game om op te slaan");

        return;

    }


    const data = {

        player: player,

        inventory: inventory,

        trees: trees,

        stones: stones,

        ores: ores,

        crystals: crystals,

        enemies: enemies,

        buildings: buildings,

        worldTime: worldTime

    };


    try {

        localStorage.setItem(
            SAVE_PREFIX + slot,
            JSON.stringify(data)
        );


        showMessage(
            "Game opgeslagen in slot " +
            slot
        );


        const indicator =
            document.getElementById(
                "saveIndicator"
            );

        indicator.classList.add("show");


        setTimeout(() => {

            indicator.classList.remove("show");

        }, 1500);

    }

    catch (error) {

        showMessage(
            "Opslaan mislukt"
        );

        console.error(error);

    }

}


/* =========================================================
   LOAD GAME
   ========================================================= */

function loadGame(slot) {

    const saved =
        localStorage.getItem(
            SAVE_PREFIX + slot
        );


    if (!saved) {

        showMessage(
            "Slot " + slot + " is leeg"
        );

        return;

    }


    try {

        const data =
            JSON.parse(saved);


        player = data.player;

        inventory = data.inventory;

        trees = data.trees || [];
        stones = data.stones || [];
        ores = data.ores || [];
        crystals = data.crystals || [];
        enemies = data.enemies || [];
        buildings = data.buildings || [];

        worldTime =
            data.worldTime || 0;


        gameOver = false;

        gameRunning = true;


        document.getElementById("menu")
            .style.display = "none";

        document.getElementById("saveScreen")
            .classList.remove("active");

        document.getElementById("game")
            .classList.add("active");

        document.getElementById("gameOver")
            .classList.remove("active");


        updateHUD();

        showMessage(
            "Slot " + slot + " geladen"
        );

    }

    catch (error) {

        showMessage(
            "Save is beschadigd"
        );

        console.error(error);

    }

}


/* =========================================================
   SAVE SCREEN
   ========================================================= */

function renderSaveSlots() {

    const container =
        document.getElementById(
            "saveSlots"
        );

    container.innerHTML = "";


    for (let i = 1; i <= 3; i++) {

        const saved =
            localStorage.getItem(
                SAVE_PREFIX + i
            );


        let info =
            "LEEG SLOT";


        if (saved) {

            try {

                const data =
                    JSON.parse(saved);


                info =
                    "Game opgeslagen • " +
                    Math.floor(
                        (data.player?.survivalTime || 0)
                    ) +
                    " sec";

            }

            catch {

                info = "Save beschadigd";

            }

        }


        const div =
            document.createElement("div");


        div.className =
            "saveSlot";


        div.innerHTML = `

            <div class="saveSlotInfo">

                <div class="saveSlotTitle">
                    SLOT ${i}
                </div>

                <div class="saveSlotData">
                    ${info}
                </div>

            </div>

            <div>

                <button data-load="${i}">
                    LADEN
                </button>

                <button data-save="${i}">
                    OPSLAAN
                </button>

            </div>

        `;


        container.appendChild(div);

    }


    container
        .querySelectorAll("[data-load]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    loadGame(
                        button.dataset.load
                    );

                }
            );

        });


    container
        .querySelectorAll("[data-save]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    saveGame(
                        button.dataset.save
                    );

                    renderSaveSlots();

                }
            );

        });

}


/* =========================================================
   MENU BUTTONS
   ========================================================= */

document.getElementById("startButton")
    .addEventListener(
        "click",
        startNewGame
    );


document.getElementById("loadButton")
    .addEventListener(
        "click",
        () => {

            renderSaveSlots();

            document.getElementById(
                "saveScreen"
            ).classList.add("active");

        }
    );


document.getElementById("closeSave")
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "saveScreen"
            ).classList.remove("active");

        }
    );


document.getElementById(
    "achievementButton"
).addEventListener(
    "click",
    () => {

        renderAchievements();

        document.getElementById(
            "achievementScreen"
        ).classList.add("active");

    }
);


document.getElementById(
    "closeAchievements"
).addEventListener(
    "click",
    () => {

        document.getElementById(
            "achievementScreen"
        ).classList.remove("active");

    }
);


/* =========================================================
   GAME OVER BUTTONS
   ========================================================= */

document.getElementById(
    "continueButton"
).addEventListener(
    "click",
    continueAfterDeath
);


document.getElementById(
    "saveAfterDeath"
).addEventListener(
    "click",
    () => {

        renderSaveSlots();

        document.getElementById(
            "gameOver"
        ).classList.remove("active");

        document.getElementById(
            "saveScreen"
        ).classList.add("active");

    }
);


document.getElementById(
    "restartButton"
).addEventListener(
    "click",
    startNewGame
);


document.getElementById(
    "menuButton"
).addEventListener(
    "click",
    () => {

        gameRunning = false;

        document.getElementById(
            "game"
        ).classList.remove("active");

        document.getElementById(
            "gameOver"
        ).classList.remove("active");

        document.getElementById(
            "menu"
        ).style.display = "flex";

    }
);


/* =========================================================
   CRAFTING CLOSE
   ========================================================= */

document.getElementById(
    "closeCrafting"
).addEventListener(
    "click",
    () => {

        document.getElementById(
            "crafting"
        ).classList.remove("active");

    }
);


/* =========================================================
   AUTO SAVE
   ========================================================= */

setInterval(() => {

    if (
        gameRunning &&
        !gameOver
    ) {

        /* automatische save naar slot 1 */

        saveGame(1);

    }

}, 60000);


/* =========================================================
   GAME LOOP
   ========================================================= */

let lastTime = performance.now();


function gameLoop(time) {

    const delta =
        Math.min(
            50,
            time - lastTime
        );

    lastTime = time;


    if (gameRunning) {

        worldTime +=
            delta / 1000;


        updatePlayer();

        updateEnemies();

        updateMachines();

        updateParticles();

        updateCamera();

        updateHUD();

        drawWorld();

    }


    requestAnimationFrame(
        gameLoop
    );

}


loadAchievements();

renderAchievements();

requestAnimationFrame(
    gameLoop
);

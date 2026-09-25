/* =====================================================
   MINVORA
   TOP-DOWN SURVIVAL GAME
===================================================== */


const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


const game =
    document.getElementById("game");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const crafting =
    document.getElementById("crafting");

const message =
    document.getElementById("message");


/* =====================================================
   CANVAS
===================================================== */

function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;
}

resizeCanvas();

window.addEventListener(
    "resize",
    resizeCanvas
);


/* =====================================================
   SPELER
===================================================== */

const player = {

    x: 0,

    y: 0,

    size: 18,

    speed: 3,

    health: 100,

    maxHealth: 100
};


/* =====================================================
   INVENTORY
===================================================== */

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


/* =====================================================
   WERELD
===================================================== */

const world = {

    width: 3000,

    height: 3000
};


const objects = [];


/* =====================================================
   RANDOM OBJECTEN
===================================================== */

function randomPosition() {

    return {

        x:
            Math.random()
            * world.width,

        y:
            Math.random()
            * world.height
    };

}


/* =====================================================
   OBJECT MAKEN
===================================================== */

function createObject(
    type,
    x,
    y
) {

    objects.push({

        type: type,

        x: x,

        y: y,

        size:
            type === "tree"
                ? 38
                : 28,

        hp:
            type === "tree"
                ? 3
                : type === "crystal"
                    ? 4
                    : 2,

        alive: true

    });

}


/* =====================================================
   STARTWERELD
===================================================== */


/* Bomen */

for (
    let i = 0;
    i < 75;
    i++
) {

    const p =
        randomPosition();

    createObject(
        "tree",
        p.x,
        p.y
    );

}


/* Stenen */

for (
    let i = 55;
    i < 110;
    i++
) {

    const p =
        randomPosition();

    createObject(
        "stone",
        p.x,
        p.y
    );

}


/* Erts */

for (
    let i = 0;
    i < 25;
    i++
) {

    const p =
        randomPosition();

    createObject(
        "ore",
        p.x,
        p.y
    );

}


/* Kristallen */

for (
    let i = 0;
    i < 12;
    i++
) {

    const p =
        randomPosition();

    createObject(
        "crystal",
        p.x,
        p.y
    );

}


/* Vijanden */

for (
    let i = 0;
    i < 10;
    i++
) {

    const p =
        randomPosition();

    createObject(
        "enemy",
        p.x,
        p.y
    );

}


/* =====================================================
   TOETSEN
===================================================== */

const keys = {};


document.addEventListener(
    "keydown",
    function(event) {

        keys[
            event.key.toLowerCase()
        ] = true;


        /* Crafting */

        if (
            event.key.toLowerCase()
            === "e"
        ) {

            crafting.classList.toggle(
                "open"
            );

        }

    }
);


document.addEventListener(
    "keyup",
    function(event) {

        keys[
            event.key.toLowerCase()
        ] = false;

    }
);


/* =====================================================
   START GAME
===================================================== */

let gameRunning = false;


startButton.addEventListener(
    "click",
    function() {

        document.getElementById(
            "menu"
        ).style.display = "none";


        game.classList.add(
            "active"
        );


        gameRunning = true;


        player.x =
            world.width / 2;

        player.y =
            world.height / 2;


        player.health = 100;


        updateUI();


        showMessage(
            "Welkom in Minvora!"
        );


        requestAnimationFrame(
            gameLoop
        );

    }
);


/* =====================================================
   RESTART
===================================================== */

restartButton.addEventListener(
    "click",
    function() {

        document
            .getElementById("gameOver")
            .classList.remove("show");


        player.x =
            world.width / 2;

        player.y =
            world.height / 2;

        player.health = 100;

        gameRunning = true;

        requestAnimationFrame(
            gameLoop
        );

    }
);


/* =====================================================
   BEWEGEN
===================================================== */

function movePlayer() {

    let dx = 0;

    let dy = 0;


    if (keys["w"])
        dy -= 1;

    if (keys["s"])
        dy += 1;

    if (keys["a"])
        dx -= 1;

    if (keys["d"])
        dx += 1;


    if (
        dx !== 0 ||
        dy !== 0
    ) {

        const length =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        dx /= length;
        dy /= length;


        player.x +=
            dx * player.speed;

        player.y +=
            dy * player.speed;

    }


    /* wereldgrenzen */

    player.x =
        Math.max(
            20,
            Math.min(
                world.width - 20,
                player.x
            )
        );


    player.y =
        Math.max(
            20,
            Math.min(
                world.height - 20,
                player.y
            )
        );

}


/* =====================================================
   CAMERA
===================================================== */

const camera = {

    x: 0,

    y: 0
};


function updateCamera() {

    camera.x =
        player.x -
        canvas.width / 2;

    camera.y =
        player.y -
        canvas.height / 2;

}


/* =====================================================
   OBJECT TEKENEN
===================================================== */

function drawObject(object) {

    if (!object.alive)
        return;


    const x =
        object.x -
        camera.x;

    const y =
        object.y -
        camera.y;


    /* buiten beeld */

    if (
        x < -100 ||
        x > canvas.width + 100 ||
        y < -100 ||
        y > canvas.height + 100
    ) {

        return;

    }


    /* =========================
       BOOM
    ========================= */

    if (
        object.type === "tree"
    ) {

        /* schaduw */

        ctx.fillStyle =
            "rgba(0,0,0,.25)";

        ctx.beginPath();

        ctx.ellipse(
            x,
            y + 18,
            30,
            12,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* stam */

        ctx.fillStyle =
            "#704526";

        ctx.fillRect(
            x - 8,
            y - 5,
            16,
            35
        );


        /* bladeren */

        ctx.fillStyle =
            "#26763d";

        ctx.beginPath();

        ctx.arc(
            x,
            y - 15,
            30,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#3c9b51";

        ctx.beginPath();

        ctx.arc(
            x - 13,
            y - 25,
            17,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 14,
            y - 23,
            17,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    /* =========================
       STEEN
    ========================= */

    if (
        object.type === "stone"
    ) {

        ctx.fillStyle =
            "rgba(0,0,0,.25)";

        ctx.beginPath();

        ctx.ellipse(
            x,
            y + 14,
            22,
            9,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#737d82";

        ctx.beginPath();

        ctx.moveTo(
            x - 22,
            y + 8
        );

        ctx.lineTo(
            x - 15,
            y - 15
        );

        ctx.lineTo(
            x + 3,
            y - 23
        );

        ctx.lineTo(
            x + 22,
            y - 8
        );

        ctx.lineTo(
            x + 16,
            y + 12
        );

        ctx.closePath();

        ctx.fill();


        ctx.strokeStyle =
            "#9ba4a7";

        ctx.stroke();

    }


    /* =========================
       ERTS
    ========================= */

    if (
        object.type === "ore"
    ) {

        ctx.fillStyle =
            "#4f5559";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            22,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#e2a733";


        ctx.beginPath();

        ctx.arc(
            x - 7,
            y - 5,
            5,
            0,
            Math.PI * 2
        );

        ctx.arc(
            x + 8,
            y + 5,
            5,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    /* =========================
       KRISTAL
    ========================= */

    if (
        object.type === "crystal"
    ) {

        ctx.shadowBlur = 15;

        ctx.shadowColor =
            "#b856ff";

        ctx.fillStyle =
            "#c85cff";


        ctx.beginPath();

        ctx.moveTo(
            x,
            y - 30
        );

        ctx.lineTo(
            x + 17,
            y
        );

        ctx.lineTo(
            x,
            y + 27
        );

        ctx.lineTo(
            x - 17,
            y
        );

        ctx.closePath();

        ctx.fill();


        ctx.shadowBlur = 0;

    }


    /* =========================
       VIJAND
    ========================= */

    if (
        object.type === "enemy"
    ) {

        ctx.fillStyle =
            "rgba(0,0,0,.3)";

        ctx.beginPath();

        ctx.ellipse(
            x,
            y + 15,
            25,
            10,
            0,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#7345a8";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            22,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /* ogen */

        ctx.fillStyle =
            "#ffffff";

        ctx.fillRect(
            x - 10,
            y - 7,
            7,
            7
        );

        ctx.fillRect(
            x + 3,
            y - 7,
            7,
            7
        );


        ctx.fillStyle =
            "#222";

        ctx.fillRect(
            x - 8,
            y - 5,
            3,
            3
        );

        ctx.fillRect(
            x + 5,
            y - 5,
            3,
            3
        );

    }

}


/* =====================================================
   SPELER TEKENEN
===================================================== */

function drawPlayer() {

    const x =
        player.x -
        camera.x;

    const y =
        player.y -
        camera.y;


    /* schaduw */

    ctx.fillStyle =
        "rgba(0,0,0,.35)";

    ctx.beginPath();

    ctx.ellipse(
        x,
        y + 18,
        17,
        9,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* lichaam */

    ctx.fillStyle =
        "#317fd1";

    ctx.beginPath();

    ctx.arc(
        x,
        y + 5,
        14,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* hoofd */

    ctx.fillStyle =
        "#e4b07d";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 12,
        10,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* haar */

    ctx.fillStyle =
        "#3a261a";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 17,
        10,
        Math.PI,
        Math.PI * 2
    );

    ctx.fill();


    /* outline */

    ctx.strokeStyle =
        "rgba(0,0,0,.5)";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.arc(
        x,
        y + 5,
        14,
        0,
        Math.PI * 2
    );

    ctx.stroke();

}


/* =====================================================
   GROND
===================================================== */

function drawGround() {

    ctx.fillStyle =
        "#3b6339";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* graspatroon */

    ctx.strokeStyle =
        "rgba(150,210,120,.08)";


    const size = 50;


    const startX =
        -(
            camera.x % size
        );

    const startY =
        -(
            camera.y % size
        );


    for (
        let x = startX;
        x < canvas.width;
        x += size
    ) {

        for (
            let y = startY;
            y < canvas.height;
            y += size
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x,
                y
            );

            ctx.lineTo(
                x + 4,
                y - 7
            );

            ctx.stroke();

        }

    }

}


/* =====================================================
   DAG / NACHT
===================================================== */

let worldTime = 0;


function drawDayNight() {

    worldTime += .0003;


    const darkness =
        (
            Math.sin(worldTime)
            + 1
        ) / 2;


    if (
        darkness > .72
    ) {

        const alpha =
            (darkness - .72)
            * .65;


        ctx.fillStyle =
            `rgba(8,12,40,${alpha})`;


        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

    }

}


/* =====================================================
   VERZAMELEN
===================================================== */

canvas.addEventListener(
    "click",
    function(event) {

        if (!gameRunning)
            return;


        const rect =
            canvas.getBoundingClientRect();


        const mouseX =
            event.clientX -
            rect.left;


        const mouseY =
            event.clientY -
            rect.top;


        const worldX =
            mouseX +
            camera.x;


        const worldY =
            mouseY +
            camera.y;


        let target = null;

        let closest = 70;


        for (
            const object
            of objects
        ) {

            if (!object.alive)
                continue;


            const distance =
                Math.hypot(
                    object.x - worldX,
                    object.y - worldY
                );


            if (
                distance < closest
            ) {

                closest =
                    distance;

                target =
                    object;

            }

        }


        if (!target) {

            return;

        }


        /* alleen dichtbij */

        const playerDistance =
            Math.hypot(
                target.x - player.x,
                target.y - player.y
            );


        if (
            playerDistance > 130
        ) {

            showMessage(
                "Je staat te ver weg!"
            );

            return;

        }


        collect(target);

    }
);


/* =====================================================
   COLLECT
===================================================== */

function collect(object) {

    object.hp--;


    if (
        object.hp > 0
    ) {

        showMessage(
            "Nog " +
            object.hp +
            " keer!"
        );

        return;

    }


    if (
        object.type === "tree"
    ) {

        inventory.wood +=
            inventory.axe
                ? 5
                : 3;

        showMessage(
            "🌲 + hout"
        );

    }


    if (
        object.type === "stone"
    ) {

        inventory.stone +=
            inventory.pickaxe
                ? 4
                : 2;

        showMessage(
            "🪨 + steen"
        );

    }


    if (
        object.type === "ore"
    ) {

        inventory.ore +=
            inventory.pickaxe
                ? 4
                : 2;

        showMessage(
            "⛏️ + erts"
        );

    }


    if (
        object.type === "crystal"
    ) {

        inventory.crystal++;

        showMessage(
            "💎 + kristal"
        );

    }


    if (
        object.type === "enemy"
    ) {

        showMessage(
            "👾 Vijand verslagen!"
        );

    }


    object.alive = false;


    updateUI();

}


/* =====================================================
   CRAFTING
===================================================== */

document
    .querySelectorAll(".craftButton")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function() {

                    craft(
                        button.dataset.craft
                    );

                }
            );

        }
    );


function craft(type) {


    /* BIJL */

    if (
        type === "axe"
    ) {

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
                "Niet genoeg materialen!"
            );

        }

    }


    /* PIKHOUWEEL */

    if (
        type === "pickaxe"
    ) {

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
                "Niet genoeg materialen!"
            );

        }

    }


    /* LANTAARN */

    if (
        type === "lantern"
    ) {

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
                "Niet genoeg materialen!"
            );

        }

    }


    /* BLOK */

    if (
        type === "block"
    ) {

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
                "Niet genoeg materialen!"
            );

        }

    }


    updateUI();

}


/* =====================================================
   UI
===================================================== */

function updateUI() {

    document.getElementById(
        "wood"
    ).textContent =
        inventory.wood;


    document.getElementById(
        "stone"
    ).textContent =
        inventory.stone;


    document.getElementById(
        "ore"
    ).textContent =
        inventory.ore;


    document.getElementById(
        "crystal"
    ).textContent =
        inventory.crystal;


    document.getElementById(
        "block"
    ).textContent =
        inventory.block;


    const health =
        Math.max(
            0,
            inventory.health ||
            player.health
        );


    document.getElementById(
        "health"
    ).style.width =
        player.health + "%";


    document.getElementById(
        "healthText"
    ).textContent =
        Math.round(
            player.health
        ) +
        " / " +
        player.maxHealth;

}


/* =====================================================
   MELDING
===================================================== */

let messageTimer;


function showMessage(text) {

    message.textContent =
        text;


    message.classList.add(
        "show"
    );


    clearTimeout(
        messageTimer
    );


    messageTimer =
        setTimeout(
            function() {

                message.classList.remove(
                    "show"
                );

            },
            1300
        );

}


/* =====================================================
   VIJANDEN
===================================================== */

function updateEnemies() {

    for (
        const enemy
        of objects
    ) {

        if (
            !enemy.alive ||
            enemy.type !== "enemy"
        ) {

            continue;

        }


        const dx =
            player.x -
            enemy.x;


        const dy =
            player.y -
            enemy.y;


        const distance =
            Math.hypot(
                dx,
                dy
            );


        if (
            distance < 260 &&
            distance > 45
        ) {

            enemy.x +=
                dx / distance *
                .45;

            enemy.y +=
                dy / distance *
                .45;

        }


        if (
            distance < 45
        ) {

            player.health -= .12;


            updateUI();


            if (
                player.health <= 0
            ) {

                player.health = 0;

                gameRunning = false;

                document
                    .getElementById(
                        "gameOver"
                    )
                    .classList.add(
                        "show"
                    );

            }

        }

    }

}


/* =====================================================
   TEKENEN
===================================================== */

function draw() {

    drawGround();


    updateCamera();


    /* sorteer objecten */

    const visibleObjects =
        objects
            .filter(
                object =>
                    object.alive
            )
            .sort(
                (a,b) => {

                    const da =
                        Math.hypot(
                            a.x - player.x,
                            a.y - player.y
                        );

                    const db =
                        Math.hypot(
                            b.x - player.x,
                            b.y - player.y
                        );

                    return db - da;

                }
            );


    for (
        const object
        of visibleObjects
    ) {

        drawObject(object);

    }


    drawPlayer();


    drawDayNight();

}


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop() {

    if (
        !gameRunning
    ) {

        return;

    }


    movePlayer();

    updateEnemies();

    draw();


    requestAnimationFrame(
        gameLoop
    );

}


/* =====================================================
   BEGIN
===================================================== */

updateUI();

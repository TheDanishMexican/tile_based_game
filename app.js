//#region controller
window.addEventListener("load", start);

function start() {
    createTiles();
    displayTiles();

    document.addEventListener("keydown", keyBoardPressed);
    document.addEventListener("keyup", keyBoardReleased);
    requestAnimationFrame(tick);
}

//#endregion

//#region model

let lastTime = 0;
const visualPlayer = document.querySelector("#player");
const visualEnemy = document.querySelector("#enemy");
const startButton = document.querySelector("#start-button");

const controls = {
    up: false,
    down: false,
    right: false,
    left: false
};
const playerObj = {
    x: 50,
    y: 50,
    regX: 12,
    regY: 26,
    speed: 100,
    width: 28,
    height: 32,
    hitboxW: 18,
    hitboxH: 25,
    hitboxX: 5,
    hitboxY: 5,
    moving: false,
    direction: undefined
};
const enemyObj = {
    x: 208,
    y: 200,
    width: 32,
    height: 40,
    movingRight: true,
    speed: 100
};

const tiles = [
    [0, 0, 0, 0, 0, 0, 6, 3, 0, 0, 0, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 2, 4, 4, 4, 2],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 2, 4, 4, 4, 2],
    [0, 6, 0, 1, 0, 0, 0, 3, 0, 1, 0, 2, 2, 5, 2, 2],
    [0, 0, 0, 1, 0, 6, 0, 3, 0, 1, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 3, 0, 1, 1, 1, 1, 1, 1, 6],
    [0, 0, 0, 0, 0, 0, 0, 3, 6, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 0, 0, 0, 0, 0, 6]
];

const grid_height = tiles.length;
const grid_width = tiles[0].length;
const tile_size = 32;


function getTileAtCoordinate({ row, col }) {
    return tiles[row][col];
}

function getTileAtPosition({ x, y }) {
    return tiles[Math.floor(y / tile_size)][Math.floor(x / tile_size)];
}

function getCoordinateFromPosition({ x, y }) {
    return { row: Math.floor(y / tile_size), col: Math.floor(x / tile_size) };
}

function getPositionFromCoordinate({ row, col }) {
    return { x: col * tile_size, y: row * tile_size };
}

function getTileCoordinateUnder(playerObj) {
    return getCoordinateFromPosition(playerObj);
}

function isTileWalkable({ row, col }) {
    const tileValue = getTileAtCoordinate({ row, col });

    switch (tileValue) {
        case 0:
            return true;
        case 1:
            return true;
        case 2:
            return false;
        case 3:
            return false;
        case 4:
            return true;
        case 5:
            return false;
        case 6:
            return false;
    }
}

//#endregion

//#region view

function createTiles() {
    const container = document.querySelector("#background");

    for (let row = 0; row < grid_height; row++) {
        for (let col = 0; col < grid_width; col++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            container.append(tile);
        }
    }
    container.style.setProperty("--tile_size", tile_size);
    container.style.setProperty("--grid_width", grid_width);
    container.style.setProperty("--grid_height", grid_height);
}

function displayTiles() {
    const visualTiles = document.querySelectorAll(".tile");
    const tileClasses = ["grass", "path", "wall", "water", "floor", "gate", "tree"];
    for (let row = 0; row < grid_height; row++) {
        for (let col = 0; col < grid_width; col++) {
            const visualTile = visualTiles[row * grid_width + col];

            visualTile.classList.add(tileClasses[getTileAtCoordinate({ row, col })]);
        }
    }
}

//#endregion

//#region DEBUG 
let prevTile = null;

function highlightTile({ row, col }) {
    const tile = getVisualTileFromCords({ row, col });
    tile.classList.add("highlight");
}

function unhighlightTile({ row, col }) {
    getVisualTileFromCords({ row, col }).classList.remove("highlight");
}

function getVisualTileFromCords({ row, col }) {
    const visualTiles = document.querySelectorAll(".tile");

    return visualTiles[row * grid_width + col];
}

function debugShowTileUnderPlayer() {
    const tileUnderPlayer = getTileCoordinateUnder(playerObj);

    if (prevTile) {
        unhighlightTile(prevTile);
    }

    highlightTile(tileUnderPlayer);

    prevTile = tileUnderPlayer;
}

function showPlayerRect() {
    visualPlayer.classList.add("show-rect");
}

function showPlayerRegPoint() {
    visualPlayer.style.setProperty("--regX", `${playerObj.regX}px`);
    visualPlayer.style.setProperty("--regY", `${playerObj.regY}px`);

    visualPlayer.classList.add("show-reg-point");
}

function showPlayerHitbox() {
    visualPlayer.style.setProperty("--hitboxW", playerObj.hitboxW);
    visualPlayer.style.setProperty("--hitboxH", playerObj.hitboxH);
    visualPlayer.style.setProperty("--hitboxX", `${playerObj.hitboxX}px`);
    visualPlayer.style.setProperty("--hitboxY", `${playerObj.hitboxY}px`);

    visualPlayer.classList.add("show-hitbox");
}

function showDebugging() {
    showPlayerRegPoint();
    debugShowTileUnderPlayer();
    showPlayerRect();
    showPlayerHitbox();
}


//#endregion

//#region player logic

function tick(time) {
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    requestAnimationFrame(tick);
    movePlayer(deltaTime);
    // moveEnemy(deltaTime);
    displayModelPlayer();
    // collision(playerObj, enemyObj);
    displayPlayerAnimation();
    showDebugging();
}

function displayModelPlayer() {
    // visualEnemy.style.transform = `translate(${enemyObj.x}px, ${enemyObj.y}px)`;
    visualPlayer.style.transform = `translate(${playerObj.x - playerObj.regX}px, ${playerObj.y - playerObj.regY}px)`;
}

function movePlayer(deltaTime) {
    playerObj.moving = false;

    const newPosition = {
        x: playerObj.x,
        y: playerObj.y
    };

    if (controls.up) {
        playerObj.moving = true;
        playerObj.direction = "up";
        newPosition.y -= playerObj.speed * deltaTime;
    }
    if (controls.down) {
        playerObj.moving = true;
        playerObj.direction = "down";
        newPosition.y += playerObj.speed * deltaTime;
    }
    if (controls.right) {
        playerObj.moving = true;
        playerObj.direction = "right";
        newPosition.x += playerObj.speed * deltaTime;
    }
    if (controls.left) {
        playerObj.moving = true;
        playerObj.direction = "left";
        newPosition.x -= playerObj.speed * deltaTime;
    }

    if (canMove(playerObj, newPosition)) {
        playerObj.x = newPosition.x;
        playerObj.y = newPosition.y;
    }
}

function keyBoardPressed(event) {
    switch (event.key) {
        case "ArrowDown":
            controls.down = true;
            break;
        case "ArrowLeft":
            controls.left = true;
            break;
        case "ArrowUp":
            controls.up = true;
            break;
        case "ArrowRight":
            controls.right = true;
            break;
    }
}

function keyBoardReleased(event) {
    switch (event.key) {
        case "ArrowUp":
            controls.up = false;
            break;
        case "ArrowDown":
            controls.down = false;
            break;
        case "ArrowRight":
            controls.right = false;
            break;
        case "ArrowLeft":
            controls.left = false;
            break;
    }
}

function canMove(playerObj, newPosition) {
    const { row, col } = getCoordinateFromPosition(newPosition);

    if (
        row < 0 || row >= grid_height ||
        col < 0 || col >= grid_width || isTileWalkable({ row, col }) == false
    ) {
        return false;
    }

    return true;
}

function collision(playerObj, enemyObj) {
    if (
        playerObj.x < enemyObj.x + enemyObj.width &&
        playerObj.x + playerObj.width > enemyObj.x &&
        playerObj.y < enemyObj.y + enemyObj.height &&
        playerObj.y + playerObj.height > enemyObj.y
    ) {

        visualPlayer.classList.add('spin');
        setTimeout(() => { visualPlayer.classList.remove("spin"); }, 500);

    }

}

function moveEnemy(deltaTime) {
    const enemyWidth = enemyObj.width;
    const gameWidth = gameFieldRect.width;
    const minX = 0;
    const maxX = gameWidth - enemyWidth;
    const maxDeltaTime = 0.1;

    deltaTime = Math.min(deltaTime, maxDeltaTime);


    if (enemyObj.movingRight) {
        enemyObj.x += enemyObj.speed * deltaTime;
        if (enemyObj.x >= maxX) {
            enemyObj.x = maxX;
            enemyObj.movingRight = false;
        }
    } else {
        enemyObj.x -= enemyObj.speed * deltaTime;
        if (enemyObj.x <= minX) {
            enemyObj.x = minX;
            enemyObj.movingRight = true;
        }
    }
}

function displayPlayerAnimation() {
    if (playerObj.moving) {
        visualPlayer.classList.add("animate");
        visualPlayer.classList.remove("up", "down", "left", "right");
        visualPlayer.classList.add(playerObj.direction);
    } else {
        visualPlayer.classList.remove("animate");
    }
}

//#endregion
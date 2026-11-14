
const board = document.getElementById("puzzleBoard");
const preview = document.getElementById("preview");
const timerDisplay = document.getElementById("timer");
const levelDisplay = document.getElementById("level");
const movesDisplay = document.getElementById("moves");
const message = document.getElementById("message");

const categorySelect = document.getElementById("category");
const difficultySelect = document.getElementById("difficulty");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalEmoji = document.getElementById("modalEmoji");
const nextBtn = document.getElementById("nextBtn");

// Beautiful picture collections
const pictures = {
    flowers: [
        "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900",
        "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=900",
        "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=900"
    ],

    nature: [
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900",
        "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=900"
    ],

    animals: [
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=900",
        "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=900",
        "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=900"
    ],

    cute: [
        "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=900",
        "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=900",
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900"
    ],

    landscapes: [
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900",
        "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900"
    ]
};

// Difficulty settings
const difficulties = {
    easy: {
        size: 3,
        time: 180
    },
    medium: {
        size: 4,
        time: 300
    },
    hard: {
        size: 5,
        time: 480
    }
};

let currentLevel = 1;
let moves = 0;
let seconds = 180;
let size = 3;
let tiles = [];
let selectedTile = null;
let timer = null;
let gameStarted = false;
let modalAction = "next";

// Get the selected picture
function getPicture() {
    const category = categorySelect.value;
    return pictures[category][currentLevel - 1];
}

// Format timer
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const secs = time % 60;

    return String(minutes).padStart(2, "0") + ":" +
           String(secs).padStart(2, "0");
}

// Update timer display
function updateTimer() {
    timerDisplay.textContent = formatTime(seconds);

    timerDisplay.style.color =
        seconds <= 30 ? "#e45b82" : "#b36d9e";
}

// Update game information
function updateInfo() {
    levelDisplay.textContent = currentLevel + " / 3";
    movesDisplay.textContent = moves;
    updateTimer();
}

// Shuffle pieces
function shuffleTiles() {
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    // Make sure the puzzle is not already solved
    if (isSolved()) {
        [tiles[0], tiles[1]] = [tiles[1], tiles[0]];
    }
}

// Start a new puzzle
function createPuzzle() {
    clearInterval(timer);

    const settings = difficulties[difficultySelect.value];

    size = settings.size;
    seconds = settings.time;
    moves = 0;
    selectedTile = null;

    const image = getPicture();

    preview.src = image;

    tiles = Array.from(
        { length: size * size },
        (_, index) => index
    );

    shuffleTiles();

    board.innerHTML = "";

    board.style.gridTemplateColumns =
        `repeat(${size}, 1fr)`;

    board.style.gridTemplateRows =
        `repeat(${size}, 1fr)`;

    tiles.forEach((piece, index) => {
        const tile = document.createElement("button");

        tile.className = "tile";
        tile.type = "button";
        tile.draggable = true;

        tile.dataset.position = index;

        tile.style.backgroundImage = `url("${image}")`;

        tile.style.backgroundSize =
            `${size * 100}% ${size * 100}%`;

        const row = Math.floor(piece / size);
        const col = piece % size;

        const x = size === 1 ? 0 : col * 100 / (size - 1);
        const y = size === 1 ? 0 : row * 100 / (size - 1);

        tile.style.backgroundPosition = `${x}% ${y}%`;

        tile.addEventListener("click", () => {
            selectTile(index);
        });

        // Desktop dragging
        tile.addEventListener("dragstart", event => {
            if (!gameStarted) {
                event.preventDefault();
                return;
            }

            selectedTile = index;
            event.dataTransfer.setData(
                "text/plain",
                String(index)
            );
        });

        tile.addEventListener("dragover", event => {
            event.preventDefault();
        });

        tile.addEventListener("drop", event => {
            event.preventDefault();

            if (!gameStarted) return;

            const from = Number(
                event.dataTransfer.getData("text/plain")
            );

            swapTiles(from, index);
        });

        board.appendChild(tile);
    });

    updateInfo();
    message.textContent =
        "Your beautiful puzzle is ready! 🌸";
}

// Select pieces by clicking
function selectTile(index) {
    if (!gameStarted) return;

    const tileElements = board.querySelectorAll(".tile");

    if (selectedTile === null) {
        selectedTile = index;
        tileElements[index].classList.add("selected");
    } else if (selectedTile === index) {
        tileElements[index].classList.remove("selected");
        selectedTile = null;
    } else {
        swapTiles(selectedTile, index);
    }
}

// Swap two puzzle pieces
function swapTiles(first, second) {
    if (!gameStarted || first === second) return;

    if (
        first < 0 || second < 0 ||
        first >= tiles.length || second >= tiles.length
    ) return;

    [tiles[first], tiles[second]] =
        [tiles[second], tiles[first]];

    moves++;
    selectedTile = null;

    updateInfo();
    renderTiles();

    if (isSolved()) {
        completeLevel();
    }
}

// Render the updated pieces
function renderTiles() {
    const image = getPicture();
    const tileElements = board.querySelectorAll(".tile");

    tiles.forEach((piece, index) => {
        const tile = tileElements[index];

        tile.classList.remove("selected");

        const row = Math.floor(piece / size);
        const col = piece % size;

        const x = col * 100 / (size - 1);
        const y = row * 100 / (size - 1);

        tile.style.backgroundImage = `url("${image}")`;
        tile.style.backgroundPosition = `${x}% ${y}%`;
    });
}

// Check whether the puzzle is complete
function isSolved() {
    return tiles.every(
        (piece, index) => piece === index
    );
}

// Start the timer
function startTimer() {
    clearInterval(timer);

    timer = setInterval(() => {
        if (!gameStarted) return;

        seconds--;
        updateTimer();

        if (seconds <= 0) {
            clearInterval(timer);
            gameStarted = false;

            showModal(
                "⏰",
                "Time's Up!",
                "Don't worry! Every puzzle takes practice. Try this level again!",
                "Try Again",
                "retry"
            );
        }
    }, 1000);
}

// Start game
function startGame() {
    currentLevel = 1;
    gameStarted = true;

    modal.classList.add("hidden");

    createPuzzle();
    startTimer();
}

// Complete a level
function completeLevel() {
    clearInterval(timer);
    gameStarted = false;

    if (currentLevel < 3) {
        showModal(
            "🌟",
            "Level Completed!",
            `Amazing work! You completed level ${currentLevel} in ${moves} moves!`,
            "Next Level →",
            "next"
        );
    } else {
        showModal(
            "🏆",
            "You Won!",
            `Congratulations! You completed all 3 levels in ${moves} moves! You are a puzzle master!`,
            "Play Again",
            "finish"
        );
    }
}

// Display popup
function showModal(emoji, title, text, buttonText, action) {
    modalEmoji.textContent = emoji;
    modalTitle.textContent = title;
    modalText.textContent = text;
    nextBtn.textContent = buttonText;

    modalAction = action;
    modal.classList.remove("hidden");
}

// Next level or restart
nextBtn.addEventListener("click", () => {
    modal.classList.add("hidden");

    if (modalAction === "next") {
        currentLevel++;
        gameStarted = true;

        createPuzzle();
        startTimer();

    } else if (
        modalAction === "retry" ||
        modalAction === "finish"
    ) {
        startGame();
    }
});

// Shuffle button
document.getElementById("shuffleBtn")
    .addEventListener("click", () => {

        if (!gameStarted) {
            message.textContent =
                "Press Start Game before shuffling!";
            return;
        }

        shuffleTiles();
        selectedTile = null;

        renderTiles();

        message.textContent = "Pieces shuffled! 🔀";
    });

// Restart button
document.getElementById("restartBtn")
    .addEventListener("click", () => {
        startGame();
    });

// Start button
document.getElementById("startBtn")
    .addEventListener("click", () => {
        startGame();
    });

// Preview picture changes when category changes
categorySelect.addEventListener("change", () => {
    preview.src = getPicture();

    if (!gameStarted) {
        message.textContent =
            "New picture selected! Press Start Game.";
    }
});

// Change difficulty before starting
difficultySelect.addEventListener("change", () => {
    if (!gameStarted) {
        const settings = difficulties[difficultySelect.value];

        seconds = settings.time;
        size = settings.size;

        updateTimer();

        message.textContent =
            "Difficulty changed! Press Start Game.";
    }
});

// Initial screen
preview.src = getPicture();
updateInfo();

message.textContent =
    "Welcome! Choose your category and difficulty, then start playing. 💗";

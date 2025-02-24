const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("scoreDisplay");
const pipeScoreDisplay = document.getElementById("pipeScoreDisplay");
const coinScoreDisplay = document.getElementById("coinScoreDisplay");
const highScoreDisplay = document.getElementById("highScoreDisplay");
const allTimeHighScoreDisplay = document.getElementById("allTimeHighScoreDisplay");
const startMenu = document.getElementById("startMenu");
const gameOverMenu = document.getElementById("gameOverMenu");
const finalScoreDisplay = document.getElementById("finalScore");
const newHighScoreDisplay = document.getElementById("newHighScore");
const newAllTimeHighScoreDisplay = document.getElementById("newAllTimeHighScore");
const settingsMenu = document.getElementById("settingsMenu");
const pauseMenu = document.getElementById("pauseMenu");
const pauseButton = document.getElementById("pauseButton");
const settingsButton = document.getElementById("settingsButton");
const featurePanel = document.getElementById("featurePanel");
const flapSound = document.getElementById("flapSound");
const coinSound = document.getElementById("coinSound");
const backgroundMusic = document.getElementById("backgroundMusic");
const loadingScreen = document.getElementById("loadingScreen");
const masterVolumeControl = document.getElementById("masterVolume");
const soundEffectsVolumeControl = document.getElementById("soundEffectsVolume");
const musicVolumeControl = document.getElementById("musicVolume");
const birdSkinSelect = document.getElementById("birdSkinSelect");
const backgroundSelect = document.getElementById("backgroundSelect");
const difficultySelect = document.getElementById("difficultySelect");
const pipeSkinSelect = document.getElementById("pipeSkinSelect");

let assetsLoaded = false;
let loadedAssets = 0;
const totalAssets = 6;
const birdSkins = {};
const backgroundThemes = {};
const pipeStyles = {
    "green": "#1e8449",
    "red": "red",
    "blue": "blue"
};
let birdImage;
let backgroundImage;
let pipeColor = pipeStyles["green"];
let currentPipeSkin = "green";
let currentBirdSkin = "bird_red.png";
let currentBackgroundTheme = "sky_background.png";
let isMusicPlaying = false;
const groundColor = "#8B4513";
const groundTextureColor = "#654321";
const grassColors = ["#4CAF50", "#66BB6A", "#81C784"];
const grassBladeColor = "#388E3C";
const grassBladeThickness = 3;
const grassBladeHeightMin = 15;
const grassBladeHeightMax = 30;
const grassTransparency = 0.7;
const coinColor = "#FFD700";
const coinOutlineColor = "#DAA520";
const enhancedCoinGradient = "#EEC900";
const HIGH_SCORE_KEY = "flippyBirdAllTimeHighScore";
const BIRD_SKIN_KEY = "flippyBirdSkin";
const BACKGROUND_THEME_KEY = "flippyBackground";
const PIPE_SKIN_KEY = "flippyPipeSkin";
const MUSIC_SETTING_KEY = "flippyBirdMusicSetting";
const SOUND_VOLUME_KEY = "flippyBirdSoundVolume";
const MUSIC_VOLUME_KEY = "flippyBirdMusicVolume";
const DIFFICULTY_KEY = "flippyBirdDifficulty";

let gameState = {
    running: false,
    paused: false,
    gameOver: false,
    bird: null,
    physics: { gravity: 0.4, flapStrength: -6, pipeSpeed: 1 },
    pipes: [],
    coins: [],
    overallScore: 0,
    pipeScore: 0,
    coinScore: 0,
    highScore: 0,
    allTimeHighScore: 0,
    pipeConfig: { width: 80, gap: 200, spawnDistance: 300, baseSpeed: 3, frequency: 1500 },
    background: null,
    difficulty: "normal",
    groundHeight: 100,
    pipeSpawnTimer: 0,
    coinSpawnTimer: 0,
    coinSpawnInterval: 3000,
    pipeSpawnInterval: 1500,
};

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (gameState.bird) {
        gameState.bird.x = window.innerWidth / 4;
    }
    gameState.pipeConfig.gap = Math.max(150, Math.min(250, window.innerHeight * 0.35));
}

function loadSetting(key, defaultValue) {
    const savedSetting = localStorage.getItem(key);
    return savedSetting === null ? defaultValue : savedSetting;
}

function saveSetting(key, value) {
    localStorage.setItem(key, value);
}

function loadAllTimeHighScore() {
    return parseInt(loadSetting(HIGH_SCORE_KEY, "0"));
}

function saveAllTimeHighScore(score) {
    saveSetting(HIGH_SCORE_KEY, score.toString());
}

function resetAllTimeHighScore() {
    if (confirm("Are you sure you want to reset all high scores?")) {
        localStorage.removeItem(HIGH_SCORE_KEY);
        gameState.allTimeHighScore = 0;
        allTimeHighScoreDisplay.innerText = "All-Time Best: 0";
        highScoreDisplay.innerText = "High Score: 0";
        gameState.highScore = 0;
        alert("All high scores have been reset!");
    }
}

function applySettings() {
    currentBirdSkin = loadSetting(BIRD_SKIN_KEY, "bird_red.png");
    currentBackgroundTheme = loadSetting(BACKGROUND_THEME_KEY, "sky_background.png");
    currentPipeSkin = loadSetting(PIPE_SKIN_KEY, "green");
    isMusicPlaying = loadSetting(MUSIC_SETTING_KEY, "true") === "true";
    gameState.difficulty = loadSetting(DIFFICULTY_KEY, "normal");

    if (flapSound) flapSound.volume = parseFloat(loadSetting(SOUND_VOLUME_KEY, "0.7"));
    if (coinSound) coinSound.volume = parseFloat(loadSetting(SOUND_VOLUME_KEY, "0.7"));
    if (backgroundMusic) backgroundMusic.volume = parseFloat(loadSetting(MUSIC_VOLUME_KEY, "0.3"));

    pipeColor = pipeStyles[currentPipeSkin] || pipeStyles["green"];

    if (birdSkins[currentBirdSkin]) {
        birdImage = birdSkins[currentBirdSkin];
    }

    if (backgroundThemes[currentBackgroundTheme]) {
        backgroundImage = backgroundThemes[currentBackgroundTheme];
    }

    if (gameState.background) {
        gameState.background.changeImage(backgroundImage);
    }

    if (birdSkinSelect) birdSkinSelect.value = currentBirdSkin;
    if (backgroundSelect) backgroundSelect.value = currentBackgroundTheme;
    if (pipeSkinSelect) pipeSkinSelect.value = currentPipeSkin;
    if (difficultySelect) difficultySelect.value = gameState.difficulty;
    if (masterVolumeControl) masterVolumeControl.value = parseFloat(loadSetting("masterVolume", "1"));
    if (soundEffectsVolumeControl) soundEffectsVolumeControl.value = parseFloat(loadSetting(SOUND_VOLUME_KEY, "0.7"));
    if (musicVolumeControl) musicVolumeControl.value = parseFloat(loadSetting(MUSIC_VOLUME_KEY, "0.3"));

    updateVolume();
    resetPhysicsBasedOnDifficulty();

    if (isMusicPlaying && backgroundMusic) {
        backgroundMusic.play().catch(() => { });
    } else if (backgroundMusic) {
        backgroundMusic.pause();
    }
}

gameState.allTimeHighScore = loadAllTimeHighScore();
if (highScoreDisplay) highScoreDisplay.innerText = "High Score: 0";
if (allTimeHighScoreDisplay) allTimeHighScoreDisplay.innerText = "All-Time Best: " + gameState.allTimeHighScore;

class Bird {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocity = 0;
        this.gravity = 0;
        this.flapStrength = 0;
    }

    update(dt) {
        this.velocity += this.gravity * dt;
        this.y += this.velocity * dt;
    }

    flap() {
        this.velocity = this.flapStrength;
    }

    draw(ctx, image) {
        if (!image || !image.complete) {
            ctx.fillStyle = "red";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        const rotation = Math.min(Math.PI / 6, Math.max(-Math.PI / 6, this.velocity * 0.04));
        ctx.rotate(rotation);
        ctx.drawImage(image, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = 0;
    }

    applyPhysics(gravity, flapStrength) {
        this.gravity = gravity;
        this.flapStrength = flapStrength;
    }
}

class Pipe {
    constructor(x, topHeight, gap, groundHeight, canvasHeight, width) {
        this.x = x;
        this.topHeight = topHeight;
        this.gap = gap;
        this.bottomHeight = canvasHeight - groundHeight - topHeight - gap;
        this.width = width;
        this.scored = false;
        this.speed = 0;
    }

    update(dt) {
        this.x -= this.speed * dt;
    }

    draw(ctx, pipeColor, currentPipeSkin, canvasHeight, groundHeight) {
        switch (currentPipeSkin) {
            case "blue":
                drawBluePipe(ctx, this.x, this.topHeight, this.bottomHeight, this.width, canvasHeight, groundHeight);
                break;
            case "red":
                drawRedPipe(ctx, this.x, this.topHeight, this.bottomHeight, this.width, canvasHeight, groundHeight);
                break;
            default:
                ctx.fillStyle = pipeColor;
                ctx.fillRect(this.x, 0, this.width, this.topHeight);
                ctx.fillRect(this.x, canvasHeight - groundHeight - this.bottomHeight, this.width, this.bottomHeight);
                break;
        }
    }

    reset(x) {
        this.x = x;
        this.scored = false;
    }

    applySpeed(speed) {
        this.speed = speed;
    }
}

class Coin {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.collected = false;
        this.speed = 0;
    }

    update(dt) {
        this.x -= this.speed * dt;
    }

    draw(ctx) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, "white");
        gradient.addColorStop(0.2, enhancedCoinGradient);
        gradient.addColorStop(1, coinColor);
        ctx.fillStyle = gradient;
        ctx.strokeStyle = coinOutlineColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x - this.radius / 3, this.y - this.radius / 3, this.radius / 2, 0, Math.PI / 2, false);
        ctx.stroke();
    }

    reset(x) {
        this.x = x;
        this.collected = false;
    }

    applySpeed(speed) {
        this.speed = speed;
    }
}

class Background {
    constructor(image, speed) {
        this.image = image;
        this.speed = speed;
        this.x = 0;
    }

    update(dt, canvasWidth) {
        this.x -= this.speed * dt;
        if (this.x <= -canvasWidth) this.x = 0;
    }

    draw(ctx, canvasWidth, canvasHeight, groundHeight) {
        if (!this.image || !this.image.complete) {
            ctx.fillStyle = "#87CEEB";
            ctx.fillRect(0, 0, canvasWidth, canvasHeight - groundHeight);
            return;
        }

        ctx.drawImage(this.image, this.x, 0, canvasWidth, canvasHeight - groundHeight);
        ctx.drawImage(this.image, this.x + canvasWidth, 0, canvasWidth, canvasHeight - groundHeight);
    }

    reset() {
        this.x = 0;
    }

    applySpeed(speed) {
        this.speed = speed;
    }

    changeImage(image) {
        this.image = image;
    }
}

window.addEventListener("resize", resizeCanvas);

function resetPhysicsBasedOnDifficulty() {
    switch (gameState.difficulty) {
        case "easy":
            gameState.physics.gravity = 0.3;
            gameState.pipeConfig.baseSpeed = 2;
            gameState.pipeConfig.gap = 250;
            gameState.pipeSpawnInterval = 2000;
            break;
        case "hard":
            gameState.physics.gravity = 0.5;
            gameState.pipeConfig.baseSpeed = 4;
            gameState.pipeConfig.gap = 180;
            gameState.pipeSpawnInterval = 1000;
            break;
        default:
            gameState.physics.gravity = 0.4;
            gameState.pipeConfig.baseSpeed = 3;
            gameState.pipeConfig.gap = 200;
            gameState.pipeSpawnInterval = 1500;
            break;
    }
    gameState.physics.pipeSpeed = gameState.pipeConfig.baseSpeed;
    if (gameState.bird) gameState.bird.applyPhysics(gameState.physics.gravity, gameState.physics.flapStrength);
    gameState.pipes.forEach(pipe => pipe.applySpeed(gameState.physics.pipeSpeed));
    gameState.coins.forEach(coin => coin.applySpeed(gameState.physics.pipeSpeed));
    if (gameState.background) gameState.background.applySpeed(gameState.physics.pipeSpeed / 3);
}

function resetGameElements() {
    if (gameState.bird) gameState.bird.reset(window.innerWidth / 4, window.innerHeight / 2);
    gameState.pipes = [];
    gameState.coins = [];
    if (gameState.background) gameState.background.reset();
    gameState.pipeSpawnTimer = 0;
    gameState.coinSpawnTimer = 0;
}

function resetScores() {
    gameState.overallScore = 0;
    gameState.pipeScore = 0;
    gameState.coinScore = 0;
}

function updateScoreDisplay() {
    if (!pipeScoreDisplay || !coinScoreDisplay || !scoreDisplay ||
        !highScoreDisplay || !allTimeHighScoreDisplay) return;

    pipeScoreDisplay.innerText = "Pipes: " + gameState.pipeScore;
    coinScoreDisplay.innerText = "Coins: " + gameState.coinScore;
    scoreDisplay.innerText = "Score: " + gameState.overallScore;
    highScoreDisplay.innerText = "High Score: " + gameState.highScore;
    allTimeHighScoreDisplay.innerText = "All-Time Best: " + gameState.allTimeHighScore;
}

function initializeGame() {
    resizeCanvas();
    resetGameElements();
    resetScores();
    gameState.running = true;
    gameState.paused = false;
    gameState.gameOver = false;

    if (pauseButton) pauseButton.textContent = "Pause";
    if (settingsButton) settingsButton.disabled = false;
    if (featurePanel) featurePanel.style.display = 'flex';

    resetPhysicsBasedOnDifficulty();
    updateScoreDisplay();

    if (startMenu) startMenu.style.display = "none";
    if (gameOverMenu) gameOverMenu.style.display = "none";
    if (settingsMenu) settingsMenu.style.display = "none";
    if (pauseMenu) pauseMenu.style.display = "none";
    if (newHighScoreDisplay) newHighScoreDisplay.style.display = "none";
    if (newAllTimeHighScoreDisplay) newAllTimeHighScoreDisplay.style.display = "none";

    if (backgroundMusic && isMusicPlaying) {
        backgroundMusic.play().catch(() => { });
    }
}

function generatePipeHeight() {
    const minHeight = 50;
    const maxHeight = window.innerHeight - gameState.pipeConfig.gap - minHeight - gameState.groundHeight;
    return Math.random() * (maxHeight - minHeight) + minHeight;
}

function createPipe() {
    const topHeight = generatePipeHeight();
    let pipe = new Pipe(window.innerWidth, topHeight, gameState.pipeConfig.gap, gameState.groundHeight, window.innerHeight, gameState.pipeConfig.width);
    pipe.applySpeed(gameState.physics.pipeSpeed);
    createCoinInPipeGap(pipe);
    gameState.pipes.push(pipe);
    gameState.pipeSpawnTimer = 0;
}

function createCoinInPipeGap(pipe) {
    const coinY = pipe.topHeight + gameState.pipeConfig.gap / 2;
    if (coinY < pipe.topHeight + 50 || coinY > window.innerHeight - gameState.groundHeight - pipe.bottomHeight - 50) return;
    let coin = new Coin(pipe.x + gameState.pipeConfig.width / 2, coinY, 18);
    coin.applySpeed(gameState.physics.pipeSpeed);
    gameState.coins.push(coin);
}

function createSkyCoin(dt) {
    gameState.coinSpawnTimer += dt;
    if (gameState.coinSpawnTimer >= gameState.coinSpawnInterval) {
        gameState.coinSpawnTimer = 0;
        let coinY = Math.random() * (window.innerHeight - gameState.groundHeight - 100) + 50;
        let coin = new Coin(window.innerWidth, coinY, 15);
        coin.applySpeed(gameState.physics.pipeSpeed);
        gameState.coins.push(coin);
    }
}

let lastTime = performance.now();

function startGame() {
    if (!assetsLoaded) {
        console.warn("Assets not loaded");
        return;
    }
    gameState.bird = new Bird(window.innerWidth / 4, window.innerHeight / 2, 50, 36);
    gameState.background = new Background(backgroundImage, 1);

    if (featurePanel) featurePanel.style.display = 'flex';
    if (settingsButton) settingsButton.style.display = 'block';

    initializeGame();
    lastTime = performance.now();
    gameLoop();
}

function restartGame() {
    initializeGame();
    lastTime = performance.now();
    gameLoop();
}

function showStartMenu() {
    gameState.running = false;
    gameState.paused = false;

    if (startMenu) startMenu.style.display = "flex";
    if (gameOverMenu) gameOverMenu.style.display = "none";
    if (settingsMenu) settingsMenu.style.display = "none";
    if (pauseMenu) pauseMenu.style.display = "none";
    if (featurePanel) featurePanel.style.display = 'none';
}

function flap(e) {
    if (e) e.preventDefault();
    if (gameState.running && !gameState.paused && !gameState.gameOver && gameState.bird) {
        gameState.bird.flap();
        if (flapSound) {
            flapSound.currentTime = 0;
            flapSound.play().catch(() => { });
        }
    }
}

if (canvas) {
    canvas.addEventListener("mousedown", flap);
    canvas.addEventListener("touchstart", flap);
}

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") flap(e);
    if (e.code === "Escape" && gameState.running && !gameState.gameOver) togglePause();
});

function updateGame(dt) {
    if (!gameState.running || gameState.paused || gameState.gameOver || !gameState.bird) return;

    gameState.bird.update(dt);
    if (gameState.background) gameState.background.update(dt, window.innerWidth);

    if (gameState.bird.y < 0) {
        gameState.bird.y = 0;
        gameState.bird.velocity = 0;
    }

    if (gameState.bird.y + gameState.bird.height > window.innerHeight - gameState.groundHeight) {
        gameOver();
        return;
    }

    gameState.pipeSpawnTimer += dt;
    if (gameState.pipes.length === 0 || gameState.pipeSpawnTimer >= gameState.pipeSpawnInterval) {
        createPipe();
    }
    createSkyCoin(dt * 16.67);

    for (let i = gameState.pipes.length - 1; i >= 0; i--) {
        const pipe = gameState.pipes[i];
        pipe.update(dt);
        if (pipe.x < -pipe.width) {
            gameState.pipes.splice(i, 1);
        }

        const birdRight = gameState.bird.x + gameState.bird.width;
        const birdBottom = gameState.bird.y + gameState.bird.height;
        const pipeRight = pipe.x + pipe.width;

        if (birdRight > pipe.x && gameState.bird.x < pipeRight) {
            if (gameState.bird.y < pipe.topHeight || birdBottom > window.innerHeight - gameState.groundHeight - pipe.bottomHeight) {
                gameOver();
                return;
            }
        }

        if (!pipe.scored && gameState.bird.x > pipeRight) {
            pipe.scored = true;
            gameState.pipeScore++;
            gameState.overallScore = gameState.pipeScore + gameState.coinScore;
            updateScoreDisplay();
            if (gameState.overallScore > gameState.highScore) {
                gameState.highScore = gameState.overallScore;
                updateScoreDisplay();
            }
        }
    }

    for (let i = gameState.coins.length - 1; i >= 0; i--) {
        const coin = gameState.coins[i];
        coin.update(dt);
        if (coin.x < -coin.radius * 2) {
            gameState.coins.splice(i, 1);
            continue;
        }

        const dx = gameState.bird.x + gameState.bird.width / 2 - coin.x;
        const dy = gameState.bird.y + gameState.bird.height / 2 - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < gameState.bird.width / 2 + coin.radius && !coin.collected) {
            coin.collected = true;
            gameState.coinScore += 10;
            gameState.overallScore = gameState.pipeScore + gameState.coinScore;
            updateScoreDisplay();
            if (coinSound) {
                coinSound.currentTime = 0;
                coinSound.play().catch(() => { });
            }
            gameState.coins.splice(i, 1);
            if (gameState.overallScore > gameState.highScore) {
                gameState.highScore = gameState.overallScore;
                updateScoreDisplay();
            }
        }
    }
}

function drawGame() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (gameState.background) gameState.background.draw(ctx, window.innerWidth, window.innerHeight, gameState.groundHeight);
    gameState.pipes.forEach(pipe => pipe.draw(ctx, pipeColor, currentPipeSkin, window.innerHeight, gameState.groundHeight));
    gameState.coins.forEach(coin => coin.draw(ctx));
    drawGround(ctx, groundColor, groundTextureColor, window.innerWidth, window.innerHeight, gameState.groundHeight);
    drawRealisticGrass(ctx, grassColors, grassBladeColor, grassBladeThickness, grassBladeHeightMin, grassBladeHeightMax, grassTransparency, window.innerWidth, window.innerHeight, gameState.groundHeight);
    if (gameState.bird) gameState.bird.draw(ctx, birdImage);
}

function drawGround(ctx, groundColor, textureColor, canvasWidth, canvasHeight, groundHeight) {
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, canvasHeight - groundHeight, canvasWidth, groundHeight);
    ctx.fillStyle = textureColor;
    for (let i = 0; i < canvasWidth; i += 5) {
        for (let j = canvasHeight - groundHeight; j < canvasHeight; j += 5) {
            if (Math.random() < 0.2) ctx.fillRect(i, j, 1, 1);
        }
    }
}

function drawRealisticGrass(ctx, grassColors, bladeColor, bladeThickness, bladeHeightMin, bladeHeightMax, grassTransparency, canvasWidth, canvasHeight, groundHeight) {
    const grassTop = canvasHeight - groundHeight;
    ctx.globalAlpha = grassTransparency;
    for (let i = 0; i < canvasWidth; i += 5) {
        const bladeHeight = Math.random() * (bladeHeightMax - bladeHeightMin) + bladeHeightMin;
        const bladeWidth = Math.random() * bladeThickness + 1;
        const color = grassColors[Math.floor(Math.random() * grassColors.length)];
        const curve = Math.random() * 4 - 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(i, grassTop);
        ctx.quadraticCurveTo(i + curve, grassTop - bladeHeight / 2, i + bladeWidth, grassTop - bladeHeight);
        ctx.lineTo(i + bladeWidth, grassTop);
        ctx.closePath();
        ctx.fill();
        if (Math.random() < 0.15) {
            ctx.strokeStyle = bladeColor;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    }
    ctx.globalAlpha = 1;
}

function drawBluePipe(ctx, x, topHeight, bottomHeight, pipeWidth, canvasHeight, groundHeight) {
    const blue500 = "rgb(59, 130, 246)";
    const blue900 = "rgb(26, 32, 144)";
    const blue200 = "rgb(191, 219, 254)";

    ctx.fillStyle = blue500;
    ctx.fillRect(x, 0, pipeWidth, topHeight);

    ctx.strokeStyle = blue900;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, 0, pipeWidth, topHeight);

    ctx.fillStyle = blue200;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x, 2, pipeWidth - 4, 2);
    ctx.globalAlpha = 1;

    for (let i = 12; i < pipeWidth; i += 32) {
        ctx.fillStyle = blue900;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x + i, 0, 1, topHeight);
        ctx.globalAlpha = 1;
    }

    ctx.fillStyle = blue900;
    ctx.beginPath();
    ctx.arc(x, 0, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + pipeWidth, 0, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();


    ctx.fillStyle = blue500;
    ctx.fillRect(x, canvasHeight - groundHeight - bottomHeight, pipeWidth, bottomHeight);

    ctx.strokeStyle = blue900;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, canvasHeight - groundHeight - bottomHeight, pipeWidth, bottomHeight);

    ctx.fillStyle = blue200;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x + 2, canvasHeight - groundHeight - bottomHeight + 2, pipeWidth - 4, 2);
    ctx.globalAlpha = 1;

    for (let i = 12; i < pipeWidth; i += 32) {
        ctx.fillStyle = blue900;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x + i, canvasHeight - groundHeight - bottomHeight, 1, bottomHeight);
        ctx.globalAlpha = 1;
    }

    ctx.fillStyle = blue900;
    ctx.beginPath();
    ctx.arc(x, canvasHeight - groundHeight - bottomHeight, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + pipeWidth, canvasHeight - groundHeight - bottomHeight, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawRedPipe(ctx, x, topHeight, bottomHeight, pipeWidth, canvasHeight, groundHeight) {
    const red500 = "rgb(244, 67, 54)";
    const red900 = "rgb(183, 28, 28)";
    const red200 = "rgb(255, 204, 204)";

    ctx.fillStyle = red500;
    ctx.fillRect(x, 0, pipeWidth, topHeight);

    ctx.strokeStyle = red900;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, 0, pipeWidth, topHeight);

    ctx.fillStyle = red200;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x, 2, pipeWidth - 4, 2);
    ctx.globalAlpha = 1;

    for (let i = 12; i < pipeWidth; i += 32) {
        ctx.fillStyle = red900;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x + i, 0, 1, topHeight);
        ctx.globalAlpha = 1;
    }

    ctx.fillStyle = red900;
    ctx.beginPath();
    ctx.arc(x, 0, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + pipeWidth, 0, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();


    ctx.fillStyle = red500;
    ctx.fillRect(x, canvasHeight - groundHeight - bottomHeight, pipeWidth, bottomHeight);

    ctx.strokeStyle = red900;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, canvasHeight - groundHeight - bottomHeight, pipeWidth, bottomHeight);

    ctx.fillStyle = red200;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(x + 2, canvasHeight - groundHeight - bottomHeight + 2, pipeWidth - 4, 2);
    ctx.globalAlpha = 1;

    for (let i = 12; i < pipeWidth; i += 32) {
        ctx.fillStyle = red900;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(x + i, canvasHeight - groundHeight - bottomHeight, 1, bottomHeight);
        ctx.globalAlpha = 1;
    }

    ctx.fillStyle = red900;
    ctx.beginPath();
    ctx.arc(x, canvasHeight - groundHeight - bottomHeight, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + pipeWidth, canvasHeight - groundHeight - bottomHeight, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function gameOver() {
    if (!gameState.running) return;
    gameState.running = false;
    gameState.gameOver = true;
    settingsButton.disabled = true;
    featurePanel.style.display = 'none';
    backgroundMusic.pause();
    finalScoreDisplay.innerText = `Score: ${gameState.overallScore}`;
    newHighScoreDisplay.style.display = 'none';
    newAllTimeHighScoreDisplay.style.display = 'none';

    if (gameState.overallScore > gameState.highScore) {
        gameState.highScore = gameState.overallScore;
        highScoreDisplay.innerText = "High Score: " + gameState.highScore;
        newHighScoreDisplay.style.display = 'block';
    }
    if (gameState.overallScore > gameState.allTimeHighScore) {
        gameState.allTimeHighScore = gameState.overallScore;
        saveAllTimeHighScore(gameState.allTimeHighScore);
        allTimeHighScoreDisplay.innerText = "All-Time Best: " + gameState.allTimeHighScore;
        newAllTimeHighScoreDisplay.style.display = 'block';
        newHighScoreDisplay.style.display = 'none';
    }

    gameOverMenu.style.display = "flex";
    pauseMenu.style.display = "none";
}

function gameLoop() {
    if (gameState.running) {
        const now = performance.now();
        const dt = Math.min(32, now - lastTime) / 16.67;
        lastTime = now;
        updateGame(dt);
        drawGame();
        requestAnimationFrame(gameLoop);
    }
}

function checkAssetLoaded() {
    loadedAssets++;
    if (loadedAssets === totalAssets) {
        assetsLoaded = true;
        loadingScreen.style.display = "none";
        startMenu.style.display = "flex";
        applySettings();
        resizeCanvas();
    }
}

birdSkins["bird_red.png"] = new Image();
birdSkins["bird_green.png"] = new Image();
birdSkins["bird_blue.png"] = new Image();
backgroundThemes["sky_background.png"] = new Image();
backgroundThemes["city_background.png"] = new Image();
backgroundThemes["night_background.png"] = new Image();

const assets = [
    { image: birdSkins["bird_red.png"], src: "bird_red.png" },
    { image: birdSkins["bird_green.png"], src: "bird_green.png" },
    { image: birdSkins["bird_blue.png"], src: "bird_blue.png" },
    { image: backgroundThemes["sky_background.png"], src: "sky_background.png" },
    { image: backgroundThemes["city_background.png"], src: "city_background.png" },
    { image: backgroundThemes["night_background.png"], src: "night_background.png" }
];

assets.forEach((asset) => {
    if (asset.image) {
        asset.image.src = asset.src;
        asset.image.onload = checkAssetLoaded;
        asset.image.onerror = () => {
            console.error("Failed to load image:", asset.src);
            checkAssetLoaded();
        };
    }
});

flapSound.addEventListener("canplaythrough", () => {});
coinSound.addEventListener("canplaythrough", () => {});
flapSound.addEventListener("error", () => console.error("Failed to load flap audio"));
coinSound.addEventListener("error", () => console.error("Failed to load coin audio"));
backgroundMusic.addEventListener("canplaythrough", checkAssetLoaded);
backgroundMusic.addEventListener("error", () => {
    console.error("Failed to load audio:", "background_music.mp3");
    checkAssetLoaded();
});
backgroundMusic.preload = "auto";
backgroundMusic.src = "background_music.mp3";


function showSettingsMenu() {
    gameState.running = false;
    const wasPaused = gameState.paused;
    gameState.paused = true;
    pauseButton.textContent = "Resume";
    settingsButton.disabled = true;
    featurePanel.style.display = 'flex';
    settingsMenu.style.display = "flex";
    startMenu.style.display = "none";
    gameOverMenu.style.display = "none";
    pauseMenu.style.display = "none";
    settingsMenu.dataset.returnToPause = wasPaused ? "true" : "false";
    backgroundMusic.pause();
}

function hideSettingsMenu() {
    settingsMenu.style.display = "none";
    settingsButton.disabled = false;
    featurePanel.style.display = 'flex';
    const returnToPause = settingsMenu.dataset.returnToPause === "true";
    if (returnToPause) {
        gameState.running = false;
        pauseMenu.style.display = "flex";
    } else if (gameState.gameOver) {
        gameOverMenu.style.display = "flex";
    } else {
        gameState.paused = false;
        gameState.running = true;
        lastTime = performance.now();
        gameLoop();
        if (isMusicPlaying) backgroundMusic.play().catch(() => { });
    }
}

function changeBirdSkin(skin) {
    if (birdSkins[skin]) {
        birdImage = birdSkins[skin];
        currentBirdSkin = skin;
        saveSetting(BIRD_SKIN_KEY, skin);
    }
}

function changeBackgroundTheme(bg) {
    if (backgroundThemes[bg]) {
        backgroundImage = backgroundThemes[bg];
        currentBackgroundTheme = bg;
        saveSetting(BACKGROUND_THEME_KEY, bg);
        if (gameState.background) {
            gameState.background.changeImage(backgroundImage);
        }
    }
}


function changeDifficulty(diff) {
    gameState.difficulty = diff;
    resetPhysicsBasedOnDifficulty();
    saveSetting(DIFFICULTY_KEY, diff);
}

function changePipeSkin(skin) {
    if (pipeStyles[skin]) {
        pipeColor = pipeStyles[skin];
        currentPipeSkin = skin;
        saveSetting(PIPE_SKIN_KEY, skin);
    } else {
        pipeColor = pipeStyles['green'];
        currentPipeSkin = 'green';
        saveSetting(PIPE_SKIN_KEY, 'green');
    }
}

function togglePause() {
    if (!gameState.running && !gameState.paused) return;
    gameState.paused = !gameState.paused;
    settingsButton.disabled = gameState.paused;
    featurePanel.style.display = gameState.paused ? 'flex' : 'none';
    if (gameState.paused) {
        gameState.running = false;
        pauseMenu.style.display = "flex";
        pauseButton.textContent = "Resume";
        backgroundMusic.pause();
    } else {
        gameState.running = true;
        pauseMenu.style.display = "none";
        pauseButton.textContent = "Pause";
        lastTime = performance.now();
        gameLoop();
        if (isMusicPlaying) backgroundMusic.play().catch(() => { });
    }
}

function toggleMusic() {
    isMusicPlaying = !isMusicPlaying;
    saveSetting(MUSIC_SETTING_KEY, isMusicPlaying.toString());
    if (isMusicPlaying) {
        backgroundMusic.play().catch((error) => console.error("Music play error:", error));
    } else {
        backgroundMusic.pause();
    }
}

function updateVolume() {
    const masterVolume = parseFloat(masterVolumeControl.value);
    const soundEffectsVolume = parseFloat(soundEffectsVolumeControl.value);
    const musicVolume = parseFloat(musicVolumeControl.value);

    flapSound.volume = soundEffectsVolume * masterVolume;
    coinSound.volume = soundEffectsVolume * masterVolume;
    backgroundMusic.volume = musicVolume * masterVolume;

    saveSetting(SOUND_VOLUME_KEY, soundEffectsVolume.toString());
    saveSetting(MUSIC_VOLUME_KEY, musicVolume.toString());
    saveSetting("masterVolume", masterVolume.toString());
}

startMenu.style.display = "none";
pauseButton.style.display = "none";
settingsButton.style.display = "none";
featurePanel.style.display = 'none';

masterVolumeControl.addEventListener("input", updateVolume);
soundEffectsVolumeControl.addEventListener("input", updateVolume);
musicVolumeControl.addEventListener("input", updateVolume);
birdSkinSelect.addEventListener("change", (e) => changeBirdSkin(e.target.value));
backgroundSelect.addEventListener("change", (e) => changeBackgroundTheme(e.target.value));
difficultySelect.addEventListener("change", (e) => changeDifficulty(e.target.value));
pipeSkinSelect.addEventListener("change", (e) => changePipeSkin(e.target.value));

window.addEventListener("load", function () {
    pauseButton.style.display = "block";
    settingsButton.style.display = "block";
    featurePanel.style.display = 'none';
    birdSkinSelect.innerHTML = `
    <option value="bird_red.png">Red Bird</option>
    <option value="bird_green.png">Green Bird</option>
    <option value="bird_blue.png">Blue Bird</option>
`;
    backgroundSelect.innerHTML = `
    <option value="sky_background.png">Sky</option>
    <option value="city_background.png">City</option>
    <option value="night_background.png">Night</option>
`;
    pipeSkinSelect.innerHTML = `
    <option value="green">Green</option>
    <option value="red">Red</option>
    <option value="blue">Blue</option>
`;
    difficultySelect.innerHTML = `
    <option value="easy">Easy</option>
    <option value="normal">Normal</option>
    <option value="hard">Hard</option>
`;
    if (assetsLoaded) {
        loadingScreen.style.display = "none";
        startMenu.style.display = "flex";
        applySettings();
    }
});
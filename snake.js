console.log('snake.js loading...');

class SnakeGame {
    constructor(mode) {
        this.mode = mode;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [];
        this.food = {};
        this.bonusFood = null;
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.level = 1;
        this.gameSpeed = 100;
        this.gameLoop = null;
        this.isRunning = false;
        this.isPaused = false;
        
        this.shield = false;
        this.speedBoost = false;
        this.shieldTimer = 0;
        this.speedTimer = 0;
        
        this.particles = [];
        
        this.init();
    }
    
    init() {
        document.getElementById('highScore').textContent = this.highScore;
        this.setupEventListeners();
        this.reset();
    }
    
    setupEventListeners() {
        if (this.mode === 'laptop') {
            document.addEventListener('keydown', (e) => this.handleKey(e));
        }
        
        document.querySelectorAll('[data-dir]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const dir = btn.getAttribute('data-dir');
                this.setDirection(dir);
            });
            
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const dir = btn.getAttribute('data-dir');
                this.setDirection(dir);
            });
        });
        
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }
        
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.gameSpeed = parseInt(e.target.getAttribute('data-speed'));
            });
        });
        
        if (this.mode === 'mobile') {
            let touchStartX = 0;
            let touchStartY = 0;
            
            this.canvas.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            });
            
            this.canvas.addEventListener('touchend', (e) => {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                
                const dx = touchEndX - touchStartX;
                const dy = touchEndY - touchStartY;
                
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0) this.setDirection('right');
                    else this.setDirection('left');
                } else {
                    if (dy > 0) this.setDirection('down');
                    else this.setDirection('up');
                }
            });
        }
    }
    
    handleKey(e) {
        const keyMap = {
            'ArrowUp': 'up', 'w': 'up', 'W': 'up',
            'ArrowDown': 'down', 's': 'down', 'S': 'down',
            'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
            'ArrowRight': 'right', 'd': 'right', 'D': 'right',
            ' ': 'pause'
        };
        
        if (keyMap[e.key]) {
            e.preventDefault();
            if (keyMap[e.key] === 'pause') {
                this.togglePause();
            } else {
                this.setDirection(keyMap[e.key]);
            }
        }
    }
    
    setDirection(dir) {
        const dirs = {
            'up': { x: 0, y: -1 },
            'down': { x: 0, y: 1 },
            'left': { x: -1, y: 0 },
            'right': { x: 1, y: 0 }
        };
        
        const newDir = dirs[dir];
        if (this.direction.x === -newDir.x && this.direction.y === -newDir.y) {
            return;
        }
        this.nextDirection = newDir;
    }
    
    reset() {
        const center = Math.floor(this.tileCount / 2);
        this.snake = [
            { x: center, y: center },
            { x: center, y: center + 1 },
            { x: center, y: center + 2 }
        ];
        this.direction = { x: 0, y: -1 };
        this.nextDirection = { x: 0, y: -1 };
        this.score = 0;
        this.level = 1;
        this.shield = false;
        this.speedBoost = false;
        this.updateScore();
        this.spawnFood();
        this.draw();
    }
    
    start() {
        const overlay = document.getElementById('gameOverlay');
        if (overlay) overlay.classList.remove('active');
        
        this.isRunning = true;
        this.isPaused = false;
        this.reset();
        
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }
    
    togglePause() {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            clearInterval(this.gameLoop);
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width/2, this.canvas.height/2);
        } else {
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
        }
    }
    
    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            document.getElementById('highScore').textContent = this.highScore;
        }
        
        const overlayTitle = document.getElementById('overlayTitle');
        const overlayText = document.getElementById('overlayText');
        const startBtn = document.getElementById('startBtn');
        
        if (overlayTitle) overlayTitle.textContent = 'GAME OVER';
        if (overlayText) overlayText.textContent = 'Final Score: ' + this.score;
        if (startBtn) startBtn.textContent = 'TRY AGAIN';
        
        const overlay = document.getElementById('gameOverlay');
        if (overlay) overlay.classList.add('active');
    }
    
    spawnFood() {
        let attempts = 0;
        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount),
                type: Math.random() > 0.8 ? 'bonus' : 'normal',
                color: Math.random() > 0.8 ? '#ff00ff' : '#00ff88'
            };
            attempts++;
        } while (this.isSnakeAt(this.food.x, this.food.y) && attempts < 100);
        
        if (Math.random() > 0.9 && !this.bonusFood) {
            setTimeout(() => {
                let attempts = 0;
                do {
                    this.bonusFood = {
                        x: Math.floor(Math.random() * this.tileCount),
                        y: Math.floor(Math.random() * this.tileCount),
                        timer: 100
                    };
                    attempts++;
                } while (this.isSnakeAt(this.bonusFood.x, this.bonusFood.y) && attempts < 100);
            }, 5000);
        }
    }
    
    isSnakeAt(x, y) {
        return this.snake.some(segment => segment.x === x && segment.y === y);
    }
    
    update() {
        this.direction = this.nextDirection;
        
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            if (this.shield) {
                this.wrapAround(head);
            } else {
                this.gameOver();
                return;
            }
        }
        
        if (this.isSnakeAt(head.x, head.y)) {
            if (!this.shield) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        if (head.x === this.food.x && head.y === this.food.y) {
            this.eatFood(this.food);
        } else if (this.bonusFood && head.x === this.bonusFood.x && head.y === this.bonusFood.y) {
            this.eatBonus();
        } else {
            this.snake.pop();
        }
        
        if (this.bonusFood) {
            this.bonusFood.timer--;
            if (this.bonusFood.timer <= 0) this.bonusFood = null;
        }
        
        if (this.shield) {
            this.shieldTimer--;
            if (this.shieldTimer <= 0) this.shield = false;
        }
        if (this.speedBoost) {
            this.speedTimer--;
            if (this.speedTimer <= 0) {
                this.speedBoost = false;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
            }
        }
        
        this.particles = this.particles.filter(p => {
            p.life--;
            p.x += p.vx;
            p.y += p.vy;
            return p.life > 0;
        });
        
        this.draw();
    }
    
    wrapAround(head) {
        if (head.x < 0) head.x = this.tileCount - 1;
        if (head.x >= this.tileCount) head.x = 0;
        if (head.y < 0) head.y = this.tileCount - 1;
        if (head.y >= this.tileCount) head.y = 0;
    }
    
    eatFood(food) {
        const points = food.type === 'bonus' ? 50 : 10;
        this.score += points;
        
        this.createParticles(food.x, food.y, food.color);
        
        if (Math.random() > 0.85) {
            this.activatePowerUp();
        }
        
        const newLevel = Math.floor(this.score / 50) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.gameSpeed = Math.max(50, this.gameSpeed - 5);
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
        }
        
        this.updateScore();
        this.spawnFood();
    }
    
    eatBonus() {
        this.score += 100;
        this.createParticles(this.bonusFood.x, this.bonusFood.y, '#FFD700');
        this.bonusFood = null;
        this.updateScore();
    }
    
    activatePowerUp() {
        const powerUps = ['shield', 'speed'];
        const powerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
        
        if (powerUp === 'shield') {
            this.shield = true;
            this.shieldTimer = 50;
        } else if (powerUp === 'speed') {
            this.speedBoost = true;
            this.speedTimer = 30;
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.update(), this.gameSpeed / 2);
        }
    }
    
    createParticles(x, y, color) {
        const centerX = x * this.gridSize + this.gridSize / 2;
        const centerY = y * this.gridSize + this.gridSize / 2;
        
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 20,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
    }
    
    updateScore() {
        const scoreEl = document.getElementById('score');
        const levelEl = document.getElementById('level');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (levelEl) levelEl.textContent = this.level;
    }
    
    draw() {
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            this.ctx.fillStyle = index === 0 ? '#00ff88' : '#00cc66';
            this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            
            if (index === 0) {
                this.ctx.fillStyle = '#000';
                const eyeSize = 3;
                if (this.direction.x === 1) {
                    this.ctx.fillRect(x + 12, y + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(x + 12, y + 12, eyeSize, eyeSize);
                } else if (this.direction.x === -1) {
                    this.ctx.fillRect(x + 5, y + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(x + 5, y + 12, eyeSize, eyeSize);
                } else if (this.direction.y === -1) {
                    this.ctx.fillRect(x + 5, y + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(x + 12, y + 5, eyeSize, eyeSize);
                } else {
                    this.ctx.fillRect(x + 5, y + 12, eyeSize, eyeSize);
                    this.ctx.fillRect(x + 12, y + 12, eyeSize, eyeSize);
                }
            }
        });
        
        const foodX = this.food.x * this.gridSize + this.gridSize/2;
        const foodY = this.food.y * this.gridSize + this.gridSize/2;
        
        this.ctx.fillStyle = this.food.color;
        this.ctx.beginPath();
        this.ctx.arc(foodX, foodY, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        if (this.bonusFood) {
            const bonusX = this.bonusFood.x * this.gridSize + this.gridSize/2;
            const bonusY = this.bonusFood.y * this.gridSize + this.gridSize/2;
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(bonusX, bonusY, 10, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life / 20;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        this.ctx.globalAlpha = 1;
        
        if (this.shield) {
            this.ctx.strokeStyle = '#00ccff';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

function initGame(mode) {
    console.log('Initializing game in mode:', mode);
    window.game = new SnakeGame(mode);
}

console.log('snake.js loaded successfully');

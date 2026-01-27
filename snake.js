// Global init function
function initGame(mode) {
    window.game = new SnakeGame(mode);
    console.log('Game created in mode:', mode);
}
console.log('snake.js is running');
activatePowerUp() {
    const powerUps = ['shield', 'speed', 'yourNewPower'];
    // Add logic for new power-up
}
this.gridSize = 20;  // Pixel size of each tile
this.tileCount = this.canvas.width / this.gridSize;
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
        
        // Power-ups
        this.shield = false;
        this.speedBoost = false;
        this.shieldTimer = 0;
        this.speedTimer = 0;
        
        // Particles
        this.particles = [];
        
        this.init();
    }
    
    init() {
        document.getElementById('highScore').textContent = this.highScore;
        this.setupEventListeners();
        this.reset();
    }
    
    setupEventListeners() {
        // Keyboard controls (laptop)
        if (this.mode === 'laptop') {
            document.addEventListener('keydown', (e) => this.handleKey(e));
        }
        
        // Button controls
        document.querySelectorAll('[data-dir]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const dir = btn.getAttribute('data-dir');
                this.setDirection(dir);
            });
            
            // Touch events for mobile
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const dir = btn.getAttribute('data-dir');
                this.setDirection(dir);
            });
        });
        
        // Start/Pause buttons
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        
        // Difficulty selection
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.gameSpeed = parseInt(e.target.getAttribute('data-speed'));
            });
        });
        
        // Swipe controls (mobile)
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
            return; // Prevent 180-degree turns
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
        document.getElementById('gameOverlay').classList.remove('active');
        this.isRunning = true;
        this.isPaused = false;
        this.reset();
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
            this.ctx.font = '30px Orbitron';
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
        
        document.getElementById('overlayTitle').textContent = 'GAME OVER';
        document.getElementById('overlayText').textContent = `Final Score: ${this.score}`;
        document.getElementById('startBtn').textContent = 'TRY AGAIN';
        document.getElementById('gameOverlay').classList.add('active');
    }
    
    spawnFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount),
                type: Math.random() > 0.8 ? 'bonus' : 'normal',
                color: Math.random() > 0.8 ? '#ff00ff' : '#00ff88'
            };
        } while (this.isSnakeAt(this.food.x, this.food.y));
        
        // Spawn bonus food occasionally
        if (Math.random() > 0.9 && !this.bonusFood) {
            setTimeout(() => {
                do {
                    this.bonusFood = {
                        x: Math.floor(Math.random() * this.tileCount),
                        y: Math.floor(Math.random() * this.tileCount),
                        timer: 100
                    };
                } while (this.isSnakeAt(this.bonusFood.x, this.bonusFood.y));
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
        
        // Wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            if (this.shield) {
                this.wrapAround(head);
            } else {
                this.gameOver();
                return;
            }
        }
        
        // Self collision
        if (this.isSnakeAt(head.x, head.y)) {
            if (!this.shield) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.eatFood(this.food);
        } else if (this.bonusFood && head.x === this.bonusFood.x && head.y === this.bonusFood.y) {
            this.eatBonus();
        } else {
            this.snake.pop();
        }
        
        // Update bonus food timer
        if (this.bonusFood) {
            this.bonusFood.timer--;
            if (this.bonusFood.timer <= 0) this.bonusFood = null;
        }
        
        // Update power-ups
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
        
        // Update particles
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
        
        // Create particles
        this.createParticles(food.x, food.y, food.color);
        
        // Random power-up chance
        if (Math.random() > 0.85) {
            this.activatePowerUp();
        }
        
        // Level up every 50 points
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
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        
        // Update power indicator
        if (this.mode === 'mobile') {
            const indicator = document.getElementById('powerUpIndicator');
            if (this.shield) {
                indicator.style.width = '100%';
                indicator.style.background = '#00ccff';
            } else if (this.speedBoost) {
                indicator.style.width = '100%';
                indicator.style.background = '#ff00ff';
            } else {
                indicator.style.width = '0%';
            }
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid (optional, subtle)
        this.ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // Gradient effect
            const gradient = this.ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
            if (index === 0) {
                gradient.addColorStop(0, '#00ff88');
                gradient.addColorStop(1, '#00cc66');
            } else {
                const intensity = 1 - (index / this.snake.length) * 0.5;
                gradient.addColorStop(0, `rgba(0, 255, 136, ${intensity})`);
                gradient.addColorStop(1, `rgba(0, 204, 102, ${intensity})`);
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.shadowBlur = index === 0 ? 15 : 0;
            this.ctx.shadowColor = '#00ff88';
            
            // Rounded rectangles for snake
            const padding = 1;
            this.ctx.beginPath();
            this.ctx.roundRect(x + padding, y + padding, this.gridSize - padding*2, this.gridSize - padding*2, 5);
            this.ctx.fill();
            
            // Eyes for head
            if (index === 0) {
                this.ctx.fillStyle = '#000';
                const eyeSize = 3;
                const eyeOffset = 5;
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
        
        this.ctx.shadowBlur = 0;
        
        // Draw food
        const foodX = this.food.x * this.gridSize + this.gridSize/2;
        const foodY = this.food.y * this.gridSize + this.gridSize/2;
        
        this.ctx.fillStyle = this.food.color;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.food.color;
        this.ctx.beginPath();
        this.ctx.arc(foodX, foodY, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Draw bonus food
        if (this.bonusFood) {
            const bonusX = this.bonusFood.x * this.gridSize + this.gridSize/2;
            const bonusY = this.bonusFood.y * this.gridSize + this.gridSize/2;
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.shadowBlur = 25;
            this.ctx.shadowColor = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(bonusX, bonusY, 10, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Timer ring
            this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(bonusX, bonusY, 12, 0, (this.bonusFood.timer / 100) * Math.PI * 2);
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }
        
        // Draw particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life / 20;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        this.ctx.globalAlpha = 1;
        
        // Draw shield indicator
        if (this.shield) {
            this.ctx.strokeStyle = '#00ccff';
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#00ccff';
            this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.shadowBlur = 0;
        }
    }
}

// Global init function
function initGame(mode) {
    window.game = new SnakeGame(mode);
}

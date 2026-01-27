/**
 * Snake Ultra - Smart Assistant
 * Provides tips, easter eggs, and intelligent game features
 */

const SnakeAssistant = {
    tips: [
        "💡 Use shield power-up to pass through walls!",
        "💡 Bonus food appears randomly - grab it quick!",
        "💡 The snake moves faster as your score increases",
        "💡 Try to keep the snake in the center area",
        "💡 Speed boost gives double points!",
        "💡 You can pause with Spacebar (laptop) or center button",
        "💡 Plan your route before going for risky food",
        "💡 The shield lasts for 50 moves - use it wisely",
        "💡 Corner trapping is a common mistake - leave escape routes!",
        "💡 Sound on? Listen for different eating tones!"
    ],
    
    easterEggs: {
        'konami': {
            code: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
            current: 0,
            action: () => {
                alert('🎮 Konami Code Activated! God Mode enabled (simulated)');
                // Could give infinite lives or special visual mode
            }
        },
        'speed': {
            code: ['s', 'p', 'e', 'e', 'd'],
            current: 0,
            action: () => {
                SoundEngine.setTheme('aggressive');
                console.log('🏎️ Speed theme activated!');
            }
        }
    },
    
    init() {
        this.setupKeyboardMonitoring();
        this.showRandomTip();
        this.addSmartFeatures();
        console.log('🤖 Snake Assistant loaded');
    },
    
    setupKeyboardMonitoring() {
        document.addEventListener('keydown', (e) => {
            this.checkEasterEggs(e.key);
        });
    },
    
    checkEasterEggs(key) {
        // Check all easter egg codes
        Object.keys(this.easterEggs).forEach(eggName => {
            const egg = this.easterEggs[eggName];
            if (key === egg.code[egg.current]) {
                egg.current++;
                if (egg.current >= egg.code.length) {
                    egg.action();
                    egg.current = 0;
                }
            } else {
                egg.current = 0;
            }
        });
    },
    
    showRandomTip() {
        const tip = this.tips[Math.floor(Math.random() * this.tips.length)];
        
        // Create tip notification
        const div = document.createElement('div');
        div.className = 'assistant-tip';
        div.innerHTML = `
            <span class="assistant-avatar">🤖</span>
            <span class="tip-text">${tip}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // Style it
        Object.assign(div.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'rgba(0, 255, 136, 0.1)',
            border: '1px solid var(--primary)',
            borderRadius: '10px',
            padding: '15px',
            color: 'white',
            fontSize: '14px',
            maxWidth: '300px',
            backdropFilter: 'blur(10px)',
            zIndex: '1000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'slideIn 0.3s ease'
        });
        
        document.body.appendChild(div);
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            if (div.parentElement) div.remove();
        }, 10000);
    },
    
    addSmartFeatures() {
        // Add performance monitor
        this.addFPSCounter();
        
        // Add gesture help for mobile
        if (window.game && window.game.mode === 'mobile') {
            this.showGestureGuide();
        }
    },
    
    addFPSCounter() {
        let lastTime = performance.now();
        let frames = 0;
        const fpsDiv = document.createElement('div');
        fpsDiv.id = 'fps-counter';
        fpsDiv.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.5);
            color: #0f0;
            padding: 5px 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            display: none;
        `;
        document.body.appendChild(fpsDiv);
        
        const updateFPS = () => {
            frames++;
            const now = performance.now();
            if (now - lastTime >= 1000) {
                fpsDiv.textContent = `FPS: ${frames}`;
                frames = 0;
                lastTime = now;
            }
            requestAnimationFrame(updateFPS);
        };
        updateFPS();
        
        // Toggle with '`' key
        document.addEventListener('keydown', (e) => {
            if (e.key === '`') {
                fpsDiv.style.display = fpsDiv.style.display === 'none' ? 'block' : 'none';
            }
        });
    },
    
    showGestureGuide() {
        // Show once per session
        if (sessionStorage.getItem('gestureShown')) return;
        
        setTimeout(() => {
            const guide = document.createElement('div');
            guide.className = 'gesture-guide';
            guide.innerHTML = `
                <div style="text-align:center; padding:20px;">
                    <h3>👋 Quick Tips</h3>
                    <p>Swipe anywhere on screen to move</p>
                    <p>Use buttons for precise control</p>
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        margin-top: 10px;
                        padding: 10px 20px;
                        background: var(--primary);
                        border: none;
                        border-radius: 20px;
                        color: black;
                        font-weight: bold;
                    ">Got it!</button>
                </div>
            `;
            guide.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid var(--primary);
                border-radius: 15px;
                color: white;
                z-index: 10000;
                max-width: 300px;
            `;
            document.body.appendChild(guide);
            sessionStorage.setItem('gestureShown', 'true');
        }, 2000);
    },
    
    // AI analysis of game state
    analyzeGame() {
        if (!window.game) return;
        
        const game = window.game;
        const advice = [];
        
        // Check if snake is too long for corners
        if (game.snake.length > 15) {
            advice.push("Your snake is getting long! Plan your turns carefully.");
        }
        
        // Check if food is in dangerous position
        const head = game.snake[0];
        const distToFood = Math.abs(head.x - game.food.x) + Math.abs(head.y - game.food.y);
        if (distToFood > 10) {
            advice.push("Food is far away - create a safe path!");
        }
        
        // Wall proximity warning
        if (head.x <= 2 || head.x >= game.tileCount - 3 || 
            head.y <= 2 || head.y >= game.tileCount - 3) {
            advice.push("⚠️ You're near a wall! Watch out unless you have shield.");
        }
        
        if (advice.length > 0 && Math.random() > 0.95) {
            this.showAdvice(advice[0]);
        }
    },
    
    showAdvice(text) {
        // Only show occasionally to not annoy
        if (document.querySelector('.assistant-advice')) return;
        
        const div = document.createElement('div');
        div.className = 'assistant-advice';
        div.innerHTML = `💬 ${text}`;
        Object.assign(div.style, {
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 193, 7, 0.9)',
            color: 'black',
            padding: '8px 15px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: '100',
            whiteSpace: 'nowrap',
            animation: 'bounce 1s infinite'
        });
        
        const container = document.querySelector('.game-area') || document.querySelector('.mobile-game-area');
        if (container) {
            container.style.position = 'relative';
            container.appendChild(div);
            setTimeout(() => div.remove(), 3000);
        }
    },
    
    // Stats tracking
    stats: {
        gamesPlayed: parseInt(localStorage.getItem('gamesPlayed') || '0'),
        totalScore: parseInt(localStorage.getItem('totalScore') || '0'),
        sessionStart: Date.now()
    },
    
    recordGame(score) {
        this.stats.gamesPlayed++;
        this.stats.totalScore += score;
        localStorage.setItem('gamesPlayed', this.stats.gamesPlayed);
        localStorage.setItem('totalScore', this.stats.totalScore);
    },
    
    getStats() {
        const avgScore = this.stats.gamesPlayed > 0 ? 
            Math.round(this.stats.totalScore / this.stats.gamesPlayed) : 0;
        return {
            ...this.stats,
            averageScore: avgScore,
            sessionTime: Math.round((Date.now() - this.stats.sessionStart) / 1000)
        };
    }
};

// Initialize assistant
window.addEventListener('DOMContentLoaded', () => {
    SnakeAssistant.init();
    
    // Periodic analysis
    setInterval(() => {
        if (window.game && window.game.isRunning && !window.game.isPaused) {
            SnakeAssistant.analyzeGame();
        }
    }, 5000); // Check every 5 seconds
});

// Add to game over to record stats
const originalGameOver = SnakeGame.prototype.gameOver;
SnakeGame.prototype.gameOver = function() {
    SnakeAssistant.recordGame(this.score);
    originalGameOver.call(this);
};

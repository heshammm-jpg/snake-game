/**
 * Snake Ultra - Sound Engine
 * Handles all audio, effects, and background music
 */

const SoundEngine = {
    ctx: null,
    sounds: {},
    musicPlaying: false,
    enabled: true,
    volume: 0.5,
    
    // Sound frequencies for synthesized effects
    frequencies: {
        eat: [440, 554, 659],      // A major chord
        eatBonus: [523, 659, 784, 1047], // C major high
        powerUp: [392, 523, 659, 784],   // G major
        gameOver: [200, 150, 100],       // Descending
        move: 300,                       // Soft click
        pause: 400
    },
    
    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.loadSettings();
            this.createUI();
            console.log('🔊 Sound engine initialized');
        } catch (e) {
            console.warn('Audio not supported');
            this.enabled = false;
        }
    },
    
    loadSettings() {
        const saved = localStorage.getItem('snakeAudioSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.enabled = settings.enabled !== false;
            this.volume = settings.volume || 0.5;
        }
    },
    
    saveSettings() {
        localStorage.setItem('snakeAudioSettings', JSON.stringify({
            enabled: this.enabled,
            volume: this.volume
        }));
    },
    
    createUI() {
        // Add sound toggle button dynamically
        const btn = document.createElement('button');
        btn.id = 'soundToggle';
        btn.innerHTML = this.enabled ? '🔊' : '🔇';
        btn.className = 'sound-btn';
        btn.onclick = () => this.toggle();
        
        // Add to header
        const header = document.querySelector('.game-header') || document.querySelector('.mobile-header');
        if (header) {
            const stats = header.querySelector('.stats') || header.querySelector('.mobile-stats');
            if (stats) stats.appendChild(btn);
        }
    },
    
    toggle() {
        this.enabled = !this.enabled;
        const btn = document.getElementById('soundToggle');
        if (btn) btn.innerHTML = this.enabled ? '🔊' : '🔇';
        
        if (this.enabled && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.saveSettings();
    },
    
    playTone(freq, type = 'sine', duration = 0.1, delay = 0) {
        if (!this.enabled || !this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.frequency.value = freq;
        osc.type = type;
        
        const now = this.ctx.currentTime + delay;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.volume * 0.3, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc.start(now);
        osc.stop(now + duration);
    },
    
    playChord(freqs, duration = 0.2) {
        if (!this.enabled || !this.ctx) return;
        freqs.forEach((freq, i) => {
            this.playTone(freq, 'sine', duration, i * 0.02);
        });
    },
    
    // Game event sounds
    playEat(isBonus = false) {
        if (isBonus) {
            this.playChord(this.frequencies.eatBonus, 0.3);
        } else {
            this.playChord(this.frequencies.eat, 0.15);
        }
    },
    
    playPowerUp(type) {
        if (type === 'shield') {
            this.playChord([523, 659, 784], 0.4);
        } else if (type === 'speed') {
            this.playChord([440, 554, 659, 880], 0.3);
        }
    },
    
    playGameOver() {
        this.frequencies.gameOver.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 'sawtooth', 0.3), i * 100);
        });
    },
    
    playMove() {
        // Subtle movement sound (very quiet)
        if (Math.random() > 0.7) {
            this.playTone(this.frequencies.move, 'triangle', 0.05);
        }
    },
    
    playPause() {
        this.playTone(this.frequencies.pause, 'sine', 0.2);
    },
    
    // Background music loop (procedural)
    startMusic() {
        if (!this.enabled || this.musicPlaying) return;
        this.musicPlaying = true;
        this.musicLoop();
    },
    
    stopMusic() {
        this.musicPlaying = false;
    },
    
    musicLoop() {
        if (!this.musicPlaying || !this.enabled) return;
        
        // Create ambient drone
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, this.ctx.currentTime); // A2
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        gain.gain.setValueAtTime(0.05 * this.volume, this.ctx.currentTime);
        
        osc.start();
        
        // Stop after 4 seconds and restart
        setTimeout(() => {
            osc.stop();
            if (this.musicPlaying) this.musicLoop();
        }, 4000);
    },
    
    // Different sound themes
    setTheme(theme) {
        switch(theme) {
            case 'retro':
                this.frequencies.eat = [440, 880]; // 8-bit style
                break;
            case 'modern':
                this.frequencies.eat = [440, 554, 659];
                break;
            case 'aggressive':
                this.frequencies.eat = [220, 330, 440];
                break;
        }
    }
};

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => SoundEngine.init());
}

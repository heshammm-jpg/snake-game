# Snake Ultra - Documentation

## Controls Guide

### Laptop Version
| Input | Action |
|-------|--------|
| Arrow Keys | Move Up/Down/Left/Right |
| W, A, S, D | Alternative movement |
| Spacebar | Pause/Resume game |
| On-screen buttons | Touch/mouse control |

### Mobile Version
| Input | Action |
|-------|--------|
| Touch Buttons | Directional control |
| Swipe | Swipe anywhere on screen to move |
| Center Button | Pause game |

## Game Mechanics

### Scoring System
- **Regular Food** (Green): +10 points
- **Bonus Food** (Purple): +50 points  
- **Gold Food** (Limited time): +100 points
- **Level Up**: Every 50 points increases speed

### Difficulty Levels
| Level | Speed | Description |
|-------|-------|-------------|
| Easy | 150ms | Beginner friendly |
| Normal | 100ms | Standard pace |
| Hard | 70ms | Fast reaction needed |
| Extreme | 50ms | Expert only |

### Technical Details

#### Canvas Specifications
- **Laptop**: 600x600px, 20px grid
- **Mobile**: 350x350px (responsive), 20px grid

#### Particle System
- Triggered on food consumption
- 8 particles per food item
- Physics-based movement with decay

#### State Management
```javascript
Game States: MENU -&gt; PLAYING -&gt; PAUSED -&gt; GAME_OVER
Power-ups: Shield (50 ticks), Speed (30 ticks)
Storage: localStorage for high score persistence

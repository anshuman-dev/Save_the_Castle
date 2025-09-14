# Save the Castle - Netlify Deployment Plan

## 🎯 Deployment Strategy for Netlify

Since Netlify hosts static sites and your game is Python/Pygame, we need to convert to web technologies.

## 📋 Recommended Approach: Web Game with Phaser.js

### 1. **Technology Stack**
- **Frontend Framework**: React.js + Phaser.js for game engine
- **Blockchain Integration**: ethers.js for Web3 functionality  
- **Styling**: Tailwind CSS for UI components
- **Build Tool**: Vite for fast development and building
- **Hosting**: Netlify static site hosting

### 2. **File Structure**
```
web/
├── public/
│   ├── assets/           # Game sprites and audio
│   │   ├── images/       # All sprite files
│   │   └── audio/        # Sound effects
│   └── index.html
├── src/
│   ├── components/
│   │   ├── GameCanvas.jsx    # Main game component
│   │   ├── WalletConnect.jsx # Wallet connection UI
│   │   ├── Leaderboard.jsx   # Blockchain leaderboard
│   │   └── HealthShop.jsx    # Health purchase UI
│   ├── game/
│   │   ├── GameScene.js      # Main game logic (Phaser)
│   │   ├── Player.js         # Player class
│   │   ├── Enemy.js          # Enemy class
│   │   └── Bullet.js         # Projectile class
│   ├── blockchain/
│   │   ├── web3Client.js     # Web3 integration
│   │   ├── contracts.js      # Contract ABIs and addresses
│   │   └── gameIntegration.js # Game-blockchain bridge
│   ├── App.jsx               # Main React app
│   └── main.jsx              # Entry point
├── package.json
├── vite.config.js
└── netlify.toml              # Netlify configuration
```

### 3. **Game Logic Conversion**

#### From Python to JavaScript:
- **pygame.sprite.Sprite** → **Phaser.GameObjects.Sprite**
- **pygame collision detection** → **Phaser.Physics.Arcade**
- **pygame event handling** → **Phaser input system**
- **Python classes** → **ES6 classes**

#### Core Game Components:
```javascript
// Player.js (converted from lib/Sprites.py)
class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    this.speed = 3;
    this.health = 200;
  }
  
  move(direction) {
    // Movement logic
  }
  
  shoot(targetX, targetY) {
    // Shooting logic
  }
}

// Enemy.js
class Enemy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemy');
    this.speed = 7;
  }
  
  update() {
    // Movement toward castle
  }
}
```

### 4. **Blockchain Integration**

#### Web3 Setup:
```javascript
// web3Client.js
import { ethers } from 'ethers';

class Web3Client {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
  }
  
  async connectWallet() {
    if (window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      await this.provider.send("eth_requestAccounts", []);
      this.signer = await this.provider.getSigner();
      return true;
    }
    return false;
  }
  
  async purchaseHealth(paymentType) {
    // Health purchase logic
  }
  
  async submitScore(score, healthPurchased) {
    // Score submission logic
  }
}
```

### 5. **Netlify Configuration**

#### netlify.toml:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### package.json:
```json
{
  "name": "save-the-castle-web",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "phaser": "^3.70.0",
    "ethers": "^6.7.0",
    "@tailwindcss/forms": "^0.5.6"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.3.0",
    "vite": "^4.4.5"
  }
}
```

### 6. **Deployment Steps**

1. **Setup Web Project**:
   ```bash
   mkdir web && cd web
   npm create vite@latest . -- --template react
   npm install phaser ethers @tailwindcss/forms
   ```

2. **Convert Game Logic**:
   - Port Python classes to JavaScript
   - Implement Phaser.js game scenes
   - Add Web3 wallet integration

3. **Asset Migration**:
   ```bash
   cp -r ../resources/* public/assets/
   ```

4. **Environment Variables**:
   ```bash
   # .env.production
   VITE_GAME_ECONOMY_ADDRESS=0x55cBEa71ad8B981B91B137116B76a4828F90C548
   VITE_LEADERBOARD_ADDRESS=0x59FF2595588AA2236441B0E82b2CD692e1373E58
   VITE_USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
   VITE_BASE_SEPOLIA_RPC=https://sepolia.base.org
   ```

5. **Deploy to Netlify**:
   ```bash
   npm run build
   # Upload dist/ folder to Netlify or connect GitHub repo
   ```

### 7. **Alternative: Python Backend + Static Frontend**

If you prefer to keep Python logic:

```
Architecture:
[Netlify Static Site] → [Railway Python API] → [Base Blockchain]
```

- **Frontend**: React.js on Netlify (UI only)
- **Backend**: Python FastAPI on Railway (game logic + blockchain)
- **Database**: Supabase for game sessions
- **Blockchain**: Direct calls from Python backend

### 8. **Timeline Estimate**

- **Web Conversion**: 2-3 days (game logic + UI)
- **Blockchain Integration**: 1 day (Web3 setup)
- **Testing & Polish**: 1 day
- **Deployment**: 1 day

**Total**: ~1 week for full web version

### 9. **Benefits of Web Version**

✅ **Wider Reach**: Works on any device with browser
✅ **No Installation**: Instant play
✅ **Mobile Friendly**: Touch controls for mobile
✅ **Social Sharing**: Easy URL sharing
✅ **Farcaster Ready**: Perfect for Mini App integration
✅ **SEO Friendly**: Better discoverability

### 10. **Next Steps**

1. **Choose approach** (Web conversion vs Python backend)
2. **Create web project structure**
3. **Port core game mechanics**
4. **Integrate Web3 wallet connection**
5. **Deploy to Netlify**

Would you like me to start the web conversion with Phaser.js?
# Save the Castle - Enterprise Architecture Plan

## 🏗️ Senior VP Engineering Architecture Decision

### Strategic Context
- **Current**: Python game + blockchain integration
- **Goal 1**: Web deployment with blockchain on Base (testnet → mainnet)
- **Goal 2**: Future mini app in separate repo with shared components
- **Timeline**: Web version in 1 week, mini app foundation ready

## 📋 Recommended Architecture: Modular React + TypeScript

### Why This Approach Wins:

1. **Code Reuse**: 70-80% shared between web and mini app
2. **Performance**: Native browser execution, no backend latency
3. **Scalability**: CDN distribution, handles millions of concurrent users
4. **Cost Efficiency**: $0 hosting vs $200+/month for Python infrastructure
5. **Team Velocity**: Single TypeScript codebase → multiple deployment targets
6. **Future-Proof**: Easy extraction to NPM packages for mini app

## 🎯 Phase 1: Current Repo Structure

```
save-the-castle/
├── packages/                          # Future NPM packages
│   ├── game-engine/                   # Core game logic
│   │   ├── src/
│   │   │   ├── entities/
│   │   │   │   ├── Player.ts          # Player class with health system
│   │   │   │   ├── Enemy.ts           # Enemy spawning & movement
│   │   │   │   └── Projectile.ts      # Bullet mechanics
│   │   │   ├── systems/
│   │   │   │   ├── CollisionSystem.ts # Hit detection
│   │   │   │   ├── SpawningSystem.ts  # Enemy generation
│   │   │   │   └── ScoringSystem.ts   # Score calculation
│   │   │   └── GameEngine.ts          # Main game loop
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── blockchain-client/             # Web3 integration
│   │   ├── src/
│   │   │   ├── contracts/
│   │   │   │   ├── GameEconomy.ts     # Health purchase logic
│   │   │   │   ├── Leaderboard.ts     # Score submission
│   │   │   │   └── types.ts           # Contract interfaces
│   │   │   ├── providers/
│   │   │   │   ├── Web3Provider.ts    # Wallet connection
│   │   │   │   └── ContractProvider.ts# Contract interactions
│   │   │   ├── hooks/
│   │   │   │   ├── useHealthPurchase.ts
│   │   │   │   ├── useLeaderboard.ts
│   │   │   │   └── useWallet.ts
│   │   │   └── BlockchainClient.ts    # Main client
│   │   ├── package.json
│   │   └── abis/                      # Contract ABIs
│   │
│   ├── ui-components/                 # Reusable UI components
│   │   ├── src/
│   │   │   ├── WalletConnect/
│   │   │   ├── HealthShop/
│   │   │   ├── Leaderboard/
│   │   │   └── GameHUD/
│   │   └── package.json
│   │
│   └── shared-config/                 # Environment configs
│       ├── src/
│       │   ├── contracts.ts           # Contract addresses
│       │   ├── networks.ts            # Network configurations
│       │   └── constants.ts           # Game constants
│       └── package.json
│
├── web-app/                           # Web-specific application
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameCanvas.tsx         # Phaser.js integration
│   │   │   ├── MenuScreen.tsx         # Game menus
│   │   │   └── layouts/
│   │   ├── game/
│   │   │   ├── scenes/
│   │   │   │   ├── MainMenuScene.ts   # Phaser scenes
│   │   │   │   ├── GameScene.ts
│   │   │   │   └── GameOverScene.ts
│   │   │   └── PhaserGame.ts          # Phaser integration
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   └── assets/                    # Game sprites/audio
│   ├── package.json
│   ├── vite.config.ts
│   └── netlify.toml
│
├── deployment/
│   ├── netlify/
│   │   ├── functions/                 # Serverless functions if needed
│   │   └── _redirects
│   ├── environments/
│   │   ├── testnet.env
│   │   └── mainnet.env
│   └── ci-cd/
│       └── deploy.yml                 # GitHub Actions
│
└── docs/
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    └── API.md
```

## 🔧 Technical Stack

### Core Technologies:
- **Frontend**: React 18 + TypeScript + Vite
- **Game Engine**: Phaser.js 3.70+ (WebGL/Canvas rendering)
- **Blockchain**: ethers.js v6 (Web3 integration)
- **UI Framework**: Tailwind CSS + Radix UI (accessibility)
- **State Management**: Zustand (lightweight, TypeScript-first)
- **Build Tool**: Vite (fast dev server, optimized builds)

### Development Tools:
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier + TypeScript strict mode
- **CI/CD**: GitHub Actions with Netlify deployment
- **Monitoring**: Sentry for error tracking

## 🎮 Game Architecture

### Game Engine Layer (packages/game-engine):
```typescript
// GameEngine.ts - Framework agnostic game logic
export class GameEngine {
  private player: Player;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private score: number = 0;
  
  constructor(private config: GameConfig) {
    this.player = new Player(config.playerConfig);
  }
  
  update(deltaTime: number): GameState {
    // Pure logic, no rendering
    this.updateEnemies(deltaTime);
    this.updateProjectiles(deltaTime);
    this.checkCollisions();
    return this.getGameState();
  }
  
  // Methods for blockchain integration
  purchaseHealth(amount: number): void {
    this.player.addHealth(amount);
  }
  
  getScoreForSubmission(): ScoreData {
    return {
      score: this.score,
      healthPurchased: this.player.healthPurchased,
      gameTime: this.gameTime
    };
  }
}
```

### Blockchain Integration (packages/blockchain-client):
```typescript
// BlockchainClient.ts
export class BlockchainClient {
  private gameEconomyContract: Contract;
  private leaderboardContract: Contract;
  
  async purchaseHealthWithETH(): Promise<TransactionResult> {
    // Health purchase logic
  }
  
  async submitScore(scoreData: ScoreData): Promise<TransactionResult> {
    // Score submission logic
  }
  
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    // Leaderboard retrieval
  }
}

// React hooks for easy integration
export const useHealthPurchase = () => {
  const [purchasing, setPurchasing] = useState(false);
  
  const purchaseWithETH = useCallback(async () => {
    setPurchasing(true);
    try {
      const result = await blockchainClient.purchaseHealthWithETH();
      // Handle success
    } finally {
      setPurchasing(false);
    }
  }, []);
  
  return { purchaseWithETH, purchasing };
};
```

## 🚀 Phase 2: Mini App Preparation

### Package Extraction Strategy:
1. **Develop in monorepo** with package structure
2. **Test package boundaries** with clear APIs
3. **Extract to NPM** when mini app development starts
4. **Version management** with semantic versioning

### Mini App Integration:
```typescript
// In future mini-app repo
import { GameEngine, GameConfig } from '@save-castle/game-engine';
import { BlockchainClient } from '@save-castle/blockchain-client';
import { WalletConnect, Leaderboard } from '@save-castle/ui-components';

// Mini app specific implementation
const miniAppGame = new GameEngine(miniAppConfig);
```

## 🌐 Deployment Strategy

### Environment Management:
```typescript
// packages/shared-config/src/networks.ts
export const NETWORKS = {
  baseSepolia: {
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    contracts: {
      gameEconomy: '0x55cBEa71ad8B981B91B137116B76a4828F90C548',
      leaderboard: '0x59FF2595588AA2236441B0E82b2CD692e1373E58'
    }
  },
  baseMainnet: {
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    contracts: {
      gameEconomy: '0x...', // Deploy to mainnet
      leaderboard: '0x...'  // Deploy to mainnet
    }
  }
} as const;
```

### CI/CD Pipeline:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify
on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:packages
      
      - name: Build for production
        run: npm run build
        env:
          VITE_ENVIRONMENT: ${{ github.ref == 'refs/heads/main' && 'mainnet' || 'testnet' }}
      
      - name: Deploy to Netlify
        uses: netlify/actions/build@master
        with:
          publish-dir: web-app/dist
```

## 📈 Benefits of This Architecture

### Immediate Benefits:
- ✅ **Fast Development**: Reuse existing game logic
- ✅ **Zero Infrastructure Costs**: Static site hosting
- ✅ **Global Distribution**: CDN performance
- ✅ **Mobile Friendly**: Responsive web design

### Long-term Benefits:
- ✅ **Code Reuse**: 80% shared with mini app
- ✅ **Easy Maintenance**: TypeScript + modular structure
- ✅ **Scalable**: Package extraction for multiple products
- ✅ **Team Productivity**: Single codebase knowledge

## 🛣️ Implementation Timeline

### Week 1: Foundation
- **Day 1-2**: Setup React + TypeScript + Phaser.js structure
- **Day 3-4**: Port core game mechanics from Python
- **Day 5**: Basic blockchain integration
- **Day 6-7**: UI polish + deployment

### Week 2: Polish & Optimization
- **Day 1-2**: Advanced blockchain features
- **Day 3-4**: Performance optimization
- **Day 5**: Package structure refinement
- **Day 6-7**: Testing + documentation

## 🎯 Success Metrics

### Technical Metrics:
- **Bundle Size**: < 2MB initial load
- **Performance**: 60 FPS gameplay on mobile
- **Blockchain**: < 30s transaction confirmation
- **Uptime**: 99.9% availability

### Business Metrics:
- **Code Reuse**: 70%+ shared with mini app
- **Development Speed**: 2x faster mini app development
- **Maintenance Cost**: 50% reduction vs separate codebases

## 🚦 Decision Point

**Recommendation**: Proceed with React + TypeScript web architecture

**Next Steps**:
1. ✅ Setup web project structure
2. ✅ Port Player/Enemy/Bullet classes to TypeScript
3. ✅ Integrate Phaser.js for rendering
4. ✅ Connect blockchain with ethers.js
5. ✅ Deploy to Netlify

This architecture positions you for:
- **Immediate**: Fast web deployment
- **Short-term**: Easy mini app development
- **Long-term**: Scalable multi-product ecosystem

Ready to implement?
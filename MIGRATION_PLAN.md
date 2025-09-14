# Save the Castle → Farcaster Mini App Migration Plan

## 🎯 Project Overview

Transform the existing Python/Pygame tower defense game into a blockchain-enabled Farcaster Mini App with smart contract integration on Base network.

## 🔗 Smart Contracts Explained

### **Leaderboard.sol**
Manages all game rankings and player statistics:
- **Global/Daily/Weekly Rankings**: Automatic time-based leaderboard resets
- **Player Stats**: Best scores, total games played, spending history
- **Name System**: Reserve player names, prevent duplicates
- **Paid vs Free Players**: Separate tracking for players who buy health

### **GameEconomy.sol** 
Handles in-game purchases and economic mechanics:
- **Health Purchases**: Buy 1-200 health points with ETH/USDC during gameplay
- **Dynamic Pricing**: 10% price increase per purchase in same game (max 5x base)
- **Game Sessions**: Unique session IDs track purchases and reset pricing
- **Revenue Tracking**: Complete analytics for ETH/USDC payments
- **Base Pricing**: 0.001 ETH or $3 USDC per 100 health points

**Example Flow:**
```
Game Start → Session #123 → Buy 100 health (0.001 ETH) → Get hit → 
Buy 100 more (0.0011 ETH, +10%) → Game End → Next game resets pricing
```

## 📋 Migration Phases

### Phase 1: Smart Contract Deployment (Week 1)
**Status: Smart Contracts Created ✅**

#### Completed:
- ✅ Created `Leaderboard.sol` - Global/daily/weekly rankings with player stats
- ✅ Created `GameEconomy.sol` - Health purchases with ETH/USDC support
- ✅ Implemented dynamic pricing (10% increase per purchase, max 5x)
- ✅ Added comprehensive event logging and admin controls

#### Next Steps:
1. **Deploy to Base Sepolia Testnet**
   - Set up Hardhat/Foundry configuration
   - Deploy contracts with proper initialization
   - Verify contracts on BaseScan explorer
   - Test all functions thoroughly

2. **Contract Integration Setup**
   - Create Web3 client wrapper for Python game
   - Implement wallet connection (MetaMask/Coinbase Wallet)
   - Add transaction handling and error management

---

### Phase 2: Game Architecture Refactoring (Week 2)

#### 2.1 Modular Component Structure
```
game/
├── engine.py              # Main game loop
├── entities/
│   ├── player.py          # Player with wallet integration
│   ├── enemy.py           # Enemy spawning system  
│   ├── projectile.py      # Bullet mechanics
│   └── powerup.py         # Health items & purchases
├── systems/
│   ├── blockchain.py      # Smart contract interactions
│   ├── scoring.py         # Score submission to blockchain
│   ├── health.py          # Health purchase integration
│   └── leaderboard.py     # Real-time leaderboard display
└── ui/
    ├── wallet_connect.py  # Wallet connection UI
    ├── purchase_dialog.py # Health purchase interface
    └── leaderboard_ui.py  # Leaderboard display
```

#### 2.2 Key Integration Points
- **Game Start**: Connect wallet & start blockchain game session
- **Health System**: Integrate blockchain health purchases
- **Score Submission**: Auto-submit scores to leaderboard contract
- **Game End**: End blockchain session & display leaderboard rank

---

### Phase 3: Web Platform Development (Week 3)

#### 3.1 Technology Stack
- **Frontend**: React.js/Next.js for web version
- **Game Engine**: Phaser.js for browser-based game
- **Blockchain**: Web3.js/ethers.js for contract interaction
- **Styling**: Tailwind CSS for responsive design

#### 3.2 Web Game Features
- Full game playable in browser
- Wallet integration (MetaMask, Coinbase Wallet, WalletConnect)
- Real-time leaderboard updates
- Social sharing functionality
- Mobile-responsive design

---

### Phase 4: Farcaster Mini App Development (Week 4)

#### 4.1 Mini App Architecture
```
social/farcaster/
├── mini_app.py           # Main Mini App logic
├── frames.py             # Frame generation
├── game_integration.py   # Game state management
├── templates/
│   ├── game.html         # Game interface
│   ├── leaderboard.html  # Leaderboard view
│   └── share.html        # Share score interface
└── api/
    ├── game_api.py       # Game data endpoints
    └── frame_api.py      # Frame metadata endpoints
```

#### 4.2 Farcaster Features
- **Playable Game**: Full game experience within Farcaster
- **Wallet Integration**: Seamless Web3 wallet connection
- **Social Features**: Share scores as casts
- **Leaderboard**: View rankings directly in app
- **Challenges**: Challenge other Farcaster users

---

### Phase 5: Social Integration (Week 5)

#### 5.1 Platform Integrations
- **Twitter API v2**: Auto-tweet high scores with game screenshots
- **Instagram Graph API**: Share achievement stories
- **Farcaster Protocol**: Native cast integration

#### 5.2 Share Features
- **Score Screenshots**: Auto-generated score images
- **Achievement Badges**: Visual accomplishments
- **Challenge Links**: Invite friends to beat your score
- **Leaderboard Updates**: Daily/weekly ranking posts

---

## 🔑 Required External Accounts & APIs

### **IMMEDIATE PRIORITY - Week 1 Setup**

#### 1. **Alchemy** (Blockchain RPC) - 5 minutes
```bash
1. Go to https://alchemy.com → Create account
2. Create app: Network = Base Sepolia, Name = "Save the Castle"
3. Copy API key → Add to .env: ALCHEMY_API_KEY=your_key_here
```
**Cost**: Free (300M requests/month) | **Need**: Your API key

#### 2. **WalletConnect** (Multi-wallet support) - 5 minutes  
```bash
1. Go to https://walletconnect.com → Create account
2. Create project: Name = "Save the Castle", Type = "dApp"
3. Copy Project ID → Add to .env: WALLETCONNECT_PROJECT_ID=your_id
```
**Cost**: Free | **Need**: Your Project ID

#### 3. **Deployment Wallet** - Base Sepolia ETH needed
```bash
1. Create new MetaMask wallet or use existing
2. Add Base Sepolia network to MetaMask
3. Get testnet ETH from Base Sepolia faucets
4. Export private key → Add to .env: PRIVATE_KEY=0x...
```
**Cost**: Free (testnet) | **Need**: Your private key with testnet ETH

### **MEDIUM PRIORITY - Week 2-3 Setup**

#### 4. **Farcaster Hub** (Mini App integration) - 15 minutes
```bash
1. Create Farcaster account at https://farcaster.xyz if needed
2. Go to https://docs.farcaster.xyz/developers/guides/accounts
3. Set up developer access and get Hub API access
4. Add to .env: FARCASTER_HUB_URL=https://hub.farcaster.xyz
```
**Cost**: Free | **Need**: Your Farcaster developer setup

#### 5. **Vercel** (Frontend hosting) - 10 minutes
```bash
1. Go to https://vercel.com → Connect GitHub account
2. Import Save_the_Castle repository 
3. Configure environment variables in dashboard
4. Deploy
```
**Cost**: Free (100GB bandwidth) | **Need**: Deploy access

#### 6. **Railway** (Backend hosting) - 15 minutes
```bash
1. Go to https://railway.app → Create account
2. Create new project from GitHub repo
3. Add environment variables
4. Deploy Python backend
```
**Cost**: $5/month | **Need**: Hosting for backend

### **LOW PRIORITY - Week 4-5 Setup**

#### 7. **Twitter API v2** (Score sharing) - 30-60 minutes
```bash
1. Go to https://developer.twitter.com
2. Apply for Developer account (1-7 day approval)  
3. Create app project and generate API keys
4. Add to .env: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_BEARER_TOKEN
```
**Cost**: $100/month Basic | **Need**: Your API credentials

#### 8. **Supabase PostgreSQL** (Database) - 10 minutes
```bash
1. Go to https://supabase.com → Create account
2. Create new project
3. Copy database URL from settings
4. Add to .env: DATABASE_URL=postgresql://...
```
**Cost**: Free (512MB) | **Need**: Database connection string

### **Cost Breakdown**
```
Development (Month 1): $5/month (Railway only)
Production (Month 2+): $114-264/month (all services)
```

### **Environment Variables Template**
```bash
# Blockchain (REQUIRED WEEK 1)
PRIVATE_KEY=0x1234... # Your deployment wallet
ALCHEMY_API_KEY=alcht_... # From Alchemy dashboard  
WALLETCONNECT_PROJECT_ID=... # From WalletConnect

# Contract Addresses (Set after deployment)
LEADERBOARD_CONTRACT=0x...
GAME_ECONOMY_CONTRACT=0x...

# Base Network URLs
BASE_SEPOLIA_RPC=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
USDC_TOKEN_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Farcaster (REQUIRED WEEK 2)
FARCASTER_HUB_URL=https://hub.farcaster.xyz
FARCASTER_MNEMONIC=your twelve word mnemonic

# Infrastructure (REQUIRED WEEK 2)  
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=random_secret_key

# Social Media (OPTIONAL)
TWITTER_API_KEY=...
TWITTER_API_SECRET=...  
TWITTER_BEARER_TOKEN=...
```

---

## 📋 Pre-Deployment Checklist

### **Week 1 - Smart Contract Deployment**
- [ ] Alchemy API key obtained and configured
- [ ] WalletConnect Project ID created  
- [ ] Deployment wallet has Base Sepolia ETH
- [ ] Base Sepolia network added to MetaMask
- [ ] Hardhat configuration complete
- [ ] Smart contracts compile successfully
- [ ] Deploy Leaderboard.sol to Base Sepolia
- [ ] Deploy GameEconomy.sol to Base Sepolia
- [ ] Verify contracts on BaseScan explorer
- [ ] Test all contract functions

### **Week 2 - Game Integration**
- [ ] Farcaster developer account setup
- [ ] Database (Supabase) configured
- [ ] Backend hosting (Railway) deployed
- [ ] Web3 Python client created
- [ ] Game modularization complete
- [ ] Blockchain integration tested

### **Week 3 - Web Platform**  
- [ ] Frontend hosting (Vercel) configured
- [ ] React/Next.js web version built
- [ ] Wallet integration working
- [ ] Web game fully functional
- [ ] Mobile responsiveness tested

### **Week 4 - Farcaster Mini App**
- [ ] Mini App development complete
- [ ] Frame generation working
- [ ] Farcaster integration tested
- [ ] Mini App submitted for review

### **Week 5 - Social & Launch**
- [ ] Twitter API configured (optional)
- [ ] Social sharing implemented  
- [ ] Production deployment complete
- [ ] Monitoring systems active
- [ ] Launch marketing ready

## 🛠️ Development Tools Setup Required

### **On Your Machine:**
```bash
# Node.js & Package Management
- Node.js v18+
- npm/yarn/pnpm

# Python Environment
- Python 3.9+
- pip, virtualenv

# Blockchain Development  
- Hardhat or Foundry
- MetaMask extension

# Installation Commands:
npm install -g hardhat
pip install pygame web3 requests python-dotenv
```

## 📊 Smart Contract Addresses (After Deployment)

### **Base Sepolia Testnet:**
```javascript
const contracts = {
  leaderboard: "0x...", // Will be set after deployment
  gameEconomy: "0x...", // Will be set after deployment  
  usdcToken: "0x036CbD53842c5426634e7929541eC2318f3dCF7e"
}
```

### **Base Mainnet (Production):**
```javascript  
const mainnetContracts = {
  leaderboard: "0x...", // Will be set after deployment
  gameEconomy: "0x...", // Will be set after deployment
  usdcToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
}
```

---

## 🚀 Development Timeline

### Week 1: Smart Contracts (Current)
- [x] Design & implement contracts
- [ ] Deploy to Base Sepolia
- [ ] Test all functionality
- [ ] Security audit (basic)

### Week 2: Game Refactoring  
- [ ] Modularize existing Python code
- [ ] Integrate blockchain functionality
- [ ] Add wallet connection to game
- [ ] Test blockchain game flow

### Week 3: Web Platform
- [ ] Create React.js web version
- [ ] Implement Phaser.js game engine
- [ ] Add Web3 wallet integration
- [ ] Deploy web platform

### Week 4: Farcaster Mini App
- [ ] Build Mini App framework
- [ ] Integrate game into Farcaster
- [ ] Test Mini App functionality
- [ ] Submit for Farcaster review

### Week 5: Social & Launch
- [ ] Implement social sharing
- [ ] Deploy to Base Mainnet
- [ ] Launch marketing campaign
- [ ] Monitor & optimize

---

## 🎮 Technical Specifications

### Game Mechanics Integration:
1. **Wallet Connection**: Required before game start
2. **Game Sessions**: Blockchain-tracked with unique IDs
3. **Health Purchases**: Real-time blockchain transactions
4. **Score Submission**: Automatic on game end
5. **Leaderboard**: Live updates from smart contract

### Performance Considerations:
- **Transaction Batching**: Batch multiple actions when possible
- **Gas Optimization**: Minimize contract calls during gameplay
- **Offline Support**: Cache leaderboards for offline viewing
- **Mobile Optimization**: Touch controls for Farcaster mobile

### Security Measures:
- **Score Validation**: Server-side validation before blockchain submission
- **Rate Limiting**: Prevent spam transactions
- **Wallet Security**: Never store private keys locally
- **Input Sanitization**: Validate all user inputs

---

## 📊 Success Metrics

### Blockchain Metrics:
- Total unique players: Target 1000+ in first month
- Health purchases: Target $1000+ revenue in first month
- Transaction success rate: >95%
- Average gas cost per transaction: <$1

### Social Metrics:
- Farcaster Mini App installs: Target 500+ in first week
- Social shares: Target 100+ daily shares
- User retention: >30% weekly retention
- Community growth: Target 10% weekly user growth

### Technical Metrics:
- Game load time: <3 seconds
- Transaction confirmation time: <30 seconds
- Uptime: >99.9%
- Mobile compatibility: Support all major browsers

---

## ⚠️ Risk Mitigation

### Technical Risks:
- **Smart Contract Bugs**: Comprehensive testing & audit
- **Gas Price Volatility**: Implement gas price monitoring
- **Network Congestion**: Fallback to cheaper operations
- **Wallet Integration**: Support multiple wallet types

### Business Risks:
- **Low Adoption**: Strong marketing & incentives
- **Regulatory Changes**: Monitor crypto regulations
- **Competition**: Unique gameplay & social features
- **Revenue Model**: Diversify beyond health purchases

---

## 🔄 Post-Launch Iterations

### Version 1.1 (Month 2):
- Tournament system with entry fees
- NFT achievement badges
- Player vs player battles
- Enhanced social features

### Version 1.2 (Month 3):
- Custom game modes
- Team tournaments
- Advanced analytics dashboard
- Mobile app version

### Version 2.0 (Month 6):
- Land ownership mechanics
- Player-generated content
- DAO governance for game updates
- Cross-chain compatibility

---

This plan provides a comprehensive roadmap for transforming Save the Castle into a successful blockchain-enabled Farcaster Mini App. Each phase builds upon the previous one, ensuring a solid foundation for long-term success.
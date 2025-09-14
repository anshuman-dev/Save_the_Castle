# Save The Castle - Smart Contracts

This directory contains the smart contracts for the Save The Castle game, designed for deployment on Base Sepolia testnet and Base mainnet.

## Contracts

### SaveTheCastleGameEconomy
- Manages in-game purchases and economic system
- Supports ETH and USDC payments for health purchases
- Dynamic pricing based on purchase frequency
- Revenue tracking and withdrawal functionality

### SaveTheCastleLeaderboard
- Manages game leaderboards (daily, weekly, all-time)
- Player statistics and rankings
- Score submission and validation
- Name registration system

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
- `PRIVATE_KEY`: Your wallet private key (without 0x prefix)
- `BASESCAN_API_KEY`: Your BaseScan API key for verification
- Update RPC URLs if needed

## Deployment

### Deploy to Base Sepolia (Testnet)
```bash
npm run deploy:base-sepolia
```

### Verify Contracts
```bash
npm run verify:base-sepolia
```

### Test Contract Interactions
```bash
npx hardhat run scripts/interact.js --network base-sepolia
```

## Network Configuration

### Base Sepolia Testnet
- Chain ID: 84532
- RPC URL: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org
- USDC Address: 0x036CbD53842c5426634e7929541eC2318f3dCF7e

### Base Mainnet
- Chain ID: 8453
- RPC URL: https://mainnet.base.org
- Explorer: https://basescan.org
- USDC Address: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

## Getting Testnet ETH

To deploy on Base Sepolia, you'll need testnet ETH:
1. Get ETH on Ethereum Sepolia from a faucet
2. Bridge to Base Sepolia using the official Base bridge: https://bridge.base.org

## Contract Addresses

After deployment, contract addresses will be saved in `deployments/<network>.json`

## Usage

### Starting a Game Session
```javascript
// Start game session
const gameId = await gameEconomy.startGameSession();
```

### Purchasing Health
```javascript
// Purchase with ETH
await gameEconomy.purchaseHealthWithETH(100, { value: ethCost });

// Purchase with USDC (requires approval)
await usdcToken.approve(gameEconomyAddress, usdcCost);
await gameEconomy.purchaseHealthWithUSDC(100);
```

### Submitting Scores
```javascript
// Submit score to leaderboard
await leaderboard.submitScore(
  playerAddress,
  "PlayerName",
  score,
  isPaidPlayer,
  totalSpent
);
```

## Security Features

- ReentrancyGuard on financial functions
- Pausable contracts for emergency stops
- Owner-only administrative functions
- Input validation and bounds checking
- Safe token transfers using OpenZeppelin libraries

## Testing

Run the test suite:
```bash
npm test
```

## Gas Optimization

Contracts are optimized for gas efficiency:
- Optimizer enabled with 200 runs
- Efficient data structures
- Minimal storage operations
- Batch operations where possible

## Support

For questions or issues, please refer to the main project repository.
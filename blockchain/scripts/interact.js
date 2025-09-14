const hre = require("hardhat");
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const networkName = hre.network.name;
  
  // Load deployment addresses
  const fs = require('fs');
  const path = require('path');
  const deploymentFile = path.join(__dirname, '../deployments', `${networkName}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.log("Please run deployment first");
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const [signer] = await ethers.getSigners();
  
  console.log("🎮 Interacting with contracts on", networkName);
  console.log("Account:", signer.address);
  console.log("===============================================");
  
  // Get contract instances
  const gameEconomy = await ethers.getContractAt(
    "SaveTheCastleGameEconomy",
    deployment.contracts.SaveTheCastleGameEconomy
  );
  
  const leaderboard = await ethers.getContractAt(
    "SaveTheCastleLeaderboard",
    deployment.contracts.SaveTheCastleLeaderboard
  );
  
  try {
    // Check contract ownership
    console.log("📋 Contract Information:");
    console.log("GameEconomy owner:", await gameEconomy.owner());
    console.log("Leaderboard owner:", await leaderboard.owner());
    console.log("Game contract in leaderboard:", await leaderboard.gameContract());
    
    // Check pricing
    console.log("");
    console.log("💰 Current Pricing:");
    const ethPrice = await gameEconomy.baseHealthPriceETH();
    const usdcPrice = await gameEconomy.baseHealthPriceUSDC();
    console.log("Base ETH price per 100 health:", ethers.formatEther(ethPrice), "ETH");
    console.log("Base USDC price per 100 health:", ethers.formatUnits(usdcPrice, 6), "USDC");
    
    // Check player pricing (for current signer)
    const [ethCost, usdcCost] = await gameEconomy.getCurrentPricing(signer.address);
    console.log("Current ETH cost for 100 health:", ethers.formatEther(ethCost), "ETH");
    console.log("Current USDC cost for 100 health:", ethers.formatUnits(usdcCost, 6), "USDC");
    
    // Check if player has active game session
    const hasActiveSession = await gameEconomy.hasActiveGameSession(signer.address);
    console.log("Has active game session:", hasActiveSession);
    
    // Get revenue stats
    console.log("");
    console.log("📊 Revenue Statistics:");
    const revenueStats = await gameEconomy.getRevenueStats();
    console.log("Total ETH revenue:", ethers.formatEther(revenueStats[0]), "ETH");
    console.log("Total USDC revenue:", ethers.formatUnits(revenueStats[1], 6), "USDC");
    console.log("Total health sold:", revenueStats[2].toString());
    console.log("Total purchases:", revenueStats[3].toString());
    
    // Get leaderboard info
    console.log("");
    console.log("🏆 Leaderboard Information:");
    console.log("Max leaderboard size:", (await leaderboard.maxLeaderboardSize()).toString());
    console.log("Min score threshold:", (await leaderboard.minScoreThreshold()).toString());
    
    // Get top scores (if any)
    const topScores = await leaderboard.getTopScores(5);
    console.log("Top 5 all-time scores:", topScores.length);
    
    if (topScores.length > 0) {
      topScores.forEach((score, index) => {
        console.log(`  ${index + 1}. ${score.playerName}: ${score.score} (${score.player})`);
      });
    }
    
    console.log("");
    console.log("✅ Contract interaction successful!");
    
  } catch (error) {
    console.error("❌ Error interacting with contracts:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
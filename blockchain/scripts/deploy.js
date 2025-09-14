const hre = require("hardhat");
const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Starting deployment to", hre.network.name);
  console.log("===============================================");
  
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.provider.getBalance(deployer.address);
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Get USDC token address based on network
  let usdcAddress;
  if (hre.network.name === "base-sepolia") {
    usdcAddress = process.env.USDC_TOKEN_ADDRESS_SEPOLIA || "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
  } else if (hre.network.name === "base") {
    usdcAddress = process.env.USDC_TOKEN_ADDRESS_MAINNET || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  } else {
    // For local development, deploy a mock USDC
    console.log("📝 Deploying mock USDC for local testing...");
    const MockUSDC = await ethers.getContractFactory("MockERC20");
    const mockUSDC = await MockUSDC.deploy("USD Coin", "USDC", 6);
    await mockUSDC.waitForDeployment();
    usdcAddress = await mockUSDC.getAddress();
    console.log("Mock USDC deployed to:", usdcAddress);
  }
  
  console.log("Using USDC token address:", usdcAddress);
  console.log("");
  
  // Deploy GameEconomy contract
  console.log("📜 Deploying SaveTheCastleGameEconomy...");
  const GameEconomy = await ethers.getContractFactory("SaveTheCastleGameEconomy");
  const gameEconomy = await GameEconomy.deploy(usdcAddress);
  await gameEconomy.waitForDeployment();
  const gameEconomyAddress = await gameEconomy.getAddress();
  
  console.log("✅ SaveTheCastleGameEconomy deployed to:", gameEconomyAddress);
  
  // Deploy Leaderboard contract
  console.log("🏆 Deploying SaveTheCastleLeaderboard...");
  const Leaderboard = await ethers.getContractFactory("SaveTheCastleLeaderboard");
  const leaderboard = await Leaderboard.deploy();
  await leaderboard.waitForDeployment();
  const leaderboardAddress = await leaderboard.getAddress();
  
  console.log("✅ SaveTheCastleLeaderboard deployed to:", leaderboardAddress);
  
  // Set up contract relationships
  console.log("");
  console.log("🔗 Setting up contract relationships...");
  
  // Set game contract address in leaderboard
  const setGameContractTx = await leaderboard.setGameContract(gameEconomyAddress);
  await setGameContractTx.wait();
  console.log("✅ Game contract address set in leaderboard");
  
  // Verify contract deployment
  console.log("");
  console.log("🔍 Verifying deployment...");
  
  const economyOwner = await gameEconomy.owner();
  const leaderboardOwner = await leaderboard.owner();
  const gameContractInLeaderboard = await leaderboard.gameContract();
  
  console.log("Game Economy owner:", economyOwner);
  console.log("Leaderboard owner:", leaderboardOwner);
  console.log("Game contract in leaderboard:", gameContractInLeaderboard);
  
  // Display deployment summary
  console.log("");
  console.log("===============================================");
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("===============================================");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("Deployer:", deployer.address);
  console.log("USDC Token:", usdcAddress);
  console.log("GameEconomy:", gameEconomyAddress);
  console.log("Leaderboard:", leaderboardAddress);
  console.log("===============================================");
  
  // Save deployment addresses to file
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      USDC: usdcAddress,
      SaveTheCastleGameEconomy: gameEconomyAddress,
      SaveTheCastleLeaderboard: leaderboardAddress
    },
    transactionHashes: {
      gameEconomy: gameEconomy.deploymentTransaction()?.hash,
      leaderboard: leaderboard.deploymentTransaction()?.hash
    }
  };
  
  const fs = require('fs');
  const path = require('path');
  const deploymentsDir = path.join(__dirname, '../deployments');
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("📁 Deployment info saved to:", deploymentFile);
  
  // Print verification commands
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("");
    console.log("📋 Contract Verification Commands:");
    console.log("===============================================");
    console.log(`npx hardhat verify --network ${hre.network.name} ${gameEconomyAddress} "${usdcAddress}"`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${leaderboardAddress}`);
    console.log("===============================================");
  }
  
  console.log("");
  console.log("🎮 Next steps:");
  console.log("1. Fund the deployer account with ETH for gas");
  console.log("2. Verify contracts on BaseScan (commands above)");
  console.log("3. Test contract interactions");
  console.log("4. Update frontend with new contract addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
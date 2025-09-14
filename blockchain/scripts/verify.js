const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const networkName = hre.network.name;
  
  // Load deployment addresses
  const fs = require('fs');
  const path = require('path');
  const deploymentFile = path.join(__dirname, '../deployments', `${networkName}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found: ${deploymentFile}`);
    console.log("Please run deployment first: npm run deploy:base-sepolia");
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  
  console.log("🔍 Verifying contracts on", networkName);
  console.log("===============================================");
  
  try {
    // Verify GameEconomy contract
    console.log("Verifying SaveTheCastleGameEconomy...");
    await hre.run("verify:verify", {
      address: deployment.contracts.SaveTheCastleGameEconomy,
      constructorArguments: [deployment.contracts.USDC],
    });
    console.log("✅ SaveTheCastleGameEconomy verified");
    
  } catch (error) {
    console.log("⚠️  GameEconomy verification failed:", error.message);
  }
  
  try {
    // Verify Leaderboard contract
    console.log("Verifying SaveTheCastleLeaderboard...");
    await hre.run("verify:verify", {
      address: deployment.contracts.SaveTheCastleLeaderboard,
      constructorArguments: [],
    });
    console.log("✅ SaveTheCastleLeaderboard verified");
    
  } catch (error) {
    console.log("⚠️  Leaderboard verification failed:", error.message);
  }
  
  console.log("");
  console.log("🎉 Verification completed!");
  console.log("Check your contracts on BaseScan:");
  console.log(`- GameEconomy: https://${networkName === 'base' ? '' : 'sepolia.'}basescan.org/address/${deployment.contracts.SaveTheCastleGameEconomy}`);
  console.log(`- Leaderboard: https://${networkName === 'base' ? '' : 'sepolia.'}basescan.org/address/${deployment.contracts.SaveTheCastleLeaderboard}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
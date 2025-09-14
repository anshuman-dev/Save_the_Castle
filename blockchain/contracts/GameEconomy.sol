// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SaveTheCastleGameEconomy
 * @dev Smart contract for managing in-game purchases and rewards
 * Supports ETH and USDC payments for health purchases
 */
contract SaveTheCastleGameEconomy is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;
    
    // USDC token interface (Base mainnet: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
    IERC20 public immutable USDC;
    
    struct HealthPurchase {
        address player;
        uint256 amount; // Health amount purchased (1-200)
        uint256 costInWei; // Cost paid in Wei (ETH)
        uint256 costInUSDC; // Cost paid in USDC (6 decimals)
        uint256 timestamp;
        string paymentMethod; // "ETH" or "USDC"
    }
    
    struct PlayerEconomyStats {
        uint256 totalSpentETH;
        uint256 totalSpentUSDC;
        uint256 totalHealthPurchased;
        uint256 purchaseCount;
        uint256 lastPurchaseTimestamp;
    }
    
    // Pricing configuration
    uint256 public baseHealthPriceETH = 0.001 ether; // 0.001 ETH per 100 health points
    uint256 public baseHealthPriceUSDC = 3 * 10**6; // $3 USDC per 100 health points (6 decimals)
    
    // Dynamic pricing
    uint256 public priceIncreasePercentage = 10; // 10% increase per purchase in same game
    uint256 public maxPriceMultiplier = 5; // Max 5x base price
    
    // Storage
    mapping(address => PlayerEconomyStats) public playerStats;
    mapping(address => uint256) public currentGamePurchases; // Purchases in current game session
    mapping(address => uint256) public activeGameId; // Current game ID for player
    
    HealthPurchase[] public allPurchases;
    
    // Revenue tracking
    uint256 public totalRevenueETH;
    uint256 public totalRevenueUSDC;
    uint256 public totalHealthSold;
    
    // Game session management
    mapping(address => bool) public activeGameSessions;
    mapping(uint256 => bool) public gameSessionExists;
    uint256 public nextGameId = 1;
    
    // Authorization
    address public gameContract;
    
    // Events
    event HealthPurchased(
        address indexed player,
        uint256 healthAmount,
        uint256 costInWei,
        uint256 costInUSDC,
        string paymentMethod,
        uint256 gameId,
        uint256 timestamp
    );
    
    event GameSessionStarted(address indexed player, uint256 gameId);
    event GameSessionEnded(address indexed player, uint256 gameId, uint256 finalScore);
    event PricesUpdated(uint256 newETHPrice, uint256 newUSDCPrice);
    event RevenueWithdrawn(address indexed recipient, uint256 ethAmount, uint256 usdcAmount);
    
    modifier onlyGameContract() {
        require(msg.sender == gameContract || msg.sender == owner(), "Unauthorized");
        _;
    }
    
    modifier hasActiveGame() {
        require(activeGameSessions[msg.sender], "No active game session");
        _;
    }
    
    constructor(address _usdcToken) Ownable(msg.sender) {
        USDC = IERC20(_usdcToken);
    }
    
    /**
     * @dev Set the authorized game contract address
     */
    function setGameContract(address _gameContract) external onlyOwner {
        gameContract = _gameContract;
    }
    
    /**
     * @dev Start a new game session
     */
    function startGameSession() external whenNotPaused returns (uint256 gameId) {
        require(!activeGameSessions[msg.sender], "Game session already active");
        
        gameId = nextGameId++;
        activeGameSessions[msg.sender] = true;
        activeGameId[msg.sender] = gameId;
        gameSessionExists[gameId] = true;
        currentGamePurchases[msg.sender] = 0;
        
        emit GameSessionStarted(msg.sender, gameId);
        return gameId;
    }
    
    /**
     * @dev End current game session
     */
    function endGameSession(uint256 finalScore) external hasActiveGame {
        uint256 gameId = activeGameId[msg.sender];
        
        activeGameSessions[msg.sender] = false;
        activeGameId[msg.sender] = 0;
        currentGamePurchases[msg.sender] = 0;
        
        emit GameSessionEnded(msg.sender, gameId, finalScore);
    }
    
    /**
     * @dev Purchase health with ETH
     * @param healthAmount Amount of health to purchase (1-200)
     */
    function purchaseHealthWithETH(uint256 healthAmount) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        hasActiveGame 
    {
        require(healthAmount > 0 && healthAmount <= 200, "Invalid health amount");
        
        uint256 cost = calculateETHCost(msg.sender, healthAmount);
        require(msg.value >= cost, "Insufficient ETH sent");
        
        _processPurchase(msg.sender, healthAmount, cost, 0, "ETH");
        
        // Refund excess ETH
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }
    }
    
    /**
     * @dev Purchase health with USDC
     * @param healthAmount Amount of health to purchase (1-200)
     */
    function purchaseHealthWithUSDC(uint256 healthAmount) 
        external 
        nonReentrant 
        whenNotPaused 
        hasActiveGame 
    {
        require(healthAmount > 0 && healthAmount <= 200, "Invalid health amount");
        
        uint256 cost = calculateUSDCCost(msg.sender, healthAmount);
        
        // Transfer USDC from player
        USDC.safeTransferFrom(msg.sender, address(this), cost);
        
        _processPurchase(msg.sender, healthAmount, 0, cost, "USDC");
    }
    
    /**
     * @dev Calculate ETH cost for health purchase including dynamic pricing
     */
    function calculateETHCost(address player, uint256 healthAmount) public view returns (uint256) {
        uint256 baseCost = (baseHealthPriceETH * healthAmount) / 100;
        uint256 purchases = currentGamePurchases[player];
        
        // Apply dynamic pricing
        uint256 multiplier = 100 + (purchases * priceIncreasePercentage);
        if (multiplier > maxPriceMultiplier * 100) {
            multiplier = maxPriceMultiplier * 100;
        }
        
        return (baseCost * multiplier) / 100;
    }
    
    /**
     * @dev Calculate USDC cost for health purchase including dynamic pricing
     */
    function calculateUSDCCost(address player, uint256 healthAmount) public view returns (uint256) {
        uint256 baseCost = (baseHealthPriceUSDC * healthAmount) / 100;
        uint256 purchases = currentGamePurchases[player];
        
        // Apply dynamic pricing
        uint256 multiplier = 100 + (purchases * priceIncreasePercentage);
        if (multiplier > maxPriceMultiplier * 100) {
            multiplier = maxPriceMultiplier * 100;
        }
        
        return (baseCost * multiplier) / 100;
    }
    
    /**
     * @dev Internal function to process purchase
     */
    function _processPurchase(
        address player,
        uint256 healthAmount,
        uint256 ethCost,
        uint256 usdcCost,
        string memory paymentMethod
    ) internal {
        uint256 gameId = activeGameId[player];
        
        // Update player stats
        PlayerEconomyStats storage stats = playerStats[player];
        stats.totalHealthPurchased += healthAmount;
        stats.purchaseCount++;
        stats.lastPurchaseTimestamp = block.timestamp;
        
        if (ethCost > 0) {
            stats.totalSpentETH += ethCost;
            totalRevenueETH += ethCost;
        }
        
        if (usdcCost > 0) {
            stats.totalSpentUSDC += usdcCost;
            totalRevenueUSDC += usdcCost;
        }
        
        // Update game session purchases
        currentGamePurchases[player]++;
        totalHealthSold += healthAmount;
        
        // Record purchase
        allPurchases.push(HealthPurchase({
            player: player,
            amount: healthAmount,
            costInWei: ethCost,
            costInUSDC: usdcCost,
            timestamp: block.timestamp,
            paymentMethod: paymentMethod
        }));
        
        emit HealthPurchased(
            player,
            healthAmount,
            ethCost,
            usdcCost,
            paymentMethod,
            gameId,
            block.timestamp
        );
    }
    
    /**
     * @dev Get player's economy statistics
     */
    function getPlayerStats(address player) external view returns (PlayerEconomyStats memory) {
        return playerStats[player];
    }
    
    /**
     * @dev Get current game pricing for player
     */
    function getCurrentPricing(address player) external view returns (uint256 ethCost, uint256 usdcCost) {
        ethCost = calculateETHCost(player, 100); // Cost for 100 health
        usdcCost = calculateUSDCCost(player, 100); // Cost for 100 health
    }
    
    /**
     * @dev Get total purchases count
     */
    function getTotalPurchases() external view returns (uint256) {
        return allPurchases.length;
    }
    
    /**
     * @dev Get purchase by index
     */
    function getPurchase(uint256 index) external view returns (HealthPurchase memory) {
        require(index < allPurchases.length, "Purchase index out of bounds");
        return allPurchases[index];
    }
    
    /**
     * @dev Check if player has active game session
     */
    function hasActiveGameSession(address player) external view returns (bool) {
        return activeGameSessions[player];
    }
    
    /**
     * @dev Get revenue statistics
     */
    function getRevenueStats() external view returns (
        uint256 totalETH,
        uint256 totalUSDC,
        uint256 totalHealthSoldAmount,
        uint256 totalPurchases
    ) {
        return (
            totalRevenueETH,
            totalRevenueUSDC,
            totalHealthSold,
            allPurchases.length
        );
    }
    
    /**
     * @dev Admin functions
     */
    function updateBasePrices(uint256 _ethPrice, uint256 _usdcPrice) external onlyOwner {
        baseHealthPriceETH = _ethPrice;
        baseHealthPriceUSDC = _usdcPrice;
        emit PricesUpdated(_ethPrice, _usdcPrice);
    }
    
    function updateDynamicPricing(uint256 _increasePercentage, uint256 _maxMultiplier) external onlyOwner {
        priceIncreasePercentage = _increasePercentage;
        maxPriceMultiplier = _maxMultiplier;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Withdraw accumulated revenue
     */
    function withdrawRevenue(address recipient) external onlyOwner nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        
        uint256 ethBalance = address(this).balance;
        uint256 usdcBalance = USDC.balanceOf(address(this));
        
        if (ethBalance > 0) {
            payable(recipient).transfer(ethBalance);
        }
        
        if (usdcBalance > 0) {
            USDC.safeTransfer(recipient, usdcBalance);
        }
        
        emit RevenueWithdrawn(recipient, ethBalance, usdcBalance);
    }
    
    /**
     * @dev Emergency function to end all active game sessions
     */
    function emergencyEndAllSessions() external onlyOwner {
        // This would require iterating through active sessions
        // Implementation depends on how we want to track active players
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256 ethBalance, uint256 usdcBalance) {
        ethBalance = address(this).balance;
        usdcBalance = USDC.balanceOf(address(this));
    }
}
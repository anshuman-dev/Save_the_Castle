// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SaveTheCastleLeaderboard
 * @dev Smart contract for managing game leaderboard with daily/weekly/all-time rankings
 */
contract SaveTheCastleLeaderboard is Ownable, ReentrancyGuard, Pausable {
    
    struct ScoreEntry {
        address player;
        string playerName;
        uint256 score;
        uint256 timestamp;
        bool isPaidPlayer; // Whether player used health purchases
    }
    
    struct PlayerStats {
        uint256 bestScore;
        uint256 totalGames;
        uint256 totalSpent; // Total USDC/ETH spent on health
        string lastKnownName;
    }
    
    // Leaderboard storage
    ScoreEntry[] public allTimeLeaderboard;
    ScoreEntry[] public dailyLeaderboard;
    ScoreEntry[] public weeklyLeaderboard;
    
    // Player mappings
    mapping(address => PlayerStats) public playerStats;
    mapping(address => bool) public hasPlayed;
    mapping(string => address) public nameToAddress; // Prevent name duplicates
    
    // Time tracking
    uint256 public currentDay;
    uint256 public currentWeek;
    uint256 public constant DAY_DURATION = 86400; // 24 hours
    uint256 public constant WEEK_DURATION = 604800; // 7 days
    
    // Configuration
    uint256 public maxLeaderboardSize = 100;
    uint256 public minScoreThreshold = 100; // Minimum score to appear on leaderboard
    
    // Game contract address (for authorization)
    address public gameContract;
    
    // Events
    event ScoreSubmitted(
        address indexed player,
        string playerName,
        uint256 score,
        uint256 timestamp,
        bool isPaidPlayer
    );
    event LeaderboardReset(string leaderboardType, uint256 timestamp);
    event PlayerNameUpdated(address indexed player, string oldName, string newName);
    
    modifier onlyGameContract() {
        require(msg.sender == gameContract, "Only game contract can submit scores");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        currentDay = block.timestamp / DAY_DURATION;
        currentWeek = block.timestamp / WEEK_DURATION;
    }
    
    /**
     * @dev Set the authorized game contract address
     */
    function setGameContract(address _gameContract) external onlyOwner {
        gameContract = _gameContract;
    }
    
    /**
     * @dev Submit a new score (called by game contract)
     */
    function submitScore(
        address player,
        string memory playerName,
        uint256 score,
        bool isPaidPlayer,
        uint256 totalSpent
    ) external onlyGameContract whenNotPaused nonReentrant {
        require(score >= minScoreThreshold, "Score below minimum threshold");
        require(bytes(playerName).length > 0 && bytes(playerName).length <= 32, "Invalid player name");
        
        // Check if name is taken by another player
        if (nameToAddress[playerName] != address(0) && nameToAddress[playerName] != player) {
            revert("Player name already taken");
        }
        
        // Update time periods if needed
        _updateTimePeriods();
        
        // Create score entry
        ScoreEntry memory newEntry = ScoreEntry({
            player: player,
            playerName: playerName,
            score: score,
            timestamp: block.timestamp,
            isPaidPlayer: isPaidPlayer
        });
        
        // Update player stats
        PlayerStats storage stats = playerStats[player];
        if (score > stats.bestScore) {
            stats.bestScore = score;
        }
        stats.totalGames++;
        stats.totalSpent += totalSpent;
        stats.lastKnownName = playerName;
        
        // Update name mapping
        nameToAddress[playerName] = player;
        hasPlayed[player] = true;
        
        // Add to leaderboards
        _insertIntoLeaderboard(allTimeLeaderboard, newEntry);
        _insertIntoLeaderboard(dailyLeaderboard, newEntry);
        _insertIntoLeaderboard(weeklyLeaderboard, newEntry);
        
        emit ScoreSubmitted(player, playerName, score, block.timestamp, isPaidPlayer);
    }
    
    /**
     * @dev Get top N scores from all-time leaderboard
     */
    function getTopScores(uint256 limit) external view returns (ScoreEntry[] memory) {
        uint256 length = allTimeLeaderboard.length < limit ? allTimeLeaderboard.length : limit;
        ScoreEntry[] memory topScores = new ScoreEntry[](length);
        
        for (uint256 i = 0; i < length; i++) {
            topScores[i] = allTimeLeaderboard[i];
        }
        
        return topScores;
    }
    
    /**
     * @dev Get top N scores from daily leaderboard
     */
    function getDailyTopScores(uint256 limit) external view returns (ScoreEntry[] memory) {
        uint256 length = dailyLeaderboard.length < limit ? dailyLeaderboard.length : limit;
        ScoreEntry[] memory topScores = new ScoreEntry[](length);
        
        for (uint256 i = 0; i < length; i++) {
            topScores[i] = dailyLeaderboard[i];
        }
        
        return topScores;
    }
    
    /**
     * @dev Get top N scores from weekly leaderboard
     */
    function getWeeklyTopScores(uint256 limit) external view returns (ScoreEntry[] memory) {
        uint256 length = weeklyLeaderboard.length < limit ? weeklyLeaderboard.length : limit;
        ScoreEntry[] memory topScores = new ScoreEntry[](length);
        
        for (uint256 i = 0; i < length; i++) {
            topScores[i] = weeklyLeaderboard[i];
        }
        
        return topScores;
    }
    
    /**
     * @dev Get player's rank in all-time leaderboard (1-indexed, 0 if not found)
     */
    function getPlayerRank(address player) external view returns (uint256) {
        for (uint256 i = 0; i < allTimeLeaderboard.length; i++) {
            if (allTimeLeaderboard[i].player == player) {
                return i + 1;
            }
        }
        return 0;
    }
    
    /**
     * @dev Get total number of unique players
     */
    function getTotalPlayers() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < allTimeLeaderboard.length; i++) {
            if (hasPlayed[allTimeLeaderboard[i].player]) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @dev Get player statistics
     */
    function getPlayerStats(address player) external view returns (PlayerStats memory) {
        return playerStats[player];
    }
    
    /**
     * @dev Check if player name is available
     */
    function isNameAvailable(string memory name) external view returns (bool) {
        return nameToAddress[name] == address(0);
    }
    
    /**
     * @dev Internal function to insert score into leaderboard (sorted by score desc)
     */
    function _insertIntoLeaderboard(ScoreEntry[] storage leaderboard, ScoreEntry memory newEntry) internal {
        // Find insertion position
        uint256 insertPosition = leaderboard.length;
        
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (newEntry.score > leaderboard[i].score) {
                insertPosition = i;
                break;
            }
        }
        
        // If leaderboard is full and new score doesn't make it, return
        if (insertPosition >= maxLeaderboardSize) {
            return;
        }
        
        // Add entry
        leaderboard.push(newEntry);
        
        // Shift entries down to make room
        for (uint256 i = leaderboard.length - 1; i > insertPosition; i--) {
            leaderboard[i] = leaderboard[i - 1];
        }
        
        // Insert at correct position
        leaderboard[insertPosition] = newEntry;
        
        // Trim if exceeded max size
        if (leaderboard.length > maxLeaderboardSize) {
            leaderboard.pop();
        }
    }
    
    /**
     * @dev Update time periods and reset leaderboards if needed
     */
    function _updateTimePeriods() internal {
        uint256 newDay = block.timestamp / DAY_DURATION;
        uint256 newWeek = block.timestamp / WEEK_DURATION;
        
        if (newDay > currentDay) {
            delete dailyLeaderboard;
            currentDay = newDay;
            emit LeaderboardReset("daily", block.timestamp);
        }
        
        if (newWeek > currentWeek) {
            delete weeklyLeaderboard;
            currentWeek = newWeek;
            emit LeaderboardReset("weekly", block.timestamp);
        }
    }
    
    /**
     * @dev Admin functions
     */
    function setMaxLeaderboardSize(uint256 _maxSize) external onlyOwner {
        maxLeaderboardSize = _maxSize;
    }
    
    function setMinScoreThreshold(uint256 _threshold) external onlyOwner {
        minScoreThreshold = _threshold;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency reset function (use with caution)
     */
    function resetAllLeaderboards() external onlyOwner {
        delete allTimeLeaderboard;
        delete dailyLeaderboard;
        delete weeklyLeaderboard;
        emit LeaderboardReset("all", block.timestamp);
    }
}
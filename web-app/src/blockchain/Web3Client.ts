import { ethers, BrowserProvider, Contract } from 'ethers';

export interface LeaderboardEntry {
  player: string;
  name: string;
  score: number;
  timestamp: string;
  is_paid_player: boolean;
}

export interface ScoreData {
  score: number;
  healthPurchased: boolean;
  gameTime: number;
}

export interface HealthPrices {
  ethPrice: number;
  usdcPrice: number;
  ethPriceWei: bigint;
  usdcPriceUnits: bigint;
}

export class Web3Client {
  private provider: BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private gameEconomyContract: Contract | null = null;
  private leaderboardContract: Contract | null = null;
  private usdcContract: Contract | null = null;

  // Base Sepolia configuration
  private readonly CHAIN_ID = 84532;
  private readonly RPC_URL = 'https://sepolia.base.org';
  
  // Contract addresses (checksummed)
  private readonly GAME_ECONOMY_ADDRESS = '0x55cBEa71ad8B981B91B137116B76a4828F90C548';
  private readonly LEADERBOARD_ADDRESS = '0x59FF2595588AA2236441B0E82b2CD692e1373E58';
  private readonly USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

  // Minimal ABIs for the functions we need
  private readonly GAME_ECONOMY_ABI = [
    'function purchaseHealthWithETH() external payable',
    'function purchaseHealthWithUSDC(uint256 _amount) external',
    'function getCurrentETHPrice() external view returns (uint256)',
    'function getCurrentUSDCPrice() external view returns (uint256)',
    'function endGameSession(address _player, string _playerName, uint256 _score, bool _healthPurchased) external'
  ];

  private readonly LEADERBOARD_ABI = [
    'function getAllTimeLeaderboard() external view returns (tuple(address player, string playerName, uint256 score, uint256 timestamp, bool isPaidPlayer)[])',
    'function getDailyLeaderboard() external view returns (tuple(address player, string playerName, uint256 score, uint256 timestamp, bool isPaidPlayer)[])',
    'function playerStats(address _player) external view returns (uint256 bestScore, uint256 totalGames, uint256 totalSpent, string lastKnownName)'
  ];

  private readonly USDC_ABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function balanceOf(address account) external view returns (uint256)'
  ];

  async connectWallet(): Promise<{ success: boolean; address?: string; error?: string }> {
    try {
      if (!window.ethereum) {
        return { success: false, error: 'No wallet found. Please install MetaMask or another Web3 wallet.' };
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      this.provider = new BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      
      // Initialize contracts
      this.initializeContracts();
      
      // Check/switch to Base Sepolia
      await this.switchToBaseSepolia();
      
      return { success: true, address };
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      return { success: false, error: error.message || 'Failed to connect wallet' };
    }
  }

  private initializeContracts(): void {
    if (!this.provider || !this.signer) return;

    this.gameEconomyContract = new Contract(
      this.GAME_ECONOMY_ADDRESS,
      this.GAME_ECONOMY_ABI,
      this.signer
    );

    this.leaderboardContract = new Contract(
      this.LEADERBOARD_ADDRESS,
      this.LEADERBOARD_ABI,
      this.signer
    );

    this.usdcContract = new Contract(
      this.USDC_ADDRESS,
      this.USDC_ABI,
      this.signer
    );
  }

  private async switchToBaseSepolia(): Promise<void> {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${this.CHAIN_ID.toString(16)}` }],
      });
    } catch (switchError: any) {
      // Chain not added, try to add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${this.CHAIN_ID.toString(16)}`,
            chainName: 'Base Sepolia',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
            rpcUrls: [this.RPC_URL],
            blockExplorerUrls: ['https://sepolia.basescan.org/'],
          }],
        });
      }
    }
  }

  async getHealthPrices(): Promise<HealthPrices | null> {
    if (!this.gameEconomyContract) {
      console.warn('Contract not initialized');
      return null;
    }

    try {
      const [ethPriceWei, usdcPriceUnits] = await Promise.all([
        this.gameEconomyContract.getCurrentETHPrice(),
        this.gameEconomyContract.getCurrentUSDCPrice()
      ]);

      return {
        ethPrice: parseFloat(ethers.formatEther(ethPriceWei)),
        usdcPrice: parseFloat(ethers.formatUnits(usdcPriceUnits, 6)),
        ethPriceWei: BigInt(ethPriceWei.toString()),
        usdcPriceUnits: BigInt(usdcPriceUnits.toString())
      };
    } catch (error) {
      console.error('Error getting health prices:', error);
      return null;
    }
  }

  async purchaseHealthWithETH(): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.gameEconomyContract) {
      return { success: false, error: 'Contract not initialized' };
    }

    try {
      const prices = await this.getHealthPrices();
      if (!prices) {
        return { success: false, error: 'Could not get current prices' };
      }

      const tx = await this.gameEconomyContract.purchaseHealthWithETH({
        value: prices.ethPriceWei
      });

      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('ETH purchase error:', error);
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }

  async purchaseHealthWithUSDC(): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.gameEconomyContract || !this.usdcContract) {
      return { success: false, error: 'Contracts not initialized' };
    }

    try {
      const prices = await this.getHealthPrices();
      if (!prices) {
        return { success: false, error: 'Could not get current prices' };
      }

      // Check USDC balance
      const address = await this.signer!.getAddress();
      const balance = await this.usdcContract.balanceOf(address);
      
      if (balance < prices.usdcPriceUnits) {
        return { 
          success: false, 
          error: `Insufficient USDC balance. Need ${prices.usdcPrice} USDC` 
        };
      }

      const tx = await this.gameEconomyContract.purchaseHealthWithUSDC(prices.usdcPriceUnits);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('USDC purchase error:', error);
      return { success: false, error: error.message || 'Purchase failed' };
    }
  }

  async approveUSDC(amount?: bigint): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.usdcContract) {
      return { success: false, error: 'USDC contract not initialized' };
    }

    try {
      const approveAmount = amount || ethers.MaxUint256;
      const tx = await this.usdcContract.approve(this.GAME_ECONOMY_ADDRESS, approveAmount);
      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('USDC approval error:', error);
      return { success: false, error: error.message || 'Approval failed' };
    }
  }

  async submitScore(playerName: string, scoreData: ScoreData): Promise<{ success: boolean; txHash?: string; error?: string }> {
    if (!this.gameEconomyContract) {
      return { success: false, error: 'Contract not initialized' };
    }

    try {
      const address = await this.signer!.getAddress();
      
      const tx = await this.gameEconomyContract.endGameSession(
        address,
        playerName,
        scoreData.score,
        scoreData.healthPurchased
      );

      await tx.wait();
      return { success: true, txHash: tx.hash };
    } catch (error: any) {
      console.error('Score submission error:', error);
      return { success: false, error: error.message || 'Score submission failed' };
    }
  }

  async getLeaderboard(type: 'all_time' | 'daily' = 'all_time'): Promise<LeaderboardEntry[]> {
    if (!this.leaderboardContract) {
      console.warn('Leaderboard contract not initialized');
      return [];
    }

    try {
      const entries = type === 'daily' 
        ? await this.leaderboardContract.getDailyLeaderboard()
        : await this.leaderboardContract.getAllTimeLeaderboard();

      return entries.map((entry: any) => ({
        player: entry.player,
        name: entry.playerName,
        score: parseInt(entry.score.toString()),
        timestamp: new Date(parseInt(entry.timestamp.toString()) * 1000).toISOString(),
        is_paid_player: entry.isPaidPlayer
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  async getPlayerStats(playerAddress?: string): Promise<any> {
    if (!this.leaderboardContract) {
      return null;
    }

    try {
      const address = playerAddress || await this.signer!.getAddress();
      const stats = await this.leaderboardContract.playerStats(address);
      
      return {
        bestScore: parseInt(stats.bestScore.toString()),
        totalGames: parseInt(stats.totalGames.toString()),
        totalSpent: parseFloat(ethers.formatUnits(stats.totalSpent, 6)),
        lastKnownName: stats.lastKnownName
      };
    } catch (error) {
      console.error('Error getting player stats:', error);
      return null;
    }
  }

  async getAccountInfo(): Promise<{ address: string; ethBalance: number; usdcBalance: number } | null> {
    if (!this.signer || !this.provider) return null;

    try {
      const address = await this.signer.getAddress();
      const ethBalance = await this.provider.getBalance(address);
      
      let usdcBalance = BigInt(0);
      if (this.usdcContract) {
        usdcBalance = await this.usdcContract.balanceOf(address);
      }

      return {
        address,
        ethBalance: parseFloat(ethers.formatEther(ethBalance)),
        usdcBalance: parseFloat(ethers.formatUnits(usdcBalance, 6))
      };
    } catch (error) {
      console.error('Error getting account info:', error);
      return null;
    }
  }

  isConnected(): boolean {
    return this.provider !== null && this.signer !== null;
  }

  getAddress(): Promise<string> | null {
    return this.signer?.getAddress() || null;
  }
}

// Global Web3Client instance
export const web3Client = new Web3Client();
import * as Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';

export interface PhaserGameConfig {
  onConnectWallet?: () => void;
  onPurchaseHealthETH?: () => void;
  onPurchaseHealthUSDC?: () => void;
  onSubmitScore?: (scoreData: any) => void;
  onRequestLeaderboard?: () => void;
  walletConnected?: boolean;
  walletAddress?: string;
  leaderboardData?: any[];
}

export class PhaserGameWrapper {
  private game: Phaser.Game | null = null;
  private config: PhaserGameConfig;

  constructor(containerId: string, config: PhaserGameConfig = {}) {
    this.config = config;
    this.initGame(containerId);
  }

  private initGame(containerId: string): void {
    const gameConfig: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1024,
      height: 768,
      parent: containerId,
      backgroundColor: '#001122',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [MenuScene, GameScene, GameOverScene, LeaderboardScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
          width: 512,
          height: 384
        },
        max: {
          width: 1600,
          height: 1200
        }
      },
      audio: {
        disableWebAudio: false
      }
    };

    this.game = new Phaser.Game(gameConfig);
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.game) return;

    // Get all scenes
    const menuScene = this.game.scene.getScene('MenuScene');
    const gameScene = this.game.scene.getScene('GameScene');
    const leaderboardScene = this.game.scene.getScene('LeaderboardScene');

    // Wallet connection
    if (menuScene) {
      menuScene.events.on('connectWallet', () => {
        if (this.config.onConnectWallet) {
          this.config.onConnectWallet();
        }
      });
    }

    // Health purchases
    if (gameScene) {
      gameScene.events.on('purchaseHealthETH', () => {
        if (this.config.onPurchaseHealthETH) {
          this.config.onPurchaseHealthETH();
        }
      });

      gameScene.events.on('purchaseHealthUSDC', () => {
        if (this.config.onPurchaseHealthUSDC) {
          this.config.onPurchaseHealthUSDC();
        }
      });

      gameScene.events.on('submitScore', (scoreData: any) => {
        if (this.config.onSubmitScore) {
          this.config.onSubmitScore(scoreData);
        }
      });
    }

    // Leaderboard requests
    if (leaderboardScene) {
      leaderboardScene.events.on('requestLeaderboard', () => {
        if (this.config.onRequestLeaderboard) {
          this.config.onRequestLeaderboard();
        }
      });
    }
  }

  // Methods to communicate with Phaser from React
  updateWalletStatus(_connected: boolean, address?: string): void {
    if (!this.game) return;

    const menuScene = this.game.scene.getScene('MenuScene');
    if (menuScene && menuScene.scene.isActive()) {
      menuScene.events.emit('walletConnected', address || '');
    }
  }

  notifyHealthPurchased(): void {
    if (!this.game) return;

    const gameScene = this.game.scene.getScene('GameScene');
    if (gameScene && gameScene.scene.isActive()) {
      gameScene.events.emit('healthPurchased');
    }
  }

  updateLeaderboard(data: any[]): void {
    if (!this.game) return;

    const leaderboardScene = this.game.scene.getScene('LeaderboardScene');
    if (leaderboardScene && leaderboardScene.scene.isActive()) {
      leaderboardScene.events.emit('leaderboardData', data);
    }
  }

  notifyLeaderboardError(error: string): void {
    if (!this.game) return;

    const leaderboardScene = this.game.scene.getScene('LeaderboardScene');
    if (leaderboardScene && leaderboardScene.scene.isActive()) {
      leaderboardScene.events.emit('leaderboardError', error);
    }
  }

  destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
  }

  resize(width: number, height: number): void {
    if (this.game) {
      this.game.scale.resize(width, height);
    }
  }

  getGame(): Phaser.Game | null {
    return this.game;
  }
}
import * as Phaser from 'phaser';

export interface GameOverData {
  score: number;
  hasWon: boolean;
  healthPurchased: boolean;
}

export class GameOverScene extends Phaser.Scene {
  private gameData!: GameOverData;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: GameOverData): void {
    this.gameData = data;
  }

  create(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Background
    this.add.rectangle(centerX, centerY, 1024, 768, 0x001122);

    // Game Over Title
    const titleColor = this.gameData.hasWon ? '#00FF00' : '#FF0000';
    const titleText = this.gameData.hasWon ? 'Victory!' : 'Game Over!';
    
    this.add.text(centerX, 150, titleText, {
      fontSize: '48px',
      color: titleColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Score
    this.add.text(centerX, 220, `Final Score: ${this.gameData.score}`, {
      fontSize: '32px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Health purchased indicator
    if (this.gameData.healthPurchased) {
      this.add.text(centerX, 270, '💰 Health purchased this game!', {
        fontSize: '20px',
        color: '#FFD700'
      }).setOrigin(0.5);
    }

    // Blockchain submission status
    this.add.text(centerX, 320, 'Score submitted to blockchain leaderboard! 🚀', {
      fontSize: '18px',
      color: '#00FF88'
    }).setOrigin(0.5);

    // Play Again Button
    const playAgainButton = this.add.text(centerX, 400, 'Play Again', {
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: '#00AA00',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5);

    playAgainButton.setInteractive();
    playAgainButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    playAgainButton.on('pointerover', () => {
      playAgainButton.setStyle({ backgroundColor: '#00CC00' });
    });

    playAgainButton.on('pointerout', () => {
      playAgainButton.setStyle({ backgroundColor: '#00AA00' });
    });

    // Main Menu Button
    const menuButton = this.add.text(centerX, 470, 'Main Menu', {
      fontSize: '20px',
      color: '#FFFFFF',
      backgroundColor: '#666666',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    menuButton.setInteractive();
    menuButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    menuButton.on('pointerover', () => {
      menuButton.setStyle({ backgroundColor: '#888888' });
    });

    menuButton.on('pointerout', () => {
      menuButton.setStyle({ backgroundColor: '#666666' });
    });

    // Leaderboard Button
    const leaderboardButton = this.add.text(centerX, 540, 'View Leaderboard', {
      fontSize: '20px',
      color: '#FFFFFF',
      backgroundColor: '#AA6600',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    leaderboardButton.setInteractive();
    leaderboardButton.on('pointerdown', () => {
      this.scene.start('LeaderboardScene');
    });

    leaderboardButton.on('pointerover', () => {
      leaderboardButton.setStyle({ backgroundColor: '#CC8800' });
    });

    leaderboardButton.on('pointerout', () => {
      leaderboardButton.setStyle({ backgroundColor: '#AA6600' });
    });

    // Auto-restart option
    this.add.text(centerX, 620, 'Press SPACE to play again', {
      fontSize: '16px',
      color: '#AAAAAA'
    }).setOrigin(0.5);

    // Keyboard input
    this.input.keyboard!.on('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });
  }
}
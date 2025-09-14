import * as Phaser from 'phaser';

export interface LeaderboardEntry {
  player: string;
  name: string;
  score: number;
  timestamp: string;
  is_paid_player: boolean;
}

export class LeaderboardScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  create(): void {
    const centerX = this.cameras.main.width / 2;

    // Background
    this.add.rectangle(centerX, 384, 1024, 768, 0x001122);

    // Title
    this.add.text(centerX, 50, 'Global Leaderboard', {
      fontSize: '36px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, 90, 'Live from Base Blockchain', {
      fontSize: '18px',
      color: '#00FF88'
    }).setOrigin(0.5);

    // Loading text
    this.loadingText = this.add.text(centerX, 200, 'Loading leaderboard data...', {
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Back button
    const backButton = this.add.text(50, 700, '← Back to Menu', {
      fontSize: '18px',
      color: '#FFFFFF',
      backgroundColor: '#666666',
      padding: { x: 15, y: 8 }
    });

    backButton.setInteractive();
    backButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    backButton.on('pointerover', () => {
      backButton.setStyle({ backgroundColor: '#888888' });
    });

    backButton.on('pointerout', () => {
      backButton.setStyle({ backgroundColor: '#666666' });
    });

    // Request leaderboard data
    this.events.emit('requestLeaderboard');

    // Listen for leaderboard data
    this.events.on('leaderboardData', (data: LeaderboardEntry[]) => {
      this.displayLeaderboard(data);
    });

    // Listen for leaderboard error
    this.events.on('leaderboardError', (error: string) => {
      this.displayError(error);
    });

    // Refresh button
    const refreshButton = this.add.text(900, 700, 'Refresh 🔄', {
      fontSize: '18px',
      color: '#FFFFFF',
      backgroundColor: '#0066CC',
      padding: { x: 15, y: 8 }
    });

    refreshButton.setInteractive();
    refreshButton.on('pointerdown', () => {
      this.refreshLeaderboard();
    });

    refreshButton.on('pointerover', () => {
      refreshButton.setStyle({ backgroundColor: '#0088FF' });
    });

    refreshButton.on('pointerout', () => {
      refreshButton.setStyle({ backgroundColor: '#0066CC' });
    });
  }

  private displayLeaderboard(data: LeaderboardEntry[]): void {
    this.loadingText.destroy();

    if (data.length === 0) {
      this.add.text(512, 200, 'No leaderboard data available', {
        fontSize: '20px',
        color: '#FFFF66'
      }).setOrigin(0.5);
      return;
    }

    // Header
    this.add.text(100, 140, 'Rank', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });

    this.add.text(200, 140, 'Player', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });

    this.add.text(450, 140, 'Score', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });

    this.add.text(600, 140, 'Type', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });

    this.add.text(700, 140, 'Date', {
      fontSize: '18px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    });

    // Entries (top 15)
    const displayData = data.slice(0, 15);
    let y = 170;

    displayData.forEach((entry, index) => {
      const rank = index + 1;
      const color = entry.is_paid_player ? '#00FF00' : '#FFFFFF';
      const typeIcon = entry.is_paid_player ? '💰' : '🆓';
      
      // Rank
      this.add.text(100, y, rank.toString(), {
        fontSize: '16px',
        color
      });

      // Player name (truncated)
      const displayName = entry.name.length > 15 
        ? entry.name.slice(0, 15) + '...' 
        : entry.name;
      
      this.add.text(200, y, displayName, {
        fontSize: '16px',
        color
      });

      // Score
      this.add.text(450, y, entry.score.toLocaleString(), {
        fontSize: '16px',
        color
      });

      // Type
      this.add.text(600, y, typeIcon, {
        fontSize: '16px'
      });

      // Date (simplified)
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleDateString();
      this.add.text(700, y, dateStr, {
        fontSize: '14px',
        color: '#CCCCCC'
      });

      y += 25;
    });

    // Legend
    this.add.text(100, y + 30, 'Legend: 💰 = Used health purchases | 🆓 = Free player', {
      fontSize: '14px',
      color: '#FFFF66'
    });
  }

  private displayError(error: string): void {
    this.loadingText.destroy();

    this.add.text(512, 200, 'Failed to load leaderboard', {
      fontSize: '24px',
      color: '#FF6666'
    }).setOrigin(0.5);

    this.add.text(512, 240, error, {
      fontSize: '16px',
      color: '#FFAAAA'
    }).setOrigin(0.5);

    this.add.text(512, 300, 'Make sure wallet is connected and try again', {
      fontSize: '16px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
  }

  private refreshLeaderboard(): void {
    // Clear existing content
    this.children.removeAll();
    
    // Recreate scene
    this.create();
  }
}
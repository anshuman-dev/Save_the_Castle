import * as Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  private startButton!: Phaser.GameObjects.Text;
  private leaderboardButton!: Phaser.GameObjects.Text;
  private walletConnected: boolean = false;
  private walletAddress: string = '';

  constructor() {
    super({ key: 'MenuScene' });
  }

  preload(): void {
    // Menu doesn't need assets, uses text and shapes
  }

  create(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Background
    this.add.rectangle(centerX, centerY, 1024, 768, 0x001122);

    // Title
    this.add.text(centerX, 150, 'Save The Castle', {
      fontSize: '48px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, 200, 'Blockchain Edition', {
      fontSize: '24px',
      color: '#00FF00'
    }).setOrigin(0.5);

    // Wallet status
    const walletText = this.walletConnected 
      ? `Connected: ${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}`
      : 'Wallet: Not Connected';
    
    this.add.text(centerX, 250, walletText, {
      fontSize: '18px',
      color: this.walletConnected ? '#00FF00' : '#FF6666'
    }).setOrigin(0.5);

    // Connect Wallet Button
    if (!this.walletConnected) {
      const connectButton = this.add.text(centerX, 300, 'Connect Wallet', {
        fontSize: '20px',
        color: '#FFFFFF',
        backgroundColor: '#0066CC',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);

      connectButton.setInteractive();
      connectButton.on('pointerdown', () => {
        this.events.emit('connectWallet');
      });

      connectButton.on('pointerover', () => {
        connectButton.setStyle({ backgroundColor: '#0088FF' });
      });

      connectButton.on('pointerout', () => {
        connectButton.setStyle({ backgroundColor: '#0066CC' });
      });
    }

    // Start Game Button
    this.startButton = this.add.text(centerX, 350, 'Start Game', {
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: '#00AA00',
      padding: { x: 30, y: 15 }
    }).setOrigin(0.5);

    this.startButton.setInteractive();
    this.startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    this.startButton.on('pointerover', () => {
      this.startButton.setStyle({ backgroundColor: '#00CC00' });
    });

    this.startButton.on('pointerout', () => {
      this.startButton.setStyle({ backgroundColor: '#00AA00' });
    });

    // Leaderboard Button
    this.leaderboardButton = this.add.text(centerX, 420, 'View Leaderboard', {
      fontSize: '20px',
      color: '#FFFFFF',
      backgroundColor: '#AA6600',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    this.leaderboardButton.setInteractive();
    this.leaderboardButton.on('pointerdown', () => {
      this.scene.start('LeaderboardScene');
    });

    this.leaderboardButton.on('pointerover', () => {
      this.leaderboardButton.setStyle({ backgroundColor: '#CC8800' });
    });

    this.leaderboardButton.on('pointerout', () => {
      this.leaderboardButton.setStyle({ backgroundColor: '#AA6600' });
    });

    // Instructions
    const instructions = [
      'Blockchain Features:',
      '• Purchase health with ETH/USDC during game (H/U keys)',
      '• Automatic leaderboard submission',
      '• Global competition on Base network'
    ];

    let y = 500;
    instructions.forEach(instruction => {
      this.add.text(centerX, y, instruction, {
        fontSize: '16px',
        color: '#FFFF66'
      }).setOrigin(0.5);
      y += 25;
    });

    // Listen for wallet connection updates
    this.events.on('walletConnected', (address: string) => {
      this.walletConnected = true;
      this.walletAddress = address;
      this.scene.restart();
    });
  }
}
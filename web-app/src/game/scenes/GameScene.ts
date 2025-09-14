import * as Phaser from 'phaser';
import { GameEngine, type GameState } from '../systems/GameEngine';

export class GameScene extends Phaser.Scene {
  private gameEngine!: GameEngine;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  
  // UI elements
  private healthBar!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  
  // Game state
  private gameState: GameState = {
    score: 0,
    health: 200,
    timeRemaining: 90000,
    isGameOver: false,
    hasWon: false,
    healthPurchased: false
  };

  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    // Load placeholder assets (will be replaced with actual assets later)
    this.load.image('grass', '/assets/images/back.jpg');
    this.load.image('castle', '/assets/images/final.png');
    this.load.image('tree', '/assets/images/tree.png');
    this.load.image('player', '/assets/images/man.jpg');
    this.load.image('enemy', '/assets/images/monster.gif');
    this.load.image('arrow', '/assets/images/bt2.png');
    this.load.image('healthbar', '/assets/images/healthbar.png');
    this.load.image('health', '/assets/images/health.png');
    
    // Load audio
    this.load.audio('shoot', '/assets/audio/shoot.wav');
    this.load.audio('hit', '/assets/audio/m_okay.wav');
    this.load.audio('enemy', '/assets/audio/beltslap.mp3');
    this.load.audio('backmusic', '/assets/audio/boldback.mp3');
    
    // Create fallback colored rectangles if images don't load
    this.load.on('loaderror', (file: any) => {
      console.warn(`Failed to load: ${file.src}`);
    });
  }

  create(): void {
    // Set world bounds
    this.physics.world.setBounds(0, 0, 1024, 768);
    
    // Create background
    this.createBackground();
    
    // Initialize game engine
    this.gameEngine = new GameEngine(this);
    
    // Set up input
    this.setupInput();
    
    // Create UI
    this.createUI();
    
    // Set up event listeners
    this.setupEventListeners();
  }

  private createBackground(): void {
    // Create grass background
    const grassWidth = 100;
    const grassHeight = 100;
    
    for (let x = 0; x < 1024; x += grassWidth) {
      for (let y = 0; y < 768; y += grassHeight) {
        const grass = this.add.rectangle(x + grassWidth/2, y + grassHeight/2, grassWidth, grassHeight, 0x228B22);
        grass.setDepth(-3);
      }
    }
    
    // Create castle (left side)
    for (let i = 0; i < 10; i++) {
      const castle = this.add.rectangle(40, 105 * i + 52, 80, 105, 0x8B4513);
      castle.setDepth(-2);
    }
    
    // Create trees (right side)
    for (let j = 0; j < 8; j++) {
      const tree = this.add.rectangle(960, 105 * j + 52, 80, 105, 0x006400);
      tree.setDepth(-1);
    }
  }

  private setupInput(): void {
    // Cursor keys
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // WASD keys
    this.wasdKeys = this.input.keyboard!.addKeys('W,S,A,D,H,U');
    
    // Mouse input for shooting
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.gameEngine.shoot(pointer.worldX, pointer.worldY);
    });
  }

  private createUI(): void {
    // Score text
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#000000'
    });
    this.scoreText.setDepth(10);
    
    // Timer text
    this.timerText = this.add.text(700, 16, '1:30', {
      fontSize: '24px',
      color: '#000000'
    });
    this.timerText.setDepth(10);
    
    // Health bar background
    const healthBarBg = this.add.rectangle(512, 25, 204, 24, 0x000000);
    healthBarBg.setDepth(9);
    
    // Health bar
    this.healthBar = this.add.graphics();
    this.healthBar.setDepth(10);
    
    // Instructions
    const instructions = this.add.text(16, 720, 'WASD: Move | Click: Shoot | H: Buy Health (ETH) | U: Buy Health (USDC)', {
      fontSize: '16px',
      color: '#FFFFFF',
      backgroundColor: '#000000AA',
      padding: { x: 10, y: 5 }
    });
    instructions.setDepth(10);
  }

  private setupEventListeners(): void {
    // Listen for blockchain events
    this.events.on('healthPurchased', () => {
      this.gameEngine.purchaseHealth();
    });
    
    this.events.on('gameOver', (gameState: GameState) => {
      this.handleGameOver(gameState);
    });
  }

  private handleGameOver(gameState: GameState): void {
    const scoreData = this.gameEngine.getScoreForSubmission();
    
    // Emit score data for blockchain submission
    this.events.emit('submitScore', scoreData);
    
    // Transition to game over scene
    this.scene.start('GameOverScene', {
      score: gameState.score,
      hasWon: gameState.hasWon,
      healthPurchased: gameState.healthPurchased
    });
  }

  update(): void {
    if (!this.gameEngine) return;
    
    // Handle input
    this.handleInput();
    
    // Update game engine
    const pointer = this.input.activePointer;
    this.gameState = this.gameEngine.update(pointer);
    
    // Update UI
    this.updateUI();
    
    // Check for game over
    if (this.gameState.isGameOver) {
      this.handleGameOver(this.gameState);
    }
  }

  private handleInput(): void {
    // Stop movement first
    this.gameEngine.stopPlayerMovement();
    
    // Handle movement
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      this.gameEngine.movePlayer('left');
    } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      this.gameEngine.movePlayer('right');
    }
    
    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      this.gameEngine.movePlayer('up');
    } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      this.gameEngine.movePlayer('down');
    }
    
    // Handle blockchain purchases
    if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.H)) {
      this.events.emit('purchaseHealthETH');
    }
    
    if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.U)) {
      this.events.emit('purchaseHealthUSDC');
    }
  }

  private updateUI(): void {
    // Update score
    this.scoreText.setText(`Score: ${this.gameState.score}`);
    
    // Update timer
    const minutes = Math.floor(this.gameState.timeRemaining / 60000);
    const seconds = Math.floor((this.gameState.timeRemaining % 60000) / 1000);
    this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    
    // Update health bar
    this.healthBar.clear();
    const healthPercentage = this.gameState.health / 200;
    const healthWidth = 200 * healthPercentage;
    
    this.healthBar.fillStyle(0x00FF00);
    this.healthBar.fillRect(410, 13, healthWidth, 20);
    
    // Health purchased indicator
    if (this.gameState.healthPurchased) {
      this.healthBar.lineStyle(2, 0xFFD700);
      this.healthBar.strokeRect(408, 11, 204, 24);
    }
  }

  destroy(): void {
    if (this.gameEngine) {
      this.gameEngine.destroy();
    }
  }
}
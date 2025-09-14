import * as Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';

export interface GameState {
  score: number;
  health: number;
  timeRemaining: number;
  isGameOver: boolean;
  hasWon: boolean;
  healthPurchased: boolean;
}

export interface ScoreData {
  score: number;
  healthPurchased: boolean;
  gameTime: number;
}

export class GameEngine {
  private scene: Phaser.Scene;
  private player: Player;
  private enemies: Phaser.GameObjects.Group;
  private projectiles: Phaser.GameObjects.Group;
  
  // Game state
  private score: number = 0;
  private gameStartTime: number;
  private gameDuration: number = 90000; // 90 seconds in milliseconds
  
  // Enemy spawning
  private enemySpawnTimer: number = 100;
  private enemySpawnDelay: number = 100;
  private spawnAcceleration: number = 0;
  
  // Audio
  private sounds: { [key: string]: Phaser.Sound.BaseSound } = {};
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameStartTime = Date.now();
    
    // Initialize groups
    this.enemies = scene.add.group();
    this.projectiles = scene.add.group();
    
    // Create player
    this.player = new Player(scene, 50, 50);
    
    // Load sounds
    this.loadSounds();
    
    // Start enemy spawning
    this.spawnInitialEnemy();
    
    // Setup collision detection
    this.setupCollisions();
  }

  private loadSounds(): void {
    try {
      this.sounds.shoot = this.scene.sound.add('shoot');
      this.sounds.hit = this.scene.sound.add('hit');
      this.sounds.enemy = this.scene.sound.add('enemy');
      this.sounds.backmusic = this.scene.sound.add('backmusic', { loop: true });
      
      // Start background music
      this.sounds.backmusic.play();
    } catch (error) {
      console.warn('Audio not loaded:', error);
    }
  }

  private spawnInitialEnemy(): void {
    const enemy = new Enemy(this.scene, 640, 100);
    this.enemies.add(enemy);
  }

  private setupCollisions(): void {
    // Projectile vs Enemy collision
    this.scene.physics.add.overlap(
      this.projectiles,
      this.enemies,
      this.onProjectileHitEnemy,
      undefined,
      this
    );
  }

  private onProjectileHitEnemy(projectile: any, enemy: any): void {
    if (this.sounds.enemy) {
      this.sounds.enemy.play();
    }
    
    // Remove both projectile and enemy
    projectile.destroy();
    enemy.destroy();
    
    // Increase score (could be more sophisticated)
    this.score += 10;
  }

  update(pointer?: Phaser.Input.Pointer): GameState {
    // Update player
    this.player.update(pointer);
    
    // Update enemies
    this.updateEnemies();
    
    // Update projectiles
    this.updateProjectiles();
    
    // Spawn new enemies
    this.updateEnemySpawning();
    
    return this.getGameState();
  }

  private updateEnemies(): void {
    this.enemies.children.entries.forEach((enemy) => {
      const enemySprite = enemy as Enemy;
      if (enemySprite.update()) {
        // Enemy reached castle
        if (this.sounds.hit) {
          this.sounds.hit.play();
        }
        
        // Damage player
        this.player.takeDamage(enemySprite.getDamage());
        
        // Remove enemy
        enemySprite.destroy();
        this.enemies.remove(enemySprite);
      }
    });
  }

  private updateProjectiles(): void {
    this.projectiles.children.entries.forEach((projectile) => {
      const projectileSprite = projectile as Projectile;
      if (projectileSprite.update()) {
        // Projectile is out of bounds
        projectileSprite.destroy();
        this.projectiles.remove(projectileSprite);
      }
    });
  }

  private updateEnemySpawning(): void {
    this.enemySpawnTimer--;
    
    if (this.enemySpawnTimer <= 0) {
      // Spawn new enemy
      const y = Phaser.Math.Between(50, 600);
      const enemy = new Enemy(this.scene, 800, y);
      this.enemies.add(enemy);
      
      // Reset timer with acceleration
      this.enemySpawnDelay = Math.max(20, this.enemySpawnDelay - this.spawnAcceleration * 2);
      this.enemySpawnTimer = this.enemySpawnDelay;
      
      // Increase spawn acceleration
      if (this.spawnAcceleration < 20) {
        this.spawnAcceleration += 2;
      }
    }
  }

  shoot(targetX: number, targetY: number): void {
    if (this.sounds.shoot) {
      this.sounds.shoot.play();
    }
    
    const shootPos = this.player.getShootPosition();
    const angle = Phaser.Math.Angle.Between(shootPos.x, shootPos.y, targetX, targetY);
    
    const projectile = new Projectile(this.scene, shootPos.x, shootPos.y, angle);
    this.projectiles.add(projectile);
  }

  movePlayer(direction: 'up' | 'down' | 'left' | 'right'): void {
    this.player.move(direction);
  }

  stopPlayerMovement(): void {
    this.player.stopMovement();
  }

  purchaseHealth(): void {
    this.player.restoreFullHealth();
  }

  getGameState(): GameState {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.gameStartTime;
    const timeRemaining = Math.max(0, this.gameDuration - elapsedTime);
    
    const isGameOver = timeRemaining <= 0 || this.player.isDead();
    const hasWon = timeRemaining <= 0 && !this.player.isDead();
    
    return {
      score: this.score,
      health: this.player.health,
      timeRemaining,
      isGameOver,
      hasWon,
      healthPurchased: this.player.healthPurchased
    };
  }

  getScoreForSubmission(): ScoreData {
    const currentTime = Date.now();
    const gameTime = currentTime - this.gameStartTime;
    
    return {
      score: this.score,
      healthPurchased: this.player.healthPurchased,
      gameTime
    };
  }

  getPlayer(): Player {
    return this.player;
  }

  destroy(): void {
    // Stop background music
    if (this.sounds.backmusic) {
      this.sounds.backmusic.stop();
    }
    
    // Clean up groups
    this.enemies.destroy(true);
    this.projectiles.destroy(true);
  }
}
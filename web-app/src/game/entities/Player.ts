import * as Phaser from 'phaser';

export class Player extends Phaser.GameObjects.Sprite {
  private speed: number = 3;
  public health: number = 200;
  public maxHealth: number = 200;
  public healthPurchased: boolean = false;
  public rotatedPosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set up physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    
    this.setOrigin(0.5, 0.5);
  }

  update(pointer?: Phaser.Input.Pointer): void {
    if (pointer) {
      // Calculate aim angle
      const aimAngle = Phaser.Math.Angle.Between(
        this.x,
        this.y,
        pointer.worldX,
        pointer.worldY
      );
      
      // Rotate player to face mouse
      this.setRotation(aimAngle);
      
      // Update rotated position for shooting
      this.rotatedPosition = { x: this.x, y: this.y };
    }
  }

  move(direction: 'up' | 'down' | 'left' | 'right'): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    switch (direction) {
      case 'up':
        body.setVelocityY(-this.speed * 60);
        break;
      case 'down':
        body.setVelocityY(this.speed * 60);
        break;
      case 'left':
        body.setVelocityX(-this.speed * 60);
        break;
      case 'right':
        body.setVelocityX(this.speed * 60);
        break;
    }
  }

  stopMovement(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  addHealth(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.healthPurchased = true;
  }

  restoreFullHealth(): void {
    this.health = this.maxHealth;
    this.healthPurchased = true;
  }

  getShootPosition(): { x: number; y: number; angle: number } {
    return {
      x: this.x + Math.cos(this.rotation) * 20,
      y: this.y + Math.sin(this.rotation) * 20,
      angle: this.rotation
    };
  }

  isDead(): boolean {
    return this.health <= 0;
  }

  getHealthPercentage(): number {
    return this.health / this.maxHealth;
  }
}
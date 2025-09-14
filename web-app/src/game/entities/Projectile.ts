import * as Phaser from 'phaser';

export class Projectile extends Phaser.GameObjects.Sprite {
  private speed: number = 10;
  public angle: number;

  constructor(scene: Phaser.Scene, x: number, y: number, angle: number) {
    super(scene, x, y, 'arrow');
    
    this.angle = angle;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set up physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(false);
    
    // Rotate arrow to match direction
    this.setRotation(angle);
    this.setOrigin(0.5, 0.5);
    
    // Set initial velocity
    const velocityX = Math.cos(angle) * this.speed * 60;
    const velocityY = Math.sin(angle) * this.speed * 60;
    body.setVelocity(velocityX, velocityY);
  }

  update(): boolean {
    // Check if projectile is out of bounds
    const bounds = this.scene.physics.world.bounds;
    
    if (this.x < bounds.x || 
        this.x > bounds.x + bounds.width || 
        this.y < bounds.y || 
        this.y > bounds.y + bounds.height) {
      return true; // Signal for removal
    }
    
    return false;
  }

  destroy(): void {
    this.setActive(false);
    this.setVisible(false);
    super.destroy();
  }
}
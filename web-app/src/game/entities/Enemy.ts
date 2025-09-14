import * as Phaser from 'phaser';

export class Enemy extends Phaser.GameObjects.Sprite {
  private speed: number = 7;
  private damage: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set up physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(false);
    
    this.setOrigin(0.5, 0.5);
    
    // Random damage between 4 and 8 (matching Python game)
    this.damage = Phaser.Math.Between(4, 8);
  }

  update(): boolean {
    // Move towards the castle (left side of screen)
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(-this.speed * 60);
    
    // Check if reached castle (x < 80, matching Python logic)
    if (this.x < 80) {
      return true; // Signal that enemy reached castle
    }
    
    return false;
  }

  getDamage(): number {
    return this.damage;
  }

  destroy(): void {
    this.setActive(false);
    this.setVisible(false);
    super.destroy();
  }
}
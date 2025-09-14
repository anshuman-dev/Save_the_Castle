"""
Enhanced Main.py with blockchain integration for Save the Castle
Includes wallet connection, health purchases, and leaderboard submission
"""

import sys
import pygame
import config
import math
import os
from lib import *
import random
from blockchain.game_integration import BlockchainGameManager

# Game states
MENU = 0
WALLET_CONNECT = 1
GAME = 2
GAME_OVER = 3
LEADERBOARD = 4

class SaveTheCastleBlockchain:
    def __init__(self):
        self.state = MENU
        self.blockchain_manager = None
        self.player_name = ""
        self.private_key = None
        self.score = 0
        self.original_health = 200
        self.health_purchased_this_game = False
        
        # Initialize pygame
        pygame.init()
        pygame.mixer.init()
        self.screen = pygame.display.set_mode(config.SCREENSIZE)
        pygame.display.set_caption('Save The CASTLE - Blockchain Edition')
        
        # Load assets
        self.imagesdict = {}
        for i, j in config.spritepics.items():
            self.imagesdict[i] = pygame.image.load(j)
        
        self.sounddict = {}
        for i, j in config.Sounds.items():
            if i != 'backmusic':
                self.sounddict[i] = pygame.mixer.Sound(j)
        
        # Fonts
        self.font_large = pygame.font.Font(None, 48)
        self.font_medium = pygame.font.Font(None, 32)
        self.font_small = pygame.font.Font(None, 24)
        
        # Colors
        self.WHITE = (255, 255, 255)
        self.BLACK = (0, 0, 0)
        self.GREEN = (0, 255, 0)
        self.RED = (255, 0, 0)
        self.BLUE = (0, 0, 255)
        self.YELLOW = (255, 255, 0)
        
        # Game variables
        self.player = None
        self.group_bullet = None
        self.group_monster = None
        self.time = 100
        self.timeless = 0
        self.healthvalue = 200
        self.game_start_time = 0
        self.running = True
        self.clock = pygame.time.Clock()
        
    def init_blockchain(self, private_key):
        """Initialize blockchain manager with private key"""
        try:
            self.blockchain_manager = BlockchainGameManager(private_key)
            self.private_key = private_key
            return True
        except Exception as e:
            print(f"Blockchain initialization failed: {e}")
            return False
    
    def draw_menu(self):
        """Draw main menu"""
        self.screen.fill(self.BLACK)
        
        # Title
        title = self.font_large.render("Save The Castle", True, self.WHITE)
        title_rect = title.get_rect(center=(config.SCREENSIZE[0]//2, 150))
        self.screen.blit(title, title_rect)
        
        subtitle = self.font_medium.render("Blockchain Edition", True, self.GREEN)
        subtitle_rect = subtitle.get_rect(center=(config.SCREENSIZE[0]//2, 200))
        self.screen.blit(subtitle, subtitle_rect)
        
        # Menu options
        play_text = self.font_medium.render("1. Play with Blockchain (Recommended)", True, self.WHITE)
        play_rect = play_text.get_rect(center=(config.SCREENSIZE[0]//2, 300))
        self.screen.blit(play_text, play_rect)
        
        offline_text = self.font_medium.render("2. Play Offline (No blockchain features)", True, self.WHITE)
        offline_rect = offline_text.get_rect(center=(config.SCREENSIZE[0]//2, 340))
        self.screen.blit(offline_text, offline_rect)
        
        leaderboard_text = self.font_medium.render("3. View Leaderboard", True, self.WHITE)
        leaderboard_rect = leaderboard_text.get_rect(center=(config.SCREENSIZE[0]//2, 380))
        self.screen.blit(leaderboard_text, leaderboard_rect)
        
        quit_text = self.font_medium.render("4. Quit", True, self.WHITE)
        quit_rect = quit_text.get_rect(center=(config.SCREENSIZE[0]//2, 420))
        self.screen.blit(quit_text, quit_rect)
        
        # Instructions
        instructions = [\n            "Blockchain Features:",\n            "• Purchase health with ETH/USDC during game (H/U keys)",\n            "• Automatic leaderboard submission",\n            "• Real-time price updates",\n            "• Compete globally on Base network"\n        ]\n        \n        y_offset = 480\n        for instruction in instructions:\n            text = self.font_small.render(instruction, True, self.YELLOW)\n            text_rect = text.get_rect(center=(config.SCREENSIZE[0]//2, y_offset))\n            self.screen.blit(text, text_rect)\n            y_offset += 25
    
    def draw_wallet_connect(self):
        """Draw wallet connection screen"""
        self.screen.fill(self.BLACK)
        
        title = self.font_large.render("Connect Wallet", True, self.WHITE)
        title_rect = title.get_rect(center=(config.SCREENSIZE[0]//2, 150))
        self.screen.blit(title, title_rect)
        
        instructions = [\n            "Enter your private key to enable blockchain features:",\n            "",\n            "• Health purchases with ETH/USDC",\n            "• Automatic score submission",\n            "• Global leaderboard participation",\n            "",\n            "Press ENTER to confirm, ESC to go back",\n            "Leave empty and press ENTER for read-only mode"\n        ]\n        \n        y_offset = 220\n        for instruction in instructions:\n            if instruction:\n                text = self.font_small.render(instruction, True, self.WHITE)\n                text_rect = text.get_rect(center=(config.SCREENSIZE[0]//2, y_offset))\n                self.screen.blit(text, text_rect)\n            y_offset += 25\n        \n        # Private key input (masked)\n        if self.private_key:\n            key_display = "*" * min(len(self.private_key), 20) + "..." if len(self.private_key) > 20 else "*" * len(self.private_key)\n        else:\n            key_display = "_" * 20\n        \n        key_text = self.font_medium.render(f"Private Key: {key_display}", True, self.GREEN)\n        key_rect = key_text.get_rect(center=(config.SCREENSIZE[0]//2, 400))\n        self.screen.blit(key_text, key_rect)
    
    def draw_game_over(self):
        """Draw game over screen"""
        self.screen.fill(self.BLACK)
        
        # Calculate final score (simplified scoring system)\n        final_score = max(0, (pygame.time.get_ticks() - self.game_start_time) // 100)\n        self.score = final_score\n        \n        title = self.font_large.render("Game Over!", True, self.RED)\n        title_rect = title.get_rect(center=(config.SCREENSIZE[0]//2, 150))
        self.screen.blit(title, title_rect)
        
n        score_text = self.font_medium.render(f"Final Score: {final_score}", True, self.WHITE)\n        score_rect = score_text.get_rect(center=(config.SCREENSIZE[0]//2, 220))\n        self.screen.blit(score_text, score_rect)\n        \n        if self.health_purchased_this_game:\n            purchased_text = self.font_small.render("Health purchased this game!", True, self.GREEN)\n            purchased_rect = purchased_text.get_rect(center=(config.SCREENSIZE[0]//2, 260))\n            self.screen.blit(purchased_text, purchased_rect)\n        \n        # Show blockchain submission status\n        if self.blockchain_manager and self.blockchain_manager.blockchain_enabled:\n            status_text = self.font_small.render("Score submitted to blockchain leaderboard!", True, self.GREEN)\n            status_rect = status_text.get_rect(center=(config.SCREENSIZE[0]//2, 300))\n            self.screen.blit(status_text, status_rect)\n        \n        # Options\n        play_again_text = self.font_medium.render("SPACE - Play Again", True, self.WHITE)\n        play_again_rect = play_again_text.get_rect(center=(config.SCREENSIZE[0]//2, 380))\n        self.screen.blit(play_again_text, play_again_rect)\n        \n        menu_text = self.font_medium.render("ESC - Main Menu", True, self.WHITE)\n        menu_rect = menu_text.get_rect(center=(config.SCREENSIZE[0]//2, 420))\n        self.screen.blit(menu_text, menu_rect)
    
    def draw_leaderboard(self):
        """Draw blockchain leaderboard"""
        self.screen.fill(self.BLACK)
        
        title = self.font_large.render("Global Leaderboard", True, self.WHITE)
        title_rect = title.get_rect(center=(config.SCREENSIZE[0]//2, 50))
        self.screen.blit(title, title_rect)
        
        if not self.blockchain_manager or not self.blockchain_manager.blockchain_enabled:
            error_text = self.font_medium.render("Blockchain not connected", True, self.RED)
            error_rect = error_text.get_rect(center=(config.SCREENSIZE[0]//2, 200))
            self.screen.blit(error_text, error_rect)
        else:
            # Get leaderboard data
            leaderboard = self.blockchain_manager.get_leaderboard("all_time")
            
            if not leaderboard:
                no_data_text = self.font_medium.render("No leaderboard data available", True, self.YELLOW)
                no_data_rect = no_data_text.get_rect(center=(config.SCREENSIZE[0]//2, 200))
                self.screen.blit(no_data_text, no_data_rect)
            else:
                # Header
                header = self.font_small.render("Rank  Player Name          Score    Type", True, self.WHITE)
                self.screen.blit(header, (100, 120))
                
                # Entries
                y_offset = 150
                for i, entry in enumerate(leaderboard[:15]):  # Top 15
                    rank = i + 1
                    name = entry["name"][:15] if len(entry["name"]) > 15 else entry["name"]
                    score = entry["score"]
                    player_type = "💰" if entry["is_paid_player"] else "🆓"
                    
                    color = self.GREEN if entry["is_paid_player"] else self.WHITE
                    
                    entry_text = f"{rank:2d}    {name:<15} {score:>8d}    {player_type}"
                    entry_surface = self.font_small.render(entry_text, True, color)
                    self.screen.blit(entry_surface, (100, y_offset))
                    y_offset += 25
        
        # Back instruction
        back_text = self.font_medium.render("ESC - Back to Menu", True, self.WHITE)
        back_rect = back_text.get_rect(center=(config.SCREENSIZE[0]//2, 600))
        self.screen.blit(back_text, back_rect)
    
    def init_game(self):
        """Initialize game objects"""
        self.player = Man(image=self.imagesdict.get('man'), position=(50, 50))
        self.group_bullet = pygame.sprite.Group()
        self.group_monster = pygame.sprite.Group()
        
        enemy = Monster(self.imagesdict.get('monster'), position=(640, 100))
        self.group_monster.add(enemy)
        
        self.time = 100
        self.timeless = 0
        self.healthvalue = 200
        self.health_purchased_this_game = False
        self.game_start_time = pygame.time.get_ticks()
        
        # Set player name for blockchain
        if self.blockchain_manager and self.blockchain_manager.blockchain_enabled:
            if not self.player_name:
                account_info = self.blockchain_manager.get_account_info()
                if account_info["address"]:
                    self.player_name = f"Player_{account_info['address'][-6:]}"
            self.blockchain_manager.set_player_name(self.player_name)
        
        # Start background music
        pygame.mixer.music.load(config.Sounds['backmusic'])
        pygame.mixer.music.play(-1, 0.0)
    
    def handle_blockchain_purchase(self):
        """Handle health purchase and restore health"""
        if self.blockchain_manager and self.blockchain_manager.blockchain_enabled:
            if self.healthvalue < 200:  # Only allow if damaged
                current_health = self.healthvalue
                self.healthvalue = 200  # Restore to full health
                self.health_purchased_this_game = True
                print(f"Health restored from {current_health} to {self.healthvalue}")
                return True
        return False
    
    def run_game_loop(self):
        """Main game loop"""
        game_running = True
        
        while game_running:
            self.screen.fill(10)
            
            # Draw background
            for x in range(config.SCREENSIZE[0]//self.imagesdict['grass'].get_width()+1):
                for y in range(config.SCREENSIZE[1]//self.imagesdict['grass'].get_height()+1):
                    self.screen.blit(self.imagesdict['grass'], (x*100, y*100))
            
            for i in range(10): 
                self.screen.blit(self.imagesdict['castle'], (0, 105*i))
            
            for j in range(8): 
                self.screen.blit(self.imagesdict['tree'], (920, 105*j))
            
            # Draw countdown timer
            time_remaining = max(0, 90000 - (pygame.time.get_ticks() - self.game_start_time))
            countdown_text = self.font_medium.render(f"{time_remaining//60000}:{(time_remaining//1000%60):02d}", True, self.BLACK)
            countdown_rect = countdown_text.get_rect()
            countdown_rect.topright = [700, 5]
            self.screen.blit(countdown_text, countdown_rect)
            
            # Handle events
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    return "quit"
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        return "menu"
                    # Blockchain purchase controls
                    elif event.key == pygame.K_h:  # Purchase with ETH
                        if self.blockchain_manager:
                            print("Attempting to purchase health with ETH...")
                            tx_hash = self.blockchain_manager.purchase_health_eth()
                            if tx_hash:
                                self.handle_blockchain_purchase()
                    elif event.key == pygame.K_u:  # Purchase with USDC
                        if self.blockchain_manager:
                            print("Attempting to purchase health with USDC...")
                            tx_hash = self.blockchain_manager.purchase_health_usdc()
                            if tx_hash:
                                self.handle_blockchain_purchase()
                    elif event.key == pygame.K_a:  # Approve USDC
                        if self.blockchain_manager:
                            print("Approving USDC...")
                            self.blockchain_manager.approve_usdc()
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    self.sounddict['shoot'].play()
                    mouse_pos = pygame.mouse.get_pos()
                    shootangle = math.atan2(mouse_pos[1]-(self.player.rotated_position[1]+32), 
                                         mouse_pos[0]-(self.player.rotated_position[0]+26))
                    shot = Bullet(self.imagesdict.get('arrow'), 
                                (shootangle, self.player.rotated_position[0]+20, self.player.rotated_position[1]+26))
                    self.group_bullet.add(shot)
            
            # Handle continuous key presses
            key_pressed = pygame.key.get_pressed()
            if key_pressed[pygame.K_w]:
                self.player.move(config.SCREENSIZE, 'up')
            elif key_pressed[pygame.K_s]:
                self.player.move(config.SCREENSIZE, 'down')
            elif key_pressed[pygame.K_a]:
                self.player.move(config.SCREENSIZE, 'left')
            elif key_pressed[pygame.K_d]:
                self.player.move(config.SCREENSIZE, 'right')
            
            # Update bullets
            for shot in list(self.group_bullet):
                if shot.update(config.SCREENSIZE):
                    self.group_bullet.remove(shot)
            
            # Spawn enemies
            if self.time == 0:
                enemy = Monster(self.imagesdict.get('monster'), position=(800, random.randint(50, 600)))
                self.group_monster.add(enemy)
                self.time = 100 - (self.timeless * 2)
                if self.timeless >= 20:
                    self.timeless = 20
                else:
                    self.timeless += 2
            self.time -= 1
            
            # Update enemies
            for enemy in list(self.group_monster):
                if enemy.update():
                    self.sounddict['hit'].play()
                    self.healthvalue -= random.randint(4, 8)
                    self.group_monster.remove(enemy)
            
            # Handle collisions
            for shot in list(self.group_bullet):
                for enemy in list(self.group_monster):
                    if pygame.sprite.collide_mask(shot, enemy):
                        self.sounddict['enemy'].play()
                        self.group_bullet.remove(shot)
                        self.group_monster.remove(enemy)
                        break
            
            # Draw sprites
            self.group_bullet.draw(self.screen)
            self.group_monster.draw(self.screen)
            self.player.draw(self.screen, pygame.mouse.get_pos())
            
            # Draw health bar
            self.screen.blit(self.imagesdict.get('healthbar'), (400, 10))
            for i in range(min(self.healthvalue, 200)):
                self.screen.blit(self.imagesdict.get('health'), (i+400, 10))
            
            # Draw blockchain UI if enabled
            if self.blockchain_manager and self.blockchain_manager.blockchain_enabled:
                self.draw_blockchain_ui()
            
            # Check win/lose conditions
            if time_remaining <= 0:
                return "game_over_win"
            if self.healthvalue <= 0:
                return "game_over_lose"
            
            pygame.display.flip()
            self.clock.tick(config.FPS)
    
    def draw_blockchain_ui(self):
        """Draw blockchain UI elements during game"""
        y_offset = 50
        
        # Get current prices
        prices = self.blockchain_manager.get_health_prices()
        if prices["eth_price"] > 0:
            price_text = f"Health: {prices['eth_price']:.6f} ETH / {prices['usdc_price']:.2f} USDC"
            price_surface = self.font_small.render(price_text, True, self.YELLOW)
            self.screen.blit(price_surface, (10, y_offset))
            y_offset += 20
        
        # Purchase instructions
        if self.healthvalue < 200:
            instructions = ["H - Buy with ETH", "U - Buy with USDC", "A - Approve USDC"]
            for instruction in instructions:
                text_surface = self.font_small.render(instruction, True, self.GREEN)
                self.screen.blit(text_surface, (10, y_offset))
                y_offset += 18
        
        # Purchase status
        if self.health_purchased_this_game:
            status_text = "Health purchased! 💰"
            status_surface = self.font_small.render(status_text, True, self.GREEN)
            self.screen.blit(status_surface, (10, y_offset))
    
    def submit_final_score(self):
        """Submit final score to blockchain"""
        if self.blockchain_manager and self.blockchain_manager.blockchain_enabled:
            print(f"Submitting final score: {self.score}")
            tx_hash = self.blockchain_manager.submit_game_score(self.score)
            if tx_hash:
                print(f"Score submitted! Transaction: {tx_hash}")
            else:
                print("Failed to submit score")
    
    def run(self):
        """Main application loop"""
        private_key_input = ""
        
        while self.running:
            if self.state == MENU:
                self.draw_menu()
                
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        self.running = False
                    elif event.type == pygame.KEYDOWN:
                        if event.key == pygame.K_1:  # Play with blockchain
                            self.state = WALLET_CONNECT
                        elif event.key == pygame.K_2:  # Play offline
                            self.init_game()
                            self.state = GAME
                        elif event.key == pygame.K_3:  # View leaderboard
                            # Initialize read-only blockchain manager if not already done
                            if not self.blockchain_manager:
                                self.blockchain_manager = BlockchainGameManager()
                            self.state = LEADERBOARD
                        elif event.key == pygame.K_4:  # Quit
                            self.running = False
            
            elif self.state == WALLET_CONNECT:
                self.draw_wallet_connect()
                
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        self.running = False
                    elif event.type == pygame.KEYDOWN:
                        if event.key == pygame.K_ESCAPE:
                            self.state = MENU
                            private_key_input = ""
                        elif event.key == pygame.K_RETURN:
                            # Initialize blockchain with private key
                            if private_key_input.strip():
                                if self.init_blockchain(private_key_input.strip()):
                                    print("Blockchain initialized successfully")
                                else:
                                    print("Blockchain initialization failed")
                            else:
                                # Read-only mode
                                self.blockchain_manager = BlockchainGameManager()
                            
                            self.init_game()
                            self.state = GAME
                            private_key_input = ""
                        elif event.key == pygame.K_BACKSPACE:
                            private_key_input = private_key_input[:-1]
                        else:
                            if len(private_key_input) < 100:  # Reasonable limit
                                private_key_input += event.unicode
                
                self.private_key = private_key_input
            
            elif self.state == GAME:
                result = self.run_game_loop()
                if result == "quit":
                    self.running = False
                elif result == "menu":
                    self.state = MENU
                elif result in ["game_over_win", "game_over_lose"]:
                    # Calculate and submit score
                    final_score = max(0, (pygame.time.get_ticks() - self.game_start_time) // 100)
                    self.score = final_score
                    self.submit_final_score()
                    self.state = GAME_OVER
            
            elif self.state == GAME_OVER:
                self.draw_game_over()
                
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        self.running = False
                    elif event.type == pygame.KEYDOWN:
                        if event.key == pygame.K_SPACE:  # Play again
                            self.init_game()
                            self.state = GAME
                        elif event.key == pygame.K_ESCAPE:  # Main menu
                            self.state = MENU
            
            elif self.state == LEADERBOARD:
                self.draw_leaderboard()
                
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        self.running = False
                    elif event.type == pygame.KEYDOWN:
                        if event.key == pygame.K_ESCAPE:
                            self.state = MENU
            
            pygame.display.flip()
            self.clock.tick(60)
        
        pygame.quit()
        sys.exit()


if __name__ == '__main__':
    game = SaveTheCastleBlockchain()
    game.run()
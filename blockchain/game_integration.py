"""
Game integration module for Save the Castle blockchain features
Integrates Web3 functionality with the existing pygame-based game
"""

import pygame
import sys
import os
from typing import Optional, Dict, Any
from web3_client import SaveTheCastleWeb3Client

# Add the main game directory to path to import game modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from config import *
    from lib.Sprites import Man, Bullet, Monster
except ImportError:
    print("Warning: Could not import game modules. Make sure to run from the correct directory.")

class BlockchainGameManager:
    """Manages blockchain integration for Save the Castle game"""
    
    def __init__(self, private_key: Optional[str] = None):
        """
        Initialize blockchain game manager
        
        Args:
            private_key: Player's private key for transactions (optional for read-only)
        """
        self.web3_client = None
        self.player_name = ""
        self.health_purchased_this_session = False
        self.original_health = 100  # Track original health to detect purchases
        
        # Initialize Web3 client
        try:
            self.web3_client = SaveTheCastleWeb3Client(private_key)
            self.blockchain_enabled = True
            print("Blockchain integration enabled")
        except Exception as e:
            print(f"Blockchain initialization failed: {e}")
            self.blockchain_enabled = False
    
    def set_player_name(self, name: str):
        """Set player name for leaderboard submissions"""
        self.player_name = name
    
    def get_health_prices(self) -> Dict[str, float]:
        """Get current health purchase prices"""
        if not self.blockchain_enabled:
            return {"eth_price": 0, "usdc_price": 0}
        
        return self.web3_client.get_health_prices()
    
    def purchase_health_eth(self) -> Optional[str]:
        """Purchase health with ETH and return transaction hash"""
        if not self.blockchain_enabled:
            print("Blockchain not available")
            return None
        
        tx_hash = self.web3_client.purchase_health_with_eth()
        if tx_hash:
            self.health_purchased_this_session = True
        return tx_hash
    
    def purchase_health_usdc(self) -> Optional[str]:
        """Purchase health with USDC and return transaction hash"""
        if not self.blockchain_enabled:
            print("Blockchain not available")
            return None
        
        tx_hash = self.web3_client.purchase_health_with_usdc()
        if tx_hash:
            self.health_purchased_this_session = True
        return tx_hash
    
    def approve_usdc(self) -> Optional[str]:
        """Approve USDC spending for health purchases"""
        if not self.blockchain_enabled:
            print("Blockchain not available")
            return None
        
        return self.web3_client.approve_usdc()
    
    def submit_game_score(self, score: int) -> Optional[str]:
        """Submit final game score to blockchain leaderboard"""
        if not self.blockchain_enabled:
            print("Blockchain not available - score not submitted")
            return None
        
        if not self.player_name:
            print("Player name not set - using default")
            self.player_name = f"Player_{self.web3_client.account.address[-6:] if self.web3_client.account else 'Unknown'}"
        
        tx_hash = self.web3_client.submit_game_score(
            self.player_name, 
            score, 
            self.health_purchased_this_session
        )
        
        # Reset session state
        self.health_purchased_this_session = False
        
        return tx_hash
    
    def get_leaderboard(self, leaderboard_type: str = "all_time"):
        """Get leaderboard data"""
        if not self.blockchain_enabled:
            return []
        
        return self.web3_client.get_leaderboard(leaderboard_type)
    
    def get_player_stats(self):
        """Get current player statistics"""
        if not self.blockchain_enabled:
            return {"best_score": 0, "total_games": 0, "total_spent": 0, "last_known_name": ""}
        
        return self.web3_client.get_player_stats()
    
    def get_account_info(self):
        """Get account balance information"""
        if not self.blockchain_enabled:
            return {"address": None, "eth_balance": 0, "usdc_balance": 0}
        
        return self.web3_client.get_account_info()
    
    def render_blockchain_ui(self, screen, font, y_offset=10):
        """Render blockchain-related UI elements"""
        if not self.blockchain_enabled:
            return y_offset
        
        # Get account info
        account_info = self.get_account_info()
        prices = self.get_health_prices()
        
        # Render account address (truncated)
        if account_info["address"]:
            address_text = f"Address: {account_info['address'][:6]}...{account_info['address'][-4:]}"
            addr_surface = font.render(address_text, True, (255, 255, 255))
            screen.blit(addr_surface, (10, y_offset))
            y_offset += 25
        
        # Render balances
        eth_balance_text = f"ETH: {account_info['eth_balance']:.4f}"
        usdc_balance_text = f"USDC: {account_info['usdc_balance']:.2f}"
        
        eth_surface = font.render(eth_balance_text, True, (255, 255, 255))
        usdc_surface = font.render(usdc_balance_text, True, (255, 255, 255))
        
        screen.blit(eth_surface, (10, y_offset))
        screen.blit(usdc_surface, (10, y_offset + 25))
        y_offset += 50
        
        # Render health purchase prices
        if prices["eth_price"] > 0:
            health_price_text = f"Health: {prices['eth_price']:.6f} ETH / {prices['usdc_price']:.2f} USDC"
            price_surface = font.render(health_price_text, True, (255, 255, 0))
            screen.blit(price_surface, (10, y_offset))
            y_offset += 25
        
        # Render purchase status
        if self.health_purchased_this_session:
            purchased_text = "Health purchased this session!"
            purchased_surface = font.render(purchased_text, True, (0, 255, 0))
            screen.blit(purchased_surface, (10, y_offset))
            y_offset += 25
        
        return y_offset
    
    def render_leaderboard(self, screen, font, x=400, y=50, max_entries=10):
        """Render leaderboard on screen"""
        if not self.blockchain_enabled:
            return
        
        leaderboard = self.get_leaderboard("all_time")
        
        # Header
        header = font.render("LEADERBOARD", True, (255, 255, 255))
        screen.blit(header, (x, y))
        y += 30
        
        # Entries
        for i, entry in enumerate(leaderboard[:max_entries]):
            rank = i + 1
            name = entry["name"][:15] if len(entry["name"]) > 15 else entry["name"]
            score = entry["score"]
            
            # Color coding for paid players
            color = (0, 255, 0) if entry["is_paid_player"] else (255, 255, 255)
            
            entry_text = f"{rank:2d}. {name:<15} {score:>6d}"
            entry_surface = font.render(entry_text, True, color)
            screen.blit(entry_surface, (x, y))
            y += 20
    
    def handle_blockchain_input(self, event) -> bool:
        """Handle blockchain-related input events"""
        if not self.blockchain_enabled:
            return False
        
        if event.type == pygame.KEYDOWN:
            # H key - purchase health with ETH
            if event.key == pygame.K_h:
                print("Purchasing health with ETH...")
                tx_hash = self.purchase_health_eth()
                if tx_hash:
                    print(f"Health purchased! TX: {tx_hash}")
                return True
            
            # U key - purchase health with USDC
            elif event.key == pygame.K_u:
                print("Purchasing health with USDC...")
                tx_hash = self.purchase_health_usdc()
                if tx_hash:
                    print(f"Health purchased! TX: {tx_hash}")
                return True
            
            # A key - approve USDC
            elif event.key == pygame.K_a:
                print("Approving USDC...")
                tx_hash = self.approve_usdc()
                if tx_hash:
                    print(f"USDC approved! TX: {tx_hash}")
                return True
        
        return False


class EnhancedGameSession:
    """Enhanced game session with blockchain integration"""
    
    def __init__(self, private_key: Optional[str] = None):
        """Initialize enhanced game session"""
        self.blockchain_manager = BlockchainGameManager(private_key)
        
        # Game state
        self.running = True
        self.game_over = False
        self.score = 0
        self.health = 100
        self.original_health = 100
        
        # Get player name (in a real implementation, this would come from UI)
        self.blockchain_manager.set_player_name("TestPlayer")
    
    def handle_health_purchase(self):
        """Handle health purchase and increase player health"""
        if self.health < 100:  # Only allow if health is damaged
            prices = self.blockchain_manager.get_health_prices()
            if prices["eth_price"] > 0:
                print(f"\nHealth Purchase Options:")
                print(f"H - Purchase with {prices['eth_price']:.6f} ETH")
                print(f"U - Purchase with {prices['usdc_price']:.2f} USDC")
                print("A - Approve USDC first (required before USDC purchase)")
    
    def complete_game_session(self):
        """Complete game session and submit score to blockchain"""
        if self.blockchain_manager.blockchain_enabled:
            print(f"\nGame Over! Final Score: {self.score}")
            print("Submitting score to blockchain...")
            
            tx_hash = self.blockchain_manager.submit_game_score(self.score)
            if tx_hash:
                print(f"Score submitted! Transaction: {tx_hash}")
            else:
                print("Failed to submit score to blockchain")
        
        # Show final stats
        stats = self.blockchain_manager.get_player_stats()
        print(f"\nPlayer Stats:")
        print(f"Best Score: {stats['best_score']}")
        print(f"Total Games: {stats['total_games']}")
        print(f"Total Spent: {stats['total_spent']} USDC")
    
    def show_leaderboard(self):
        """Display current leaderboard"""
        print("\n=== ALL-TIME LEADERBOARD ===")
        leaderboard = self.blockchain_manager.get_leaderboard("all_time")
        
        for i, entry in enumerate(leaderboard[:10]):
            rank = i + 1
            paid_indicator = " 💰" if entry["is_paid_player"] else ""
            print(f"{rank:2d}. {entry['name']:<20} {entry['score']:>6d}{paid_indicator}")


# Example usage and testing
if __name__ == "__main__":
    print("Save the Castle - Blockchain Integration Test")
    print("============================================")
    
    # Test without private key (read-only)
    print("\n1. Testing read-only functionality...")
    session = EnhancedGameSession()
    
    if session.blockchain_manager.blockchain_enabled:
        print("✓ Blockchain connection successful")
        
        # Test price fetching
        prices = session.blockchain_manager.get_health_prices()
        print(f"✓ Current prices - ETH: {prices['eth_price']:.6f}, USDC: {prices['usdc_price']:.2f}")
        
        # Test leaderboard
        session.show_leaderboard()
    else:
        print("✗ Blockchain connection failed")
    
    print("\n2. For full functionality (transactions), provide a private key when initializing.")
    print("   Example: session = EnhancedGameSession(private_key='your_private_key_here')")
    
    print("\nBlockchain integration test completed!")
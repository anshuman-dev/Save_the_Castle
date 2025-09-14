"""
Web3 client for Save the Castle blockchain integration
Handles GameEconomy and Leaderboard contract interactions
"""

import json
from decimal import Decimal
from typing import Optional, Dict, List, Tuple
from web3 import Web3
from web3.contract import Contract
from eth_account import Account
import os
from datetime import datetime

class SaveTheCastleWeb3Client:
    """Web3 client for interacting with Save the Castle smart contracts"""
    
    # Base Sepolia Testnet configuration
    BASE_SEPOLIA_RPC = "https://sepolia.base.org"
    CHAIN_ID = 84532
    
    # Contract addresses on Base Sepolia
    GAME_ECONOMY_ADDRESS = "0x55cbea71ad8b981b91b137116b76a4828f90c548"
    LEADERBOARD_ADDRESS = "0x59ff2595588aa2236441b0e82b2cd692e1373e58"
    USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"  # USDC on Base Sepolia
    
    def __init__(self, private_key: Optional[str] = None, rpc_url: Optional[str] = None):
        """
        Initialize Web3 client
        
        Args:
            private_key: Player's private key (optional for read-only operations)
            rpc_url: Custom RPC URL (optional, defaults to Base Sepolia)
        """
        self.rpc_url = rpc_url or self.BASE_SEPOLIA_RPC
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        if not self.w3.is_connected():
            raise ConnectionError(f"Failed to connect to {self.rpc_url}")
        
        # Set up account if private key provided
        self.account = None
        if private_key:
            self.account = Account.from_key(private_key)
            self.w3.eth.default_account = self.account.address
        
        # Load contract ABIs and initialize contracts
        self._load_contracts()
    
    def _load_contracts(self):
        """Load contract ABIs and initialize contract instances"""
        # Note: In production, you'd load these from files
        # For now, we'll define minimal ABIs for the functions we need
        
        self.game_economy_abi = [
            {
                "inputs": [],
                "name": "purchaseHealthWithETH",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [{"name": "_amount", "type": "uint256"}],
                "name": "purchaseHealthWithUSDC",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getCurrentETHPrice",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getCurrentUSDCPrice",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"name": "_player", "type": "address"},
                    {"name": "_playerName", "type": "string"},
                    {"name": "_score", "type": "uint256"},
                    {"name": "_healthPurchased", "type": "bool"}
                ],
                "name": "endGameSession",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
        
        self.leaderboard_abi = [
            {
                "inputs": [],
                "name": "getAllTimeLeaderboard",
                "outputs": [
                    {
                        "components": [
                            {"name": "player", "type": "address"},
                            {"name": "playerName", "type": "string"},
                            {"name": "score", "type": "uint256"},
                            {"name": "timestamp", "type": "uint256"},
                            {"name": "isPaidPlayer", "type": "bool"}
                        ],
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getDailyLeaderboard",
                "outputs": [
                    {
                        "components": [
                            {"name": "player", "type": "address"},
                            {"name": "playerName", "type": "string"},
                            {"name": "score", "type": "uint256"},
                            {"name": "timestamp", "type": "uint256"},
                            {"name": "isPaidPlayer", "type": "bool"}
                        ],
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_player", "type": "address"}],
                "name": "playerStats",
                "outputs": [
                    {"name": "bestScore", "type": "uint256"},
                    {"name": "totalGames", "type": "uint256"},
                    {"name": "totalSpent", "type": "uint256"},
                    {"name": "lastKnownName", "type": "string"}
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ]
        
        self.usdc_abi = [
            {
                "inputs": [
                    {"name": "spender", "type": "address"},
                    {"name": "amount", "type": "uint256"}
                ],
                "name": "approve",
                "outputs": [{"name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "account", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]
        
        # Initialize contract instances
        self.game_economy = self.w3.eth.contract(
            address=self.GAME_ECONOMY_ADDRESS,
            abi=self.game_economy_abi
        )
        
        self.leaderboard = self.w3.eth.contract(
            address=self.LEADERBOARD_ADDRESS,
            abi=self.leaderboard_abi
        )
        
        self.usdc = self.w3.eth.contract(
            address=self.USDC_ADDRESS,
            abi=self.usdc_abi
        )
    
    def get_health_prices(self) -> Dict[str, float]:
        """Get current health purchase prices in ETH and USDC"""
        try:
            eth_price_wei = self.game_economy.functions.getCurrentETHPrice().call()
            usdc_price_units = self.game_economy.functions.getCurrentUSDCPrice().call()
            
            return {
                "eth_price": self.w3.from_wei(eth_price_wei, 'ether'),
                "usdc_price": usdc_price_units / 1e6,  # USDC has 6 decimals
                "eth_price_wei": eth_price_wei,
                "usdc_price_units": usdc_price_units
            }
        except Exception as e:
            print(f"Error getting health prices: {e}")
            return {"eth_price": 0, "usdc_price": 0, "eth_price_wei": 0, "usdc_price_units": 0}
    
    def purchase_health_with_eth(self) -> Optional[str]:
        """Purchase health with ETH"""
        if not self.account:
            raise ValueError("Account required for transactions")
        
        try:
            # Get current price
            prices = self.get_health_prices()
            eth_price = prices["eth_price_wei"]
            
            if eth_price == 0:
                raise ValueError("Could not get ETH price")
            
            # Build transaction
            transaction = self.game_economy.functions.purchaseHealthWithETH().build_transaction({
                'from': self.account.address,
                'value': eth_price,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'chainId': self.CHAIN_ID
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            print(f"Health purchased with ETH! TX: {tx_hash.hex()}")
            return tx_hash.hex()
            
        except Exception as e:
            print(f"Error purchasing health with ETH: {e}")
            return None
    
    def purchase_health_with_usdc(self) -> Optional[str]:
        """Purchase health with USDC (requires prior approval)"""
        if not self.account:
            raise ValueError("Account required for transactions")
        
        try:
            # Get current price
            prices = self.get_health_prices()
            usdc_amount = prices["usdc_price_units"]
            
            if usdc_amount == 0:
                raise ValueError("Could not get USDC price")
            
            # Check USDC balance
            balance = self.usdc.functions.balanceOf(self.account.address).call()
            if balance < usdc_amount:
                raise ValueError(f"Insufficient USDC balance. Need {usdc_amount/1e6}, have {balance/1e6}")
            
            # Build transaction
            transaction = self.game_economy.functions.purchaseHealthWithUSDC(usdc_amount).build_transaction({
                'from': self.account.address,
                'gas': 250000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'chainId': self.CHAIN_ID
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            print(f"Health purchased with USDC! TX: {tx_hash.hex()}")
            return tx_hash.hex()
            
        except Exception as e:
            print(f"Error purchasing health with USDC: {e}")
            return None
    
    def approve_usdc(self, amount: Optional[int] = None) -> Optional[str]:
        """Approve USDC spending for health purchases"""
        if not self.account:
            raise ValueError("Account required for transactions")
        
        try:
            # Use max approval if no amount specified
            if amount is None:
                amount = 2**256 - 1  # Max uint256
            
            # Build transaction
            transaction = self.usdc.functions.approve(self.GAME_ECONOMY_ADDRESS, amount).build_transaction({
                'from': self.account.address,
                'gas': 100000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'chainId': self.CHAIN_ID
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            print(f"USDC approved! TX: {tx_hash.hex()}")
            return tx_hash.hex()
            
        except Exception as e:
            print(f"Error approving USDC: {e}")
            return None
    
    def submit_game_score(self, player_name: str, score: int, health_purchased: bool) -> Optional[str]:
        """Submit game score to leaderboard"""
        if not self.account:
            raise ValueError("Account required for transactions")
        
        try:
            # Build transaction
            transaction = self.game_economy.functions.endGameSession(
                self.account.address,
                player_name,
                score,
                health_purchased
            ).build_transaction({
                'from': self.account.address,
                'gas': 300000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'chainId': self.CHAIN_ID
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.account.key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            print(f"Score submitted! TX: {tx_hash.hex()}")
            return tx_hash.hex()
            
        except Exception as e:
            print(f"Error submitting score: {e}")
            return None
    
    def get_leaderboard(self, leaderboard_type: str = "all_time") -> List[Dict]:
        """Get leaderboard data"""
        try:
            if leaderboard_type == "daily":
                entries = self.leaderboard.functions.getDailyLeaderboard().call()
            else:
                entries = self.leaderboard.functions.getAllTimeLeaderboard().call()
            
            # Convert to readable format
            leaderboard = []
            for entry in entries:
                leaderboard.append({
                    "player": entry[0],
                    "name": entry[1],
                    "score": entry[2],
                    "timestamp": datetime.fromtimestamp(entry[3]).strftime("%Y-%m-%d %H:%M:%S"),
                    "is_paid_player": entry[4]
                })
            
            return leaderboard
            
        except Exception as e:
            print(f"Error getting leaderboard: {e}")
            return []
    
    def get_player_stats(self, player_address: Optional[str] = None) -> Dict:
        """Get player statistics"""
        if not player_address and not self.account:
            raise ValueError("Player address or account required")
        
        address = player_address or self.account.address
        
        try:
            stats = self.leaderboard.functions.playerStats(address).call()
            return {
                "best_score": stats[0],
                "total_games": stats[1],
                "total_spent": stats[2] / 1e6,  # Convert from USDC units
                "last_known_name": stats[3]
            }
        except Exception as e:
            print(f"Error getting player stats: {e}")
            return {"best_score": 0, "total_games": 0, "total_spent": 0, "last_known_name": ""}
    
    def get_account_info(self) -> Dict:
        """Get current account information"""
        if not self.account:
            return {"address": None, "eth_balance": 0, "usdc_balance": 0}
        
        try:
            eth_balance = self.w3.eth.get_balance(self.account.address)
            usdc_balance = self.usdc.functions.balanceOf(self.account.address).call()
            
            return {
                "address": self.account.address,
                "eth_balance": self.w3.from_wei(eth_balance, 'ether'),
                "usdc_balance": usdc_balance / 1e6
            }
        except Exception as e:
            print(f"Error getting account info: {e}")
            return {"address": self.account.address, "eth_balance": 0, "usdc_balance": 0}


# Example usage and testing
if __name__ == "__main__":
    # Example usage (replace with actual private key for testing)
    # client = SaveTheCastleWeb3Client(private_key="your_private_key_here")
    
    # For read-only operations, no private key needed
    client = SaveTheCastleWeb3Client()
    
    print("Save the Castle Web3 Client initialized")
    print(f"Connected to: {client.rpc_url}")
    print(f"GameEconomy: {client.GAME_ECONOMY_ADDRESS}")
    print(f"Leaderboard: {client.LEADERBOARD_ADDRESS}")
    
    # Test read operations
    print("\n--- Current Health Prices ---")
    prices = client.get_health_prices()
    print(f"ETH Price: {prices['eth_price']} ETH")
    print(f"USDC Price: {prices['usdc_price']} USDC")
    
    print("\n--- All-Time Leaderboard ---")
    leaderboard = client.get_leaderboard("all_time")
    for i, entry in enumerate(leaderboard[:5]):  # Top 5
        print(f"{i+1}. {entry['name']} - {entry['score']} points ({entry['timestamp']})")
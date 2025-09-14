import React, { useEffect, useRef, useState } from 'react';
import { PhaserGameWrapper } from '../game/PhaserGame';
import { web3Client, type ScoreData } from '../blockchain/Web3Client';

interface GameCanvasProps {
  className?: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ className = '' }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<PhaserGameWrapper | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [notification, setNotification] = useState<string>('');

  useEffect(() => {
    if (!gameRef.current) return;

    // Initialize Phaser game
    phaserGameRef.current = new PhaserGameWrapper('game-container', {
      onConnectWallet: handleConnectWallet,
      onPurchaseHealthETH: handlePurchaseHealthETH,
      onPurchaseHealthUSDC: handlePurchaseHealthUSDC,
      onSubmitScore: handleSubmitScore,
      onRequestLeaderboard: handleRequestLeaderboard
    });

    // Cleanup on unmount
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy();
        phaserGameRef.current = null;
      }
    };
  }, []);

  const showNotification = (message: string, duration = 3000) => {
    setNotification(message);
    setTimeout(() => setNotification(''), duration);
  };

  const handleConnectWallet = async () => {
    try {
      const result = await web3Client.connectWallet();
      
      if (result.success && result.address) {
        setWalletConnected(true);
        setWalletAddress(result.address);
        
        // Update Phaser game
        phaserGameRef.current?.updateWalletStatus(true, result.address);
        
        showNotification('Wallet connected successfully! 🎉');
      } else {
        showNotification(`Connection failed: ${result.error}`, 5000);
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      showNotification(`Connection error: ${error.message}`, 5000);
    }
  };

  const handlePurchaseHealthETH = async () => {
    if (!walletConnected) {
      showNotification('Please connect your wallet first');
      return;
    }

    try {
      showNotification('Purchasing health with ETH... 💰');
      
      const result = await web3Client.purchaseHealthWithETH();
      
      if (result.success) {
        // Notify Phaser game that health was purchased
        phaserGameRef.current?.notifyHealthPurchased();
        
        showNotification(`Health purchased! TX: ${result.txHash?.slice(0, 10)}...`, 5000);
      } else {
        showNotification(`Purchase failed: ${result.error}`, 5000);
      }
    } catch (error: any) {
      console.error('ETH purchase error:', error);
      showNotification(`Purchase error: ${error.message}`, 5000);
    }
  };

  const handlePurchaseHealthUSDC = async () => {
    if (!walletConnected) {
      showNotification('Please connect your wallet first');
      return;
    }

    try {
      showNotification('Purchasing health with USDC... 💵');
      
      const result = await web3Client.purchaseHealthWithUSDC();
      
      if (result.success) {
        // Notify Phaser game that health was purchased
        phaserGameRef.current?.notifyHealthPurchased();
        
        showNotification(`Health purchased! TX: ${result.txHash?.slice(0, 10)}...`, 5000);
      } else {
        // If it's an allowance issue, suggest approval
        if (result.error?.includes('allowance') || result.error?.includes('approve')) {
          showNotification('You need to approve USDC first. Press A in game to approve.', 7000);
        } else {
          showNotification(`Purchase failed: ${result.error}`, 5000);
        }
      }
    } catch (error: any) {
      console.error('USDC purchase error:', error);
      showNotification(`Purchase error: ${error.message}`, 5000);
    }
  };

  const handleSubmitScore = async (scoreData: ScoreData) => {
    if (!walletConnected) {
      console.warn('Wallet not connected, skipping score submission');
      return;
    }

    try {
      // Generate player name from address
      const playerName = `Player_${walletAddress.slice(-6)}`;
      
      const result = await web3Client.submitScore(playerName, scoreData);
      
      if (result.success) {
        showNotification(`Score submitted to blockchain! 🚀`, 5000);
      } else {
        console.error('Score submission failed:', result.error);
        showNotification(`Score submission failed: ${result.error}`, 5000);
      }
    } catch (error: any) {
      console.error('Score submission error:', error);
      showNotification(`Score submission error: ${error.message}`, 5000);
    }
  };

  const handleRequestLeaderboard = async () => {
    try {
      const leaderboardData = await web3Client.getLeaderboard('all_time');
      
      if (leaderboardData.length > 0) {
        phaserGameRef.current?.updateLeaderboard(leaderboardData);
      } else {
        phaserGameRef.current?.notifyLeaderboardError('No leaderboard data available');
      }
    } catch (error: any) {
      console.error('Leaderboard request error:', error);
      phaserGameRef.current?.notifyLeaderboardError(error.message);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Game Container */}
      <div 
        id="game-container" 
        ref={gameRef}
        className="w-full h-full bg-gray-900 rounded-lg overflow-hidden shadow-2xl"
      />
      
      {/* Notification Overlay */}
      {notification && (
        <div className="absolute top-4 right-4 z-50">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg max-w-sm">
            <p className="text-sm font-medium">{notification}</p>
          </div>
        </div>
      )}
      
      {/* Wallet Status Overlay */}
      {walletConnected && (
        <div className="absolute top-4 left-4 z-40">
          <div className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium">
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        </div>
      )}
      
      {/* Loading Overlay (for when wallet is connecting) */}
      {!walletConnected && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 rounded-lg">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4 text-center">Welcome to Save the Castle!</h2>
            <p className="text-gray-600 mb-4 text-center">
              Connect your wallet to enable blockchain features like health purchases and leaderboard submissions.
            </p>
            <button
              onClick={handleConnectWallet}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Connect Wallet
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              You can also click "Start Game" in the game menu to play without blockchain features.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
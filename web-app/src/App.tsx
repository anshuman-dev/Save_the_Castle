import { GameCanvas } from './components/GameCanvas';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">Save the Castle</h1>
            <p className="text-sm text-gray-300">Blockchain Tower Defense Game</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Powered by Base Network</p>
            <p className="text-xs text-gray-400">Phase 1 - Web Version</p>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <GameCanvas className="w-full h-[600px] min-h-[400px]" />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-3 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div>
            <p>Built with React + Phaser.js + ethers.js</p>
          </div>
          <div className="flex space-x-4">
            <a 
              href="https://github.com/anshuman-dev/Save_the_Castle" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-yellow-400 transition-colors"
            >
              GitHub
            </a>
            <a 
              href="https://sepolia.basescan.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-yellow-400 transition-colors"
            >
              Base Sepolia
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

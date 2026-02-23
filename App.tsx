import React, { useState } from 'react';
import { Gamepad2, Grid3x3, BrainCircuit, Flag, LayoutGrid, Calculator, Palette, Disc, Rocket, Bird, Blocks } from 'lucide-react';
import TicTacToe from './components/TicTacToe';
import Snake from './components/Snake';
import Memory from './components/Memory';
import Pong from './components/Pong';
import Minesweeper from './components/Minesweeper';
import Breakout from './components/Breakout';
import Game2048 from './components/Game2048';
import SimonSays from './components/SimonSays';
import ConnectFour from './components/ConnectFour';
import SpaceInvaders from './components/SpaceInvaders';
import FlappyBird from './components/FlappyBird';
import Tetris from './components/Tetris';

type GameType = 'menu' | 'tictactoe' | 'snake' | 'memory' | 'pong' | 'minesweeper' | 'breakout' | '2048' | 'simonsays' | 'connectfour' | 'spaceinvaders' | 'flappybird' | 'tetris';
type TabType = 'all' | 'classic' | 'arcade' | 'puzzle';

export default function App() {
  const [currentGame, setCurrentGame] = useState<GameType>('menu');
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const renderGame = () => {
    switch (currentGame) {
      case 'tictactoe': return <TicTacToe />;
      case 'snake': return <Snake />;
      case 'memory': return <Memory />;
      case 'pong': return <Pong />;
      case 'minesweeper': return <Minesweeper />;
      case 'breakout': return <Breakout />;
      case '2048': return <Game2048 />;
      case 'simonsays': return <SimonSays />;
      case 'connectfour': return <ConnectFour />;
      case 'spaceinvaders': return <SpaceInvaders />;
      case 'flappybird': return <FlappyBird />;
      case 'tetris': return <Tetris />;
      default: return null;
    }
  };

  const games = [
    {
      id: 'tictactoe',
      name: 'Tic-Tac-Toe',
      desc: 'The classic paper-and-pencil game for two players. Get three in a row to win!',
      icon: <Grid3x3 size={32} />,
      color: 'blue',
      category: 'classic'
    },
    {
      id: 'minesweeper',
      name: 'Minesweeper',
      desc: 'Clear the board without detonating any hidden mines. Use logic to win!',
      icon: <Flag size={32} />,
      color: 'rose',
      category: 'puzzle'
    },
    {
      id: 'memory',
      name: 'Memory Match',
      desc: 'Test your memory by finding all the matching pairs of cards in the fewest moves.',
      icon: <BrainCircuit size={32} />,
      color: 'indigo',
      category: 'puzzle'
    },
    {
      id: 'snake',
      name: 'Snake',
      desc: 'Eat the food to grow longer, but don\'t hit the walls or your own tail!',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-3 5 6 5-6h3"/><circle cx="19" cy="9" r="2"/></svg>,
      color: 'emerald',
      category: 'arcade'
    },
    {
      id: 'pong',
      name: 'Pong',
      desc: 'The classic arcade tennis game. Defeat the computer by being the first to score 5 points!',
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="4" height="18" rx="1"/><rect x="18" y="3" width="4" height="18" rx="1"/><circle cx="12" cy="12" r="2"/></svg>,
      color: 'sky',
      category: 'arcade'
    },
    {
      id: 'breakout',
      name: 'Breakout',
      desc: 'Destroy all the bricks with the bouncing ball. Don\'t let the ball fall!',
      icon: <LayoutGrid size={32} />,
      color: 'amber',
      category: 'arcade'
    },
    {
      id: 'tetris',
      name: 'Tetris',
      desc: 'Clear lines by arranging the falling blocks. Don\'t let them reach the top!',
      icon: <Blocks size={32} />,
      color: 'cyan',
      category: 'arcade'
    },
    {
      id: 'spaceinvaders',
      name: 'Space Invaders',
      desc: 'Defend Earth from the alien invasion! Shoot them down before they land.',
      icon: <Rocket size={32} />,
      color: 'purple',
      category: 'arcade'
    },
    {
      id: 'flappybird',
      name: 'Flappy Bird',
      desc: 'Navigate the bird through the pipes. Tap to jump and avoid crashing!',
      icon: <Bird size={32} />,
      color: 'yellow',
      category: 'arcade'
    },
    {
      id: '2048',
      name: '2048',
      desc: 'Slide tiles to combine matching numbers. Can you reach the 2048 tile?',
      icon: <Calculator size={32} />,
      color: 'orange',
      category: 'puzzle'
    },
    {
      id: 'simonsays',
      name: 'Simon Says',
      desc: 'Follow the pattern of lights and sounds. How long of a sequence can you remember?',
      icon: <Palette size={32} />,
      color: 'fuchsia',
      category: 'puzzle'
    },
    {
      id: 'connectfour',
      name: 'Connect Four',
      desc: 'Drop your discs into the columns. First to get four in a row wins!',
      icon: <Disc size={32} />,
      color: 'red',
      category: 'classic'
    }
  ];

  const filteredGames = activeTab === 'all' 
    ? games 
    : games.filter(g => g.category === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setCurrentGame('menu')}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:bg-indigo-700 transition-colors">
              <Gamepad2 size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Arcade<span className="text-indigo-600">Hub</span></h1>
          </div>
          
          {currentGame !== 'menu' && (
            <button
              onClick={() => setCurrentGame('menu')}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              Back to Menu
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {currentGame === 'menu' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                Choose your game
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Take a break and enjoy some classic mini-games. Select a category below!
              </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex bg-slate-200/50 p-1.5 rounded-2xl">
                {(['all', 'arcade', 'classic', 'puzzle'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${
                      activeTab === tab 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {filteredGames.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setCurrentGame(game.id as GameType)}
                  className={`group relative flex flex-col items-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left w-full
                    hover:border-${game.color}-200
                  `}
                >
                  <div className={`w-16 h-16 bg-${game.color}-50 text-${game.color}-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {game.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 w-full text-center">{game.name}</h3>
                  <p className="text-slate-500 text-center text-sm leading-relaxed">
                    {game.desc}
                  </p>
                  <div className="mt-4 px-3 py-1 bg-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider rounded-full">
                    {game.category}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            {renderGame()}
          </div>
        )}
      </main>
    </div>
  );
}

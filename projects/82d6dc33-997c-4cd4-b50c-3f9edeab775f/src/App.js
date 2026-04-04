import React from 'react';
import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import Controls from './components/Controls';
import MenuOverlay from './components/MenuOverlay';
import GameOverModal from './components/GameOverModal';
import DifficultySelector from './components/DifficultySelector';
import useSnakeGame from './hooks/useSnakeGame';
import { GAME_STATUS } from './utils/constants';

const App = () => {
  const {
    snake,
    food,
    score,
    highScore,
    gameStatus,
    difficulty,
    isMuted,
    startGame,
    resetGame,
    changeDirection,
    setDifficulty,
    toggleMute
  } = useSnakeGame();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 select-none overflow-hidden bg-[#fafafa]">
      {/* Subtle Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-neutral-300 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-neutral-400 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-md flex flex-col gap-6 z-10">
        <header className="flex justify-between items-start px-2">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black tracking-tighter text-neutral-900 drop-shadow-sm">
              SNAKE<span className="text-neutral-400">OS</span>
            </h1>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.3em] mt-1">
              Monochrome Edition
            </p>
            
            <button 
              onClick={toggleMute}
              className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 bg-white/50 backdrop-blur-sm text-[10px] font-bold text-neutral-600 hover:bg-white hover:text-neutral-900 transition-all uppercase tracking-widest shadow-sm active:scale-95"
              aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {isMuted ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                  <span>Muted</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                  <span>Audio On</span>
                </>
              )}
            </button>
          </div>
          <ScoreBoard score={score} highScore={highScore} />
        </header>

        <main className="relative aspect-square w-full glass rounded-[1.5rem] overflow-hidden shadow-xl border border-neutral-200 bg-white">
          <GameBoard snake={snake} food={food} />
          
          {gameStatus === GAME_STATUS.IDLE && (
            <MenuOverlay onStart={startGame} />
          )}

          {gameStatus === GAME_STATUS.GAME_OVER && (
            <GameOverModal 
              score={score} 
              highScore={highScore} 
              onRestart={resetGame} 
            />
          )}
        </main>

        <footer className="flex flex-col gap-8">
          <DifficultySelector 
            current={difficulty} 
            onChange={setDifficulty} 
            disabled={gameStatus === GAME_STATUS.PLAYING} 
          />
          <div className="px-4">
            <Controls onMove={changeDirection} />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;

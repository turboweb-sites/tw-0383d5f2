import { useState } from 'react';
import ColorSelector from './components/ColorSelector';
import ChessBoard from './components/ChessBoard';
import GameStatus from './components/GameStatus';
import { useChessGame } from './hooks/useChessGame';
import { Trophy, RotateCcw, Sparkles, Users, Bot } from 'lucide-react';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [gameMode, setGameMode] = useState<'bot' | 'pvp'>('bot');
  
  const {
    board,
    currentTurn,
    selectedSquare,
    validMoves,
    lastMove,
    isCheck,
    isCheckmate,
    isStalemate,
    winner,
    capturedPieces,
    selectSquare,
    resetGame
  } = useChessGame(playerColor, gameMode);

  const handleStartGame = (color: 'white' | 'black', mode: 'bot' | 'pvp') => {
    setPlayerColor(color);
    setGameMode(mode);
    setGameStarted(true);
    resetGame();
  };

  const handleNewGame = () => {
    setGameStarted(false);
    resetGame();
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Sparkles className="w-16 h-16 text-yellow-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Шахматы</h1>
            <p className="text-gray-300">Выберите режим игры</p>
          </div>
          
          {/* Game Mode Selection */}
          <div className="space-y-4 mb-6">
            <button
              onClick={() => handleStartGame('white', 'bot')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <Bot className="w-6 h-6" />
              Играть против компьютера
            </button>
            
            <button
              onClick={() => handleStartGame('white', 'pvp')}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <Users className="w-6 h-6" />
              Играть вдвоем
            </button>
          </div>

          <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm text-gray-300">
            <p className="flex items-start gap-2">
              <Bot className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <span><strong>Против компьютера:</strong> Выберите цвет и играйте против AI</span>
            </p>
            <p className="flex items-start gap-2">
              <Users className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <span><strong>Игра вдвоем:</strong> Доска автоматически переворачивается после каждого хода</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            Шахматы
            {gameMode === 'pvp' && <Users className="w-8 h-8 text-purple-400" />}
            {gameMode === 'bot' && <Bot className="w-8 h-8 text-blue-400" />}
          </h1>
          <p className="text-gray-400">
            {gameMode === 'pvp' 
              ? 'Игра вдвоем — доска переворачивается автоматически'
              : `Вы играете ${playerColor === 'white' ? 'белыми ♔' : 'черными ♚'} против компьютера`
            }
          </p>
        </div>

        {(isCheckmate || isStalemate) && (
          <div className="mb-6 text-center">
            <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-lg rounded-xl p-6 inline-block border border-yellow-500/30">
              <div className="flex items-center gap-3 justify-center mb-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">
                  {isCheckmate 
                    ? `Мат! Победа ${winner === 'white' ? 'белых ♔' : 'черных ♚'}` 
                    : 'Пат! Ничья'
                  }
                </h2>
              </div>
              <button
                onClick={handleNewGame}
                className="mt-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-5 h-5" />
                Новая игра
              </button>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-start">
          <ChessBoard
            board={board}
            playerColor={playerColor}
            gameMode={gameMode}
            selectedSquare={selectedSquare}
            validMoves={validMoves}
            lastMove={lastMove}
            isCheck={isCheck}
            currentTurn={currentTurn}
            onSquareClick={selectSquare}
          />

          <div className="lg:w-80 space-y-4">
            <GameStatus
              currentTurn={currentTurn}
              isCheck={isCheck}
              isCheckmate={isCheckmate}
              isStalemate={isStalemate}
              winner={winner}
              capturedPieces={capturedPieces}
              playerColor={playerColor}
              gameMode={gameMode}
            />

            <button
              onClick={handleNewGame}
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all backdrop-blur-lg flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Новая игра
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
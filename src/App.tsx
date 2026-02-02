import { useState } from 'react';
import ColorSelector from './components/ColorSelector';
import ChessBoard from './components/ChessBoard';
import GameStatus from './components/GameStatus';
import { useChessGame } from './hooks/useChessGame';
import { Trophy, RotateCcw, Sparkles } from 'lucide-react';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  
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
  } = useChessGame(playerColor);

  const handleStartGame = (color: 'white' | 'black') => {
    setPlayerColor(color);
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
            <p className="text-gray-300">Сыграйте партию против компьютера</p>
          </div>
          
          <ColorSelector onSelectColor={handleStartGame} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Шахматы</h1>
          <p className="text-gray-400">Вы играете {playerColor === 'white' ? 'белыми' : 'черными'}</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
          <div className="flex justify-center">
            <ChessBoard
              board={board}
              playerColor={playerColor}
              selectedSquare={selectedSquare}
              validMoves={validMoves}
              lastMove={lastMove}
              isCheck={isCheck}
              currentTurn={currentTurn}
              onSquareClick={selectSquare}
            />
          </div>
          
          <div className="space-y-6">
            <GameStatus
              currentTurn={currentTurn}
              isCheck={isCheck}
              isCheckmate={isCheckmate}
              isStalemate={isStalemate}
              winner={winner}
              capturedPieces={capturedPieces}
              playerColor={playerColor}
            />
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Управление</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Кликните на фигуру, чтобы выбрать её</li>
                <li>• Зеленые точки показывают возможные ходы</li>
                <li>• Кликните на подсвеченную клетку для хода</li>
                <li>• Компьютер ходит автоматически</li>
              </ul>
              
              <button
                onClick={handleNewGame}
                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                <RotateCcw className="w-5 h-5" />
                Новая игра
              </button>
            </div>

            {(isCheckmate || isStalemate) && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center animate-pulse">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  {isCheckmate ? 'Шах и мат!' : 'Пат!'}
                </h3>
                <p className="text-gray-300">
                  {winner ? (winner === playerColor ? 'Вы победили!' : 'Компьютер победил!') : 'Ничья!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
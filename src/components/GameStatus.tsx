import { GameState, PieceColor, PieceType } from '../types/chess';
import { Clock, Crown, AlertCircle, Loader2 } from 'lucide-react';

interface GameStatusProps {
  gameState: GameState;
  playerColor: PieceColor;
  isThinking: boolean;
}

const pieceValues: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0
};

const pieceUnicode: Record<string, string> = {
  'white-king': '♔',
  'white-queen': '♕',
  'white-rook': '♖',
  'white-bishop': '♗',
  'white-knight': '♘',
  'white-pawn': '♙',
  'black-king': '♚',
  'black-queen': '♛',
  'black-rook': '♜',
  'black-bishop': '♝',
  'black-knight': '♞',
  'black-pawn': '♟',
};

export default function GameStatus({ gameState, playerColor, isThinking }: GameStatusProps) {
  const { currentTurn, isCheck, isCheckmate, isStalemate, capturedPieces, moveHistory } = gameState;
  
  const calculateMaterialAdvantage = () => {
    const whiteValue = capturedPieces.black.reduce((sum, piece) => sum + pieceValues[piece.type], 0);
    const blackValue = capturedPieces.white.reduce((sum, piece) => sum + pieceValues[piece.type], 0);
    return whiteValue - blackValue;
  };

  const materialAdvantage = calculateMaterialAdvantage();

  return (
    <div className="space-y-6">
      {/* Current Turn */}
      <div className="bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Статус игры
        </h2>
        
        {isCheckmate ? (
          <div className="text-center py-4">
            <Crown className="w-16 h-16 mx-auto mb-3 text-yellow-500" />
            <p className="text-2xl font-bold text-green-600">Шах и мат!</p>
            <p className="text-lg text-gray-600 mt-2">
              Победили {currentTurn === 'white' ? 'чёрные' : 'белые'}
            </p>
          </div>
        ) : isStalemate ? (
          <div className="text-center py-4">
            <AlertCircle className="w-16 h-16 mx-auto mb-3 text-yellow-500" />
            <p className="text-2xl font-bold text-yellow-600">Пат!</p>
            <p className="text-lg text-gray-600 mt-2">Ничья</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg">
                  Ход: <span className="font-bold">{currentTurn === 'white' ? 'Белые' : 'Чёрные'}</span>
                </p>
                {isCheck && (
                  <p className="text-red-600 font-bold flex items-center gap-2 mt-2">
                    <AlertCircle className="w-5 h-5" />
                    Шах!
                  </p>
                )}
              </div>
              
              {isThinking && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Компьютер думает...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className={`px-3 py-1 rounded-full ${playerColor === 'white' ? 'bg-gray-200' : 'bg-gray-800 text-white'}`}>
                Вы: {playerColor === 'white' ? 'Белые' : 'Чёрные'}
              </div>
              <div className={`px-3 py-1 rounded-full ${playerColor === 'black' ? 'bg-gray-200' : 'bg-gray-800 text-white'}`}>
                Компьютер: {playerColor === 'black' ? 'Белые' : 'Чёрные'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Material Advantage */}
      <div className="bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Материальное преимущество</h2>
        
        <div className="space-y-3">
          {/* White captured pieces */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Взятые белые фигуры:</p>
            <div className="flex flex-wrap gap-1">
              {capturedPieces.white.length > 0 ? (
                capturedPieces.white.map((piece, index) => (
                  <span key={index} className="text-3xl">
                    {pieceUnicode[`white-${piece.type}`]}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          </div>

          {/* Black captured pieces */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Взятые чёрные фигуры:</p>
            <div className="flex flex-wrap gap-1">
              {capturedPieces.black.length > 0 ? (
                capturedPieces.black.map((piece, index) => (
                  <span key={index} className="text-3xl">
                    {pieceUnicode[`black-${piece.type}`]}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          </div>

          {/* Material score */}
          <div className="pt-3 border-t">
            <p className="text-lg font-semibold">
              {materialAdvantage > 0 ? (
                <span className="text-green-600">Белые +{materialAdvantage}</span>
              ) : materialAdvantage < 0 ? (
                <span className="text-red-600">Чёрные +{Math.abs(materialAdvantage)}</span>
              ) : (
                <span className="text-gray-600">Равенство</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Move History */}
      <div className="bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">История ходов</h2>
        <div className="max-h-48 overflow-y-auto">
          {moveHistory.length > 0 ? (
            <div className="space-y-1">
              {moveHistory.map((move, index) => (
                <div key={index} className="text-sm text-gray-600">
                  {Math.floor(index / 2) + 1}. {index % 2 === 0 ? '' : '...'} {move}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Ходов пока нет</p>
          )}
        </div>
      </div>
    </div>
  );
}
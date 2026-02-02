import { AlertCircle, Clock, Trophy } from 'lucide-react';
import { Piece } from '../types/chess';

interface GameStatusProps {
  currentTurn: 'white' | 'black';
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  winner: 'white' | 'black' | null;
  capturedPieces: { white: Piece[]; black: Piece[] };
  playerColor: 'white' | 'black';
}

const pieceValues: Record<string, number> = {
  queen: 9,
  rook: 5,
  bishop: 3,
  knight: 3,
  pawn: 1,
  king: 0
};

export default function GameStatus({
  currentTurn,
  isCheck,
  isCheckmate,
  isStalemate,
  winner,
  capturedPieces,
  playerColor
}: GameStatusProps) {
  const calculateMaterialAdvantage = () => {
    const whiteValue = capturedPieces.black.reduce((sum, piece) => sum + pieceValues[piece.type], 0);
    const blackValue = capturedPieces.white.reduce((sum, piece) => sum + pieceValues[piece.type], 0);
    return whiteValue - blackValue;
  };

  const materialAdvantage = calculateMaterialAdvantage();
  const isPlayerTurn = currentTurn === playerColor;

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Статус игры</h2>
        {!isCheckmate && !isStalemate && (
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300">
              {isPlayerTurn ? 'Ваш ход' : 'Ход компьютера'}
            </span>
          </div>
        )}
      </div>

      {isCheck && !isCheckmate && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/20 rounded-lg p-3">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Шах!</span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Ход:</span>
          <span className="text-white font-medium">
            {currentTurn === 'white' ? 'Белые' : 'Черные'}
            {!isCheckmate && !isStalemate && (
              <span className="text-gray-400 ml-2">
                ({isPlayerTurn ? 'Вы' : 'Компьютер'})
              </span>
            )}
          </span>
        </div>

        {materialAdvantage !== 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Материал:</span>
            <span className={`font-medium ${materialAdvantage > 0 ? 'text-white' : 'text-gray-900'}`}>
              {materialAdvantage > 0 ? `Белые +${materialAdvantage}` : `Черные +${Math.abs(materialAdvantage)}`}
            </span>
          </div>
        )}
      </div>

      {/* Captured pieces */}
      <div className="border-t border-gray-700 pt-4 space-y-3">
        <div>
          <p className="text-sm text-gray-400 mb-2">Взятые белые:</p>
          <div className="flex flex-wrap gap-1">
            {capturedPieces.white.map((piece, index) => (
              <span key={index} className="text-2xl text-white drop-shadow-lg">
                {piece.type === 'king' && '♔'}
                {piece.type === 'queen' && '♕'}
                {piece.type === 'rook' && '♖'}
                {piece.type === 'bishop' && '♗'}
                {piece.type === 'knight' && '♘'}
                {piece.type === 'pawn' && '♙'}
              </span>
            ))}
            {capturedPieces.white.length === 0 && <span className="text-gray-500">—</span>}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-2">Взятые черные:</p>
          <div className="flex flex-wrap gap-1">
            {capturedPieces.black.map((piece, index) => (
              <span key={index} className="text-2xl text-gray-900">
                {piece.type === 'king' && '♚'}
                {piece.type === 'queen' && '♛'}
                {piece.type === 'rook' && '♜'}
                {piece.type === 'bishop' && '♝'}
                {piece.type === 'knight' && '♞'}
                {piece.type === 'pawn' && '♟'}
              </span>
            ))}
            {capturedPieces.black.length === 0 && <span className="text-gray-500">—</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
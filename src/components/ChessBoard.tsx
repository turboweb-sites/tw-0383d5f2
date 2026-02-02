import { Position, GameState, PieceColor, Move } from '../types/chess';
import ChessPiece from './ChessPiece';

interface ChessBoardProps {
  gameState: GameState;
  selectedSquare: Position | null;
  possibleMoves: Position[];
  lastMove: Move | null;
  playerColor: PieceColor;
  onSquareClick: (position: Position) => void;
  isPlayerTurn: boolean;
}

export default function ChessBoard({
  gameState,
  selectedSquare,
  possibleMoves,
  lastMove,
  playerColor,
  onSquareClick,
  isPlayerTurn
}: ChessBoardProps) {
  const isFlipped = playerColor === 'black';

  const getSquareColor = (row: number, col: number) => {
    const isLight = (row + col) % 2 === 0;
    return isLight ? 'bg-amber-200' : 'bg-amber-600';
  };

  const isSquareSelected = (row: number, col: number) => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };

  const isPossibleMove = (row: number, col: number) => {
    return possibleMoves.some(move => move.row === row && move.col === col);
  };

  const isLastMoveSquare = (row: number, col: number) => {
    return (lastMove?.from.row === row && lastMove?.from.col === col) ||
           (lastMove?.to.row === row && lastMove?.to.col === col);
  };

  const renderBoard = () => {
    const board = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const displayRow = isFlipped ? 7 - row : row;
        const displayCol = isFlipped ? 7 - col : col;
        const piece = gameState.board[displayRow][displayCol];
        
        board.push(
          <div
            key={`${displayRow}-${displayCol}`}
            className={`
              chess-square
              ${getSquareColor(displayRow, displayCol)}
              ${isSquareSelected(displayRow, displayCol) ? 'selected-square' : ''}
              ${isPossibleMove(displayRow, displayCol) ? 'possible-move' : ''}
              ${isLastMoveSquare(displayRow, displayCol) ? 'last-move' : ''}
              ${isPlayerTurn ? 'hover:brightness-110' : 'cursor-not-allowed'}
            `}
            onClick={() => onSquareClick({ row: displayRow, col: displayCol })}
          >
            {piece && <ChessPiece piece={piece} />}
          </div>
        );
      }
    }
    return board;
  };

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  
  if (isFlipped) {
    files.reverse();
    ranks.reverse();
  }

  return (
    <div className="inline-block">
      {/* Top file labels */}
      <div className="flex ml-8">
        {files.map(file => (
          <div key={file} className="w-20 h-8 flex items-center justify-center text-gray-600 font-semibold">
            {file}
          </div>
        ))}
      </div>
      
      <div className="flex">
        {/* Left rank labels */}
        <div className="flex flex-col">
          {ranks.map(rank => (
            <div key={rank} className="w-8 h-20 flex items-center justify-center text-gray-600 font-semibold">
              {rank}
            </div>
          ))}
        </div>
        
        {/* Chess board */}
        <div className="grid grid-cols-8 border-4 border-gray-800 rounded-lg overflow-hidden shadow-xl">
          {renderBoard()}
        </div>
        
        {/* Right rank labels */}
        <div className="flex flex-col">
          {ranks.map(rank => (
            <div key={`${rank}-right`} className="w-8 h-20 flex items-center justify-center text-gray-600 font-semibold">
              {rank}
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom file labels */}
      <div className="flex ml-8">
        {files.map(file => (
          <div key={`${file}-bottom`} className="w-20 h-8 flex items-center justify-center text-gray-600 font-semibold">
            {file}
          </div>
        ))}
      </div>
    </div>
  );
}
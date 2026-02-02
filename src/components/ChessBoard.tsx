import ChessPiece from './ChessPiece';
import { Board, Position } from '../types/chess';

interface ChessBoardProps {
  board: Board;
  playerColor: 'white' | 'black';
  gameMode: 'bot' | 'pvp';
  selectedSquare: Position | null;
  validMoves: Position[];
  lastMove: { from: Position; to: Position } | null;
  isCheck: boolean;
  currentTurn: 'white' | 'black';
  onSquareClick: (position: Position) => void;
}

export default function ChessBoard({
  board,
  playerColor,
  gameMode,
  selectedSquare,
  validMoves,
  lastMove,
  isCheck,
  currentTurn,
  onSquareClick
}: ChessBoardProps) {
  // В режиме PvP доска переворачивается в зависимости от чьего хода
  // В режиме с ботом доска ориентирована по цвету игрока
  const isFlipped = gameMode === 'pvp' 
    ? currentTurn === 'black'
    : playerColor === 'black';
  
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  
  const displayFiles = isFlipped ? [...files].reverse() : files;
  const displayRanks = isFlipped ? [...ranks].reverse() : ranks;

  const isValidMove = (row: number, col: number) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const isSelected = (row: number, col: number) => {
    return selectedSquare?.row === row && selectedSquare?.col === col;
  };

  const isLastMove = (row: number, col: number) => {
    return (lastMove?.from.row === row && lastMove?.from.col === col) ||
           (lastMove?.to.row === row && lastMove?.to.col === col);
  };

  const isKingInCheck = (row: number, col: number) => {
    const piece = board[row][col];
    return isCheck && piece?.type === 'king' && piece?.color === currentTurn;
  };

  const handleSquareClick = (row: number, col: number) => {
    const displayRow = isFlipped ? 7 - row : row;
    const displayCol = isFlipped ? 7 - col : col;
    onSquareClick({ row: displayRow, col: displayCol });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 shadow-2xl transition-all duration-700">
      <div className="relative">
        {/* Column labels */}
        <div className="flex mb-2">
          <div className="w-8 md:w-10"></div>
          {displayFiles.map(file => (
            <div key={file} className="w-16 md:w-20 text-center text-sm md:text-base font-semibold text-gray-300">
              {file}
            </div>
          ))}
        </div>

        {/* Board grid */}
        <div className="flex">
          <div className="flex flex-col justify-between mr-2">
            {displayRanks.map(rank => (
              <div key={rank} className="h-16 md:h-20 flex items-center justify-center text-sm md:text-base font-semibold text-gray-300 w-8 md:w-10">
                {rank}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-8 gap-0 border-2 border-gray-600 rounded-lg overflow-hidden">
            {Array.from({ length: 8 }, (_, row) => 
              Array.from({ length: 8 }, (_, col) => {
                const displayRow = isFlipped ? 7 - row : row;
                const displayCol = isFlipped ? 7 - col : col;
                const piece = board[displayRow][displayCol];
                const isDark = (row + col) % 2 === 1;
                
                return (
                  <div
                    key={`${row}-${col}`}
                    onClick={() => handleSquareClick(row, col)}
                    className={`
                      chess-square w-16 h-16 md:w-20 md:h-20
                      ${isDark ? 'bg-amber-700' : 'bg-amber-100'}
                      ${isSelected(displayRow, displayCol) ? 'selected-square' : ''}
                      ${isLastMove(displayRow, displayCol) ? 'last-move' : ''}
                      ${isKingInCheck(displayRow, displayCol) ? 'check-square' : ''}
                      ${isValidMove(displayRow, displayCol) ? 'valid-move' : ''}
                    `}
                  >
                    {piece && <ChessPiece piece={piece} />}
                  </div>
                );
              })
            ).flat()}
          </div>
        </div>
      </div>

      {/* Turn indicator for PvP mode */}
      {gameMode === 'pvp' && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-6 py-2">
            <div className={`w-3 h-3 rounded-full ${currentTurn === 'white' ? 'bg-white' : 'bg-gray-900'}`}></div>
            <span className="text-white font-medium">
              Ход {currentTurn === 'white' ? 'белых' : 'черных'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
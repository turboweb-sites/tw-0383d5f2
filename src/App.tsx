import { useState, useEffect } from 'react';
import ChessBoard from './components/ChessBoard';
import ColorSelector from './components/ColorSelector';
import GameStatus from './components/GameStatus';
import { Position, GameState, PieceColor, Move } from './types/chess';
import { initializeBoard, isValidMove, makeMove, isCheckmate, isStalemate, isCheck, getAllValidMoves } from './lib/chessLogic';
import { getBestMove } from './lib/chessBot';
import { RotateCcw, Trophy } from 'lucide-react';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerColor, setPlayerColor] = useState<PieceColor>('white');
  const [gameState, setGameState] = useState<GameState>({
    board: initializeBoard(),
    currentTurn: 'white',
    castlingRights: { whiteKingside: true, whiteQueenside: true, blackKingside: true, blackQueenside: true },
    enPassantTarget: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    capturedPieces: { white: [], black: [] },
    moveHistory: []
  });
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  // Bot makes move when it's bot's turn
  useEffect(() => {
    if (gameStarted && gameState.currentTurn !== playerColor && !gameState.isCheckmate && !gameState.isStalemate) {
      setIsThinking(true);
      const timer = setTimeout(() => {
        const botMove = getBestMove(gameState, playerColor === 'white' ? 'black' : 'white');
        if (botMove) {
          handleMove(botMove.from, botMove.to);
        }
        setIsThinking(false);
      }, 1000); // 1 second delay for better UX
      
      return () => clearTimeout(timer);
    }
  }, [gameState.currentTurn, playerColor, gameStarted, gameState.isCheckmate, gameState.isStalemate]);

  const startGame = (color: PieceColor) => {
    setPlayerColor(color);
    setGameStarted(true);
    if (color === 'black') {
      // If player chooses black, bot (white) makes first move
      setIsThinking(true);
      setTimeout(() => {
        const botMove = getBestMove(gameState, 'white');
        if (botMove) {
          handleMove(botMove.from, botMove.to);
        }
        setIsThinking(false);
      }, 1000);
    }
  };

  const handleSquareClick = (position: Position) => {
    if (!gameStarted || gameState.currentTurn !== playerColor || isThinking) return;

    const piece = gameState.board[position.row][position.col];

    if (selectedSquare) {
      // If a square is already selected, try to move
      if (possibleMoves.some(move => move.row === position.row && move.col === position.col)) {
        handleMove(selectedSquare, position);
      } else if (piece && piece.color === playerColor) {
        // Select new piece if it's the player's piece
        selectSquare(position);
      } else {
        // Deselect if clicking elsewhere
        setSelectedSquare(null);
        setPossibleMoves([]);
      }
    } else if (piece && piece.color === playerColor) {
      // Select a piece
      selectSquare(position);
    }
  };

  const selectSquare = (position: Position) => {
    setSelectedSquare(position);
    const moves = getAllValidMoves(gameState, position);
    setPossibleMoves(moves);
  };

  const handleMove = (from: Position, to: Position) => {
    if (isValidMove(gameState, from, to)) {
      const newGameState = makeMove(gameState, from, to);
      setGameState(newGameState);
      setSelectedSquare(null);
      setPossibleMoves([]);
      setLastMove({ from, to });

      // Check game ending conditions
      const isInCheck = isCheck(newGameState, newGameState.currentTurn);
      const hasNoMoves = !hasValidMoves(newGameState, newGameState.currentTurn);
      
      if (hasNoMoves) {
        if (isInCheck) {
          setGameState(prev => ({ ...prev, isCheckmate: true }));
        } else {
          setGameState(prev => ({ ...prev, isStalemate: true }));
        }
      } else if (isInCheck) {
        setGameState(prev => ({ ...prev, isCheck: true }));
      }
    }
  };

  const hasValidMoves = (state: GameState, color: PieceColor): boolean => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row][col];
        if (piece && piece.color === color) {
          const moves = getAllValidMoves(state, { row, col });
          if (moves.length > 0) return true;
        }
      }
    }
    return false;
  };

  const resetGame = () => {
    setGameState({
      board: initializeBoard(),
      currentTurn: 'white',
      castlingRights: { whiteKingside: true, whiteQueenside: true, blackKingside: true, blackQueenside: true },
      enPassantTarget: null,
      halfmoveClock: 0,
      fullmoveNumber: 1,
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      capturedPieces: { white: [], black: [] },
      moveHistory: []
    });
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    setGameStarted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        {!gameStarted ? (
          <ColorSelector onSelectColor={startGame} />
        ) : (
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-500" />
                Шахматы
              </h1>
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Новая игра
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <ChessBoard
                  gameState={gameState}
                  selectedSquare={selectedSquare}
                  possibleMoves={possibleMoves}
                  lastMove={lastMove}
                  playerColor={playerColor}
                  onSquareClick={handleSquareClick}
                  isPlayerTurn={gameState.currentTurn === playerColor && !isThinking}
                />
              </div>
              
              <div className="flex-grow">
                <GameStatus
                  gameState={gameState}
                  playerColor={playerColor}
                  isThinking={isThinking}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback } from 'react';
import { Board, Position, Piece, GameState } from '../types/chess';
import { initializeBoard, getValidMoves, makeMove, isInCheck, isCheckmate, isStalemate } from '../utils/chessLogic';
import { getBestMove } from '../utils/chessBot';

export function useChessGame(playerColor: 'white' | 'black', gameMode: 'bot' | 'pvp' = 'bot') {
  const [board, setBoard] = useState<Board>(initializeBoard());
  const [currentTurn, setCurrentTurn] = useState<'white' | 'black'>('white');
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<{ white: Piece[]; black: Piece[] }>({
    white: [],
    black: []
  });
  const [gameState, setGameState] = useState<GameState>({
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    winner: null
  });

  // Check game state after each move
  const updateGameState = useCallback((board: Board, turn: 'white' | 'black') => {
    const check = isInCheck(board, turn);
    const checkmate = isCheckmate(board, turn);
    const stalemate = isStalemate(board, turn);
    
    setGameState({
      isCheck: check,
      isCheckmate: checkmate,
      isStalemate: stalemate,
      winner: checkmate ? (turn === 'white' ? 'black' : 'white') : null
    });
  }, []);

  // Handle square selection and moves
  const selectSquare = useCallback((position: Position) => {
    const piece = board[position.row][position.col];

    // В режиме PvP можно ходить любым цветом в свой ход
    // В режиме с ботом можно ходить только своим цветом
    const canMove = gameMode === 'pvp' 
      ? piece && piece.color === currentTurn
      : piece && piece.color === currentTurn && currentTurn === playerColor;

    // If a square is already selected
    if (selectedSquare) {
      const isValidMove = validMoves.some(
        move => move.row === position.row && move.col === position.col
      );

      if (isValidMove) {
        // Make the move
        const { newBoard, capturedPiece } = makeMove(board, selectedSquare, position);
        setBoard(newBoard);
        setLastMove({ from: selectedSquare, to: position });
        
        // Update captured pieces
        if (capturedPiece) {
          setCapturedPieces(prev => ({
            ...prev,
            [capturedPiece.color]: [...prev[capturedPiece.color], capturedPiece]
          }));
        }

        // Switch turns
        const nextTurn = currentTurn === 'white' ? 'black' : 'white';
        setCurrentTurn(nextTurn);
        updateGameState(newBoard, nextTurn);
        
        // Clear selection
        setSelectedSquare(null);
        setValidMoves([]);
      } else if (canMove) {
        // Select new piece
        setSelectedSquare(position);
        setValidMoves(getValidMoves(board, position));
      } else {
        // Clear selection
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else if (canMove) {
      // Select piece
      setSelectedSquare(position);
      setValidMoves(getValidMoves(board, position));
    }
  }, [board, selectedSquare, validMoves, currentTurn, playerColor, gameMode, updateGameState]);

  // Bot moves (только в режиме с ботом)
  useEffect(() => {
    if (gameMode === 'bot' && currentTurn !== playerColor && !gameState.isCheckmate && !gameState.isStalemate) {
      const timer = setTimeout(() => {
        const move = getBestMove(board, currentTurn);
        if (move) {
          const { newBoard, capturedPiece } = makeMove(board, move.from, move.to);
          setBoard(newBoard);
          setLastMove(move);
          
          if (capturedPiece) {
            setCapturedPieces(prev => ({
              ...prev,
              [capturedPiece.color]: [...prev[capturedPiece.color], capturedPiece]
            }));
          }

          const nextTurn = currentTurn === 'white' ? 'black' : 'white';
          setCurrentTurn(nextTurn);
          updateGameState(newBoard, nextTurn);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentTurn, playerColor, board, gameState, gameMode, updateGameState]);

  // Reset game
  const resetGame = useCallback(() => {
    setBoard(initializeBoard());
    setCurrentTurn('white');
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setCapturedPieces({ white: [], black: [] });
    setGameState({
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      winner: null
    });
  }, []);

  return {
    board,
    currentTurn,
    selectedSquare,
    validMoves,
    lastMove,
    isCheck: gameState.isCheck,
    isCheckmate: gameState.isCheckmate,
    isStalemate: gameState.isStalemate,
    winner: gameState.winner,
    capturedPieces,
    selectSquare,
    resetGame
  };
}
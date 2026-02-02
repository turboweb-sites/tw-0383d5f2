import { GameState, Position, Move, PieceColor, PieceType } from '../types/chess';
import { isValidMove, makeMove, isCheck, getAllValidMoves } from './chessLogic';

interface MoveEvaluation {
  move: Move;
  score: number;
}

const pieceValues: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000
};

const positionBonus: Record<PieceType, number[][]> = {
  pawn: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  knight: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  bishop: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  rook: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ],
  queen: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  king: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ]
};

export function getBestMove(gameState: GameState, botColor: PieceColor): Move | null {
  const possibleMoves = getAllPossibleMoves(gameState, botColor);
  
  if (possibleMoves.length === 0) return null;
  
  // Evaluate each move
  const evaluatedMoves: MoveEvaluation[] = possibleMoves.map(move => {
    const score = evaluateMove(gameState, move, botColor);
    return { move, score };
  });
  
  // Sort by score (descending)
  evaluatedMoves.sort((a, b) => b.score - a.score);
  
  // Add some randomness to avoid predictability
  const topMoves = evaluatedMoves.slice(0, Math.min(3, evaluatedMoves.length));
  const selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
  
  return selectedMove.move;
}

function getAllPossibleMoves(gameState: GameState, color: PieceColor): Move[] {
  const moves: Move[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === color) {
        const from = { row, col };
        const validMoves = getAllValidMoves(gameState, from);
        
        for (const to of validMoves) {
          moves.push({ from, to });
        }
      }
    }
  }
  
  return moves;
}

function evaluateMove(gameState: GameState, move: Move, botColor: PieceColor): number {
  let score = 0;
  
  const piece = gameState.board[move.from.row][move.from.col];
  if (!piece) return 0;
  
  const targetPiece = gameState.board[move.to.row][move.to.col];
  
  // Capture value
  if (targetPiece) {
    score += pieceValues[targetPiece.type];
  }
  
  // Position value
  const fromPositionValue = getPositionValue(piece.type, move.from, botColor);
  const toPositionValue = getPositionValue(piece.type, move.to, botColor);
  score += toPositionValue - fromPositionValue;
  
  // Check if move creates check
  const newState = makeMove(gameState, move.from, move.to);
  if (isCheck(newState, botColor === 'white' ? 'black' : 'white')) {
    score += 50;
  }
  
  // Avoid moving into danger
  if (isSquareAttacked(newState, move.to, botColor === 'white' ? 'black' : 'white')) {
    score -= pieceValues[piece.type] / 2;
  }
  
  // Prefer center control
  if (move.to.row >= 3 && move.to.row <= 4 && move.to.col >= 3 && move.to.col <= 4) {
    score += 20;
  }
  
  // Castle if possible (high priority early game)
  if (piece.type === 'king' && Math.abs(move.to.col - move.from.col) === 2) {
    score += 60;
  }
  
  return score;
}

function getPositionValue(pieceType: PieceType, position: Position, color: PieceColor): number {
  const table = positionBonus[pieceType];
  const row = color === 'white' ? 7 - position.row : position.row;
  return table[row][position.col];
}

function isSquareAttacked(gameState: GameState, square: Position, byColor: PieceColor): boolean {
  const tempState = { ...gameState, currentTurn: byColor };
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === byColor) {
        if (isValidMove(tempState, { row, col }, square)) {
          return true;
        }
      }
    }
  }
  
  return false;
}
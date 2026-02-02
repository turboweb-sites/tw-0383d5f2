import { Board, Position, Piece } from '../types/chess';
import { getValidMoves, makeMove, isInCheck, isCheckmate } from './chessLogic';

interface Move {
  from: Position;
  to: Position;
  score: number;
}

const pieceValues: Record<string, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 1000
};

export function getBestMove(board: Board, color: 'white' | 'black'): { from: Position; to: Position } | null {
  const moves = getAllPossibleMoves(board, color);
  
  if (moves.length === 0) return null;
  
  // Evaluate each move
  const evaluatedMoves: Move[] = moves.map(move => ({
    ...move,
    score: evaluateMove(board, move, color)
  }));
  
  // Sort by score (higher is better)
  evaluatedMoves.sort((a, b) => b.score - a.score);
  
  // Add some randomness for moves with similar scores
  const topMoves = evaluatedMoves.filter(move => 
    move.score >= evaluatedMoves[0].score - 0.5
  );
  
  const selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
  
  return { from: selectedMove.from, to: selectedMove.to };
}

function getAllPossibleMoves(board: Board, color: 'white' | 'black'): Move[] {
  const moves: Move[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const validMoves = getValidMoves(board, { row, col });
        validMoves.forEach(to => {
          moves.push({ from: { row, col }, to, score: 0 });
        });
      }
    }
  }
  
  return moves;
}

function evaluateMove(board: Board, move: Move, color: 'white' | 'black'): number {
  let score = 0;
  
  const { newBoard, capturedPiece } = makeMove(board, move.from, move.to);
  
  // Reward captures
  if (capturedPiece) {
    score += pieceValues[capturedPiece.type] * 10;
  }
  
  // Check if this move gives check
  const opponentColor = color === 'white' ? 'black' : 'white';
  if (isInCheck(newBoard, opponentColor)) {
    score += 5;
    
    // Check for checkmate
    if (isCheckmate(newBoard, opponentColor)) {
      score += 1000;
    }
  }
  
  // Evaluate piece positioning
  score += evaluatePosition(newBoard, move.to, board[move.from.row][move.from.col]!);
  
  // Penalize if move puts own king in danger
  if (isKingInDanger(newBoard, color)) {
    score -= 20;
  }
  
  // Simple material evaluation
  score += evaluateMaterial(newBoard, color) - evaluateMaterial(board, color);
  
  return score;
}

function evaluatePosition(board: Board, position: Position, piece: Piece): number {
  let score = 0;
  
  // Reward center control
  const centerDistance = Math.abs(position.row - 3.5) + Math.abs(position.col - 3.5);
  score += (7 - centerDistance) * 0.1;
  
  // Piece-specific positioning
  switch (piece.type) {
    case 'pawn':
      // Reward pawn advancement
      if (piece.color === 'white') {
        score += (7 - position.row) * 0.2;
      } else {
        score += position.row * 0.2;
      }
      break;
    case 'knight':
      // Knights are better in the center
      score += (7 - centerDistance) * 0.3;
      break;
    case 'king':
      // King safety (prefer corners in endgame, but not implemented here)
      break;
  }
  
  return score;
}

function isKingInDanger(board: Board, color: 'white' | 'black'): boolean {
  // Find king position
  let kingPos: Position | null = null;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.type === 'king' && piece.color === color) {
        kingPos = { row, col };
        break;
      }
    }
    if (kingPos) break;
  }
  
  if (!kingPos) return false;
  
  // Check if any opponent piece can attack squares around the king
  const opponentColor = color === 'white' ? 'black' : 'white';
  let dangerCount = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        const moves = getValidMoves(board, { row, col });
        const attacksNearKing = moves.some(move => 
          Math.abs(move.row - kingPos.row) <= 1 && 
          Math.abs(move.col - kingPos.col) <= 1
        );
        if (attacksNearKing) dangerCount++;
      }
    }
  }
  
  return dangerCount > 1;
}

function evaluateMaterial(board: Board, color: 'white' | 'black'): number {
  let score = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = pieceValues[piece.type];
        score += piece.color === color ? value : -value;
      }
    }
  }
  
  return score;
}
import { Board, Position, Piece, PieceType } from '../types/chess';

export function initializeBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false };
    board[6][col] = { type: 'pawn', color: 'white', hasMoved: false };
  }
  
  // Place other pieces
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: pieceOrder[col], color: 'black', hasMoved: false };
    board[7][col] = { type: pieceOrder[col], color: 'white', hasMoved: false };
  }
  
  return board;
}

export function getValidMoves(board: Board, position: Position): Position[] {
  const piece = board[position.row][position.col];
  if (!piece) return [];
  
  const moves: Position[] = [];
  
  switch (piece.type) {
    case 'pawn':
      moves.push(...getPawnMoves(board, position, piece));
      break;
    case 'knight':
      moves.push(...getKnightMoves(board, position, piece));
      break;
    case 'bishop':
      moves.push(...getBishopMoves(board, position, piece));
      break;
    case 'rook':
      moves.push(...getRookMoves(board, position, piece));
      break;
    case 'queen':
      moves.push(...getQueenMoves(board, position, piece));
      break;
    case 'king':
      moves.push(...getKingMoves(board, position, piece));
      break;
  }
  
  // Filter out moves that would leave king in check
  return moves.filter(move => {
    const testBoard = cloneBoard(board);
    testBoard[move.row][move.col] = piece;
    testBoard[position.row][position.col] = null;
    return !isInCheck(testBoard, piece.color);
  });
}

function getPawnMoves(board: Board, position: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;
  
  // Move forward one square
  const oneStep = { row: position.row + direction, col: position.col };
  if (isValidPosition(oneStep) && !board[oneStep.row][oneStep.col]) {
    moves.push(oneStep);
    
    // Move forward two squares from starting position
    if (position.row === startRow) {
      const twoStep = { row: position.row + (2 * direction), col: position.col };
      if (!board[twoStep.row][twoStep.col]) {
        moves.push(twoStep);
      }
    }
  }
  
  // Capture diagonally
  const captures = [
    { row: position.row + direction, col: position.col - 1 },
    { row: position.row + direction, col: position.col + 1 }
  ];
  
  captures.forEach(capture => {
    if (isValidPosition(capture) && board[capture.row][capture.col]?.color !== piece.color && board[capture.row][capture.col]) {
      moves.push(capture);
    }
  });
  
  return moves;
}

function getKnightMoves(board: Board, position: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const knightMoves = [
    { row: -2, col: -1 }, { row: -2, col: 1 },
    { row: -1, col: -2 }, { row: -1, col: 2 },
    { row: 1, col: -2 }, { row: 1, col: 2 },
    { row: 2, col: -1 }, { row: 2, col: 1 }
  ];
  
  knightMoves.forEach(move => {
    const newPos = { row: position.row + move.row, col: position.col + move.col };
    if (isValidPosition(newPos) && (!board[newPos.row][newPos.col] || board[newPos.row][newPos.col]?.color !== piece.color)) {
      moves.push(newPos);
    }
  });
  
  return moves;
}

function getBishopMoves(board: Board, position: Position, piece: Piece): Position[] {
  return getLineMoves(board, position, piece, [
    { row: -1, col: -1 }, { row: -1, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 1 }
  ]);
}

function getRookMoves(board: Board, position: Position, piece: Piece): Position[] {
  return getLineMoves(board, position, piece, [
    { row: -1, col: 0 }, { row: 1, col: 0 },
    { row: 0, col: -1 }, { row: 0, col: 1 }
  ]);
}

function getQueenMoves(board: Board, position: Position, piece: Piece): Position[] {
  return [
    ...getBishopMoves(board, position, piece),
    ...getRookMoves(board, position, piece)
  ];
}

function getKingMoves(board: Board, position: Position, piece: Piece): Position[] {
  const moves: Position[] = [];
  const kingMoves = [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 }, { row: 0, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }
  ];
  
  kingMoves.forEach(move => {
    const newPos = { row: position.row + move.row, col: position.col + move.col };
    if (isValidPosition(newPos) && (!board[newPos.row][newPos.col] || board[newPos.row][newPos.col]?.color !== piece.color)) {
      moves.push(newPos);
    }
  });
  
  return moves;
}

function getLineMoves(board: Board, position: Position, piece: Piece, directions: Position[]): Position[] {
  const moves: Position[] = [];
  
  directions.forEach(dir => {
    let current = { row: position.row + dir.row, col: position.col + dir.col };
    
    while (isValidPosition(current)) {
      const targetPiece = board[current.row][current.col];
      
      if (!targetPiece) {
        moves.push({ ...current });
      } else if (targetPiece.color !== piece.color) {
        moves.push({ ...current });
        break;
      } else {
        break;
      }
      
      current = { row: current.row + dir.row, col: current.col + dir.col };
    }
  });
  
  return moves;
}

function isValidPosition(position: Position): boolean {
  return position.row >= 0 && position.row < 8 && position.col >= 0 && position.col < 8;
}

export function makeMove(board: Board, from: Position, to: Position): { newBoard: Board; capturedPiece: Piece | null } {
  const newBoard = cloneBoard(board);
  const piece = newBoard[from.row][from.col];
  const capturedPiece = newBoard[to.row][to.col];
  
  if (piece) {
    piece.hasMoved = true;
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;
  }
  
  return { newBoard, capturedPiece };
}

export function isInCheck(board: Board, color: 'white' | 'black'): boolean {
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
  
  // Check if any opponent piece can attack the king
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color !== color) {
        const moves = getValidMovesWithoutCheckFilter(board, { row, col });
        if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

function getValidMovesWithoutCheckFilter(board: Board, position: Position): Position[] {
  const piece = board[position.row][position.col];
  if (!piece) return [];
  
  const moves: Position[] = [];
  
  switch (piece.type) {
    case 'pawn':
      moves.push(...getPawnMoves(board, position, piece));
      break;
    case 'knight':
      moves.push(...getKnightMoves(board, position, piece));
      break;
    case 'bishop':
      moves.push(...getBishopMoves(board, position, piece));
      break;
    case 'rook':
      moves.push(...getRookMoves(board, position, piece));
      break;
    case 'queen':
      moves.push(...getQueenMoves(board, position, piece));
      break;
    case 'king':
      moves.push(...getKingMoves(board, position, piece));
      break;
  }
  
  return moves;
}

export function isCheckmate(board: Board, color: 'white' | 'black'): boolean {
  if (!isInCheck(board, color)) return false;
  
  // Check if any piece has a valid move
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, { row, col });
        if (moves.length > 0) return false;
      }
    }
  }
  
  return true;
}

export function isStalemate(board: Board, color: 'white' | 'black'): boolean {
  if (isInCheck(board, color)) return false;
  
  // Check if any piece has a valid move
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, { row, col });
        if (moves.length > 0) return false;
      }
    }
  }
  
  return true;
}

function cloneBoard(board: Board): Board {
  return board.map(row => row.map(piece => piece ? { ...piece } : null));
}
import { Board, Position, GameState, Piece, PieceColor, PieceType, Move } from '../types/chess';

export function initializeBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black' };
    board[6][col] = { type: 'pawn', color: 'white' };
  }
  
  // Place other pieces
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: pieceOrder[col], color: 'black' };
    board[7][col] = { type: pieceOrder[col], color: 'white' };
  }
  
  return board;
}

export function isValidMove(gameState: GameState, from: Position, to: Position): boolean {
  const piece = gameState.board[from.row][from.col];
  if (!piece || piece.color !== gameState.currentTurn) return false;
  
  // Can't capture own piece
  const targetPiece = gameState.board[to.row][to.col];
  if (targetPiece && targetPiece.color === piece.color) return false;
  
  // Check if move follows piece movement rules
  if (!isValidPieceMove(gameState, piece, from, to)) return false;
  
  // Check if move would leave king in check
  const testState = makeMove(gameState, from, to, true);
  if (isCheck(testState, piece.color)) return false;
  
  return true;
}

function isValidPieceMove(gameState: GameState, piece: Piece, from: Position, to: Position): boolean {
  const dx = to.col - from.col;
  const dy = to.row - from.row;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);
  
  switch (piece.type) {
    case 'pawn':
      return isValidPawnMove(gameState, piece, from, to, dx, dy);
    
    case 'rook':
      return (dx === 0 || dy === 0) && isPathClear(gameState.board, from, to);
    
    case 'bishop':
      return adx === ady && isPathClear(gameState.board, from, to);
    
    case 'queen':
      return ((dx === 0 || dy === 0) || (adx === ady)) && isPathClear(gameState.board, from, to);
    
    case 'knight':
      return (adx === 2 && ady === 1) || (adx === 1 && ady === 2);
    
    case 'king':
      return isValidKingMove(gameState, piece, from, to, dx, dy, adx, ady);
    
    default:
      return false;
  }
}

function isValidPawnMove(gameState: GameState, piece: Piece, from: Position, to: Position, dx: number, dy: number): boolean {
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;
  const targetPiece = gameState.board[to.row][to.col];
  
  // Move forward one square
  if (dx === 0 && dy === direction && !targetPiece) {
    return true;
  }
  
  // Move forward two squares from starting position
  if (dx === 0 && dy === direction * 2 && from.row === startRow && !targetPiece) {
    const middleSquare = gameState.board[from.row + direction][from.col];
    return !middleSquare;
  }
  
  // Capture diagonally
  if (Math.abs(dx) === 1 && dy === direction) {
    // Regular capture
    if (targetPiece && targetPiece.color !== piece.color) {
      return true;
    }
    
    // En passant
    if (gameState.enPassantTarget && 
        to.row === gameState.enPassantTarget.row && 
        to.col === gameState.enPassantTarget.col) {
      return true;
    }
  }
  
  return false;
}

function isValidKingMove(gameState: GameState, piece: Piece, from: Position, to: Position, dx: number, dy: number, adx: number, ady: number): boolean {
  // Normal king move (one square in any direction)
  if (adx <= 1 && ady <= 1) {
    return true;
  }
  
  // Castling
  if (dy === 0 && adx === 2) {
    // Check if king has moved
    if (piece.color === 'white' && from.row === 7 && from.col === 4) {
      // Kingside castling
      if (dx > 0 && gameState.castlingRights.whiteKingside) {
        return canCastle(gameState, piece.color, 'kingside');
      }
      // Queenside castling
      if (dx < 0 && gameState.castlingRights.whiteQueenside) {
        return canCastle(gameState, piece.color, 'queenside');
      }
    } else if (piece.color === 'black' && from.row === 0 && from.col === 4) {
      // Kingside castling
      if (dx > 0 && gameState.castlingRights.blackKingside) {
        return canCastle(gameState, piece.color, 'kingside');
      }
      // Queenside castling
      if (dx < 0 && gameState.castlingRights.blackQueenside) {
        return canCastle(gameState, piece.color, 'queenside');
      }
    }
  }
  
  return false;
}

function canCastle(gameState: GameState, color: PieceColor, side: 'kingside' | 'queenside'): boolean {
  const row = color === 'white' ? 7 : 0;
  const kingCol = 4;
  
  // Check if king is in check
  if (isCheck(gameState, color)) return false;
  
  if (side === 'kingside') {
    // Check if squares between king and rook are empty
    if (gameState.board[row][5] || gameState.board[row][6]) return false;
    
    // Check if king passes through or ends up in check
    for (let col = kingCol; col <= kingCol + 2; col++) {
      const testState = { ...gameState };
      testState.board = testState.board.map(row => [...row]);
      testState.board[row][col] = testState.board[row][kingCol];
      if (col !== kingCol) testState.board[row][kingCol] = null;
      if (isCheck(testState, color)) return false;
    }
  } else {
    // Check if squares between king and rook are empty
    if (gameState.board[row][1] || gameState.board[row][2] || gameState.board[row][3]) return false;
    
    // Check if king passes through or ends up in check
    for (let col = kingCol; col >= kingCol - 2; col--) {
      const testState = { ...gameState };
      testState.board = testState.board.map(row => [...row]);
      testState.board[row][col] = testState.board[row][kingCol];
      if (col !== kingCol) testState.board[row][kingCol] = null;
      if (isCheck(testState, color)) return false;
    }
  }
  
  return true;
}

function isPathClear(board: Board, from: Position, to: Position): boolean {
  const dx = Math.sign(to.col - from.col);
  const dy = Math.sign(to.row - from.row);
  
  let currentRow = from.row + dy;
  let currentCol = from.col + dx;
  
  while (currentRow !== to.row || currentCol !== to.col) {
    if (board[currentRow][currentCol]) return false;
    currentRow += dy;
    currentCol += dx;
  }
  
  return true;
}

export function makeMove(gameState: GameState, from: Position, to: Position, testMove: boolean = false): GameState {
  const newBoard = gameState.board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];
  const capturedPiece = newBoard[to.row][to.col];
  
  if (!piece) return gameState;
  
  // Handle castling
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    const row = from.row;
    if (to.col > from.col) {
      // Kingside castling
      newBoard[row][5] = newBoard[row][7];
      newBoard[row][7] = null;
    } else {
      // Queenside castling
      newBoard[row][3] = newBoard[row][0];
      newBoard[row][0] = null;
    }
  }
  
  // Handle en passant capture
  if (piece.type === 'pawn' && 
      gameState.enPassantTarget && 
      to.row === gameState.enPassantTarget.row && 
      to.col === gameState.enPassantTarget.col) {
    const captureRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
    const enPassantCaptured = newBoard[captureRow][to.col];
    if (enPassantCaptured) {
      newBoard[captureRow][to.col] = null;
      if (!testMove) {
        gameState.capturedPieces[enPassantCaptured.color].push(enPassantCaptured);
      }
    }
  }
  
  // Move the piece
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;
  
  // Handle pawn promotion
  if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
    newBoard[to.row][to.col] = { ...piece, type: 'queen' };
  }
  
  if (testMove) {
    return {
      ...gameState,
      board: newBoard,
      currentTurn: gameState.currentTurn === 'white' ? 'black' : 'white'
    };
  }
  
  // Update game state
  const newGameState: GameState = {
    ...gameState,
    board: newBoard,
    currentTurn: gameState.currentTurn === 'white' ? 'black' : 'white',
    halfmoveClock: capturedPiece || piece.type === 'pawn' ? 0 : gameState.halfmoveClock + 1,
    fullmoveNumber: gameState.currentTurn === 'black' ? gameState.fullmoveNumber + 1 : gameState.fullmoveNumber,
    isCheck: false,
    isCheckmate: false,
    isStalemate: false
  };
  
  // Update castling rights
  if (piece.type === 'king') {
    if (piece.color === 'white') {
      newGameState.castlingRights.whiteKingside = false;
      newGameState.castlingRights.whiteQueenside = false;
    } else {
      newGameState.castlingRights.blackKingside = false;
      newGameState.castlingRights.blackQueenside = false;
    }
  }
  
  if (piece.type === 'rook') {
    if (piece.color === 'white') {
      if (from.row === 7 && from.col === 0) newGameState.castlingRights.whiteQueenside = false;
      if (from.row === 7 && from.col === 7) newGameState.castlingRights.whiteKingside = false;
    } else {
      if (from.row === 0 && from.col === 0) newGameState.castlingRights.blackQueenside = false;
      if (from.row === 0 && from.col === 7) newGameState.castlingRights.blackKingside = false;
    }
  }
  
  // Update en passant target
  if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
    newGameState.enPassantTarget = {
      row: (from.row + to.row) / 2,
      col: from.col
    };
  } else {
    newGameState.enPassantTarget = null;
  }
  
  // Update captured pieces
  if (capturedPiece) {
    newGameState.capturedPieces[capturedPiece.color].push(capturedPiece);
  }
  
  // Add to move history
  const moveNotation = getMoveNotation(gameState, from, to, piece, capturedPiece);
  newGameState.moveHistory.push(moveNotation);
  
  return newGameState;
}

function getMoveNotation(gameState: GameState, from: Position, to: Position, piece: Piece, captured: Piece | null): string {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  
  const pieceSymbol = piece.type === 'pawn' ? '' : piece.type[0].toUpperCase();
  const fromSquare = files[from.col] + ranks[from.row];
  const toSquare = files[to.col] + ranks[to.row];
  const captureSymbol = captured ? 'x' : '';
  
  if (piece.type === 'pawn' && captured) {
    return `${files[from.col]}x${toSquare}`;
  }
  
  return `${pieceSymbol}${captureSymbol}${toSquare}`;
}

export function isCheck(gameState: GameState, color: PieceColor): boolean {
  const kingPosition = findKing(gameState.board, color);
  if (!kingPosition) return false;
  
  // Check if any opponent piece can attack the king
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color !== color) {
        const testState = { ...gameState, currentTurn: piece.color };
        if (isValidPieceMove(testState, piece, { row, col }, kingPosition)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

export function isCheckmate(gameState: GameState, color: PieceColor): boolean {
  if (!isCheck(gameState, color)) return false;
  
  // Check if any move can get out of check
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === color) {
        const moves = getAllValidMoves(gameState, { row, col });
        if (moves.length > 0) return false;
      }
    }
  }
  
  return true;
}

export function isStalemate(gameState: GameState, color: PieceColor): boolean {
  if (isCheck(gameState, color)) return false;
  
  // Check if any legal move exists
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece && piece.color === color) {
        const moves = getAllValidMoves(gameState, { row, col });
        if (moves.length > 0) return false;
      }
    }
  }
  
  return true;
}

export function getAllValidMoves(gameState: GameState, from: Position): Position[] {
  const validMoves: Position[] = [];
  const piece = gameState.board[from.row][from.col];
  
  if (!piece || piece.color !== gameState.currentTurn) return validMoves;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (isValidMove(gameState, from, { row, col })) {
        validMoves.push({ row, col });
      }
    }
  }
  
  return validMoves;
}

function findKing(board: Board, color: PieceColor): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}
export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export type Board = (Piece | null)[][];

export interface GameState {
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  winner: 'white' | 'black' | null;
}
import { Piece } from '../types/chess';

interface ChessPieceProps {
  piece: Piece;
}

const pieceUnicode: Record<string, Record<string, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
};

export default function ChessPiece({ piece }: ChessPieceProps) {
  const unicode = pieceUnicode[piece.color][piece.type];
  
  return (
    <div className={`chess-piece ${piece.color === 'white' ? 'text-white drop-shadow-lg' : 'text-gray-900'}`}>
      {unicode}
    </div>
  );
}
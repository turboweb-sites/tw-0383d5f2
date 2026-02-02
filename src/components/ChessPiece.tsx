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
    <div className={`chess-piece ${piece.color === 'white' ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : 'text-black drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]'}`}>
      {unicode}
    </div>
  );
}
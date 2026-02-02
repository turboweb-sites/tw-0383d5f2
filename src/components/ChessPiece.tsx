import { Piece } from '../types/chess';

interface ChessPieceProps {
  piece: Piece;
}

const pieceUnicode: Record<string, string> = {
  'white-king': '♔',
  'white-queen': '♕',
  'white-rook': '♖',
  'white-bishop': '♗',
  'white-knight': '♘',
  'white-pawn': '♙',
  'black-king': '♚',
  'black-queen': '♛',
  'black-rook': '♜',
  'black-bishop': '♝',
  'black-knight': '♞',
  'black-pawn': '♟',
};

export default function ChessPiece({ piece }: ChessPieceProps) {
  const pieceKey = `${piece.color}-${piece.type}`;
  const unicode = pieceUnicode[pieceKey];

  return (
    <div 
      className={`chess-piece ${piece.color === 'white' ? 'text-white drop-shadow-lg' : 'text-gray-900'}`}
      style={{ textShadow: piece.color === 'white' ? '2px 2px 3px rgba(0,0,0,0.5)' : 'none' }}
    >
      {unicode}
    </div>
  );
}
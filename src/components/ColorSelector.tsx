import { PieceColor } from '../types/chess';
import { Crown } from 'lucide-react';

interface ColorSelectorProps {
  onSelectColor: (color: PieceColor) => void;
}

export default function ColorSelector({ onSelectColor }: ColorSelectorProps) {
  return (
    <div className="bg-white rounded-xl shadow-2xl p-12 max-w-2xl mx-auto text-center">
      <div className="flex justify-center mb-8">
        <Crown className="w-16 h-16 text-yellow-500" />
      </div>
      
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Шахматы</h1>
      <p className="text-xl text-gray-600 mb-12">Выберите цвет фигур</p>
      
      <div className="grid grid-cols-2 gap-8">
        <button
          onClick={() => onSelectColor('white')}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-300 p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          <div className="relative z-10">
            <div className="text-8xl mb-4">♔</div>
            <h3 className="text-2xl font-bold text-gray-800">Белые</h3>
            <p className="text-gray-600 mt-2">Ходят первыми</p>
          </div>
        </button>
        
        <button
          onClick={() => onSelectColor('black')}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 p-8 transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          <div className="relative z-10">
            <div className="text-8xl mb-4 text-white">♚</div>
            <h3 className="text-2xl font-bold text-white">Чёрные</h3>
            <p className="text-gray-300 mt-2">Ходят вторыми</p>
          </div>
        </button>
      </div>
    </div>
  );
}
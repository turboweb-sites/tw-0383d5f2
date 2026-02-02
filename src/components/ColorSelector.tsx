import { Crown } from 'lucide-react';

interface ColorSelectorProps {
  onSelectColor: (color: 'white' | 'black') => void;
}

export default function ColorSelector({ onSelectColor }: ColorSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white text-center mb-6">Выберите цвет фигур</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelectColor('white')}
          className="group relative bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="text-6xl">♔</div>
            <span className="text-lg font-medium text-white">Белые</span>
            <span className="text-sm text-gray-300">Ходят первыми</span>
          </div>
          <div className="absolute inset-0 rounded-xl ring-2 ring-white/50 group-hover:ring-white/80 transition-all duration-300"></div>
        </button>

        <button
          onClick={() => onSelectColor('black')}
          className="group relative bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="text-6xl text-gray-900">♚</div>
            <span className="text-lg font-medium text-white">Черные</span>
            <span className="text-sm text-gray-300">Ходят вторыми</span>
          </div>
          <div className="absolute inset-0 rounded-xl ring-2 ring-gray-600 group-hover:ring-gray-400 transition-all duration-300"></div>
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
          <Crown className="w-4 h-4" />
          Сложность: Средний уровень
        </p>
      </div>
    </div>
  );
}
import React from 'react';
import { Plus, Minus, Target, MapPin } from 'lucide-react';

interface FloatingControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onMyLocation: () => void;
}

const FloatingControls: React.FC<FloatingControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onMyLocation
}) => {
  return (
    <div className="absolute top-20 right-4 z-50 flex flex-col space-y-1">
      <button
        onClick={onZoomIn}
        className="w-11 h-11 bg-white border-none rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center group"
        title="Увеличить"
      >
        <Plus className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
      </button>
      
      <button
        onClick={onZoomOut}
        className="w-11 h-11 bg-white border-none rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center group"
        title="Уменьшить"
      >
        <Minus className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
      </button>
      
      <button
        onClick={onRecenter}
        className="w-11 h-11 bg-white border-none rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center group"
        title="По центру"
      >
        <Target className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
      </button>
      
      <button
        onClick={onMyLocation}
        className="w-11 h-11 bg-white border-none rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center group"
        title="Моё местоположение"
      >
        <MapPin className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
      </button>
    </div>
  );
};

export default FloatingControls;
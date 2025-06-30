import React from 'react';

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue: number;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'auto';
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  maxValue,
  color = 'auto',
  showPercentage = true,
  size = 'md',
  animated = true
}) => {
  // Защита от undefined/null значений
  const safeValue = value ?? 0;
  const safeMaxValue = maxValue ?? 1;
  const percentage = Math.min((safeValue / safeMaxValue) * 100, 100);
  
  const getColor = () => {
    if (color !== 'auto') {
      const colors = {
        blue: 'bg-blue-500',
        green: 'bg-green-500', 
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
        purple: 'bg-purple-500'
      };
      return colors[color];
    }
    
    // Auto color based on percentage
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSize = () => {
    const sizes = {
      sm: 'h-1.5',
      md: 'h-2',
      lg: 'h-3'
    };
    return sizes[size];
  };

  const getBackgroundColor = () => {
    if (color !== 'auto') {
      const colors = {
        blue: 'bg-blue-100',
        green: 'bg-green-100',
        yellow: 'bg-yellow-100', 
        red: 'bg-red-100',
        purple: 'bg-purple-100'
      };
      return colors[color];
    }
    return 'bg-gray-200';
  };

  return (
    <div className="w-full">
      {/* Label and percentage */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {showPercentage && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{safeValue.toLocaleString()}</span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {percentage.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className={`w-full ${getBackgroundColor()} rounded-full ${getSize()} overflow-hidden`}>
        <div
          className={`${getSize()} ${getColor()} rounded-full transition-all duration-500 ease-out ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shine effect */}
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};

// Multi-segment progress bar
interface MultiProgressBarProps {
  label: string;
  segments: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  total: number;
  showLegend?: boolean;
}

const MultiProgressBar: React.FC<MultiProgressBarProps> = ({
  label,
  segments,
  total,
  showLegend = true
}) => {
  // Защита от undefined/null значений
  const safeTotal = total ?? 0;
  const safeSegments = segments ?? [];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">{safeTotal.toLocaleString()}</span>
      </div>

      {/* Multi-segment bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden flex">
        {safeSegments.map((segment, index) => {
          const segmentValue = segment?.value ?? 0;
          const width = safeTotal > 0 ? (segmentValue / safeTotal) * 100 : 0;
          return (
            <div
              key={index}
              className="h-full transition-all duration-500 ease-out"
              style={{ 
                width: `${width}%`,
                backgroundColor: segment?.color ?? '#e5e7eb'
              }}
              title={`${segment?.label ?? 'Unknown'}: ${segmentValue} (${width.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-3 flex flex-wrap gap-3">
          {safeSegments.map((segment, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment?.color ?? '#e5e7eb' }}
              />
              <span className="text-xs text-gray-600">
                {segment?.label ?? 'Unknown'}: {segment?.value ?? 0}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Главный компонент ProgressBars с демо данными
const ProgressBars: React.FC = () => {
  const progressData = [
    { label: 'Транспортная доступность', value: 85, maxValue: 100, color: 'green' as const },
    { label: 'Покрытие остановками', value: 72, maxValue: 100, color: 'blue' as const },
    { label: 'Качество дорог', value: 58, maxValue: 100, color: 'yellow' as const },
    { label: 'Экологичность', value: 45, maxValue: 100, color: 'red' as const },
  ];

  const multiSegmentData = {
    label: 'Распределение транспорта',
    segments: [
      { label: 'Автобусы', value: 120, color: '#3b82f6' },
      { label: 'Троллейбусы', value: 45, color: '#10b981' },
      { label: 'Маршрутки', value: 230, color: '#f59e0b' },
      { label: 'Метро', value: 15, color: '#8b5cf6' },
    ],
    total: 410
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-lg font-semibold mb-4">Показатели эффективности</h3>
        <div className="space-y-6">
          {progressData.map((item, index) => (
            <ProgressBar
              key={index}
              label={item.label}
              value={item.value}
              maxValue={item.maxValue}
              color={item.color}
            />
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-lg font-semibold mb-4">Структура транспорта</h3>
        <MultiProgressBar
          label={multiSegmentData.label}
          segments={multiSegmentData.segments}
          total={multiSegmentData.total}
        />
      </div>
    </div>
  );
};

export { ProgressBar, MultiProgressBar };
export default ProgressBars;
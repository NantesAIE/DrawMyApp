import React from 'react';

interface EraserTooltipProps {
  visible: boolean;
  x: number;
  y: number;
}

export const EraserTooltip: React.FC<EraserTooltipProps> = ({ visible, x, y }) => {
  if (!visible) return null;

  return (
    <div
      className="absolute bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-10"
      style={{
        left: x + 10,
        top: y - 30,
        pointerEvents: 'none',
      }}
    >
      Cliquez pour effacer
    </div>
  );
};
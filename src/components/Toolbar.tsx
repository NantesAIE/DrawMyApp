import React from 'react';
import { 
  Pen, 
  Square, 
  Circle, 
  ArrowRight, 
  Type, 
  Eraser,
  Undo,
  Redo,
  Trash2,
  Download,
  Palette
} from 'lucide-react';
import type { DrawingTool } from '../types/drawing';

interface ToolbarProps {
  currentTool: DrawingTool;
  currentColor: string;
  currentWidth: number;
  onToolChange: (tool: DrawingTool) => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const tools: { tool: DrawingTool; icon: React.ReactNode; label: string }[] = [
  { tool: 'pen', icon: <Pen size={20} />, label: 'Pinceau' },
  { tool: 'rectangle', icon: <Square size={20} />, label: 'Rectangle' },
  { tool: 'circle', icon: <Circle size={20} />, label: 'Cercle' },
  { tool: 'arrow', icon: <ArrowRight size={20} />, label: 'Flèche' },
  { tool: 'text', icon: <Type size={20} />, label: 'Texte' },
  { tool: 'eraser', icon: <Eraser size={20} />, label: 'Gomme' },
];

const colors = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
  '#800080', '#008000', '#800000', '#000080'
];

const widths = [1, 2, 4, 6, 8, 12];

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  currentColor,
  currentWidth,
  onToolChange,
  onColorChange,
  onWidthChange,
  onUndo,
  onRedo,
  onClear,
  onExport,
  canUndo,
  canRedo,
}) => {
  return (
    <div className="bg-white border-b border-gray-300 p-4 flex flex-wrap items-center gap-4">
      {/* Drawing Tools */}
      <div className="flex gap-2">
        {tools.map(({ tool, icon, label }) => (
          <button
            key={tool}
            onClick={() => onToolChange(tool)}
            className={`p-2 rounded-md border transition-colors ${
              currentTool === tool
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
            title={label}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-gray-300" />

      {/* Colors */}
      <div className="flex items-center gap-2">
        <Palette size={20} className="text-gray-600" />
        <div className="flex gap-1">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`w-8 h-8 rounded border-2 transition-transform ${
                currentColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              title={`Couleur: ${color}`}
            />
          ))}
          <input
            type="color"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            title="Choisir une couleur personnalisée"
          />
        </div>
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-gray-300" />

      {/* Width */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Épaisseur:</span>
        <select
          value={currentWidth}
          onChange={(e) => onWidthChange(Number(e.target.value))}
          className="px-2 py-1 border border-gray-300 rounded text-sm"
        >
          {widths.map(width => (
            <option key={width} value={width}>
              {width}px
            </option>
          ))}
        </select>
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-gray-300" />

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`p-2 rounded-md border transition-colors ${
            canUndo
              ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
          }`}
          title="Annuler"
        >
          <Undo size={20} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`p-2 rounded-md border transition-colors ${
            canRedo
              ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
          }`}
          title="Refaire"
        >
          <Redo size={20} />
        </button>
        <button
          onClick={onClear}
          className="p-2 rounded-md border bg-red-100 text-red-700 border-red-300 hover:bg-red-200 transition-colors"
          title="Effacer tout"
        >
          <Trash2 size={20} />
        </button>
        <button
          onClick={onExport}
          className="p-2 rounded-md border bg-green-100 text-green-700 border-green-300 hover:bg-green-200 transition-colors"
          title="Exporter en PNG"
        >
          <Download size={20} />
        </button>
      </div>
    </div>
  );
};
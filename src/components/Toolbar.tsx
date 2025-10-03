import React from 'react';
import { 
  Pen, 
  Square, 
  Circle, 
  ArrowRight, 
  Type, 
  Eraser,
  Image,
  Undo,
  Redo,
  Trash2,
  Download,
  Palette,
  MousePointer
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
  { tool: 'select', icon: <MousePointer size={20} />, label: 'Sélection' },
  { tool: 'pen', icon: <Pen size={20} />, label: 'Pinceau' },
  { tool: 'rectangle', icon: <Square size={20} />, label: 'Rectangle' },
  { tool: 'circle', icon: <Circle size={20} />, label: 'Cercle' },
  { tool: 'arrow', icon: <ArrowRight size={20} />, label: 'Flèche' },
  { tool: 'text', icon: <Type size={20} />, label: 'Texte' },
  { tool: 'image', icon: <Image size={20} />, label: 'Image' },
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
    <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center gap-6">
          {/* Drawing Tools */}
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
            {tools.map(({ tool, icon, label }) => (
              <button
                key={tool}
                onClick={() => onToolChange(tool)}
                className={`p-3 rounded-lg transition-all duration-200 font-medium ${
                  currentTool === tool
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-white hover:text-gray-800 hover:shadow-md'
                }`}
                title={label}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Colors */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Palette size={18} className="text-gray-500" />
              <span className="text-sm">Couleur</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-50 p-2 rounded-xl border border-gray-200">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                    currentColor === color 
                      ? 'border-gray-800 scale-110 shadow-lg' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Couleur: ${color}`}
                />
              ))}
              <input
                type="color"
                value={currentColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-8 h-8 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
                title="Choisir une couleur personnalisée"
              />
            </div>
          </div>

          {/* Width */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Épaisseur</span>
            <div className="relative">
              <select
                value={currentWidth}
                onChange={(e) => onWidthChange(Number(e.target.value))}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                {widths.map(width => (
                  <option key={width} value={width}>
                    {width}px
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  canUndo
                    ? 'text-gray-600 hover:bg-white hover:text-gray-800 hover:shadow-md'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Annuler"
              >
                <Undo size={18} />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  canRedo
                    ? 'text-gray-600 hover:bg-white hover:text-gray-800 hover:shadow-md'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Refaire"
              >
                <Redo size={18} />
              </button>
            </div>
            
            <button
              onClick={onClear}
              className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:shadow-md transition-all duration-200"
              title="Effacer tout"
            >
              <Trash2 size={18} />
            </button>
            
            <button
              onClick={onExport}
              className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              title="Exporter en PNG"
            >
              <Download size={18} />
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
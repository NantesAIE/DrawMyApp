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
  { tool: 'select', icon: <MousePointer size={16} />, label: 'Sélection' },
  { tool: 'pen', icon: <Pen size={16} />, label: 'Pinceau' },
  { tool: 'rectangle', icon: <Square size={16} />, label: 'Rectangle' },
  { tool: 'circle', icon: <Circle size={16} />, label: 'Cercle' },
  { tool: 'arrow', icon: <ArrowRight size={16} />, label: 'Flèche' },
  { tool: 'text', icon: <Type size={16} />, label: 'Texte' },
  { tool: 'image', icon: <Image size={16} />, label: 'Image' },
  { tool: 'eraser', icon: <Eraser size={16} />, label: 'Gomme' },
];

const colors = [
  '#1F2937', '#EF4444', '#10B981', '#3B82F6', 
  '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316',
  '#EC4899', '#84CC16', '#6366F1', '#14B8A6'
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
    <div className="fixed bottom-4 left-0 left-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg z-50 rounded-xl">
      <div className="max-w-full mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 overflow-x-auto">
          {/* Logo AIE */}
          <div className="flex-shrink-0">
            <img 
              src="src/assets/logo-aie.svg" 
              alt="Logo AIE" 
              className="h-8 w-auto transition-all duration-200 filter"
              style={{
                filter: 'brightness(0) saturate(100%) invert(27%) sepia(99%) saturate(2976%) hue-rotate(217deg) brightness(97%) contrast(97%)'
              }}
            />
          </div>

          {/* Outils centrés */}
          <div className="flex items-center gap-4 flex-1 justify-center">
            {/* Drawing Tools */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200 flex-shrink-0">
              {tools.map(({ tool, icon, label }) => (
                <button
                  key={tool}
                  onClick={() => onToolChange(tool)}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    currentTool === tool
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-white hover:text-gray-800'
                  }`}
                  title={label}
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* Colors */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Palette size={16} className="text-gray-500" />
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
                {colors.slice(0, 6).map(color => (
                  <button
                    key={color}
                    onClick={() => onColorChange(color)}
                    className={`w-6 h-6 rounded-md border-2 transition-all duration-200 ${
                      currentColor === color 
                        ? 'border-gray-800 scale-110' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Couleur: ${color}`}
                  />
                ))}
                {/* <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-6 h-6 rounded-md border-2 border-gray-300 cursor-pointer"
                  title="Couleur personnalisée"
                /> */}
              </div>
            </div>

            {/* Width */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-medium text-gray-700">Épaisseur</span>
              <select
                value={currentWidth}
                onChange={(e) => onWidthChange(Number(e.target.value))}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                {widths.map(width => (
                  <option key={width} value={width}>
                    {width}px
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    canUndo
                      ? 'text-gray-600 hover:bg-white hover:text-gray-800'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  title="Annuler"
                >
                  <Undo size={16} />
                </button>
                <button
                  onClick={onRedo}
                  disabled={!canRedo}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    canRedo
                      ? 'text-gray-600 hover:bg-white hover:text-gray-800'
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                  title="Refaire"
                >
                  <Redo size={16} />
                </button>
              </div>
              
              <button
                onClick={onClear}
                className="p-2 rounded-md bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all duration-200"
                title="Effacer tout"
              >
                <Trash2 size={16} />
              </button>
              
              <button
                onClick={onExport}
                className="px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md hover:from-green-600 hover:to-green-700 transition-all duration-200 text-xs font-medium shadow-md flex items-center gap-1"
                title="Exporter en PNG"
              >
                <Download size={14} />
                <span>Exporter</span>
              </button>
            </div>
          </div>

          {/* Espace pour équilibrer la mise en page */}
          <div className="flex-shrink-0 w-8"></div>
        </div>
      </div>
    </div>
  );
};
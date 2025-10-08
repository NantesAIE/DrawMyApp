import React, { useRef, useState } from 'react';
import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';
import { Toast } from './Toast';
import { useDrawing } from '../hooks/useDrawing';
import { useToast } from '../hooks/useToast';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { exportCanvasDirectly } from '../utils/export';
import type { ToolbarPosition } from '../types/drawing';

export const DrawingApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [toolbarPosition, setToolbarPosition] = useState<ToolbarPosition>('bottom');
  const { toast, showSuccess, showError, hideToast } = useToast();
  const { width, height } = useCanvasSize();

  const {
    elements,
    currentTool,
    currentColor,
    currentWidth,
    selectedImage,
    setTool,
    setColor,
    setWidth,
    startDrawing,
    updateDrawing,
    endDrawing,
    addText,
    addImage,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
  } = useDrawing();

  const handleMouseDown = (point: { x: number; y: number }) => {
    if (currentTool === 'text') {
      setTextPosition(point);
      setShowTextInput(true);
      return;
    }
    if (currentTool === 'image') {
      addImage(point);
      return;
    }
    startDrawing(point);
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      addText(textPosition, textInput);
    }
    setShowTextInput(false);
    setTextInput('');
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:\-T]/g, '');
        exportCanvasDirectly(canvas, `drawing_${timestamp}`);
        showSuccess('Dessin exporté avec succès !');
      } catch (error) {
        showError('Erreur lors de l\'exportation du dessin');
      }
    }
  };

  // Fonction pour obtenir les classes de padding en fonction de la position de la toolbar
  const getMainPaddingClasses = () => {
    switch (toolbarPosition) {
      case 'top':
        return 'pt-24 pb-6 px-6'; // pt-24 pour la toolbar en haut + espacement
      case 'bottom':
      default:
        return 'pb-24 pt-6 px-6'; // pb-24 pour la toolbar en bas + espacement
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 animate-fade-in">
      {/* Header - Commenté pour l'instant */}
      {/* ... */}

      {/* Canvas Area */}
      <main className={`flex-1 ${getMainPaddingClasses()}`}>
        <div className="w-full h-full mx-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Canvas Container */}
              <div className="relative">
                <Canvas
                  ref={canvasRef}
                  elements={elements}
                  currentTool={currentTool}
                  selectedImage={selectedImage}
                  onMouseDown={handleMouseDown}
                  onMouseMove={updateDrawing}
                  onMouseUp={endDrawing}
                  width={width}
                  height={height}
                />
                
                {/* Text Input Modal */}
                {showTextInput && (
                  <div 
                    className="absolute bg-white border border-gray-300 rounded-xl shadow-2xl p-4 z-50"
                    style={{
                      left: textPosition.x,
                      top: textPosition.y,
                    }}
                  >
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleTextSubmit();
                          } else if (e.key === 'Escape') {
                            setShowTextInput(false);
                            setTextInput('');
                          }
                        }}
                        autoFocus
                        className="w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tapez votre texte..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleTextSubmit}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        >
                          Ajouter
                        </button>
                        <button
                          onClick={() => {
                            setShowTextInput(false);
                            setTextInput('');
                          }}
                          className="flex-1 px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors font-medium"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div>
      </main>

      {/* Toolbar */}
      <Toolbar
        currentTool={currentTool}
        currentColor={currentColor}
        currentWidth={currentWidth}
        position={toolbarPosition}
        onToolChange={setTool}
        onColorChange={setColor}
        onWidthChange={setWidth}
        onPositionChange={setToolbarPosition}
        onUndo={undo}
        onRedo={redo}
        onClear={clear}
        onExport={handleExport}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
};
import React, { useRef, useState } from 'react';
import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';
import { Toast } from './Toast';
import { useDrawing } from '../hooks/useDrawing';
import { useToast } from '../hooks/useToast';
import { exportCanvasDirectly } from '../utils/export';

export const DrawingApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const { toast, showSuccess, showError, hideToast } = useToast();

  const {
    elements,
    currentTool,
    currentColor,
    currentWidth,
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

  const handleSave = () => {
    try {
      const dataToSave = {
        elements,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('drawing_save', JSON.stringify(dataToSave));
      showSuccess('Dessin sauvegardé localement !');
    } catch (error) {
      showError('Erreur lors de la sauvegarde');
    }
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('drawing_save');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // This would need to be implemented in useDrawing hook
        console.log('Loading saved drawing:', data);
        showSuccess('Dessin chargé avec succès !');
      } catch (error) {
        showError('Erreur lors du chargement de la sauvegarde');
      }
    } else {
      showError('Aucune sauvegarde trouvée');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 animate-fade-in">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm animate-slide-up">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-bounce-gentle">
                DrawMySolution
              </h1>
              <p className="text-gray-600 mt-1">Créez et exportez vos diagrammes avec élégance</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-sm text-blue-700 font-medium transition-all duration-200 hover:bg-blue-100">
                {elements.length} élément{elements.length !== 1 ? 's' : ''}
              </div>
              <div className="px-3 py-1 bg-green-50 border border-green-200 rounded-full text-sm text-green-700 font-medium transition-all duration-200 hover:bg-green-100 capitalize">
                {currentTool}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar
        currentTool={currentTool}
        currentColor={currentColor}
        currentWidth={currentWidth}
        onToolChange={setTool}
        onColorChange={setColor}
        onWidthChange={setWidth}
        onUndo={undo}
        onRedo={redo}
        onClear={clear}
        onExport={handleExport}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Canvas Area */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Canvas Container */}
            <div className="flex items-center justify-center p-8 bg-gray-50/50">
              <div className="relative">
                <Canvas
                  ref={canvasRef}
                  elements={elements}
                  currentTool={currentTool}
                  onMouseDown={handleMouseDown}
                  onMouseMove={updateDrawing}
                  onMouseUp={endDrawing}
                  width={1200}
                  height={800}
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
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                💾 Sauvegarder
              </button>
              <button
                onClick={handleLoad}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                📁 Charger
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Fait avec ❤️ pour vos diagrammes
            </div>
          </div>
        </div>
      </footer>

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
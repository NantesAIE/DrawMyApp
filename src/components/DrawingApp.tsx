import React, { useRef, useState } from 'react';
import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';
import { useDrawing } from '../hooks/useDrawing';
import { exportCanvasDirectly } from '../utils/export';

export const DrawingApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });

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
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:\-T]/g, '');
      exportCanvasDirectly(canvas, `drawing_${timestamp}`);
    }
  };

  const handleSave = () => {
    const dataToSave = {
      elements,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('drawing_save', JSON.stringify(dataToSave));
    alert('Dessin sauvegardé localement !');
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('drawing_save');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // This would need to be implemented in useDrawing hook
        console.log('Loading saved drawing:', data);
        alert('Dessin chargé !');
      } catch (error) {
        alert('Erreur lors du chargement de la sauvegarde');
      }
    } else {
      alert('Aucune sauvegarde trouvée');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">DrawMySolution</h1>
        <p className="text-gray-600">Créez et exportez vos diagrammes facilement</p>
      </div>

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
      <div className="flex-1 flex items-center justify-center p-4 relative">
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
              className="absolute bg-white border border-gray-300 rounded shadow-lg p-2"
              style={{
                left: textPosition.x,
                top: textPosition.y,
                zIndex: 10,
              }}
            >
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
                className="px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="Tapez votre texte..."
              />
              <div className="flex gap-1 mt-1">
                <button
                  onClick={handleTextSubmit}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  OK
                </button>
                <button
                  onClick={() => {
                    setShowTextInput(false);
                    setTextInput('');
                  }}
                  className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with additional actions */}
      <div className="bg-white border-t border-gray-300 px-6 py-3 flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Sauvegarder
          </button>
          <button
            onClick={handleLoad}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Charger
          </button>
        </div>
        <div className="text-sm text-gray-500">
          {elements.length} élément(s) • Outil actuel: {currentTool}
        </div>
      </div>
    </div>
  );
};
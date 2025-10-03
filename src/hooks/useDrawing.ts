import { useState, useCallback, useRef } from 'react';
import type { DrawingState, DrawingElement, DrawingTool, Point, DrawingPath, Shape } from '../types/drawing';

const initialState: DrawingState = {
  elements: [],
  currentTool: 'pen',
  currentColor: '#000000',
  currentWidth: 2,
  isDrawing: false,
  history: [[]],
  historyIndex: 0,
};

export const useDrawing = () => {
  const [state, setState] = useState<DrawingState>(initialState);
  const currentPathRef = useRef<DrawingPath | null>(null);
  const currentShapeRef = useRef<Shape | null>(null);

  // Helper function to check if a point is near a path
  const isPointNearPath = (point: Point, path: DrawingPath, tolerance: number = 10): boolean => {
    for (let i = 0; i < path.points.length - 1; i++) {
      const p1 = path.points[i];
      const p2 = path.points[i + 1];
      if (!p1 || !p2) continue;
      
      const distance = distancePointToLine(point, p1, p2);
      if (distance <= tolerance) return true;
    }
    return false;
  };

  // Helper function to check if a point is inside a shape
  const isPointInShape = (point: Point, shape: Shape): boolean => {
    if (!shape.startPoint || !shape.endPoint) return false;
    
    const { startPoint, endPoint } = shape;
    const minX = Math.min(startPoint.x, endPoint.x);
    const maxX = Math.max(startPoint.x, endPoint.x);
    const minY = Math.min(startPoint.y, endPoint.y);
    const maxY = Math.max(startPoint.y, endPoint.y);
    
    switch (shape.type) {
      case 'rectangle':
        return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
      
      case 'circle':
        const centerX = (startPoint.x + endPoint.x) / 2;
        const centerY = (startPoint.y + endPoint.y) / 2;
        const radius = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)) / 2;
        const distance = Math.sqrt(Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2));
        return distance <= radius;
      
      case 'arrow':
        return distancePointToLine(point, startPoint, endPoint) <= 10;
      
      case 'text':
        // Simple bounding box for text
        const textWidth = (shape.text?.length || 0) * shape.width * 4; // Approximation
        const textHeight = shape.width * 8;
        return point.x >= startPoint.x && point.x <= startPoint.x + textWidth &&
               point.y >= startPoint.y - textHeight && point.y <= startPoint.y;
      
      default:
        return false;
    }
  };

  // Helper function to calculate distance from point to line
  const distancePointToLine = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const setTool = useCallback((tool: DrawingTool) => {
    setState(prev => ({ ...prev, currentTool: tool }));
  }, []);

  const setColor = useCallback((color: string) => {
    setState(prev => ({ ...prev, currentColor: color }));
  }, []);

  const setWidth = useCallback((width: number) => {
    setState(prev => ({ ...prev, currentWidth: width }));
  }, []);

  const startDrawing = useCallback((point: Point) => {
    setState(prev => {
      // Handle eraser tool
      if (prev.currentTool === 'eraser') {
        // Find element to erase
        let elementToErase: DrawingElement | null = null;
        
        // Check shapes first (they are usually on top)
        for (let i = prev.elements.length - 1; i >= 0; i--) {
          const element = prev.elements[i];
          if ('points' in element) {
            // It's a path
            if (isPointNearPath(point, element as DrawingPath)) {
              elementToErase = element;
              break;
            }
          } else {
            // It's a shape
            if (isPointInShape(point, element as Shape)) {
              elementToErase = element;
              break;
            }
          }
        }
        
        if (elementToErase) {
          const newElements = prev.elements.filter(el => el.id !== elementToErase!.id);
          const newHistory = prev.history.slice(0, prev.historyIndex + 1);
          newHistory.push([...newElements]);
          
          return {
            ...prev,
            elements: newElements,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        }
        
        return prev;
      }
      
      // Normal drawing logic
      const newState = { ...prev, isDrawing: true };
      
      if (prev.currentTool === 'pen') {
        currentPathRef.current = {
          id: Date.now().toString(),
          points: [point],
          color: prev.currentColor,
          width: prev.currentWidth,
          tool: prev.currentTool,
        };
      } else if (['rectangle', 'circle', 'arrow', 'text'].includes(prev.currentTool)) {
        currentShapeRef.current = {
          id: Date.now().toString(),
          type: prev.currentTool as 'rectangle' | 'circle' | 'arrow' | 'text',
          startPoint: point,
          endPoint: point,
          color: prev.currentColor,
          width: prev.currentWidth,
        };
      }
      
      return newState;
    });
  }, []);

  const updateDrawing = useCallback((point: Point) => {
    setState(prev => {
      if (!prev.isDrawing || prev.currentTool === 'eraser') return prev;

      if (prev.currentTool === 'pen' && currentPathRef.current) {
        currentPathRef.current.points.push(point);
        return {
          ...prev,
          elements: [
            ...prev.elements.filter(el => el.id !== currentPathRef.current?.id),
            { ...currentPathRef.current! }
          ]
        };
      } else if (currentShapeRef.current) {
        currentShapeRef.current.endPoint = point;
        return {
          ...prev,
          elements: [
            ...prev.elements.filter(el => el.id !== currentShapeRef.current?.id),
            { ...currentShapeRef.current! }
          ]
        };
      }
      
      return prev;
    });
  }, []);

  const endDrawing = useCallback(() => {
    setState(prev => {
      if (prev.isDrawing && prev.currentTool !== 'eraser') {
        const newElements = [...prev.elements];
        const newHistory = prev.history.slice(0, prev.historyIndex + 1);
        newHistory.push([...newElements]);
        
        currentPathRef.current = null;
        currentShapeRef.current = null;
        
        return { 
          ...prev, 
          isDrawing: false,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      }
      return prev;
    });
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex > 0) {
        return {
          ...prev,
          historyIndex: prev.historyIndex - 1,
          elements: prev.history[prev.historyIndex - 1] || [],
        };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex < prev.history.length - 1) {
        return {
          ...prev,
          historyIndex: prev.historyIndex + 1,
          elements: prev.history[prev.historyIndex + 1] || [],
        };
      }
      return prev;
    });
  }, []);

  const clear = useCallback(() => {
    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([]);
      
      return {
        ...prev,
        elements: [],
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const addText = useCallback((point: Point, text: string) => {
    if (!text.trim()) return;

    setState(prev => {
      const textShape: Shape = {
        id: Date.now().toString(),
        type: 'text',
        startPoint: point,
        endPoint: point,
        color: prev.currentColor,
        width: prev.currentWidth,
        text: text.trim(),
      };

      const newElements = [...prev.elements, textShape];
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([...newElements]);
      
      return {
        ...prev,
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  return {
    ...state,
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
  };
};
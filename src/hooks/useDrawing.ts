import { useState, useCallback, useRef } from 'react';
import type { DrawingState, DrawingElement, DrawingTool, Point, DrawingPath, Shape, ImageElement, ResizeHandle } from '../types/drawing';
import { uploadImageFile, resizeImage } from '../utils/imageUtils';

const initialState: DrawingState = {
  elements: [],
  currentTool: 'pen',
  currentColor: '#000000',
  currentWidth: 2,
  isDrawing: false,
  history: [[]],
  historyIndex: 0,
  selectedImage: undefined,
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

  // Helper function to check if a point is inside an image
  const isPointInImage = (point: Point, image: ImageElement): boolean => {
    return point.x >= image.position.x && 
           point.x <= image.position.x + image.width &&
           point.y >= image.position.y && 
           point.y <= image.position.y + image.height;
  };

  // Helper function to get resize handles for an image
  const getResizeHandles = (image: ImageElement): ResizeHandle[] => {
    const { position, width, height } = image;
    const handleSize = 8;
    
    return [
      { x: position.x - handleSize/2, y: position.y - handleSize/2, type: 'nw' },
      { x: position.x + width - handleSize/2, y: position.y - handleSize/2, type: 'ne' },
      { x: position.x - handleSize/2, y: position.y + height - handleSize/2, type: 'sw' },
      { x: position.x + width - handleSize/2, y: position.y + height - handleSize/2, type: 'se' },
      { x: position.x + width/2 - handleSize/2, y: position.y - handleSize/2, type: 'n' },
      { x: position.x + width/2 - handleSize/2, y: position.y + height - handleSize/2, type: 's' },
      { x: position.x - handleSize/2, y: position.y + height/2 - handleSize/2, type: 'w' },
      { x: position.x + width - handleSize/2, y: position.y + height/2 - handleSize/2, type: 'e' },
    ];
  };

  // Helper function to check if a point is on a resize handle
  const getResizeHandle = (point: Point, image: ImageElement): ResizeHandle | null => {
    const handles = getResizeHandles(image);
    const handleSize = 8;
    
    for (const handle of handles) {
      if (point.x >= handle.x && point.x <= handle.x + handleSize &&
          point.y >= handle.y && point.y <= handle.y + handleSize) {
        return handle;
      }
    }
    return null;
  };

  // Function to select an image
  const selectImage = useCallback((imageId: string) => {
    setState(prev => {
      const imageElement = prev.elements.find(el => el.id === imageId && 'position' in el) as ImageElement;
      if (!imageElement) return prev;

      return {
        ...prev,
        selectedImage: {
          element: imageElement,
          isDragging: false,
          isResizing: false,
        }
      };
    });
  }, []);

  // Function to deselect image
  const deselectImage = useCallback(() => {
    setState(prev => ({ ...prev, selectedImage: undefined }));
  }, []);

  // Function to update selected image position
  const updateImagePosition = useCallback((imageId: string, newPosition: Point) => {
    setState(prev => {
      const newElements = prev.elements.map(el => {
        if (el.id === imageId && 'position' in el) {
          return { ...el, position: newPosition } as ImageElement;
        }
        return el;
      });

      // Update selected image if it's the one being moved
      const newSelectedImage = prev.selectedImage && prev.selectedImage.element.id === imageId 
        ? { ...prev.selectedImage, element: { ...prev.selectedImage.element, position: newPosition } }
        : prev.selectedImage;

      return {
        ...prev,
        elements: newElements,
        selectedImage: newSelectedImage,
      };
    });
  }, []);

  // Function to update selected image size
  const updateImageSize = useCallback((imageId: string, newWidth: number, newHeight: number, newPosition?: Point) => {
    setState(prev => {
      const newElements = prev.elements.map(el => {
        if (el.id === imageId && 'position' in el) {
          const updated = { ...el, width: newWidth, height: newHeight } as ImageElement;
          if (newPosition) {
            updated.position = newPosition;
          }
          return updated;
        }
        return el;
      });

      // Update selected image if it's the one being resized
      const newSelectedImage = prev.selectedImage && prev.selectedImage.element.id === imageId 
        ? { 
            ...prev.selectedImage, 
            element: { 
              ...prev.selectedImage.element, 
              width: newWidth, 
              height: newHeight,
              position: newPosition || prev.selectedImage.element.position
            } 
          }
        : prev.selectedImage;

      return {
        ...prev,
        elements: newElements,
        selectedImage: newSelectedImage,
      };
    });
  }, []);

  // Function to save current state to history
  const saveToHistory = useCallback(() => {
    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push([...prev.elements]);
      
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);
    
    const addImage = useCallback(async (point: Point) => {
    try {
      const { imageData, width, height } = await uploadImageFile();
      
      // Resize image if too large (max 400x400 for canvas)
      const maxSize = 400;
      const resizedImage = await resizeImage(imageData, maxSize, maxSize);
      
      setState(prev => {
        const imageElement: ImageElement = {
          id: Date.now().toString(),
          type: 'image',
          position: point,
          width: resizedImage.width,
          height: resizedImage.height,
          imageData: resizedImage.imageData,
          originalWidth: width,
          originalHeight: height,
        };

        const newElements = [...prev.elements, imageElement];
        const newHistory = prev.history.slice(0, prev.historyIndex + 1);
        newHistory.push([...newElements]);
        
        return {
          ...prev,
          elements: newElements,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'image:', error);
      alert('Erreur lors du chargement de l\'image. Veuillez réessayer.');
    }
  }, []);

  const startDrawing = useCallback((point: Point) => {
    setState(prev => {
      // Handle select tool - check for image selection first
      if (prev.currentTool === 'select') {
        // Check if clicking on a resize handle of selected image
        if (prev.selectedImage) {
          const resizeHandle = getResizeHandle(point, prev.selectedImage.element);
          if (resizeHandle) {
            return {
              ...prev,
              selectedImage: {
                ...prev.selectedImage,
                isResizing: true,
                resizeHandle,
              }
            };
          }
          
          // Check if clicking on the selected image to drag it
          if (isPointInImage(point, prev.selectedImage.element)) {
            return {
              ...prev,
              selectedImage: {
                ...prev.selectedImage,
                isDragging: true,
                dragOffset: {
                  x: point.x - prev.selectedImage.element.position.x,
                  y: point.y - prev.selectedImage.element.position.y,
                }
              }
            };
          }
        }
        
        // Check for image selection
        for (let i = prev.elements.length - 1; i >= 0; i--) {
          const element = prev.elements[i];
          if ('position' in element && isPointInImage(point, element as ImageElement)) {
            const imageElement = element as ImageElement;
            return {
              ...prev,
              selectedImage: {
                element: imageElement,
                isDragging: true,
                isResizing: false,
                dragOffset: {
                  x: point.x - imageElement.position.x,
                  y: point.y - imageElement.position.y,
                }
              }
            };
          }
        }
        
        // If clicking on empty space, deselect
        return { ...prev, selectedImage: undefined };
      }

      // Handle image tool
      if (prev.currentTool === 'image') {
        // Don't set isDrawing for image tool
        addImage(point);
        return prev;
      }
      
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
          } else if ('startPoint' in element) {
            // It's a shape
            if (isPointInShape(point, element as Shape)) {
              elementToErase = element;
              break;
            }
          } else if ('position' in element) {
            // It's an image
            const img = element as ImageElement;
            if (point.x >= img.position.x && point.x <= img.position.x + img.width &&
                point.y >= img.position.y && point.y <= img.position.y + img.height) {
              elementToErase = element;
              break;
            }
          }
        }
        
        if (elementToErase) {
          const newElements = prev.elements.filter(el => el.id !== elementToErase!.id);
          const newHistory = prev.history.slice(0, prev.historyIndex + 1);
          newHistory.push([...newElements]);
          
          // Deselect if the erased element was selected
          const newSelectedImage = prev.selectedImage?.element.id === elementToErase.id 
            ? undefined 
            : prev.selectedImage;
          
          return {
            ...prev,
            elements: newElements,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            selectedImage: newSelectedImage,
          };
        }
        
        return prev;
      }
      
      // Normal drawing logic - deselect any selected image when starting to draw
      const newState = { ...prev, isDrawing: true, selectedImage: undefined };
      
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
  }, [addImage, isPointInImage, getResizeHandle, isPointNearPath, isPointInShape]);

  const updateDrawing = useCallback((point: Point) => {
    setState(prev => {
      // Handle image dragging
      if (prev.selectedImage?.isDragging && prev.selectedImage.dragOffset) {
        const newPosition = {
          x: point.x - prev.selectedImage.dragOffset.x,
          y: point.y - prev.selectedImage.dragOffset.y,
        };
        
        // Update the image position
        updateImagePosition(prev.selectedImage.element.id, newPosition);
        return prev;
      }
      
      // Handle image resizing
      if (prev.selectedImage?.isResizing && prev.selectedImage.resizeHandle) {
        const handle = prev.selectedImage.resizeHandle;
        const img = prev.selectedImage.element;
        let newWidth = img.width;
        let newHeight = img.height;
        let newPosition = img.position;
        
        const aspectRatio = img.originalWidth / img.originalHeight;
        
        switch (handle.type) {
          case 'se': // Bottom-right
            newWidth = Math.max(20, point.x - img.position.x);
            newHeight = Math.max(20, point.y - img.position.y);
            // Maintain aspect ratio
            if (newWidth / aspectRatio !== newHeight) {
              newHeight = newWidth / aspectRatio;
            }
            break;
          case 'sw': // Bottom-left
            newWidth = Math.max(20, img.position.x + img.width - point.x);
            newHeight = Math.max(20, point.y - img.position.y);
            newPosition = { x: point.x, y: img.position.y };
            // Maintain aspect ratio
            if (newWidth / aspectRatio !== newHeight) {
              newHeight = newWidth / aspectRatio;
            }
            break;
          case 'ne': // Top-right
            newWidth = Math.max(20, point.x - img.position.x);
            newHeight = Math.max(20, img.position.y + img.height - point.y);
            newPosition = { x: img.position.x, y: point.y };
            // Maintain aspect ratio
            if (newWidth / aspectRatio !== newHeight) {
              newHeight = newWidth / aspectRatio;
              newPosition.y = img.position.y + img.height - newHeight;
            }
            break;
          case 'nw': // Top-left
            newWidth = Math.max(20, img.position.x + img.width - point.x);
            newHeight = Math.max(20, img.position.y + img.height - point.y);
            newPosition = { x: point.x, y: point.y };
            // Maintain aspect ratio
            if (newWidth / aspectRatio !== newHeight) {
              newHeight = newWidth / aspectRatio;
              newPosition.y = img.position.y + img.height - newHeight;
            }
            break;
          case 'n': // Top
            newHeight = Math.max(20, img.position.y + img.height - point.y);
            newWidth = newHeight * aspectRatio;
            newPosition = { x: img.position.x - (newWidth - img.width) / 2, y: point.y };
            break;
          case 's': // Bottom
            newHeight = Math.max(20, point.y - img.position.y);
            newWidth = newHeight * aspectRatio;
            newPosition = { x: img.position.x - (newWidth - img.width) / 2, y: img.position.y };
            break;
          case 'w': // Left
            newWidth = Math.max(20, img.position.x + img.width - point.x);
            newHeight = newWidth / aspectRatio;
            newPosition = { x: point.x, y: img.position.y - (newHeight - img.height) / 2 };
            break;
          case 'e': // Right
            newWidth = Math.max(20, point.x - img.position.x);
            newHeight = newWidth / aspectRatio;
            newPosition = { x: img.position.x, y: img.position.y - (newHeight - img.height) / 2 };
            break;
        }
        
        updateImageSize(img.id, newWidth, newHeight, newPosition);
        return prev;
      }

      if (!prev.isDrawing || prev.currentTool === 'eraser' || prev.currentTool === 'select') return prev;

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
  }, [updateImagePosition, updateImageSize]);

  const endDrawing = useCallback(() => {
    setState(prev => {
      // Handle end of image dragging or resizing
      if (prev.selectedImage?.isDragging || prev.selectedImage?.isResizing) {
        // Save to history when finishing drag or resize
        saveToHistory();
        
        return {
          ...prev,
          selectedImage: prev.selectedImage ? {
            ...prev.selectedImage,
            isDragging: false,
            isResizing: false,
            dragOffset: undefined,
            resizeHandle: undefined,
          } : undefined,
        };
      }

      if (prev.isDrawing && prev.currentTool !== 'eraser' && prev.currentTool !== 'select') {
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
  }, [saveToHistory]);

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
    addImage,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
    selectImage,
    deselectImage,
    updateImagePosition,
    updateImageSize,
    getResizeHandles,
    isPointInImage,
  };
};
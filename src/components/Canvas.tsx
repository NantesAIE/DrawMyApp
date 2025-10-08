import React, { useEffect, useCallback, forwardRef, useRef } from 'react';
import type { Point, DrawingElement, DrawingPath, Shape, ImageElement, SelectedImage } from '../types/drawing';

interface CanvasProps {
  elements: DrawingElement[];
  currentTool: string;
  selectedImage?: SelectedImage;
  onMouseDown: (point: Point) => void;
  onMouseMove: (point: Point) => void;
  onMouseUp: () => void;
  width: number;
  height: number;
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({
  elements,
  currentTool,
  selectedImage,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  width,
  height,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Expose the canvas ref to parent component
  React.useImperativeHandle(ref, () => canvasRef.current!, []);
  
  // Determine cursor based on current tool
  const getCursor = useCallback(() => {
    // If we're hovering over a resize handle, show resize cursor
    if (selectedImage && currentTool === 'select') {
      if (selectedImage.isResizing && selectedImage.resizeHandle) {
        const handle = selectedImage.resizeHandle;
        switch (handle.type) {
          case 'nw':
          case 'se':
            return 'nw-resize';
          case 'ne':
          case 'sw':
            return 'ne-resize';
          case 'n':
          case 's':
            return 'ns-resize';
          case 'e':
          case 'w':
            return 'ew-resize';
          default:
            return 'default';
        }
      }
      
      if (selectedImage.isDragging) {
        return 'grabbing';
      }
      
      return 'grab';
    }
    
    switch (currentTool) {
      case 'eraser':
        return 'pointer';
      case 'text':
        return 'text';
      case 'image':
        return 'copy';
      case 'select':
        return 'default';
      case 'pen':
        return 'crosshair';
      default:
        return 'crosshair';
    }
  }, [currentTool, selectedImage]);

  const drawPath = useCallback((ctx: CanvasRenderingContext2D, path: DrawingPath) => {
    if (!path.points || path.points.length < 2 || !path.points[0]) return;

    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);

    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x, path.points[i].y);
    }

    ctx.stroke();
  }, []);

  const drawShape = useCallback((ctx: CanvasRenderingContext2D, shape: Shape) => {
    if (!shape.startPoint || !shape.endPoint) return;
    
    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.width;

    const { startPoint, endPoint } = shape;
    const width = endPoint.x - startPoint.x;
    const height = endPoint.y - startPoint.y;

    switch (shape.type) {
      case 'rectangle':
        ctx.strokeRect(startPoint.x, startPoint.y, width, height);
        break;
      
      case 'circle':
        const radius = Math.sqrt(width * width + height * height) / 2;
        const centerX = startPoint.x + width / 2;
        const centerY = startPoint.y + height / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      
      case 'arrow':
        // Draw line
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(height, width);
        const arrowLength = 20;
        const arrowAngle = Math.PI / 6;

        ctx.beginPath();
        ctx.moveTo(endPoint.x, endPoint.y);
        ctx.lineTo(
          endPoint.x - arrowLength * Math.cos(angle - arrowAngle),
          endPoint.y - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(endPoint.x, endPoint.y);
        ctx.lineTo(
          endPoint.x - arrowLength * Math.cos(angle + arrowAngle),
          endPoint.y - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.stroke();
        break;
      
      case 'text':
        if (shape.text) {
          ctx.fillStyle = shape.color;
          ctx.font = `${shape.width * 8}px Arial`;
          ctx.fillText(shape.text, startPoint.x, startPoint.y);
        }
        break;
    }
  }, []);

  const drawImage = useCallback((ctx: CanvasRenderingContext2D, imageElement: ImageElement) => {
    const cachedImage = imageCache.current.get(imageElement.id);
    if (cachedImage && cachedImage.complete) {
      ctx.drawImage(cachedImage, imageElement.position.x, imageElement.position.y, imageElement.width, imageElement.height);
    }
  }, []);

  // Function to draw selection outline and resize handles
  const drawImageSelection = useCallback((ctx: CanvasRenderingContext2D, imageElement: ImageElement) => {
    const { position, width, height } = imageElement;
    
    // Draw selection outline
    ctx.strokeStyle = '#0066cc';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(position.x - 2, position.y - 2, width + 4, height + 4);
    ctx.setLineDash([]);
    
    // Draw resize handles
    const handleSize = 8;
    const handles = [
      { x: position.x - handleSize/2, y: position.y - handleSize/2 }, // nw
      { x: position.x + width - handleSize/2, y: position.y - handleSize/2 }, // ne
      { x: position.x - handleSize/2, y: position.y + height - handleSize/2 }, // sw
      { x: position.x + width - handleSize/2, y: position.y + height - handleSize/2 }, // se
      { x: position.x + width/2 - handleSize/2, y: position.y - handleSize/2 }, // n
      { x: position.x + width/2 - handleSize/2, y: position.y + height - handleSize/2 }, // s
      { x: position.x - handleSize/2, y: position.y + height/2 - handleSize/2 }, // w
      { x: position.x + width - handleSize/2, y: position.y + height/2 - handleSize/2 }, // e
    ];
    
    ctx.fillStyle = '#0066cc';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
  }, []);

  // Preload images function
  const preloadImages = useCallback(() => {
    const imageElements = elements.filter(el => 'position' in el) as ImageElement[];
    
    imageElements.forEach(imageElement => {
      if (!imageCache.current.has(imageElement.id)) {
        const img = new Image();
        img.onload = () => {
          imageCache.current.set(imageElement.id, img);
          // Trigger a redraw when image loads
          redraw();
        };
        img.src = imageElement.imageData;
        imageCache.current.set(imageElement.id, img);
      }
    });
  }, [elements]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw images first (background layer)
    elements.forEach(element => {
      if ('position' in element) {
        drawImage(ctx, element as ImageElement);
      }
    });

    // Draw other elements on top (foreground layer)
    elements.forEach(element => {
      if ('points' in element) {
        drawPath(ctx, element as DrawingPath);
      } else if ('startPoint' in element) {
        drawShape(ctx, element as Shape);
      }
    });

    // Draw selection overlay for selected image
    if (selectedImage && currentTool === 'select') {
      drawImageSelection(ctx, selectedImage.element);
    }
  }, [elements, selectedImage, currentTool, drawPath, drawShape, drawImage, drawImageSelection]);

  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const getTouchPos = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);
    onMouseDown(point);
  }, [getMousePos, onMouseDown]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);
    onMouseMove(point);
  }, [getMousePos, onMouseMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Empêche le comportement par défaut (scroll, zoom, etc.)
    const point = getTouchPos(e);
    onMouseDown(point);
  }, [getTouchPos, onMouseDown]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Empêche le scroll pendant le dessin
    const point = getTouchPos(e);
    onMouseMove(point);
  }, [getTouchPos, onMouseMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    onMouseUp();
  }, [onMouseUp]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="border-2 border-gray-200 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
      style={{ display: 'block', cursor: getCursor(), touchAction: 'none' }}
    />
  );
});
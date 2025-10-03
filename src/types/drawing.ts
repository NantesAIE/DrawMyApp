export interface Point {
  x: number;
  y: number;
}

export interface DrawingPath {
  id: string;
  points: Point[];
  color: string;
  width: number;
  tool: DrawingTool;
}

export interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow' | 'text';
  startPoint: Point;
  endPoint: Point;
  color: string;
  width: number;
  text?: string;
}

export interface ImageElement {
  id: string;
  type: 'image';
  position: Point;
  width: number;
  height: number;
  imageData: string; // base64 encoded image
  originalWidth: number;
  originalHeight: number;
}

export type DrawingElement = DrawingPath | Shape | ImageElement;

export type DrawingTool = 'pen' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'eraser' | 'image';

export interface DrawingState {
  elements: DrawingElement[];
  currentTool: DrawingTool;
  currentColor: string;
  currentWidth: number;
  isDrawing: boolean;
  history: DrawingElement[][];
  historyIndex: number;
}
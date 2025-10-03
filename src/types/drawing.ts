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

export type DrawingElement = DrawingPath | Shape;

export type DrawingTool = 'pen' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'eraser';

export interface DrawingState {
  elements: DrawingElement[];
  currentTool: DrawingTool;
  currentColor: string;
  currentWidth: number;
  isDrawing: boolean;
  history: DrawingElement[][];
  historyIndex: number;
}
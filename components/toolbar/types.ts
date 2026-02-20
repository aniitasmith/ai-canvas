export type Tool = "select" | "hand" | "brush" | "text";
export type ShapeType = "rect" | "circle" | "triangle";

export interface ToolConfig {
  id: Tool;
  icon: string;
  label: string;
}

export interface ShapeConfig {
  id: ShapeType;
  icon: string;
  label: string;
}

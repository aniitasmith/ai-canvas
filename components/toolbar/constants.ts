import { ToolConfig, ShapeConfig } from "./types";

export const TOOLS: ToolConfig[] = [
  { 
    id: "select", 
    icon: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122", 
    label: "Select" 
  },
  { 
    id: "hand", 
    icon: "M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11", 
    label: "Hand (Pan)" 
  },
  { 
    id: "brush", 
    icon: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42", 
    label: "Brush" 
  },
  { 
    id: "text", 
    icon: "TEXT_ICON", 
    label: "Text" 
  },
];

export const SHAPES: ShapeConfig[] = [
  { 
    id: "rect", 
    icon: "M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z", 
    label: "Rectangle" 
  },
  { 
    id: "circle", 
    icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z", 
    label: "Circle" 
  },
  { 
    id: "triangle", 
    icon: "M12 4L3 20h18L12 4z", 
    label: "Triangle" 
  },
];

export const CANVAS_BACKGROUND_COLOR = "#f8fafc";
export const MAX_HISTORY_LENGTH = 50;

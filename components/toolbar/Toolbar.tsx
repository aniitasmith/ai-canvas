import { Tool, ShapeType } from "./types";
import { TOOLS } from "./constants";
import ToolButton from "./ToolButton";
import ShapesMenu from "./ShapesMenu";
import ColorSizeControls from "./ColorSizeControls";
import LayerControls from "./LayerControls";
import HistoryControls from "./HistoryControls";
import { ResetViewIcon } from "../icons";

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
  showShapesMenu: boolean;
  onToggleShapesMenu: () => void;
  onSelectShape: (type: ShapeType) => void;
  brushColor: string;
  brushSize: number;
  textColor: string;
  textSize: number;
  onBrushColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onTextColorChange: (color: string) => void;
  onTextSizeChange: (size: number) => void;
  onSendToBack: () => void;
  onSendBackward: () => void;
  onBringForward: () => void;
  onBringToFront: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onResetView: () => void;
}

function Separator() {
  return <div className="w-px h-6 bg-slate-300 mx-1" />;
}

export default function Toolbar({
  activeTool,
  onToolChange,
  showShapesMenu,
  onToggleShapesMenu,
  onSelectShape,
  brushColor,
  brushSize,
  textColor,
  textSize,
  onBrushColorChange,
  onBrushSizeChange,
  onTextColorChange,
  onTextSizeChange,
  onSendToBack,
  onSendBackward,
  onBringForward,
  onBringToFront,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onResetView,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-2 bg-white border-b border-slate-200 relative z-30">
      <HistoryControls
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
      />

      <Separator />

      {TOOLS.map((tool) => (
        <ToolButton
          key={tool.id}
          tool={tool}
          isActive={activeTool === tool.id}
          onClick={onToolChange}
        />
      ))}

      <Separator />

      <ShapesMenu
        isOpen={showShapesMenu}
        onToggle={onToggleShapesMenu}
        onSelectShape={onSelectShape}
      />

      <Separator />

      <ColorSizeControls
        activeTool={activeTool}
        brushColor={brushColor}
        brushSize={brushSize}
        textColor={textColor}
        textSize={textSize}
        onBrushColorChange={onBrushColorChange}
        onBrushSizeChange={onBrushSizeChange}
        onTextColorChange={onTextColorChange}
        onTextSizeChange={onTextSizeChange}
      />

      <Separator />

      <LayerControls
        onSendToBack={onSendToBack}
        onSendBackward={onSendBackward}
        onBringForward={onBringForward}
        onBringToFront={onBringToFront}
      />

      <button
        onClick={onResetView}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 ml-auto"
        title="Reset View"
      >
        <ResetViewIcon />
      </button>
    </div>
  );
}

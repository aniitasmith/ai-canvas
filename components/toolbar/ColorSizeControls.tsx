import { Tool } from "./types";

interface ColorSizeControlsProps {
  activeTool: Tool;
  brushColor: string;
  brushSize: number;
  textColor: string;
  textSize: number;
  onBrushColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onTextColorChange: (color: string) => void;
  onTextSizeChange: (size: number) => void;
}

export default function ColorSizeControls({
  activeTool,
  brushColor,
  brushSize,
  textColor,
  textSize,
  onBrushColorChange,
  onBrushSizeChange,
  onTextColorChange,
  onTextSizeChange,
}: ColorSizeControlsProps) {
  const isEnabled = activeTool === "brush" || activeTool === "text";
  const isTextMode = activeTool === "text";

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTextMode) {
      onTextColorChange(e.target.value);
    } else {
      onBrushColorChange(e.target.value);
    }
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (isTextMode) {
      onTextSizeChange(value);
    } else {
      onBrushSizeChange(value);
    }
  };

  return (
    <>
      <input
        type="color"
        value={isTextMode ? textColor : brushColor}
        onChange={handleColorChange}
        disabled={!isEnabled}
        className={`w-8 h-8 rounded ${
          isEnabled ? "cursor-pointer" : "cursor-not-allowed opacity-50"
        }`}
        title={isTextMode ? "Text Color" : "Brush Color"}
      />
      <input
        type="range"
        min={isTextMode ? "12" : "1"}
        max={isTextMode ? "120" : "50"}
        value={isTextMode ? textSize : brushSize}
        onChange={handleSizeChange}
        disabled={!isEnabled}
        className={`w-20 ${
          isEnabled ? "" : "cursor-not-allowed opacity-50"
        }`}
        title={isTextMode ? "Text Size" : "Brush Size"}
      />
    </>
  );
}

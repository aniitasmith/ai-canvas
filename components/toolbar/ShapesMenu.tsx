import { useRef } from "react";
import { ShapeType } from "./types";
import { SHAPES } from "./constants";
import { RectangleIcon, ChevronDownIcon, CircleIcon, TriangleIcon } from "../icons";

interface ShapesMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectShape: (type: ShapeType) => void;
}

const shapeIcons: Record<ShapeType, React.ComponentType<{ className?: string }>> = {
  rect: RectangleIcon,
  circle: CircleIcon,
  triangle: TriangleIcon,
};

export default function ShapesMenu({ isOpen, onToggle, onSelectShape }: ShapesMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={onToggle}
        className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
          isOpen
            ? "bg-purple-100 text-purple-700"
            : "hover:bg-slate-100 text-slate-600"
        }`}
        title="Shapes"
      >
        <RectangleIcon />
        <ChevronDownIcon />
      </button>

      {isOpen && buttonRef.current && (
        <div 
          className="fixed bg-white rounded-lg shadow-xl border border-slate-200 p-1 z-[9999]"
          style={{
            top: buttonRef.current.getBoundingClientRect().bottom + 4,
            left: buttonRef.current.getBoundingClientRect().left,
          }}
        >
          {SHAPES.map((shape) => {
            const IconComponent = shapeIcons[shape.id];
            return (
              <button
                key={shape.id}
                onClick={() => onSelectShape(shape.id)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600 text-sm whitespace-nowrap"
              >
                <IconComponent />
                {shape.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

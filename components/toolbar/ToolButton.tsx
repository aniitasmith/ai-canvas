import { Tool, ToolConfig } from "./types";
import { TextIcon, ToolIcon } from "../icons";

interface ToolButtonProps {
  tool: ToolConfig;
  isActive: boolean;
  onClick: (id: Tool) => void;
}

export default function ToolButton({ tool, isActive, onClick }: ToolButtonProps) {
  const isTextTool = tool.id === "text";

  return (
    <button
      onClick={() => onClick(tool.id)}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? "bg-purple-100 text-purple-700"
          : "hover:bg-slate-100 text-slate-600"
      }`}
      title={tool.label}
    >
      {isTextTool ? (
        <TextIcon />
      ) : (
        <ToolIcon path={tool.icon} />
      )}
    </button>
  );
}

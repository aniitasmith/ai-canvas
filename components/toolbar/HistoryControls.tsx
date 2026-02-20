import { UndoIcon, RedoIcon } from "../icons";

interface HistoryControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export default function HistoryControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: HistoryControlsProps) {
  return (
    <>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`p-2 rounded-lg transition-colors ${
          canUndo ? "hover:bg-slate-100 text-slate-600" : "text-slate-300 cursor-not-allowed"
        }`}
        title="Undo (Ctrl+Z)"
      >
        <UndoIcon />
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`p-2 rounded-lg transition-colors ${
          canRedo ? "hover:bg-slate-100 text-slate-600" : "text-slate-300 cursor-not-allowed"
        }`}
        title="Redo (Ctrl+Y)"
      >
        <RedoIcon />
      </button>
    </>
  );
}

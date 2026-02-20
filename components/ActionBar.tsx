import { TrashIcon, RefreshIcon, DownloadIcon } from "./icons";

interface ActionBarProps {
  onDelete: () => void;
  onClear: () => void;
  onDownload: () => void;
}

export default function ActionBar({ onDelete, onClear, onDownload }: ActionBarProps) {
  return (
    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
      <div className="flex gap-2">
        <button
          onClick={onDelete}
          className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
          title="Delete selected"
        >
          <TrashIcon />
          Delete
        </button>
        <button
          onClick={onClear}
          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
          title="Clear canvas"
        >
          <RefreshIcon />
          Clear All
        </button>
      </div>

      <button
        onClick={onDownload}
        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
      >
        <DownloadIcon />
        Download
      </button>
    </div>
  );
}

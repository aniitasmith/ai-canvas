interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export default function PromptInput({
  value,
  onChange,
  onSubmit,
  loading,
  error,
}: PromptInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      onSubmit();
    }
  };

  return (
    <div className="p-4 border-b border-slate-200">
      <div className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your emoji: a happy cat, a cute robot, a dancing pizza..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-800"
          disabled={loading}
        />
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-medium rounded-xl transition-all disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? "Creating..." : "Generate Emoji"}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-red-600 text-sm">{error}</p>
      )}

      <p className="mt-3 text-slate-500 text-sm">
        Tip: Use the hand tool to pan the canvas, scroll to zoom. Add shapes, text, or draw to customize!
      </p>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import Canvas, { CanvasRef } from "@/components/Canvas";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<CanvasRef>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate emoji");
      }

      setImageUrl(data.imageUrl);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.exportImage();
    if (!dataUrl) return;

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `emoji-canvas-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDeleteSelected = () => {
    canvasRef.current?.deleteSelected();
  };

  const handleClearCanvas = () => {
    canvasRef.current?.clearCanvas();
    setImageUrl(null);
  };

  return (
    <main className="min-h-screen p-4">
      <div className="w-full">
        <header className="text-center mb-4">
          <h1 className="text-3xl font-bold text-white mb-1">
            Emoji Canvas Generator
          </h1>
          <p className="text-white/80 text-sm">
            Generate cute emoji-style images with AI and create your own compositions!
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: "calc(100vh - 140px)", minHeight: "600px" }}>
          <div className="p-4 border-b border-slate-200">
            <div className="flex gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleGenerate()}
                placeholder="Describe your emoji: a happy cat, a cute robot, a dancing pizza..."
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-800"
                disabled={loading}
              />
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
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

          <Canvas ref={canvasRef} imageUrl={imageUrl} loading={loading} />

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
                title="Delete selected"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
              <button
                onClick={handleClearCanvas}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
                title="Clear canvas"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Clear All
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>

        <footer className="mt-2 text-center text-white/60 text-xs">
          Powered by Hugging Face & FLUX
        </footer>
      </div>
    </main>
  );
}

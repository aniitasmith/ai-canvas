"use client";

import { useState, useRef, useCallback } from "react";
import Canvas, { CanvasRef } from "@/components/Canvas";
import PromptInput from "@/components/PromptInput";
import ActionBar from "@/components/ActionBar";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<CanvasRef>(null);

  const handleGenerate = useCallback(async () => {
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
  }, [prompt]);

  const handleDownload = useCallback(() => {
    const dataUrl = canvasRef.current?.exportImage();
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `emoji-canvas-${Date.now()}.png`;
    link.click();
  }, []);

  const handleDeleteSelected = useCallback(() => {
    canvasRef.current?.deleteSelected();
  }, []);

  const handleClearCanvas = useCallback(() => {
    canvasRef.current?.clearCanvas();
    setImageUrl(null);
  }, []);

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

        <div 
          className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" 
          style={{ height: "calc(100vh - 140px)", minHeight: "600px" }}
        >
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleGenerate}
            loading={loading}
            error={error}
          />

          <Canvas ref={canvasRef} imageUrl={imageUrl} loading={loading} />

          <ActionBar
            onDelete={handleDeleteSelected}
            onClear={handleClearCanvas}
            onDownload={handleDownload}
          />
        </div>

        <footer className="mt-2 text-center text-white/60 text-xs">
          Powered by Hugging Face & FLUX
        </footer>
      </div>
    </main>
  );
}

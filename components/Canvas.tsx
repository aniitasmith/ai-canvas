"use client";

import Image from "next/image";

interface CanvasProps {
  imageUrl: string | null;
  loading: boolean;
}

export default function Canvas({ imageUrl, loading }: CanvasProps) {
  return (
    <div className="relative aspect-square bg-slate-100 flex items-center justify-center">
      {loading && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Creating your image...</p>
          <p className="text-slate-400 text-sm">This may take 10-30 seconds</p>
        </div>
      )}

      {!loading && !imageUrl && (
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-medium">Your creation will appear here</p>
          <p className="text-sm">Enter a prompt and click Generate</p>
        </div>
      )}

      {!loading && imageUrl && (
        <Image
          src={imageUrl}
          alt="AI Generated Image"
          fill
          className="object-contain"
          unoptimized
        />
      )}
    </div>
  );
}

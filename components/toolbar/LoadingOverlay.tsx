interface LoadingOverlayProps {
  isVisible: boolean;
}

export default function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-100/90 z-10 pointer-events-none">
      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      <p className="text-slate-600 font-medium">Creating your emoji...</p>
      <p className="text-slate-400 text-sm">This may take 10-30 seconds</p>
    </div>
  );
}

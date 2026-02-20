import { SendToBackIcon, SendBackwardIcon, BringForwardIcon, BringToFrontIcon } from "../icons";

interface LayerControlsProps {
  onSendToBack: () => void;
  onSendBackward: () => void;
  onBringForward: () => void;
  onBringToFront: () => void;
}

export default function LayerControls({
  onSendToBack,
  onSendBackward,
  onBringForward,
  onBringToFront,
}: LayerControlsProps) {
  return (
    <>
      <button
        onClick={onSendToBack}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        title="Send to Back"
      >
        <SendToBackIcon />
      </button>

      <button
        onClick={onSendBackward}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        title="Send Backward"
      >
        <SendBackwardIcon />
      </button>

      <button
        onClick={onBringForward}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        title="Bring Forward"
      >
        <BringForwardIcon />
      </button>

      <button
        onClick={onBringToFront}
        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        title="Bring to Front"
      >
        <BringToFrontIcon />
      </button>
    </>
  );
}

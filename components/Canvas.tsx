"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import {
  Canvas as FabricCanvas,
  FabricImage,
  Rect,
  Circle,
  Triangle,
  IText,
  PencilBrush,
  FabricObject,
  Point,
  TMat2D,
} from "fabric";

interface CanvasProps {
  imageUrl: string | null;
  loading: boolean;
}

export interface CanvasRef {
  exportImage: () => string | null;
  deleteSelected: () => void;
  clearCanvas: () => void;
}

type Tool = "select" | "hand" | "brush" | "text";
type ShapeType = "rect" | "circle" | "triangle";

const Canvas = forwardRef<CanvasRef, CanvasProps>(({ imageUrl, loading }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastImageUrlRef = useRef<string | null>(null);
  const initializedRef = useRef(false);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const activeToolRef = useRef<Tool>("select");
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [textColor, setTextColor] = useState("#1e293b");
  const [textSize, setTextSize] = useState(32);
  const [showShapesMenu, setShowShapesMenu] = useState(false);
  const shapesButtonRef = useRef<HTMLButtonElement>(null);
  const isPanning = useRef(false);
  const lastPosX = useRef(0);
  const lastPosY = useRef(0);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || initializedRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "#f8fafc",
      selection: true,
    });

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = brushColor;
    canvas.freeDrawingBrush.width = brushSize;

    fabricRef.current = canvas;
    initializedRef.current = true;

    const handleResize = () => {
      if (!fabricRef.current || !containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      fabricRef.current.setDimensions({ width: newWidth, height: newHeight });
      fabricRef.current.renderAll();
    };

    canvas.on("mouse:down", (opt) => {
      if (activeToolRef.current === "hand") {
        isPanning.current = true;
        const evt = opt.e as MouseEvent;
        lastPosX.current = evt.clientX;
        lastPosY.current = evt.clientY;
        canvas.selection = false;
        canvas.defaultCursor = "grabbing";
        canvas.renderAll();
      }
    });

    canvas.on("mouse:move", (opt) => {
      if (isPanning.current && activeToolRef.current === "hand") {
        const evt = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] += evt.clientX - lastPosX.current;
          vpt[5] += evt.clientY - lastPosY.current;
          canvas.requestRenderAll();
          lastPosX.current = evt.clientX;
          lastPosY.current = evt.clientY;
        }
      }
    });

    canvas.on("mouse:up", () => {
      isPanning.current = false;
      if (activeToolRef.current === "hand") {
        canvas.defaultCursor = "grab";
      }
      if (activeToolRef.current !== "hand") {
        canvas.selection = true;
      }
    });

    canvas.on("mouse:wheel", (opt) => {
      const delta = (opt.e as WheelEvent).deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 5) zoom = 5;
      if (zoom < 0.2) zoom = 0.2;
      canvas.zoomToPoint(new Point((opt.e as WheelEvent).offsetX, (opt.e as WheelEvent).offsetY), zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    canvas.on("object:moving", (e) => {
      const obj = e.target;
      if (!obj) return;
      
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const objBounds = obj.getBoundingRect();
      
      if (objBounds.left < 0) {
        obj.left = obj.left! - objBounds.left;
      }
      if (objBounds.top < 0) {
        obj.top = obj.top! - objBounds.top;
      }
      if (objBounds.left + objBounds.width > canvasWidth) {
        obj.left = obj.left! - (objBounds.left + objBounds.width - canvasWidth);
      }
      if (objBounds.top + objBounds.height > canvasHeight) {
        obj.top = obj.top! - (objBounds.top + objBounds.height - canvasHeight);
      }
    });

    window.addEventListener("resize", handleResize);
    
    setTimeout(() => {
      handleResize();
    }, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    canvas.isDrawingMode = activeTool === "brush";
    canvas.selection = activeTool === "select";
    
    if (activeTool === "hand") {
      canvas.defaultCursor = "grab";
      canvas.hoverCursor = "grab";
      canvas.selection = false;
      canvas.forEachObject((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });
    } else if (activeTool === "brush") {
      canvas.defaultCursor = "crosshair";
      canvas.hoverCursor = "crosshair";
      canvas.forEachObject((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });
    } else {
      canvas.defaultCursor = "default";
      canvas.hoverCursor = "move";
      canvas.forEachObject((obj) => {
        obj.selectable = true;
        obj.evented = true;
      });
    }
  }, [activeTool]);

  useEffect(() => {
    if (!fabricRef.current?.freeDrawingBrush) return;
    fabricRef.current.freeDrawingBrush.color = brushColor;
    fabricRef.current.freeDrawingBrush.width = brushSize;
  }, [brushColor, brushSize]);

  useEffect(() => {
    if (!fabricRef.current || !imageUrl || imageUrl === lastImageUrlRef.current) return;

    lastImageUrlRef.current = imageUrl;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;

      const fabricImage = new FabricImage(img, {
        scaleX: 0.5,
        scaleY: 0.5,
      });

      const zoom = canvas.getZoom();
      const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
      const centerX = (canvas.getWidth() / 2 - vpt[4]) / zoom;
      const centerY = (canvas.getHeight() / 2 - vpt[5]) / zoom;

      fabricImage.set({
        left: centerX - (fabricImage.getScaledWidth() / 2),
        top: centerY - (fabricImage.getScaledHeight() / 2),
      });

      canvas.add(fabricImage);
      canvas.setActiveObject(fabricImage);
      canvas.renderAll();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const addShape = (type: ShapeType) => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const zoom = canvas.getZoom();
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    const centerX = (canvas.getWidth() / 2 - vpt[4]) / zoom;
    const centerY = (canvas.getHeight() / 2 - vpt[5]) / zoom;

    let shape: FabricObject;

    switch (type) {
      case "rect":
        shape = new Rect({
          left: centerX - 50,
          top: centerY - 50,
          width: 100,
          height: 100,
          fill: "#8b5cf6",
          stroke: "#7c3aed",
          strokeWidth: 2,
        });
        break;
      case "circle":
        shape = new Circle({
          left: centerX - 50,
          top: centerY - 50,
          radius: 50,
          fill: "#ec4899",
          stroke: "#db2777",
          strokeWidth: 2,
        });
        break;
      case "triangle":
        shape = new Triangle({
          left: centerX - 50,
          top: centerY - 50,
          width: 100,
          height: 100,
          fill: "#f59e0b",
          stroke: "#d97706",
          strokeWidth: 2,
        });
        break;
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    setShowShapesMenu(false);
    setActiveTool("select");
  };

  const addText = () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const zoom = canvas.getZoom();
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    const centerX = (canvas.getWidth() / 2 - vpt[4]) / zoom;
    const centerY = (canvas.getHeight() / 2 - vpt[5]) / zoom;

    const text = new IText("Text", {
      left: centerX - 30,
      top: centerY - 15,
      fontSize: textSize,
      fill: textColor,
      fontFamily: "Arial",
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    setActiveTool("select");
  };

  const bringForward = () => {
    if (!fabricRef.current) return;
    const active = fabricRef.current.getActiveObject();
    if (active) {
      fabricRef.current.bringObjectForward(active);
      fabricRef.current.renderAll();
    }
  };

  const sendBackward = () => {
    if (!fabricRef.current) return;
    const active = fabricRef.current.getActiveObject();
    if (active) {
      fabricRef.current.sendObjectBackwards(active);
      fabricRef.current.renderAll();
    }
  };

  const bringToFront = () => {
    if (!fabricRef.current) return;
    const active = fabricRef.current.getActiveObject();
    if (active) {
      fabricRef.current.bringObjectToFront(active);
      fabricRef.current.renderAll();
    }
  };

  const sendToBack = () => {
    if (!fabricRef.current) return;
    const active = fabricRef.current.getActiveObject();
    if (active) {
      fabricRef.current.sendObjectToBack(active);
      fabricRef.current.renderAll();
    }
  };

  const resetView = () => {
    if (!fabricRef.current) return;
    fabricRef.current.setZoom(1);
    fabricRef.current.setViewportTransform([1, 0, 0, 1, 0, 0] as TMat2D);
    fabricRef.current.renderAll();
  };

  useImperativeHandle(ref, () => ({
    exportImage: () => {
      if (!fabricRef.current) return null;
      const originalVpt = fabricRef.current.viewportTransform?.slice() as TMat2D | undefined;
      fabricRef.current.setViewportTransform([1, 0, 0, 1, 0, 0] as TMat2D);
      const dataUrl = fabricRef.current.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 2,
      });
      if (originalVpt) {
        fabricRef.current.setViewportTransform(originalVpt);
      }
      return dataUrl;
    },
    deleteSelected: () => {
      if (!fabricRef.current) return;
      const active = fabricRef.current.getActiveObjects();
      active.forEach((obj) => fabricRef.current?.remove(obj));
      fabricRef.current.discardActiveObject();
      fabricRef.current.renderAll();
    },
    clearCanvas: () => {
      if (!fabricRef.current) return;
      fabricRef.current.clear();
      fabricRef.current.backgroundColor = "#f8fafc";
      fabricRef.current.setViewportTransform([1, 0, 0, 1, 0, 0] as TMat2D);
      fabricRef.current.renderAll();
      lastImageUrlRef.current = null;
    },
  }));

  const tools: { id: Tool; icon: string; label: string }[] = [
    { id: "select", icon: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122", label: "Select" },
    { id: "hand", icon: "M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11", label: "Hand (Pan)" },
    { id: "brush", icon: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42", label: "Brush" },
    { id: "text", icon: "TEXT_ICON", label: "Text" },
  ];

  const shapes: { id: ShapeType; icon: string; label: string }[] = [
    { id: "rect", icon: "M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z", label: "Rectangle" },
    { id: "circle", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Circle" },
    { id: "triangle", icon: "M12 4L3 20h18L12 4z", label: "Triangle" },
  ];

  return (
    <div className="relative flex flex-col flex-1 w-full h-full overflow-visible">
      <div className="flex items-center gap-1 p-2 bg-white border-b border-slate-200 relative z-30">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => {
              if (tool.id === "text") {
                setActiveTool("text");
              } else {
                setActiveTool(tool.id);
              }
              setShowShapesMenu(false);
            }}
            className={`p-2 rounded-lg transition-colors ${
              activeTool === tool.id
                ? "bg-purple-100 text-purple-700"
                : "hover:bg-slate-100 text-slate-600"
            }`}
            title={tool.label}
          >
            {tool.id === "text" ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize="18" fontWeight="bold">T</text>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={tool.icon} />
              </svg>
            )}
          </button>
        ))}

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <div className="relative">
          <button
            ref={shapesButtonRef}
            onClick={() => setShowShapesMenu(!showShapesMenu)}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
              showShapesMenu
                ? "bg-purple-100 text-purple-700"
                : "hover:bg-slate-100 text-slate-600"
            }`}
            title="Shapes"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
            </svg>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showShapesMenu && shapesButtonRef.current && (
            <div 
              className="fixed bg-white rounded-lg shadow-xl border border-slate-200 p-1 z-[9999]"
              style={{
                top: shapesButtonRef.current.getBoundingClientRect().bottom + 4,
                left: shapesButtonRef.current.getBoundingClientRect().left,
              }}
            >
              {shapes.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => addShape(shape.id)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600 text-sm whitespace-nowrap"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={shape.icon} />
                  </svg>
                  {shape.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {activeTool === "brush" && (
          <>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
              title="Brush Color"
            />
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20"
              title="Brush Size"
            />
          </>
        )}

        {activeTool === "text" && (
          <>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
              title="Text Color"
            />
            <input
              type="number"
              min="8"
              max="200"
              value={textSize}
              onChange={(e) => setTextSize(Number(e.target.value))}
              className="w-16 px-2 py-1 rounded border border-slate-300 text-sm"
              title="Text Size"
            />
            <button
              onClick={addText}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
            >
              Add Text
            </button>
          </>
        )}

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <button
          onClick={sendToBack}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          title="Send to Back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 15l-7 7-7-7M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button
          onClick={sendBackward}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          title="Send Backward"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7" />
          </svg>
        </button>

        <button
          onClick={bringForward}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          title="Bring Forward"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7" />
          </svg>
        </button>

        <button
          onClick={bringToFront}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          title="Bring to Front"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 9l7-7 7 7M5 15l7-7 7 7" />
          </svg>
        </button>

        <button
          onClick={resetView}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 ml-auto"
          title="Reset View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
          </svg>
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 w-full h-full overflow-hidden"
        style={{ cursor: activeTool === "hand" ? (isPanning.current ? "grabbing" : "grab") : "default" }}
        onClick={() => setShowShapesMenu(false)}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>
      
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-100/90 z-10 pointer-events-none">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Creating your emoji...</p>
          <p className="text-slate-400 text-sm">This may take 10-30 seconds</p>
        </div>
      )}
    </div>
  );
});

Canvas.displayName = "Canvas";

export default Canvas;

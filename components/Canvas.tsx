"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from "react";
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
} from "fabric";

type TMat2D = [number, number, number, number, number, number];
import { Toolbar, LoadingOverlay } from "./toolbar";
import { Tool, ShapeType } from "./toolbar/types";
import { CANVAS_BACKGROUND_COLOR, MAX_HISTORY_LENGTH } from "./toolbar/constants";

interface CanvasProps {
  imageUrl: string | null;
  loading: boolean;
}

export interface CanvasRef {
  exportImage: () => string | null;
  deleteSelected: () => void;
  clearCanvas: () => void;
}

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
  const textColorRef = useRef("#1e293b");
  const textSizeRef = useRef(32);
  const [showShapesMenu, setShowShapesMenu] = useState(false);
  
  const isPanning = useRef(false);
  const lastPosX = useRef(0);
  const lastPosY = useRef(0);
  
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  useEffect(() => {
    textColorRef.current = textColor;
    textSizeRef.current = textSize;
  }, [textColor, textSize]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || initializedRef.current) return;

    const container = containerRef.current;
    const canvas = new FabricCanvas(canvasRef.current, {
      width: container.clientWidth,
      height: container.clientHeight,
      backgroundColor: CANVAS_BACKGROUND_COLOR,
      selection: true,
    });

    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = brushColor;
    canvas.freeDrawingBrush.width = brushSize;

    fabricRef.current = canvas;
    initializedRef.current = true;

    const handleResize = () => {
      if (!fabricRef.current || !containerRef.current) return;
      fabricRef.current.setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
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
      } else if (activeToolRef.current === "text" && !opt.target) {
        const pointer = canvas.getViewportPoint(opt.e as MouseEvent);
        const text = new IText("Text", {
          left: pointer.x,
          top: pointer.y,
          fontSize: textSizeRef.current,
          fill: textColorRef.current,
          fontFamily: "Arial",
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
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
      zoom = Math.min(Math.max(zoom, 0.2), 5);
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
      
      if (objBounds.left < 0) obj.left = obj.left! - objBounds.left;
      if (objBounds.top < 0) obj.top = obj.top! - objBounds.top;
      if (objBounds.left + objBounds.width > canvasWidth) {
        obj.left = obj.left! - (objBounds.left + objBounds.width - canvasWidth);
      }
      if (objBounds.top + objBounds.height > canvasHeight) {
        obj.top = obj.top! - (objBounds.top + objBounds.height - canvasHeight);
      }
    });

    const saveCanvasState = () => {
      if (isUndoRedoRef.current) return;
      const json = JSON.stringify(canvas.toJSON());
      if (historyIndexRef.current < historyRef.current.length - 1) {
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      }
      historyRef.current.push(json);
      historyIndexRef.current = historyRef.current.length - 1;
      if (historyRef.current.length > MAX_HISTORY_LENGTH) {
        historyRef.current.shift();
        historyIndexRef.current--;
      }
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(false);
    };

    canvas.on("object:added", saveCanvasState);
    canvas.on("object:removed", saveCanvasState);
    canvas.on("object:modified", saveCanvasState);
    canvas.on("path:created", saveCanvasState);

    historyRef.current = [JSON.stringify(canvas.toJSON())];
    historyIndexRef.current = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && !canvas.isDrawingMode) {
        const activeObj = canvas.getActiveObject();
        if (activeObj && !(activeObj instanceof IText && (activeObj as IText).isEditing)) {
          canvas.getActiveObjects().forEach((obj) => canvas.remove(obj));
          canvas.discardActiveObject();
          canvas.renderAll();
          e.preventDefault();
        }
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        if (historyIndexRef.current > 0) {
          isUndoRedoRef.current = true;
          historyIndexRef.current--;
          canvas.loadFromJSON(historyRef.current[historyIndexRef.current]).then(() => {
            canvas.renderAll();
            isUndoRedoRef.current = false;
            setCanUndo(historyIndexRef.current > 0);
            setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
          });
        }
      }
      
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        if (historyIndexRef.current < historyRef.current.length - 1) {
          isUndoRedoRef.current = true;
          historyIndexRef.current++;
          canvas.loadFromJSON(historyRef.current[historyIndexRef.current]).then(() => {
            canvas.renderAll();
            isUndoRedoRef.current = false;
            setCanUndo(historyIndexRef.current > 0);
            setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
          });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
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
      const fabricImage = new FabricImage(img, { scaleX: 0.5, scaleY: 0.5 });
      const zoom = canvas.getZoom();
      const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
      const centerX = (canvas.getWidth() / 2 - vpt[4]) / zoom;
      const centerY = (canvas.getHeight() / 2 - vpt[5]) / zoom;

      fabricImage.set({
        left: centerX - fabricImage.getScaledWidth() / 2,
        top: centerY - fabricImage.getScaledHeight() / 2,
      });

      canvas.add(fabricImage);
      canvas.setActiveObject(fabricImage);
      canvas.renderAll();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const undo = useCallback(() => {
    if (!fabricRef.current || historyIndexRef.current <= 0) return;
    isUndoRedoRef.current = true;
    historyIndexRef.current--;
    fabricRef.current.loadFromJSON(historyRef.current[historyIndexRef.current]).then(() => {
      fabricRef.current?.renderAll();
      isUndoRedoRef.current = false;
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    });
  }, []);

  const redo = useCallback(() => {
    if (!fabricRef.current || historyIndexRef.current >= historyRef.current.length - 1) return;
    isUndoRedoRef.current = true;
    historyIndexRef.current++;
    fabricRef.current.loadFromJSON(historyRef.current[historyIndexRef.current]).then(() => {
      fabricRef.current?.renderAll();
      isUndoRedoRef.current = false;
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    });
  }, []);

  const addShape = useCallback((type: ShapeType) => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const zoom = canvas.getZoom();
    const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    const centerX = (canvas.getWidth() / 2 - vpt[4]) / zoom;
    const centerY = (canvas.getHeight() / 2 - vpt[5]) / zoom;

    let shape: FabricObject;
    const baseProps = { left: centerX - 50, top: centerY - 50 };

    switch (type) {
      case "rect":
        shape = new Rect({ ...baseProps, width: 100, height: 100, fill: "#8b5cf6", stroke: "#7c3aed", strokeWidth: 2 });
        break;
      case "circle":
        shape = new Circle({ ...baseProps, radius: 50, fill: "#ec4899", stroke: "#db2777", strokeWidth: 2 });
        break;
      case "triangle":
        shape = new Triangle({ ...baseProps, width: 100, height: 100, fill: "#f59e0b", stroke: "#d97706", strokeWidth: 2 });
        break;
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    setShowShapesMenu(false);
    setActiveTool("select");
  }, []);

  const bringForward = useCallback(() => {
    const active = fabricRef.current?.getActiveObject();
    if (active) {
      fabricRef.current?.bringObjectForward(active);
      fabricRef.current?.renderAll();
    }
  }, []);

  const sendBackward = useCallback(() => {
    const active = fabricRef.current?.getActiveObject();
    if (active) {
      fabricRef.current?.sendObjectBackwards(active);
      fabricRef.current?.renderAll();
    }
  }, []);

  const bringToFront = useCallback(() => {
    const active = fabricRef.current?.getActiveObject();
    if (active) {
      fabricRef.current?.bringObjectToFront(active);
      fabricRef.current?.renderAll();
    }
  }, []);

  const sendToBack = useCallback(() => {
    const active = fabricRef.current?.getActiveObject();
    if (active) {
      fabricRef.current?.sendObjectToBack(active);
      fabricRef.current?.renderAll();
    }
  }, []);

  const resetView = useCallback(() => {
    if (!fabricRef.current) return;
    fabricRef.current.setZoom(1);
    fabricRef.current.setViewportTransform([1, 0, 0, 1, 0, 0] as TMat2D);
    fabricRef.current.renderAll();
  }, []);

  const handleToolChange = useCallback((tool: Tool) => {
    setActiveTool(tool);
    setShowShapesMenu(false);
  }, []);

  const handleTextColorChange = useCallback((color: string) => {
    setTextColor(color);
    textColorRef.current = color;
  }, []);

  const handleTextSizeChange = useCallback((size: number) => {
    setTextSize(size);
    textSizeRef.current = size;
  }, []);

  useImperativeHandle(ref, () => ({
    exportImage: () => {
      if (!fabricRef.current) return null;
      const originalVpt = fabricRef.current.viewportTransform?.slice() as TMat2D | undefined;
      fabricRef.current.setViewportTransform([1, 0, 0, 1, 0, 0] as TMat2D);
      const dataUrl = fabricRef.current.toDataURL({ format: "png", quality: 1, multiplier: 2 });
      if (originalVpt) fabricRef.current.setViewportTransform(originalVpt);
      return dataUrl;
    },
    deleteSelected: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length > 0) {
        activeObjects.forEach((obj) => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    },
    clearCanvas: () => {
      if (!fabricRef.current) return;
      fabricRef.current.clear();
      fabricRef.current.backgroundColor = CANVAS_BACKGROUND_COLOR;
      fabricRef.current.setViewportTransform([1, 0, 0, 1, 0, 0] as TMat2D);
      fabricRef.current.renderAll();
      lastImageUrlRef.current = null;
    },
  }));

  return (
    <div className="relative flex flex-col flex-1 w-full h-full overflow-visible">
      <Toolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        showShapesMenu={showShapesMenu}
        onToggleShapesMenu={() => setShowShapesMenu(!showShapesMenu)}
        onSelectShape={addShape}
        brushColor={brushColor}
        brushSize={brushSize}
        textColor={textColor}
        textSize={textSize}
        onBrushColorChange={setBrushColor}
        onBrushSizeChange={setBrushSize}
        onTextColorChange={handleTextColorChange}
        onTextSizeChange={handleTextSizeChange}
        onSendToBack={sendToBack}
        onSendBackward={sendBackward}
        onBringForward={bringForward}
        onBringToFront={bringToFront}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onResetView={resetView}
      />

      <div
        ref={containerRef}
        className="flex-1 w-full h-full overflow-hidden"
        style={{ cursor: activeTool === "hand" ? (isPanning.current ? "grabbing" : "grab") : "default" }}
        onClick={() => setShowShapesMenu(false)}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>
      
      <LoadingOverlay isVisible={loading} />
    </div>
  );
});

Canvas.displayName = "Canvas";

export default Canvas;

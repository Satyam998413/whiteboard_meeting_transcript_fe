import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Line, Rect, Ellipse, Group, Text } from 'react-konva';
import * as Y from 'yjs';

const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const CURSOR_THROTTLE_MS = 40;
const PEN_UPDATE_THROTTLE_MS = 50;

function StickyNote({ shape, draggable, onDragEnd, onEdit }) {
  return (
    <Group
      x={shape.x}
      y={shape.y}
      draggable={draggable}
      onDragEnd={(e) => onDragEnd(shape.id, { x: e.target.x(), y: e.target.y() })}
      onDblClick={() => onEdit(shape)}
      onDblTap={() => onEdit(shape)}
    >
      <Rect width={shape.width} height={shape.height} fill={shape.fill} shadowBlur={6} shadowOpacity={0.25} cornerRadius={4} />
      <Text text={shape.text || ''} width={shape.width} height={shape.height} padding={10} fontSize={14} fill="#1f2937" wrap="word" />
    </Group>
  );
}

const Canvas = forwardRef(function Canvas({ doc, awareness, tool, color, strokeWidth, readOnly, onUndoStateChange }, ref) {
  const shapesMap = useMemo(() => doc.getMap('shapes'), [doc]);
  const [shapes, setShapes] = useState({});
  const [editingSticky, setEditingSticky] = useState(null);
  const drawingRef = useRef(null);
  const lastCursorSentRef = useRef(0);
  const lastPenSyncRef = useRef(0);
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const [size, setSize] = useState({ width: 800, height: 480 });

  const undoManager = useMemo(() => new Y.UndoManager(shapesMap), [shapesMap]);

  useImperativeHandle(ref, () => ({
    undo: () => undoManager.undo(),
    redo: () => undoManager.redo(),
  }));

  useEffect(() => {
    const sync = () => {
      onUndoStateChange?.({ canUndo: undoManager.undoStack.length > 0, canRedo: undoManager.redoStack.length > 0 });
    };
    undoManager.on('stack-item-added', sync);
    undoManager.on('stack-item-popped', sync);
    sync();
    return () => {
      undoManager.off('stack-item-added', sync);
      undoManager.off('stack-item-popped', sync);
      onUndoStateChange?.({ canUndo: false, canRedo: false });
    };
  }, [undoManager, onUndoStateChange]);

  useEffect(() => {
    const sync = () => setShapes(Object.fromEntries(shapesMap.entries()));
    shapesMap.observe(sync);
    sync();
    return () => shapesMap.unobserve(sync);
  }, [shapesMap]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setSize({ width: entry.contentRect.width, height: Math.max(entry.contentRect.height, 360) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const writeShape = (id, patch) => {
    const existing = shapesMap.get(id) || {};
    shapesMap.set(id, { ...existing, ...patch, id });
  };

  const handlePointerDown = (e) => {
    if (readOnly || tool === 'select') return;
    const pos = e.target.getStage().getPointerPosition();

    if (tool === 'pen') {
      const id = genId();
      drawingRef.current = { id, points: [pos.x, pos.y] };
      writeShape(id, { type: 'pen', points: [pos.x, pos.y], stroke: color, strokeWidth });
    } else if (tool === 'rectangle' || tool === 'ellipse') {
      const id = genId();
      drawingRef.current = { id, startX: pos.x, startY: pos.y };
      writeShape(id, {
        type: tool,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        radiusX: 0,
        radiusY: 0,
        stroke: color,
        strokeWidth,
        fill: 'transparent',
      });
    } else if (tool === 'sticky') {
      const id = genId();
      writeShape(id, { type: 'sticky', x: pos.x - 60, y: pos.y - 50, width: 120, height: 100, text: '', fill: color });
    }
  };

  const handlePointerMove = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;

    const now = Date.now();
    if (awareness && now - lastCursorSentRef.current > CURSOR_THROTTLE_MS) {
      awareness.setLocalStateField('cursor', { x: pos.x, y: pos.y });
      lastCursorSentRef.current = now;
    }

    if (readOnly || !drawingRef.current) return;

    if (tool === 'pen') {
      drawingRef.current.points.push(pos.x, pos.y);
      if (now - lastPenSyncRef.current > PEN_UPDATE_THROTTLE_MS) {
        writeShape(drawingRef.current.id, { points: [...drawingRef.current.points] });
        lastPenSyncRef.current = now;
      }
    } else if (tool === 'rectangle') {
      const { id, startX, startY } = drawingRef.current;
      writeShape(id, {
        x: Math.min(startX, pos.x),
        y: Math.min(startY, pos.y),
        width: Math.abs(pos.x - startX),
        height: Math.abs(pos.y - startY),
      });
    } else if (tool === 'ellipse') {
      const { id, startX, startY } = drawingRef.current;
      writeShape(id, {
        x: startX,
        y: startY,
        radiusX: Math.abs(pos.x - startX),
        radiusY: Math.abs(pos.y - startY),
      });
    }
  };

  const handlePointerUp = () => {
    if (readOnly || !drawingRef.current) return;
    if (tool === 'pen') writeShape(drawingRef.current.id, { points: [...drawingRef.current.points] });
    drawingRef.current = null;
  };

  const handleShapeDragEnd = (id, patch) => writeShape(id, patch);

  const shapeList = Object.values(shapes);

  return (
    <div ref={containerRef} className="relative h-full min-h-[360px] w-full overflow-hidden rounded-lg border border-border bg-[#0c0c0c]">
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        style={{ cursor: readOnly ? 'default' : tool === 'select' ? 'default' : 'crosshair' }}
      >
        <Layer>
          {shapeList.map((shape) => {
            const draggable = !readOnly && tool === 'select';
            if (shape.type === 'pen') {
              return (
                <Line
                  key={shape.id}
                  points={shape.points}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  lineCap="round"
                  lineJoin="round"
                  tension={0}
                />
              );
            }
            if (shape.type === 'rectangle') {
              return (
                <Rect
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  fill={shape.fill === 'transparent' ? undefined : shape.fill}
                  draggable={draggable}
                  onDragEnd={(e) => handleShapeDragEnd(shape.id, { x: e.target.x(), y: e.target.y() })}
                />
              );
            }
            if (shape.type === 'ellipse') {
              return (
                <Ellipse
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  radiusX={shape.radiusX}
                  radiusY={shape.radiusY}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  fill={shape.fill === 'transparent' ? undefined : shape.fill}
                  draggable={draggable}
                  onDragEnd={(e) => handleShapeDragEnd(shape.id, { x: e.target.x(), y: e.target.y() })}
                />
              );
            }
            if (shape.type === 'sticky') {
              return (
                <StickyNote
                  key={shape.id}
                  shape={shape}
                  draggable={!readOnly}
                  onDragEnd={handleShapeDragEnd}
                  onEdit={(s) => !readOnly && setEditingSticky(s)}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>

      {editingSticky && (
        <div
          className="absolute z-10"
          style={{ left: editingSticky.x, top: editingSticky.y, width: editingSticky.width, height: editingSticky.height }}
        >
          <textarea
            autoFocus
            defaultValue={editingSticky.text}
            className="h-full w-full resize-none rounded p-2 text-sm text-gray-900 outline-none ring-2 ring-primary"
            style={{ background: editingSticky.fill }}
            onBlur={(e) => {
              writeShape(editingSticky.id, { text: e.target.value });
              setEditingSticky(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setEditingSticky(null);
            }}
          />
        </div>
      )}
    </div>
  );
});

export default Canvas;

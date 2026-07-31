import React, { useMemo } from 'react';
import { Stage, Layer, Line, Rect, Ellipse, Group, Text } from 'react-konva';
import * as Y from 'yjs';

// Decodes a board's persisted Yjs snapshot into shapes and renders them statically — no socket,
// no editing. Used by the public share page, which is view-only and shouldn't need a live
// connection or board access at all.
export default function ReadOnlyCanvasPreview({ snapshotBase64 }) {
  const shapes = useMemo(() => {
    if (!snapshotBase64) return [];
    try {
      const doc = new Y.Doc();
      const bytes = Uint8Array.from(atob(snapshotBase64), (c) => c.charCodeAt(0));
      Y.applyUpdate(doc, bytes);
      return Array.from(doc.getMap('shapes').values());
    } catch (e) {
      return [];
    }
  }, [snapshotBase64]);

  if (shapes.length === 0) {
    return <p className="text-sm text-text-secondary">No canvas content yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[#0c0c0c]">
      <Stage width={640} height={360}>
        <Layer>
          {shapes.map((shape) => {
            if (shape.type === 'pen') {
              return (
                <Line
                  key={shape.id}
                  points={shape.points}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  lineCap="round"
                  lineJoin="round"
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
                />
              );
            }
            if (shape.type === 'sticky') {
              return (
                <Group key={shape.id} x={shape.x} y={shape.y}>
                  <Rect width={shape.width} height={shape.height} fill={shape.fill} cornerRadius={4} />
                  <Text text={shape.text || ''} width={shape.width} height={shape.height} padding={10} fontSize={14} fill="#1f2937" wrap="word" />
                </Group>
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
}

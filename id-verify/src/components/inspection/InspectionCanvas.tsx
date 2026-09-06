"use client";

import { useMemo, useState } from "react";
import {
  MousePointerClick,
  Flame,
  Layers,
} from "lucide-react";
import type { BoundingBox } from "@/lib/types";
import { SyntheticPassport, DOC_VIEWBOX_W, DOC_VIEWBOX_H } from "./SyntheticPassport";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface InspectionCanvasProps {
  boxes: BoundingBox[];
  activeBoxId: string | null;
  onSelect: (id: string | null) => void;
  showHeatmap: boolean;
}

const SEVERITY_COLOR: Record<string, { stroke: string; fill: string; text: string; glow: string }> = {
  HIGH: {
    stroke: "#ef4444",
    fill: "rgba(239,68,68,0.14)",
    text: "#fca5a5",
    glow: "0 0 12px rgba(239,68,68,0.55)",
  },
  WARNING: {
    stroke: "#eab308",
    fill: "rgba(234,179,8,0.12)",
    text: "#fde047",
    glow: "0 0 10px rgba(234,179,8,0.45)",
  },
  LOW: {
    stroke: "#60a5fa",
    fill: "rgba(96,165,250,0.12)",
    text: "#93c5fd",
    glow: "0 0 8px rgba(96,165,250,0.4)",
  },
};

export function InspectionCanvas({
  boxes,
  activeBoxId,
  onSelect,
  showHeatmap,
}: InspectionCanvasProps) {
  const [zoomBox, setZoomBox] = useState<BoundingBox | null>(null);

  const heat = useMemo(() => {
    if (!showHeatmap) return null;
    return boxes
      .filter((b) => b.severity !== "CLEAR")
      .map((b) => ({
        cx: b.x + b.width / 2,
        cy: b.y + b.height / 2,
        r: Math.max(b.width, b.height) * 1.1,
        severity: b.severity,
      }));
  }, [boxes, showHeatmap]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-lg border border-border bg-[#0b0d12] shadow-inner">
        {/* Scaling container */}
        <div className="relative w-full">
          <svg
            viewBox={`0 0 ${DOC_VIEWBOX_W} ${DOC_VIEWBOX_H}`}
            className="block h-auto w-full"
            role="group"
            aria-label="Document inspection canvas with detected regions"
          >
            <SyntheticPassport />

            {/* Heatmap overlay */}
            {heat && (
              <g>
                <defs>
                  {heat.map((h, i) => (
                    <radialGradient key={i} id={`heat-${i}`}>
                      <stop offset="0%" stopColor={h.severity === "HIGH" ? "#ef4444" : "#eab308"} stopOpacity="0.4" />
                      <stop offset="60%" stopColor={h.severity === "HIGH" ? "#ef4444" : "#eab308"} stopOpacity="0.15" />
                      <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </radialGradient>
                  ))}
                </defs>
                {heat.map((h, i) => (
                  <circle key={i} cx={h.cx} cy={h.cy} r={h.r} fill={`url(#heat-${i})`} />
                ))}
              </g>
            )}

            {/* Bounding boxes */}
            {boxes.map((box, i) => {
              const color = SEVERITY_COLOR[box.severity] ?? SEVERITY_COLOR.WARNING;
              const active = activeBoxId === `${box.label}-${i}`;
              const boxId = `${box.label}-${i}`;
              return (
                <g
                  key={boxId}
                  className="cursor-pointer"
                  onMouseEnter={() => onSelect(boxId)}
                  onMouseLeave={() => onSelect(null)}
                  onClick={() => onSelect(boxId)}
                >
                  <rect
                    x={box.x}
                    y={box.y}
                    width={box.width}
                    height={box.height}
                    rx={4}
                    fill={active ? color.fill : "transparent"}
                    stroke={color.stroke}
                    strokeWidth={active ? 2.5 : 1.5}
                    strokeDasharray={active ? "none" : "6 3"}
                    style={{ filter: active ? color.glow : undefined }}
                  />
                  {/* Corner ticks */}
                  {[
                    [box.x, box.y, 1, 1],
                    [box.x + box.width, box.y, -1, 1],
                    [box.x, box.y + box.height, 1, -1],
                    [box.x + box.width, box.y + box.height, -1, -1],
                  ].map(([cx, cy, dx, dy], j) => (
                    <path
                      key={j}
                      d={`M ${cx} ${cy} h ${8 * dx} m ${-8 * dx} v ${8 * dy}`}
                      stroke={color.stroke}
                      strokeWidth={2}
                      fill="none"
                    />
                  ))}
                  {/* Label pill */}
                  <g>
                    <rect
                      x={box.x}
                      y={box.y - 22}
                      width={Math.min(box.width + 44, 210)}
                      height={20}
                      rx={4}
                      fill={color.stroke}
                      opacity={active ? 1 : 0.92}
                    />
                    <text
                      x={box.x + 6}
                      y={box.y - 8}
                      fontSize="10"
                      fontWeight="700"
                      fill="#0a0b0d"
                    >
                      {(box.label.length > 26 ? box.label.slice(0, 25) + "…" : box.label).toUpperCase()}
                    </text>
                    <text
                      x={box.x + 6 + Math.min(box.width + 44, 210) - 10}
                      y={box.y - 8}
                      fontSize="10"
                      fontWeight="700"
                      textAnchor="end"
                      fill="#0a0b0d"
                      opacity="0.85"
                    >
                      {box.confidence.toFixed(0)}%
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Badge variant="high" className="gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> High
          </Badge>
          <Badge variant="warning" className="gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Warning
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MousePointerClick className="h-3.5 w-3.5" />
            Hover to inspect
          </span>
          <span className="inline-flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            {boxes.length} regions
          </span>
        </div>
      </div>

      {/* Zoom detail dialog */}
      <Dialog open={!!zoomBox} onOpenChange={(o) => !o && setZoomBox(null)}>
        {zoomBox && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 capitalize text-base">
                <Flame className="h-4 w-4 text-red-500" />
                {zoomBox.label.toLowerCase()}
              </DialogTitle>
              <DialogDescription>
                {zoomBox.category} · Detected region analysis
              </DialogDescription>
            </DialogHeader>
            <div className="relative w-full overflow-hidden rounded-md border border-border">
              <svg
                viewBox={`${Math.max(0, zoomBox.x - 20)} ${Math.max(0, zoomBox.y - 20)} ${Math.min(DOC_VIEWBOX_W, zoomBox.x + zoomBox.width + 20) - Math.max(0, zoomBox.x - 20)} ${Math.min(DOC_VIEWBOX_H, zoomBox.y + zoomBox.height + 20) - Math.max(0, zoomBox.y - 20)}`}
                className="block h-auto w-full"
              >
                <SyntheticPassport />
                <rect
                  x={zoomBox.x}
                  y={zoomBox.y}
                  width={zoomBox.width}
                  height={zoomBox.height}
                  rx={4}
                  fill="rgba(239,68,68,0.15)"
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex flex-col gap-1 text-muted-foreground">
                <span>Coordinates</span>
                <span className="tabular-nums text-foreground">
                  ({zoomBox.x}, {zoomBox.y}) {zoomBox.width}×{zoomBox.height}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1 text-muted-foreground">
                <span>Model confidence</span>
                <span className="tabular-nums text-foreground">
                  {zoomBox.confidence.toFixed(1)}%
                </span>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
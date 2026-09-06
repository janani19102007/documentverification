"use client";

import {
  AlertTriangle,
  Crosshair,
  Info,
  ThermometerSun,
  Zap,
} from "lucide-react";
import type { BoundingBox } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface InspectionSidebarProps {
  boxes: BoundingBox[];
  activeBoxId: string | null;
  onSelect: (id: string | null) => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
}

export function InspectionSidebar({
  boxes,
  activeBoxId,
  onSelect,
  showHeatmap,
  onToggleHeatmap,
}: InspectionSidebarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Crosshair className="h-4 w-4 text-primary" />
          Detected Regions
        </h3>
        <button
          onClick={onToggleHeatmap}
          aria-pressed={showHeatmap}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
            showHeatmap
              ? "border-primary/50 bg-primary/15 text-primary"
              : "border-border text-muted-foreground hover:bg-accent"
          )}
        >
          <ThermometerSun className="h-3 w-3" />
          Heatmap
        </button>
      </div>

      <ul className="flex flex-col gap-2" aria-label="Detected suspicious regions">
        {boxes.map((box, i) => {
          const id = `${box.label}-${i}`;
          const active = activeBoxId === id;
          const highRisk = box.severity === "HIGH";
          return (
            <li key={id}>
              <button
                onClick={() => onSelect(active ? null : id)}
                onMouseEnter={() => onSelect(id)}
                onMouseLeave={() => onSelect(null)}
                aria-pressed={active}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-all",
                  active
                    ? "border-primary/50 bg-primary/10 shadow-sm"
                    : "border-border bg-card hover:bg-accent"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                        highRisk
                          ? "bg-red-500/15 text-red-500"
                          : "bg-amber-500/15 text-amber-500"
                      )}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm font-medium leading-tight text-foreground">
                      {box.label}
                    </span>
                  </div>
                  {box.severity === "HIGH" && (
                    <Badge variant="high">{box.severity}</Badge>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="text-[11px] text-muted-foreground">
                    {box.category}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[11px] font-medium tabular-nums",
                      highRisk ? "text-red-500" : "text-amber-500"
                    )}
                  >
                    <Zap className="h-3 w-3" />
                    {box.confidence.toFixed(1)}% confidence
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {activeBoxId && (
        <div
          className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground"
          role="status"
        >
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          Hover a region on the canvas or a row above to inspect its exact
          bounding area in detail.
        </div>
      )}
    </div>
  );
}
"use client";

import {
  AlertTriangle,
  CameraOff,
  VideoOff,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import type { DeviceError as DeviceErrorType } from "@/lib/types";
import { Button } from "@/components/ui/button";

const ICONS = {
  "camera-denied": CameraOff,
  "no-camera": VideoOff,
  "low-light": Lightbulb,
  generic: AlertTriangle,
} as const;

interface DeviceErrorProps {
  error: DeviceErrorType;
  onRetry?: () => void;
}

export function DeviceErrorBanner({ error, onRetry }: DeviceErrorProps) {
  const Icon = ICONS[error.type] ?? AlertTriangle;

  return (
    <div
      role="alert"
      className="flex w-full flex-col gap-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-5"
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-foreground">{error.message}</p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            {error.suggestions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="self-start gap-2"
          onClick={onRetry}
        >
          <RotateCcw className="h-4 w-4" />
          Retry camera access
        </Button>
      )}
    </div>
  );
}

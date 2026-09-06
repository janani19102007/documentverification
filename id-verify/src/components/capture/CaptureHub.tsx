"use client";

import { useState } from "react";
import { Camera, ScanLine, Upload, RefreshCcw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WebcamCapture } from "./WebcamCapture";
import { UploadDropzone } from "./UploadDropzone";
import { ProcessingProgress } from "@/components/processing/ProcessingProgress";
import { DeviceErrorBanner } from "@/components/processing/DeviceError";
import { cn } from "@/lib/utils";
import type { DeviceError, DeviceErrorType } from "@/lib/types";

interface CaptureHubProps {
  onDocumentReady: (imageUrl: string) => void;
  onStatusChange?: (status: HubStatus) => void;
  onReset?: () => void;
}

export type HubStatus = "idle" | "uploading" | "processing" | "complete";

export function CaptureHub({ onDocumentReady, onStatusChange, onReset }: CaptureHubProps) {
  const [mode, setMode] = useState<"upload" | "webcam">("upload");
  const [status, setStatus] = useState<HubStatus>("idle");
  const [deviceError, setDeviceError] = useState<DeviceError | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const notify = (s: HubStatus) => {
    setStatus(s);
    onStatusChange?.(s);
  };

  const handleFile = (file: File) => {
    notify("uploading");
    setDeviceError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    // Simulate upload-to-process transition
    setTimeout(() => {
      notify("processing");
      setTimeout(() => {
        notify("complete");
        onDocumentReady(url);
      }, 4200);
    }, 900);
  };

  const handleCapture = (dataUrl: string) => {
    notify("uploading");
    setDeviceError(null);
    setPreviewUrl(dataUrl);
    setTimeout(() => {
      notify("processing");
      setTimeout(() => {
        notify("complete");
        onDocumentReady(dataUrl);
      }, 4200);
    }, 700);
  };

  const handleDeviceError = (type: DeviceErrorType) => {
    const errors: Record<DeviceErrorType, DeviceError> = {
      "camera-denied": {
        type,
        message: "Camera permission was denied.",
        suggestions: [
          "Allow camera access in your browser's site settings.",
          "Refresh the page and try again.",
        ],
      },
      "no-camera": {
        type,
        message: "No camera device was detected.",
        suggestions: [
          "Connect an external webcam, then retry.",
          "Use the upload mode instead.",
        ],
      },
      "low-light": {
        type,
        message: "Lighting is too low for reliable capture.",
        suggestions: [
          "Move to a brighter area or enable additional lighting.",
          "Hold the document steady and increase light contrast.",
        ],
      },
      generic: {
        type,
        message: "An unexpected camera error occurred.",
        suggestions: ["Restart the browser and try again."],
      },
    };
    setDeviceError(errors[type]);
  };

  const retry = () => {
    setDeviceError(null);
    setMode("webcam");
  };

  const reset = () => {
    notify("idle");
    setPreviewUrl(null);
    setDeviceError(null);
    onReset?.();
  };

  return (
    <div className="flex flex-col gap-4">
      {status === "idle" && (
        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as "upload" | "webcam")}
        >
          <TabsList className="grid w-full max-w-sm grid-cols-2" aria-label="Capture mode">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="webcam">
              <Camera className="h-4 w-4" />
              Webcam
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <UploadDropzone onUpload={handleFile} disabled={false} />
          </TabsContent>
          <TabsContent value="webcam" className="mt-4">
            {deviceError ? (
              <DeviceErrorBanner error={deviceError} onRetry={retry} />
            ) : (
              <WebcamCapture
                onCapture={handleCapture}
                onDeviceError={handleDeviceError}
              />
            )}
          </TabsContent>
        </Tabs>
      )}

      {(status === "uploading" || status === "processing") && (
        <div className="flex flex-col items-center gap-6 rounded-lg border border-border bg-card p-8">
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- dynamic data URL preview
            <img
              src={previewUrl}
              alt="Captured document preview"
              className="max-h-64 rounded-md border border-border object-contain"
            />
          )}
          <div className="w-full max-w-md">
            {status === "uploading" ? (
              <div className="flex flex-col items-center gap-3">
                <ScanLine className="h-6 w-6 animate-pulse text-primary" />
                <p className="text-sm font-medium text-foreground">
                  Preparing document…
                </p>
              </div>
            ) : (
              <ProcessingProgress />
            )}
          </div>
        </div>
      )}

      {status === "complete" && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500"
              )}
            >
              <ScanLine className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <p className="text-sm font-medium text-foreground">
                Document ingested successfully
              </p>
              <p className="text-xs text-muted-foreground">
                Analysis complete — review findings below.
              </p>
            </div>
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            New scan
          </button>
        </div>
      )}
    </div>
  );
}
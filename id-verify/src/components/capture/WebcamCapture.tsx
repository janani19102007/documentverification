"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  ScanLine,
  Camera,
  Sun,
  ShieldAlert,
} from "lucide-react";
import type { DeviceErrorType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WebcamCaptureProps {
  onCapture: (dataUrl: string) => void;
  onDeviceError: (type: DeviceErrorType) => void;
}

interface GuidanceState {
  detected: boolean;
  stable: boolean;
  brightness: number; // 0-1
  x: number;
  y: number;
  w: number;
  h: number;
}

const INITIAL_GUIDANCE: GuidanceState = {
  detected: false,
  stable: false,
  brightness: 0.4,
  x: 0.2,
  y: 0.18,
  w: 0.6,
  h: 0.55,
};

export function WebcamCapture({ onCapture, onDeviceError }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [guidance, setGuidance] = useState<GuidanceState>(INITIAL_GUIDANCE);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [flash, setFlash] = useState(false);

  const analyzeFrame = useCallback(() => {
    const video = webcamRef.current?.video;
    if (!video || video.readyState < 2) {
      return;
    }

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.drawImage(video, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    let sum = 0;
    let count = 0;
    const step = 16;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const i = (y * w + x) * 4;
        sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        count += 1;
      }
    }
    const brightness = sum / count / 255;

    // Simulated document detection: after camera is ready, briefly settle then detect
    const now = Date.now() / 1000;
    const detected = cameraReady && now % 5 > 1.2;
    const jitter = (t: number) => Math.sin(t) * 0.012;

    const g: GuidanceState = {
      detected,
      stable: detected && Math.abs(Math.sin(now / 2.1)) < 0.25,
      brightness,
      x: 0.2 + jitter(now),
      y: 0.18 + jitter(now * 1.3),
      w: 0.6,
      h: 0.55,
    };

    if (g.brightness < 0.18) {
      onDeviceError("low-light");
    }

    setGuidance(g);
  }, [cameraReady, onDeviceError]);

  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      analyzeFrame();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [analyzeFrame]);

  // Auto-capture when stable
  useEffect(() => {
    if (!guidance.stable || isCapturing) return;
    const t = setTimeout(() => {
      const shot = webcamRef.current?.getScreenshot();
      if (shot) {
        setIsCapturing(true);
        setFlash(true);
        setTimeout(() => setFlash(false), 250);
        setTimeout(() => onCapture(shot), 400);
      }
    }, 900);
    return () => clearTimeout(t);
  }, [guidance.stable, isCapturing, onCapture]);

  const handleUserMediaError = useCallback(
    (err: string | DOMException) => {
      onDeviceError(
        String(err).includes("PermissionDenied") || String(err).includes("NotAllowedError")
          ? "camera-denied"
          : "no-camera"
      );
    },
    [onDeviceError]
  );

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-black">
      <div className="relative aspect-[4/3] w-full">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 960 },
          }}
          onUserMedia={() => setCameraReady(true)}
          onUserMediaError={handleUserMediaError}
          className="h-full w-full object-cover"
          mirrored
        />

        {!cameraReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 text-center">
            <ScanLine className="h-8 w-8 animate-pulse text-primary" />
            <p className="text-sm text-muted-foreground">
              Initializing camera…
            </p>
          </div>
        )}

        {/* Live camera feed must not show the overlay in dark; use high contrast lines */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          {/* Card boundary rectangle */}
          <div
            className={cn(
              "absolute rounded-[6px] border-2 border-dashed transition-colors duration-300",
              guidance.detected
                ? "border-emerald-400/90"
                : "border-white/50"
            )}
            style={{
              left: `${guidance.x * 100}%`,
              top: `${guidance.y * 100}%`,
              width: `${guidance.w * 100}%`,
              height: `${guidance.h * 100}%`,
              boxShadow: guidance.detected
                ? "0 0 0 3px rgba(16,185,129,0.2), 0 0 30px rgba(16,185,129,0.25)"
                : "0 0 0 3px rgba(255,255,255,0.05)",
            }}
          >
            {/* Corner marks */}
            {[
              "left-0 top-0 border-l-4 border-t-4",
              "right-0 top-0 border-r-4 border-t-4",
              "left-0 bottom-0 border-l-4 border-b-4",
              "right-0 bottom-0 border-r-4 border-b-4",
            ].map((pos) => (
              <span
                key={pos}
                className={cn(
                  "absolute h-5 w-5 rounded-sm border-white",
                  pos,
                  guidance.detected && "border-emerald-300"
                )}
              />
            ))}
          </div>

          {/* Lighting + hold status chips */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            <StatusChip
              icon={<Sun className="h-3.5 w-3.5" />}
              label={
                guidance.brightness < 0.18
                  ? "Lighting too low"
                  : guidance.brightness < 0.3
                    ? "Lighting low"
                    : "Lighting OK"
              }
              tone={
                guidance.brightness < 0.18
                  ? "danger"
                  : guidance.brightness < 0.3
                    ? "warn"
                    : "ok"
              }
            />
            <StatusChip
              icon={
                guidance.stable ? (
                  <ShieldAlert className="h-3.5 w-3.5" />
                ) : (
                  <Camera className="h-3.5 w-3.5" />
                )
              }
              label={
                guidance.stable
                  ? "Hold steady → Capturing"
                  : guidance.detected
                    ? "Hold steady…"
                    : "Align document in frame"
              }
              tone={guidance.stable ? "ok" : guidance.detected ? "warn" : "idle"}
            />
          </div>
        </div>

        {/* Flash effect */}
        {flash && (
          <div className="absolute inset-0 animate-pulse bg-white/80" />
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const shot = webcamRef.current?.getScreenshot();
              if (shot) onCapture(shot);
            }}
            className="bg-black/40 text-white backdrop-blur"
          >
            <Camera className="h-4 w-4" />
            Capture
          </Button>
        </div>
        <p className="text-xs text-white/80">
          {guidance.stable
            ? "Stable — capturing in a moment…"
            : guidance.detected
              ? "Detected — hold steady"
              : "Align the ID within the frame"}
        </p>
        <p className="hidden text-xs text-white/60 sm:block">
          Auto-capture enabled
        </p>
      </div>
    </div>
  );
}

function StatusChip({
  icon,
  label,
  tone = "idle",
}: {
  icon: React.ReactNode;
  label: string;
  tone: "ok" | "warn" | "danger" | "idle";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur",
        tone === "ok" && "border-emerald-400/40 bg-emerald-950/60 text-emerald-300",
        tone === "warn" &&
          "border-amber-400/40 bg-amber-950/60 text-amber-300",
        tone === "danger" && "border-red-400/40 bg-red-950/60 text-red-300",
        tone === "idle" && "border-white/20 bg-black/50 text-white/80"
      )}
    >
      {icon}
      {label}
    </span>
  );
}
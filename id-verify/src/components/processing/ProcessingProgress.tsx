"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const STEPS = [
  { id: "ocr", label: "Extracting OCR Text", sub: "Reading document fields" },
  { id: "mrz", label: "Validating MRZ Checksums", sub: "Cross-checking machine zone" },
  { id: "biometrics", label: "Running Biometrics", sub: "Face match + liveness" },
  { id: "forensics", label: "Analyzing Pixel Forensics", sub: "Scanning for tampering" },
  { id: "hologram", label: "Verifying Security Features", sub: "UV/IR & sheen response" },
  { id: "scoring", label: "Compiling Risk Score", sub: "Aggregating findings" },
];

export function ProcessingProgress() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const total = STEPS.length;
    let current = 0;
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 3 + Math.random() * 6, 100);
        if (next > ((current + 1) / total) * 96 && current < total - 1) {
          current += 1;
          setActiveStep(current);
        }
        return next;
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-full flex-col gap-4" aria-live="polite">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">Analyzing document…</span>
        <span className="tabular-nums text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} aria-label="Scan progress" />
      <ol className="mt-1 space-y-2.5">
        {STEPS.map((step, i) => {
          const isActive = i === activeStep;
          const isDone = i < activeStep;
          return (
            <li
              key={step.id}
              className="flex items-center gap-3 text-sm"
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  isDone &&
                    "border-emerald-500/50 bg-emerald-500/15 text-emerald-500",
                  isActive &&
                    "border-primary bg-primary/15 text-primary",
                  !isDone &&
                    !isActive &&
                    "border-border text-muted-foreground/50"
                )}
              >
                {isDone ? (
                  <Check className="h-3 w-3" />
                ) : isActive ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{step.label}</span>
                <span className="text-xs text-muted-foreground">{step.sub}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

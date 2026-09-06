"use client";

import {
  Fingerprint,
  ScanEye,
  Database,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock3,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { InspectionResults, CheckResult } from "@/lib/types";

interface Category {
  id: string;
  title: string;
  icon: React.ReactNode;
  check: CheckResult | undefined;
  config: { status: string; confidence: number; detail: string };
}

export function CategoryBreakdown({
  results,
}: {
  results: InspectionResults;
}) {
  const categories: Category[] = [
    {
      id: "authenticity",
      title: "Document Authenticity",
      icon: <ScanEye className="h-4 w-4" />,
      check: results.documentAuthenticity,
      config: {
        status: results.documentAuthenticity?.status ?? "PENDING",
        confidence: results.documentAuthenticity?.confidence ?? 0,
        detail:
          results.documentAuthenticity?.details ??
          "Font analysis, edge clipping, pixel alteration",
      },
    },
    {
      id: "biometric",
      title: "Biometric Matching",
      icon: <Fingerprint className="h-4 w-4" />,
      check: results.faceMatch ?? results.biometricMatch,
      config: {
        status:
          (results.faceMatch ?? results.biometricMatch)?.status ?? "PENDING",
        confidence:
          (results.faceMatch ?? results.biometricMatch)?.confidence ?? 0,
        detail: `Face match ${(results.faceMatch ?? results.biometricMatch)?.livenessVerified ? "with" : "without"} liveness confirmation`,
      },
    },
    {
      id: "data-integrity",
      title: "Data Integrity",
      icon: <Database className="h-4 w-4" />,
      check: results.dataIntegrity ?? results.mrzCheck,
      config: {
        status: (results.dataIntegrity ?? results.mrzCheck)?.status ?? "PENDING",
        confidence: (results.dataIntegrity ?? results.mrzCheck)?.confidence ?? 0,
        detail:
          results.dataIntegrity?.details ??
          "MRZ checksum validation and OCR vs barcode cross-check",
      },
    },
    {
      id: "hologram",
      title: "Hologram & Security",
      icon: <Sparkles className="h-4 w-4" />,
      check: results.hologramCheck,
      config: {
        status: results.hologramCheck?.status ?? "PENDING",
        confidence: results.hologramCheck?.confidence ?? 0,
        detail: `UV response ${results.hologramCheck?.uvResponse ? "OK" : "warned"} · Sheen ${results.hologramCheck?.sheenVerified ? "verified" : "anomalous"}`,
      },
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {categories.map((cat) => {
        const status = cat.config.status.toLowerCase();
        const tone =
          status === "passed"
            ? "success"
            : status === "failed"
              ? "danger"
              : status === "flagged"
                ? "warning"
                : "pending";
        return (
          <div
            key={cat.id}
            className={cn(
              "rounded-lg border p-4 transition-colors",
              tone === "success" && "border-emerald-500/30 bg-emerald-500/5",
              tone === "danger" && "border-red-500/30 bg-red-500/5",
              tone === "warning" && "border-amber-500/30 bg-amber-500/5",
              tone === "pending" && "border-border bg-muted/40"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md",
                    tone === "success" && "bg-emerald-500/15 text-emerald-500",
                    tone === "danger" && "bg-red-500/15 text-red-500",
                    tone === "warning" && "bg-amber-500/15 text-amber-500",
                    tone === "pending" && "bg-muted text-muted-foreground"
                  )}
                >
                  {cat.icon}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {cat.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {cat.config.detail}
                  </span>
                </div>
              </div>
              <StatusBadge status={status} />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Progress
                value={cat.config.confidence}
                className={cn(
                  "h-1.5",
                  tone === "success" && "[&>div]:bg-emerald-500",
                  tone === "danger" && "[&>div]:bg-red-500",
                  tone === "warning" && "[&>div]:bg-amber-500",
                  tone === "pending" && "[&>div]:bg-primary"
                )}
              />
              <span className="w-12 shrink-0 text-right text-sm font-medium tabular-nums text-foreground">
                {cat.config.confidence.toFixed(1)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const meta = {
    passed: { label: "Passed", icon: CheckCircle2, cls: "text-emerald-500 border-emerald-500/40 bg-emerald-500/10" },
    failed: { label: "Failed", icon: XCircle, cls: "text-red-500 border-red-500/40 bg-red-500/10" },
    flagged: { label: "Flagged", icon: AlertTriangle, cls: "text-amber-500 border-amber-500/40 bg-amber-500/10" },
    pending: { label: "Pending", icon: Clock3, cls: "text-muted-foreground border-border bg-muted/40" },
  }[status] ?? {
    label: status,
    icon: AlertTriangle,
    cls: "text-muted-foreground border-border bg-muted/40",
  };
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        meta.cls
      )}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}
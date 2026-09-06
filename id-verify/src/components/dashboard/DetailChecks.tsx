"use client";

import { useState } from "react";
import {
  ChevronDown,
  Fingerprint,
  Hash,
  ScanSearch,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock3,
} from "lucide-react";
import type { CheckResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DetailItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  check: CheckResult;
  extra: React.ReactNode;
}

const TONE = {
  PASSED: "success",
  FAILED: "danger",
  FLAGGED: "warning",
  PENDING: "pending",
} as const;

export function DetailChecks({ report }: { report: { inspectionResults: { biometricMatch: CheckResult & { livenessVerified?: boolean }; mrzCheck: CheckResult & { checksumValid?: boolean }; pixelForensics: CheckResult & { boundingBoxes: Array<{ label: string }> }; hologramCheck?: CheckResult & { uvResponse?: boolean; sheenVerified?: boolean } } } }) {
  const [openId, setOpenId] = useState<string | null>("mrz");

  const items: DetailItem[] = [
    {
      id: "biometric",
      title: "Biometric Face Match",
      icon: <Fingerprint className="h-4 w-4" />,
      check: report.inspectionResults.biometricMatch,
      extra: report.inspectionResults.biometricMatch.livenessVerified ? (
        <Badge variant="success">Liveness verified</Badge>
      ) : (
        <Badge variant="warning">Liveness pending</Badge>
      ),
    },
    {
      id: "mrz",
      title: "MRZ Checksum Validation",
      icon: <Hash className="h-4 w-4" />,
      check: report.inspectionResults.mrzCheck,
      extra: (
        <Badge variant={report.inspectionResults.mrzCheck.checksumValid ? "success" : "high"}>
          Checksum {report.inspectionResults.mrzCheck.checksumValid ? "valid" : "invalid"}
        </Badge>
      ),
    },
    {
      id: "forensics",
      title: "Pixel Forensics Engine",
      icon: <ScanSearch className="h-4 w-4" />,
      check: report.inspectionResults.pixelForensics,
      extra: (
        <Badge variant="warning">
          {report.inspectionResults.pixelForensics.boundingBoxes.length} region(s) flagged
        </Badge>
      ),
    },
    ...(report.inspectionResults.hologramCheck
      ? [
          {
            id: "hologram",
            title: "Hologram & UV Response",
            icon: <Sparkles className="h-4 w-4" />,
            check: report.inspectionResults.hologramCheck,
            extra: (
              <Badge variant="secondary">
                UV {report.inspectionResults.hologramCheck.uvResponse ? "ok" : "warn"} · Sheen{" "}
                {report.inspectionResults.hologramCheck.sheenVerified ? "verified" : "anomaly"}
              </Badge>
            ),
          } satisfies DetailItem,
        ]
      : []),
  ];

  return (
    <div className="flex flex-col divide-y divide-border">
      {items.map((item) => {
        const tone = TONE[item.check.status as keyof typeof TONE] ?? "pending";
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <button
              onClick={() => setOpenId(open ? null : item.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md",
                    tone === "success" && "bg-emerald-500/15 text-emerald-500",
                    tone === "danger" && "bg-red-500/15 text-red-500",
                    tone === "warning" && "bg-amber-500/15 text-amber-500",
                    tone === "pending" && "bg-muted text-muted-foreground"
                  )}
                >
                  {item.icon}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Confidence {item.check.confidence.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.extra}
                <StatusIcon status={item.check.status} />
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    open && "rotate-180"
                  )}
                />
              </div>
            </button>
            {open && (
              <div className="px-4 pb-4 pl-[3.75rem] text-sm text-muted-foreground">
                <p className="rounded-md bg-muted/60 p-3">
                  {item.check.details ?? "No additional details provided."}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  const cls = "h-4 w-4";
  switch (status) {
    case "PASSED":
      return <CheckCircle2 className={cn(cls, "text-emerald-500")} />;
    case "FAILED":
      return <XCircle className={cn(cls, "text-red-500")} />;
    case "FLAGGED":
      return <AlertTriangle className={cn(cls, "text-amber-500")} />;
    default:
      return <Clock3 className={cn(cls, "text-muted-foreground")} />;
  }
}
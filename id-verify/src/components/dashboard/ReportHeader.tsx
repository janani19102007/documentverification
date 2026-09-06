"use client";

import {
  FileBadge,
  Globe2,
  Clock3,
  UserCheck,
  CircleDot,
} from "lucide-react";
import type { VerificationReport } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const VERDICT_MAP = {
  VERIFIED: { label: "Verified", cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-500" },
  REJECTED: { label: "Rejected", cls: "border-red-500/40 bg-red-500/10 text-red-500" },
  FLAGGED: { label: "Flagged", cls: "border-amber-500/40 bg-amber-500/10 text-amber-500" },
} as const;

export function ReportHeader({ report }: { report: VerificationReport }) {
  const v = VERDICT_MAP[report.overallVerdict];
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-muted text-primary">
          <FileBadge className="h-5 w-5" />
        </span>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">
              Inspection Report
            </h2>
            <Badge className={v.cls}>{v.label}</Badge>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {report.documentId}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <Meta icon={<FileBadge className="h-3.5 w-3.5" />} label="Type">
          <span className="font-medium text-foreground">
            {report.documentType.replace("_", " ")}
          </span>
        </Meta>
        <Meta icon={<Globe2 className="h-3.5 w-3.5" />} label="Issuing country">
          <span className="font-medium text-foreground">
            {report.issuingCountry}
          </span>
        </Meta>
        <Meta icon={<Clock3 className="h-3.5 w-3.5" />} label="Processed in">
          <span className="font-medium tabular-nums text-foreground">
            {(report.processingTimeMs ?? 0).toLocaleString()} ms
          </span>
        </Meta>
        <Meta icon={<UserCheck className="h-3.5 w-3.5" />} label="Reviewer">
          <span className="font-medium text-foreground">
            {report.submittedBy ?? "—"}
          </span>
        </Meta>
        <Meta icon={<CircleDot className="h-3.5 w-3.5" />} label="Captured">
          <span className="font-medium text-foreground">
            {report.capturedAt
              ? new Date(report.capturedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </span>
        </Meta>
      </div>
    </div>
  );
}

function Meta({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      <span className="sr-only">{label}: </span>
      {children}
    </span>
  );
}
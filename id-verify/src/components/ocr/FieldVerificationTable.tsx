"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Pin,
} from "lucide-react";
import type { ExtractedField } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Override = { decision: "approve" | "reject"; at: string } | null;

export function FieldVerificationTable({ fields }: { fields: ExtractedField[] }) {
  const [overrides, setOverrides] = useState<Record<number, Override>>({});
  const [pinned, setPinned] = useState<number | null>(null);

  const toggleOverride = (i: number, decision: "approve" | "reject") => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (next[i]?.decision === decision) delete next[i];
      else next[i] = { decision, at: "Officer override" };
      return next;
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Raw Extracted Text
          </span>
          <ArrowIcon />
          <span className="text-xs font-medium text-muted-foreground">
            Expected Schema
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {fields.filter((f) => f.flagged).length} field(s) flagged
        </span>
      </div>

      <ul className="divide-y divide-border">
        {fields.map((field, i) => {
          const override = overrides[i];
          const approved = override?.decision === "approve";
          const rejected = override?.decision === "reject";
          const mismatch = field.flagged && field.expected && field.value !== field.expected;

          return (
            <li
              key={i}
              className={cn(
                "grid grid-cols-1 gap-3 px-4 py-3 transition-colors sm:grid-cols-[1.1fr_1.6fr_2.2fr_0.8fr] sm:items-center",
                pinned === i && "bg-primary/5",
                approved && "bg-emerald-500/5",
                rejected && "bg-red-500/5"
              )}
            >
              {/* Field name */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPinned(pinned === i ? null : i)}
                  aria-label={pinned === i ? "Unpin field" : "Pin field"}
                  className={cn(
                    "rounded p-0.5 transition-colors hover:bg-accent",
                    pinned === i ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Pin className="h-3.5 w-3.5" />
                </button>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {field.field}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Conf. {field.confidence.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Raw VS expected */}
              <div className="flex items-center gap-2 pl-6 sm:pl-0">
                <code
                  className={cn(
                    "rounded bg-muted px-2 py-1 text-xs",
                    field.flagged ? "text-red-400 line-through decoration-red-500/60" : "text-foreground"
                  )}
                >
                  {field.expected ?? field.value}
                </code>
                {mismatch && (
                  <>
                    <ArrowIcon />
                    <code className="rounded bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400">
                      {field.value}
                    </code>
                  </>
                )}
              </div>

              {/* Reason / confidence */}
              <div className="flex flex-col gap-0.5 pl-6 sm:pl-0">
                {field.flagged ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {field.reason ?? "Mismatch detected"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    Matches expected schema
                  </span>
                )}
                {override && (
                  <span className="text-[11px] text-muted-foreground">
                    {override.at}
                  </span>
                )}
              </div>

              {/* Override buttons */}
              <div className="flex items-center gap-1.5 pl-6 sm:pl-0">
                <button
                  onClick={() => toggleOverride(i, "approve")}
                  aria-pressed={approved}
                  aria-label={`Approve ${field.field}`}
                  title="Manually approve this field"
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                    approved
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-500"
                      : "border-border text-muted-foreground hover:border-emerald-500/40 hover:text-emerald-500"
                  )}
                >
                  <ThumbsUp className="h-3 w-3" />
                  Approve
                </button>
                <button
                  onClick={() => toggleOverride(i, "reject")}
                  aria-pressed={rejected}
                  aria-label={`Reject ${field.field}`}
                  title="Reject this field as incorrect"
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                    rejected
                      ? "border-red-500/50 bg-red-500/15 text-red-500"
                      : "border-border text-muted-foreground hover:border-red-500/40 hover:text-red-500"
                  )}
                >
                  <ThumbsDown className="h-3 w-3" />
                  Reject
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <Badge variant="secondary" className="gap-1">
          <ShieldCheck className="h-3 w-3" />
          Human-in-the-loop review enabled
        </Badge>
        <span className="text-xs text-muted-foreground">
          {Object.keys(overrides).length} manual override(s) recorded
        </span>
      </div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3 w-3 shrink-0 text-muted-foreground"
      fill="none"
      aria-hidden="true"
    >
      <path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
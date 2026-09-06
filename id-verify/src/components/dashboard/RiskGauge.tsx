"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskGaugeProps {
  score: number; // 0-100
  verdict: "VERIFIED" | "REJECTED" | "FLAGGED";
  animate?: boolean;
}

function scoreColor(score: number) {
  if (score >= 75) return "#ef4444";
  if (score >= 50) return "#eab308";
  return "#22c55e";
}

function verdictMeta(verdict: RiskGaugeProps["verdict"]) {
  switch (verdict) {
    case "VERIFIED":
      return { label: "Verified / Authentic", icon: ShieldCheck, cls: "text-emerald-500" };
    case "REJECTED":
      return { label: "Rejected — Fraud Detected", icon: ShieldAlert, cls: "text-red-500" };
    default:
      return { label: "Flagged — Manual Review", icon: ShieldQuestion, cls: "text-amber-500" };
  }
}

export function RiskGauge({ score, verdict, animate = true }: RiskGaugeProps) {
  const [display, setDisplay] = useState(0);
  const color = scoreColor(score);
  const meta = verdictMeta(verdict);
  const Icon = meta.icon;
  const value = animate ? display : score;

  useEffect(() => {
    if (!animate) return;
    let raf: number;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(score * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, animate]);

  const R = 54;
  const C = 2 * Math.PI * R;
  const filled = (value / 100) * C;

  return (
    <div className="relative flex w-44 flex-col items-center gap-3">
      <div className="relative h-44 w-44" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)} aria-label="Composite risk score">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke="var(--color-secondary)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${C}`}
            className="transition-[stroke-dasharray] duration-75 ease-linear"
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums tracking-tight" style={{ color }}>
            {Math.round(display)}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Risk Score
          </span>
        </div>
      </div>

      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
          verdict === "VERIFIED" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
          verdict === "REJECTED" && "border-red-500/40 bg-red-500/10 text-red-500",
          verdict === "FLAGGED" && "border-amber-500/40 bg-amber-500/10 text-amber-500"
        )}
      >
        <Icon className={cn("h-3.5 w-3.5", meta.cls)} />
        {meta.label}
      </div>
    </div>
  );
}
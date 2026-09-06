"use client";

import { useCallback, useState } from "react";
import {
  Activity,
  Fingerprint,
  ScanSearch,
  ShieldCheck,
  Boxes,
  FileSearch,
  Gauge,
} from "lucide-react";
import { CaptureHub, type HubStatus } from "@/components/capture/CaptureHub";
import { InspectionCanvas } from "@/components/inspection/InspectionCanvas";
import { InspectionSidebar } from "@/components/inspection/InspectionSidebar";
import { RiskGauge } from "@/components/dashboard/RiskGauge";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { DetailChecks } from "@/components/dashboard/DetailChecks";
import { ReportHeader } from "@/components/dashboard/ReportHeader";
import { FieldVerificationTable } from "@/components/ocr/FieldVerificationTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MOCK_REPORT } from "@/lib/mockData";
import type { VerificationReport } from "@/lib/types";

type Phase = "idle" | "processing" | "complete";

export function VerificationDashboard() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeBoxId, setActiveBoxId] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const handleDocumentReady = useCallback((imageUrl: string) => {
    setPreviewUrl(imageUrl);
    setReport(MOCK_REPORT);
    setPhase("complete");
  }, []);

  const handleStatusChange = useCallback((s: HubStatus) => {
    if (s === "idle") {
      setPhase("idle");
      setReport(null);
      setPreviewUrl(null);
      setActiveBoxId(null);
      setShowHeatmap(false);
    } else if (s === "uploading" || s === "processing") {
      setPhase("processing");
    }
  }, []);

  const resetAll = useCallback(() => {
    setPhase("idle");
    setReport(null);
    setPreviewUrl(null);
    setActiveBoxId(null);
    setShowHeatmap(false);
  }, []);

  const boxes = report?.inspectionResults.pixelForensics.boundingBoxes ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar online={phase !== "idle"} />

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-10 pt-6 sm:px-6">
        {/* Capture Hub — persistent, single instance */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-5">
            <CaptureHub
              onDocumentReady={handleDocumentReady}
              onStatusChange={handleStatusChange}
              onReset={resetAll}
            />
          </CardContent>
        </Card>

        {phase === "idle" && <ModesOverview />}

        {phase === "processing" && <ProcessingSkeleton imageUrl={previewUrl} />}

        {phase === "complete" && report && (
          <div className="flex flex-col gap-6">
            <ReportHeader report={report} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
              {/* Left: inspection canvas + regions */}
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <ScanSearch className="h-4 w-4 text-primary" />
                        Inspection Canvas
                      </CardTitle>
                      <Badge variant="outline" className="tabular-nums">
                        {boxes.length} regions · {report.documentType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <InspectionCanvas
                      boxes={boxes}
                      activeBoxId={activeBoxId}
                      onSelect={setActiveBoxId}
                      showHeatmap={showHeatmap}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <InspectionSidebar
                      boxes={boxes}
                      activeBoxId={activeBoxId}
                      onSelect={setActiveBoxId}
                      showHeatmap={showHeatmap}
                      onToggleHeatmap={() => setShowHeatmap((v) => !v)}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right: risk score + breakdown */}
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Gauge className="h-4 w-4 text-primary" />
                      Composite Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-6 pt-4">
                    <RiskGauge
                      score={report.compositeRiskScore}
                      verdict={report.overallVerdict}
                    />
                    <div className="w-full">
                      <CategoryBreakdown results={report.inspectionResults} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-1">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Boxes className="h-4 w-4 text-primary" />
                      Engine Checks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <DetailChecks report={report} />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* OCR field verification table */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <FileSearch className="h-4 w-4 text-primary" />
                    Field Verification & Manual Override
                  </CardTitle>
                  <Badge variant="secondary" className="gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Officer review required
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Side-by-side OCR extraction vs expected schema. Flagged
                  fields require a human-in-the-loop decision.
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <FieldVerificationTable fields={report.extractedFields} />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

/* ------------------------- Sub-components ------------------------- */

function TopBar({ online }: { online: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Fingerprint className="h-4 w-4" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-foreground">
              SentinelID <span className="font-normal text-muted-foreground">Ops</span>
            </span>
            <span className="text-[11px] text-muted-foreground">
              AI Document Screening Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
              online
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
                : "border-border bg-muted text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                online ? "animate-pulse bg-emerald-500" : "bg-muted-foreground"
              )}
            />
            {online ? "Pipeline online" : "Standby"}
          </span>
          <Badge variant="outline" className="hidden gap-1 sm:inline-flex">
            <Activity className="h-3 w-3" />
            v4.2.1
          </Badge>
        </div>
      </div>
    </header>
  );
}

function ModesOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          Capabilities
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Dense multi-engine pipeline for forgery, manipulation, and spoof
          detection.
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <ModeCard
          icon={<ScanSearch className="h-5 w-5" />}
          title="Pixel forensics"
          desc="Font inconsistency, edge clipping, clone-detection and digital alteration analysis."
        />
        <ModeCard
          icon={<Fingerprint className="h-5 w-5" />}
          title="Biometrics & liveness"
          desc="Face-match against document photo with motion-based spoof defense."
        />
        <ModeCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Security features"
          desc="MRZ checksums, UV/IR response, hologram sheen and template validation."
        />
      </CardContent>
    </Card>
  );
}

function ModeCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="text-sm font-semibold text-foreground">{title}</span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </div>
  );
}

/* Processing skeleton shown while the mock pipeline runs */
function ProcessingSkeleton({ imageUrl }: { imageUrl: string | null }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 animate-pulse text-primary" />
            AI Pipeline Running
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-0">
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- dynamic data URL preview
            <img
              src={imageUrl}
              alt="Captured document being analyzed"
              className="max-h-52 self-center rounded-md border border-border object-contain"
            />
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" role="status" aria-label="Loading analysis">
            <div className="flex h-28 animate-pulse flex-col justify-between rounded-lg border border-border bg-secondary/40 p-4">
              <div className="h-3 w-1/2 rounded bg-secondary" />
              <div className="h-6 w-2/3 rounded bg-secondary/80" />
            </div>
            <div className="hidden h-28 animate-pulse flex-col justify-between rounded-lg border border-border bg-secondary/40 p-4 sm:flex">
              <div className="h-3 w-1/2 rounded bg-secondary" />
              <div className="h-6 w-2/3 rounded bg-secondary/80" />
            </div>
            <div className="hidden h-28 animate-pulse flex-col justify-between rounded-lg border border-border bg-secondary/40 p-4 sm:flex">
              <div className="h-3 w-1/2 rounded bg-secondary" />
              <div className="h-6 w-2/3 rounded bg-secondary/80" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
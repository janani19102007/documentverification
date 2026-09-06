"use client";

import { useCallback, useRef, useState } from "react";
import { CloudUpload, FileImage, FileText, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onUpload: (file: File) => void;
  disabled?: boolean;
}

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
const MAX_MB = 15;

export function UploadDropzone({ onUpload, disabled }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!ACCEPTED.includes(file.type)) {
        setError("Unsupported file type. Please upload a PNG, JPG, or PDF.");
        return;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        setError(`File exceeds the ${MAX_MB} MB limit.`);
        return;
      }
      setError(null);
      onUpload(file);
    },
    [onUpload]
  );

  return (
    <div
      className={cn(
        "relative flex min-h-[280px] w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
        dragActive
          ? "border-primary bg-primary/10"
          : "border-border bg-muted/40 hover:border-primary/60 hover:bg-muted/70",
        disabled && "pointer-events-none opacity-60"
      )}
      role="button"
      tabIndex={0}
      aria-label="Upload a document image or PDF"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        aria-hidden="true"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background shadow-sm">
        {dragActive ? (
          <UploadCloud className="h-7 w-7 text-primary" />
        ) : (
          <CloudUpload className="h-7 w-7 text-muted-foreground" />
        )}
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">
          {dragActive ? "Release to upload" : "Drag & drop your document here"}
        </p>
        <p className="text-xs text-muted-foreground">
          or click to browse from your device
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <FileImage className="h-3.5 w-3.5" />
          PNG
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <FileImage className="h-3.5 w-3.5" />
          JPG
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          PDF
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          Max 15 MB
        </span>
      </div>
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
export type Severity = "HIGH" | "WARNING" | "LOW" | "CLEAR";

export type Verdict = "VERIFIED" | "REJECTED" | "FLAGGED";

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  severity: Severity;
  confidence: number;
  category: string;
}

export interface CheckResult {
  status: "PASSED" | "FAILED" | "FLAGGED" | "PENDING";
  confidence: number;
  details?: string;
}

export interface ExtractedField {
  field: string;
  value: string;
  expected?: string;
  confidence: number;
  flagged: boolean;
  reason?: string;
}

export interface InspectionResults {
  biometricMatch: CheckResult & { livenessVerified?: boolean };
  faceMatch?: CheckResult & { livenessVerified?: boolean };
  mrzCheck: CheckResult & { checksumValid?: boolean };
  pixelForensics: CheckResult & { boundingBoxes: BoundingBox[] };
  dataIntegrity?: CheckResult;
  documentAuthenticity?: CheckResult;
  hologramCheck?: CheckResult & {
    uvResponse?: boolean;
    sheenVerified?: boolean;
  };
}

export interface VerificationReport {
  documentId: string;
  documentType: "PASSPORT" | "DRIVERS_LICENSE" | "NATIONAL_ID";
  issuingCountry: string;
  overallVerdict: Verdict;
  compositeRiskScore: number;
  processingTimeMs?: number;
  capturedAt?: string;
  submittedBy?: string;
  extractedFields: ExtractedField[];
  inspectionResults: InspectionResults;
}

export type ScanPhase =
  | "idle"
  | "capturing"
  | "uploading"
  | "processing"
  | "complete"
  | "error";

export type DeviceErrorType =
  | "camera-denied"
  | "no-camera"
  | "low-light"
  | "generic";

export interface DeviceError {
  type: DeviceErrorType;
  message: string;
  suggestions: string[];
}

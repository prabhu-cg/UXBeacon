// Scan lifecycle
export type ScanStatus = "pending" | "crawling" | "analyzing" | "complete" | "failed";

export type UXGrade = "A+" | "A" | "B" | "C" | "D" | "F";

// Heuristics
export type HeuristicId =
  | "visibility-of-system-status"
  | "match-real-world"
  | "user-control-freedom"
  | "consistency-standards"
  | "error-prevention"
  | "recognition-not-recall"
  | "flexibility-efficiency"
  | "aesthetic-minimalist"
  | "help-users-recover"
  | "help-documentation";

export interface HeuristicScore {
  id: HeuristicId;
  name: string;
  score: number; // 0–10
  severity: "none" | "cosmetic" | "minor" | "major" | "catastrophic";
  explanation: string;
  recommendation: string;
}

// UX Laws
export type UXLawId =
  | "hicks-law"
  | "fitts-law"
  | "jakobs-law"
  | "millers-law"
  | "doherty-threshold"
  | "pareto-principle";

export interface UXLawScore {
  id: UXLawId;
  name: string;
  score: number; // 0–10
  finding: string;
  recommendation: string;
}

// Accessibility
export type AccessibilitySeverity = "critical" | "serious" | "moderate" | "minor";

export interface AccessibilityIssue {
  id: string;
  severity: AccessibilitySeverity;
  description: string;
  wcagCriteria: string;
  affectedElements: number;
  recommendation: string;
}

export interface AccessibilityScore {
  score: number; // 0–100
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  issues: AccessibilityIssue[];
}

// Content Quality
export interface ContentScore {
  score: number; // 0–100
  readability: number;
  headingHierarchy: number;
  ctaClarity: number;
  linkQuality: number;
  contentDensity: number;
  findings: string[];
}

// Navigation
export interface NavigationScore {
  score: number; // 0–100
  findings: string[];
}

// UX Health Score
export interface UXHealthScore {
  overall: number; // 0–100
  grade: UXGrade;
  accessibility: number;
  heuristics: number;
  uxLaws: number;
  contentQuality: number;
  navigation: number;
}

// Page
export interface PageData {
  url: string;
  title: string;
  metaDescription: string;
  headings: { level: number; text: string }[];
  links: { href: string; text: string; isExternal: boolean }[];
  images: { src: string; alt: string; hasAlt: boolean }[];
  forms: { action: string; method: string; fields: number }[];
  buttons: string[];
  navigationItems: string[];
  wordCount: number;
  loadTimeMs?: number;
}

// Scan
export interface ScanRequest {
  url: string;
  guestToken?: string;
}

export interface ScanResult {
  id: string;
  url: string;
  status: ScanStatus;
  startedAt: string;
  completedAt?: string;
  pageCount: number;
  uxHealthScore?: UXHealthScore;
  heuristicScores?: HeuristicScore[];
  uxLawScores?: UXLawScore[];
  accessibilityScore?: AccessibilityScore;
  contentScore?: ContentScore;
  navigationScore?: NavigationScore;
  screenshots?: {
    desktop?: string;
    tablet?: string;
    mobile?: string;
  };
  siteStructure?: SitemapNode;
  executiveSummary?: string;
  keyFindings?: string[];
  recommendations?: string[];
  error?: string;
}

// Sitemap
export interface SitemapNode {
  url: string;
  title: string;
  children: SitemapNode[];
  depth: number;
}

// API responses
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface ScanInitResponse {
  scanId: string;
  status: ScanStatus;
}

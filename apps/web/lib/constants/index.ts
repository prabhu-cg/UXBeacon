export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const GUEST_SCAN_LIMIT = 3;
export const GUEST_PAGE_LIMIT = 25;

export const GRADE_COLORS: Record<string, string> = {
  "A+": "#16a34a",
  A: "#22c55e",
  B: "#84cc16",
  C: "#eab308",
  D: "#f97316",
  F: "#ef4444",
};

export const GRADE_BACKGROUNDS: Record<string, string> = {
  "A+": "#dcfce7",
  A: "#dcfce7",
  B: "#f7fee7",
  C: "#fef9c3",
  D: "#ffedd5",
  F: "#fee2e2",
};

export const HEURISTIC_NAMES: Record<string, string> = {
  "visibility-of-system-status": "Visibility of System Status",
  "match-real-world": "Match with Real World",
  "user-control-freedom": "User Control & Freedom",
  "consistency-standards": "Consistency & Standards",
  "error-prevention": "Error Prevention",
  "recognition-not-recall": "Recognition over Recall",
  "flexibility-efficiency": "Flexibility & Efficiency",
  "aesthetic-minimalist": "Aesthetic & Minimalist Design",
  "help-users-recover": "Help Users Recover from Errors",
  "help-documentation": "Help & Documentation",
};

export const UX_LAW_NAMES: Record<string, string> = {
  "hicks-law": "Hick's Law",
  "fitts-law": "Fitts's Law",
  "jakobs-law": "Jakob's Law",
  "millers-law": "Miller's Law",
  "doherty-threshold": "Doherty Threshold",
  "pareto-principle": "Pareto Principle",
};

export const SCORE_WEIGHTS = {
  accessibility: 0.25,
  heuristics: 0.25,
  uxLaws: 0.2,
  contentQuality: 0.15,
  navigation: 0.15,
} as const;

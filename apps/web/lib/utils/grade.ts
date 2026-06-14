import type { UXGrade } from "@uxbeacon/shared-types";

export function scoreToGrade(score: number): UXGrade {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

export function gradeToLabel(grade: UXGrade): string {
  const labels: Record<UXGrade, string> = {
    "A+": "Excellent",
    A: "Great",
    B: "Good",
    C: "Fair",
    D: "Poor",
    F: "Critical",
  };
  return labels[grade];
}

export function formatScore(score: number): string {
  return Math.round(score).toString();
}

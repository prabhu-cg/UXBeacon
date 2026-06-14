import type { UXGrade } from "@uxbeacon/shared-types";
import { gradeToLabel } from "@/lib/utils/grade";
import { GRADE_COLORS, GRADE_BACKGROUNDS } from "@/lib/constants";

interface Props {
  grade: UXGrade;
  score: number;
  size?: "sm" | "md" | "lg";
}

export function ScoreGrade({ grade, score, size = "md" }: Props) {
  const color = GRADE_COLORS[grade] ?? "#333333";
  const bg = GRADE_BACKGROUNDS[grade] ?? "#f3f4f6";

  const sizeClasses = {
    sm: "h-12 w-12 rounded-xl text-xl",
    md: "h-20 w-20 rounded-2xl text-3xl",
    lg: "h-28 w-28 rounded-3xl text-5xl",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex flex-col items-center justify-center ${sizeClasses[size]} border-2`}
        style={{
          backgroundColor: bg,
          borderColor: color,
        }}
      >
        <span className="font-extrabold leading-none" style={{ color }}>
          {grade}
        </span>
      </div>
      <div className="text-center">
        <div className="text-2xl font-extrabold text-[#333333]">
          {Math.round(score)}<span className="text-sm font-normal text-gray-400">/100</span>
        </div>
        <div className="text-xs font-semibold" style={{ color }}>
          {gradeToLabel(grade)}
        </div>
      </div>
    </div>
  );
}

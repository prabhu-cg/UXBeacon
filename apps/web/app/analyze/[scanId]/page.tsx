import type { Metadata } from "next";
import { ScanPageClient } from "./ScanPageClient";

interface Props {
  params: Promise<{ scanId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { scanId } = await params;
  return {
    title: `UX Analysis ${scanId.slice(0, 8)} — UXBeacon`,
    description: "View your UX health report with accessibility, heuristics, and content quality findings.",
  };
}

export default async function AnalyzePage({ params }: Props) {
  const { scanId } = await params;
  return <ScanPageClient scanId={scanId} />;
}

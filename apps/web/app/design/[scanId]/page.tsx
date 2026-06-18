import { DesignPageClient } from "./DesignPageClient";

export default async function DesignScanPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = await params;
  return <DesignPageClient scanId={scanId} />;
}

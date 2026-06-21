import { AttentionPageClient } from "./AttentionPageClient";

export default async function AttentionScanPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = await params;
  return <AttentionPageClient scanId={scanId} />;
}

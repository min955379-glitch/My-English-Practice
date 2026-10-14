import { DrillEngine } from "@/components/practice/DrillEngine";
import { levelIds } from "@/lib/curriculum";
export default async function SessionPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const params = await searchParams;
  const level = Number(params.level);
  return <DrillEngine initialLevel={levelIds.has(level) ? level : undefined} />;
}

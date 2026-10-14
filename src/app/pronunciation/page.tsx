import { PronunciationPractice } from "@/components/practice/PronunciationPractice";
import { levelIds } from "@/lib/curriculum";
export default async function PronunciationPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>;
}) {
  const params = await searchParams;
  const level = Number(params.level);
  return (
    <PronunciationPractice initialLevel={levelIds.has(level) ? level : 1} />
  );
}

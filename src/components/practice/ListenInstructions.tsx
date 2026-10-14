"use client";
import { useSpeech } from "@/hooks/useSpeech";
import { Icon } from "@/components/ui/Icon";
export function ListenInstructions({
  text = "Listen to a word. Hear it slowly. Then type its spelling, one letter at a time. If a letter is not right, try that letter again. After two mistakes, you can choose a hint.",
}: {
  text?: string;
}) {
  const speech = useSpeech();
  return (
    <div>
      <button className="text-button" onClick={() => speech.speak(text)}>
        <Icon name="volume" width={16} />
        Hear the instructions
      </button>
      {speech.message && (
        <p className="small muted" role="status">
          {speech.message}
        </p>
      )}
    </div>
  );
}

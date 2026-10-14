"use client";
import { useSyncExternalStore } from "react";
import { usePractice } from "@/components/PracticeProvider";
import { Select } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";
import { hasAudioConsent, setAudioConsent } from "@/lib/audio";
import { selectSpeechVoice } from "@/lib/voices";
import type { useSpeech } from "@/hooks/useSpeech";
function subscribe(change: () => void) {
  window.addEventListener("english-practice-audio-consent", change);
  window.addEventListener("storage", change);
  return () => {
    window.removeEventListener("english-practice-audio-consent", change);
    window.removeEventListener("storage", change);
  };
}
export function AudioSettings({
  speech,
}: {
  speech: ReturnType<typeof useSpeech>;
}) {
  const { data, update } = usePractice();
  const consent = useSyncExternalStore(subscribe, hasAudioConsent, () => false);
  const selection = selectSpeechVoice(
    speech.voices,
    data.settings.voiceGender ?? "female",
    data.settings.preferredVoice,
  );
  return (
    <div className="audio-settings">
      <Select
        label="Audio source"
        value={data.settings.audioSource ?? "device"}
        options={[
          {
            value: "device",
            label: "This device",
            description: "Uses installed browser voices.",
          },
          {
            value: "enhanced",
            label: "Enhanced British audio",
            description:
              "Ryan (male) or Sonia (female). Internet and permission required.",
            disabled: !speech.enhancedAvailable || !consent,
          },
        ]}
        onChange={(audioSource) =>
          update((d) => ({
            ...d,
            settings: {
              ...d.settings,
              audioSource: audioSource as "device" | "enhanced",
            },
          }))
        }
      />
      <p className="audio-status">
        <Icon name="headphones" width={17} />
        {data.settings.audioSource === "enhanced" &&
        speech.enhancedAvailable &&
        consent
          ? "Enhanced British audio selected"
          : "Device voice: " +
            (selection.voice?.name ?? "waiting for installed voices")}
      </p>
      {data.settings.audioSource !== "enhanced" && !selection.genderMatched && (
        <p className="small muted">
          Your browser does not expose a named British{" "}
          {data.settings.voiceGender ?? "female"} voice. Changing this choice
          cannot install one. We use the best installed English voice instead.
        </p>
      )}
      {speech.enhancedAvailable ? (
        <label className="audio-consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setAudioConsent(e.target.checked);
              if (!e.target.checked)
                update((d) => ({
                  ...d,
                  settings: { ...d.settings, audioSource: "device" },
                }));
            }}
          />
          I allow lesson text to be sent to Microsoft for enhanced speech. No
          typed answers or microphone recordings are sent by this feature.
          Permission is for this browser only.
        </label>
      ) : (
        <p className="small muted">
          Enhanced male/female audio is ready to connect, but is not configured
          on this deployment. The operator needs an Azure Speech resource and
          server credentials. Device playback remains available.
        </p>
      )}
    </div>
  );
}

export type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  className?: string;
};

export function ProgressBar({
  value,
  max = 100,
  label = "Session progress",
  className = "",
}: ProgressBarProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = Number.isFinite(value)
    ? Math.min(safeMax, Math.max(0, value))
    : 0;
  const percentage = (safeValue / safeMax) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm font-medium text-calm-text-secondary">{label}</p>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        aria-valuetext={`${Math.round(percentage)} per cent complete`}
        className="h-3 w-full overflow-hidden rounded-full bg-calm-stone-light"
      >
        <div
          className="h-full rounded-full bg-calm-teal-dark transition-[width] duration-300 motion-reduce:transition-none"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

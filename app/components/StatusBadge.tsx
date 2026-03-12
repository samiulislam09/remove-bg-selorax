type StatusBadgeProps = {
  active: boolean;
  label?: [string, string]; // [trueLabel, falseLabel]
};

export default function StatusBadge({
  active,
  label = ["Active", "Inactive"],
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
          : "bg-zinc-100 text-zinc-500 ring-1 ring-zinc-500/10"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-zinc-400"
        }`}
      />
      {active ? label[0] : label[1]}
    </span>
  );
}

type TimeCellProps = {
  date: string;
};

export default function TimeCell({ date }: TimeCellProps) {
  const d = new Date(date);
  const dateStr = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col">
      <span className="text-sm text-zinc-800">{dateStr}</span>
      <span className="text-xs text-zinc-400">{timeStr}</span>
    </div>
  );
}

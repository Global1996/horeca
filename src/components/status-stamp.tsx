import { cn } from "@/lib/utils";

export type StockStatus = "rosu" | "galben" | "verde";

const statusConfig: Record<
  StockStatus,
  { label: string; dot: string; bg: string }
> = {
  rosu: { label: "Sub prag", dot: "bg-danger", bg: "bg-danger/10" },
  galben: { label: "Aproape de prag", dot: "bg-gold", bg: "bg-gold/15" },
  verde: { label: "OK", dot: "bg-olive", bg: "bg-olive/10" },
};

export function StatusStamp({ status }: { status: StockStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium text-ink",
        config.bg
      )}
    >
      <span className={cn("h-2 w-2 shrink-0 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}

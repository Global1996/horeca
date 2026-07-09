import type { StockStatus } from "@/components/status-stamp";

export function getStockStatus(
  currentStock: number,
  minThreshold: number
): StockStatus {
  if (currentStock <= minThreshold) return "rosu";
  if (currentStock <= minThreshold * 1.3) return "galben";
  return "verde";
}

export const stockStatusLabels: Record<StockStatus, string> = {
  rosu: "Sub prag",
  galben: "Aproape de prag",
  verde: "OK",
};

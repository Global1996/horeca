import type { Worksheet } from "exceljs";

export function argbFromHex(hex: string) {
  return `FF${hex.replace("#", "").toUpperCase()}`;
}

export function styleHeaderRow(worksheet: Worksheet, bgHex: string, textHex: string) {
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: argbFromHex(textHex) } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: argbFromHex(bgHex) },
  };
  headerRow.alignment = { vertical: "middle" };
}

export function autoSizeColumns(worksheet: Worksheet) {
  worksheet.columns.forEach((column) => {
    let maxLength = typeof column.header === "string" ? column.header.length : 10;
    column.eachCell?.({ includeEmpty: false }, (cell) => {
      const value = cell.value == null ? "" : String(cell.value);
      maxLength = Math.max(maxLength, value.length);
    });
    column.width = Math.min(Math.max(maxLength + 2, 10), 40);
  });
}

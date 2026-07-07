const numberFormat = new Intl.NumberFormat("ro-RO");

export function formatQuantity(value: number, unit: string) {
  return `${numberFormat.format(value)} ${unit}`;
}

export function formatCategory(category: string) {
  const withSpaces = category.replace(/_/g, " ");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

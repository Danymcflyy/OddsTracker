export function formatOdds(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return value.toFixed(2);
}

export function isOddsInRange(
  odds: number | null | undefined,
  min: number | null,
  max: number | null
): boolean {
  if (odds === null || odds === undefined) return false;
  if (min !== null && odds < min) return false;
  if (max !== null && odds > max) return false;
  return true;
}

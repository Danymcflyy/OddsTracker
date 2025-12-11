export const FOOTBALL_TOTAL_LINES = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5];
export const HOCKEY_TOTAL_LINES = [4.5, 5.5, 6.5];
export const TENNIS_TOTAL_LINES = [20.5, 22.5, 24.5];
export const VOLLEYBALL_TOTAL_LINES = [145.5, 150.5, 155.5];

const TOTAL_LINES_BY_SPORT: Record<number, number[]> = {
  10: FOOTBALL_TOTAL_LINES,
  12: TENNIS_TOTAL_LINES,
  15: HOCKEY_TOTAL_LINES,
  23: VOLLEYBALL_TOTAL_LINES,
};

export function getTotalsLinesForSport(sportId: number): number[] {
  return TOTAL_LINES_BY_SPORT[sportId] ?? [];
}


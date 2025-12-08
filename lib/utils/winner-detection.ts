export interface WinnerResult {
  isWinner: boolean;
  isLoser: boolean;
  isVoid: boolean;
}

export function determineWinner(
  homeScore: number | null,
  awayScore: number | null,
  marketType: string,
  outcome: string,
  line?: number
): WinnerResult {
  // Match non terminé
  if (homeScore === null || awayScore === null) {
    return { isWinner: false, isLoser: false, isVoid: false };
  }

  switch (marketType) {
    case "1X2":
      return determine1X2Winner(homeScore, awayScore, outcome);
    case "OVER_UNDER":
      return determineOverUnderWinner(homeScore, awayScore, outcome, line);
    default:
      return { isWinner: false, isLoser: false, isVoid: false };
  }
}

function determine1X2Winner(
  homeScore: number,
  awayScore: number,
  outcome: string
): WinnerResult {
  const result = homeScore > awayScore ? "1"
               : homeScore < awayScore ? "2"
               : "X";

  return {
    isWinner: result === outcome,
    isLoser: result !== outcome,
    isVoid: false
  };
}

function determineOverUnderWinner(
  homeScore: number,
  awayScore: number,
  outcome: string,
  line?: number
): WinnerResult {
  if (line === undefined) {
    return { isWinner: false, isLoser: false, isVoid: false };
  }

  const totalGoals = homeScore + awayScore;
  const isOver = outcome.startsWith("O") || outcome.startsWith("Over");

  if (totalGoals > line) {
    return {
      isWinner: isOver,
      isLoser: !isOver,
      isVoid: false
    };
  } else if (totalGoals < line) {
    return {
      isWinner: !isOver,
      isLoser: isOver,
      isVoid: false
    };
  } else {
    return { isWinner: false, isLoser: false, isVoid: true };
  }
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLeagueTitle(title: string): string {
  if (!title || !title.includes(' - ')) return title;
  const parts = title.split(' - ');
  const leagueName = parts[0].trim();
  const countryName = parts[1].trim();

  // Map country names from English to French
  const countryMap: Record<string, string> = {
    'England': 'Angleterre',
    'Spain': 'Espagne',
    'Germany': 'Allemagne',
    'Italy': 'Italie',
    'France': 'France',
    'Portugal': 'Portugal',
    'Netherlands': 'Pays-Bas',
    'Belgium': 'Belgique',
    'Turkey': 'Turquie',
    'Greece': 'Grèce',
    'Switzerland': 'Suisse',
    'Austria': 'Autriche',
    'Denmark': 'Danemark',
    'Scotland': 'Écosse',
    'Sweden': 'Suède',
    'Norway': 'Norvège',
    'Finland': 'Finlande',
    'Poland': 'Pologne',
    'Russia': 'Russie',
    'Argentina': 'Argentine',
    'Chile': 'Chili',
    'Colombia': 'Colombie',
    'Uruguay': 'Uruguay',
    'Ecuador': 'Équateur',
    'USA': 'USA',
    'Mexico': 'Mexique',
    'Australia': 'Australie',
    'Japan': 'Japon',
    'South Korea': 'Corée du Sud',
    'China': 'Chine',
    'Saudi Arabia': 'Arabie Saoudite',
    'South Africa': 'Afrique du Sud',
    'Romania': 'Roumanie',
    'Croatia': 'Croatie',
    'Ukraine': 'Ukraine',
    'Europe': 'Europe',
    'CONMEBOL': 'Amérique du Sud',
  };

  const translatedCountry = countryMap[countryName] || countryName;
  return `${leagueName} (${translatedCountry})`;
}


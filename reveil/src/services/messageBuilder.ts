import type { MessageTone, SchoolVacationInfo, WeatherData } from '@/types';
import { WEATHER_EMOJI, WEATHER_LABELS } from '@/services/weatherService';

const DAY_NAMES = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

const DAY_GREETINGS: Record<number, Record<MessageTone, string>> = {
  0: {
    formal: 'Bon dimanche.',
    casual: 'Bon dimanche !',
    humorous: 'Bon dimanche — mode repos activé !',
  },
  1: {
    formal: 'Bon lundi.',
    casual: 'Bon lundi, bon courage pour cette nouvelle semaine !',
    humorous: 'Bon lundi… respirez, on y va doucement !',
  },
  2: {
    formal: 'Bon mardi.',
    casual: 'Bon mardi, en route pour une bonne journée !',
    humorous: 'Bon mardi — la semaine avance, tenez bon !',
  },
  3: {
    formal: 'Bon mercredi.',
    casual: 'Bon mercredi, on est à mi-parcours !',
    humorous: 'Bon mercredi — la descente commence !',
  },
  4: {
    formal: 'Bon jeudi.',
    casual: 'Bon jeudi, presque le week-end !',
    humorous: 'Bon jeudi — encore un petit effort !',
  },
  5: {
    formal: 'Bon vendredi.',
    casual: 'Bon vendredi, plus qu’un effort avant le week-end !',
    humorous: 'Bon vendredi — le week-end est en vue !',
  },
  6: {
    formal: 'Bon samedi.',
    casual: 'Bon samedi, profitez bien !',
    humorous: 'Bon samedi — pas de réveil matinal obligatoire !',
  },
};

const HOLIDAY_GREETINGS: Record<string, Record<MessageTone, string>> = {
  "Jour de l'an": {
    formal: 'Bonne année.',
    casual: 'Bonne année ! Jour de repos bien mérité.',
    humorous: 'Bonne année — les bonnes résolutions peuvent attendre demain !',
  },
  'Fête du Travail': {
    formal: 'Bonne fête du Travail.',
    casual: 'Fête du Travail — pas de travail aujourd’hui !',
    humorous: '1er mai : le travail est officiellement en grève !',
  },
  'Fête Nationale': {
    formal: 'Bonne fête nationale.',
    casual: 'Bon 14 juillet, profitez bien de la fête !',
    humorous: '14 juillet — feu d’artifice ou sieste, à vous de choisir !',
  },
  Noël: {
    formal: 'Joyeux Noël.',
    casual: 'Joyeux Noël !',
    humorous: 'Joyeux Noël — le Père Noël est passé ?',
  },
  'Lundi de Pâques': {
    formal: 'Bon lundi de Pâques.',
    casual: 'Lundi de Pâques — le week-end continue !',
    humorous: 'Lundi de Pâques : chocolat et sieste au programme !',
  },
  'Lundi de Pentecôte': {
    formal: 'Bon lundi de Pentecôte.',
    casual: 'Lundi de Pentecôte — encore un jour de repos !',
    humorous: 'Pentecôte : le week-end version deluxe !',
  },
};

function defaultHolidayGreeting(name: string, tone: MessageTone): string {
  if (tone === 'formal') return `Jour férié : ${name}.`;
  if (tone === 'humorous') return `C’est ${name} — pas la peine de se presser !`;
  return `Jour férié : ${name}. Profitez-en !`;
}

function weatherPart(weather: WeatherData, tone: MessageTone): string {
  const label = WEATHER_LABELS[weather.condition];
  const temp = weather.temp;

  if (weather.condition === 'rain' || weather.condition === 'drizzle') {
    if (tone === 'humorous') return `Il pleut (${temp}°C) — le parapluie, votre meilleur ami ce matin.`;
    return `Il pleut et il fait ${temp}°C, n’oubliez pas votre parapluie.`;
  }
  if (weather.condition === 'snow') {
    return `Il neige (${temp}°C), habillez-vous chaudement et attention aux routes.`;
  }
  if (weather.condition === 'fog') {
    return `Brouillard ce matin (${temp}°C), conduisez prudemment.`;
  }
  if (weather.condition === 'thunderstorm') {
    return `Orage en cours (${temp}°C), restez au sec si possible.`;
  }
  if (temp <= 5) {
    if (tone === 'humorous') return `Il fait ${temp}°C — sortez le manteau d’hiver, oui, encore.`;
    return `Il fait froid ce matin (${temp}°C), habillez-vous chaudement.`;
  }
  if (temp >= 28) {
    return `Il fait déjà chaud (${temp}°C), pensez à vous hydrater.`;
  }
  if (weather.condition === 'clear') {
    if (tone === 'humorous') return `Beau soleil et ${temp}°C — la journée s’annonce ensoleillée !`;
    return `Belle journée ensoleillée à ${temp}°C.`;
  }
  return `${label}, ${temp}°C.`;
}

function forecastPart(weather: WeatherData, tone: MessageTone): string | null {
  const afternoon = (weather.hourly ?? []).filter((h) => {
    const hour = Number(h.time.slice(11, 13));
    return hour >= 12 && hour <= 19;
  });
  const maxRain = afternoon.length ? Math.max(...afternoon.map((h) => h.precipProbability)) : 0;

  if (maxRain >= 55) {
    if (tone === 'humorous') {
      return 'Pluie prévue cet après-midi — le parapluie reste votre meilleur allié.';
    }
    return 'Pluie probable cet après-midi, prévoyez un parapluie.';
  }

  if (weather.todayMax - weather.temp >= 6 && weather.todayMax >= 26) {
    if (tone === 'humorous') {
      return `Ça montera jusqu'à ${weather.todayMax}°C — hydratez-vous comme des champions !`;
    }
    return `Les températures pourront monter jusqu'à ${weather.todayMax}°C cet après-midi.`;
  }

  if (weather.todayMin <= 5 && weather.temp <= 8 && weather.todayMax - weather.todayMin >= 8) {
    return `Écart de température marqué aujourd'hui (${weather.todayMin}° à ${weather.todayMax}°).`;
  }

  return null;
}

function windTip(windSpeed: number): string | null {
  if (windSpeed >= 40) return 'Vent fort prévu, attention dehors.';
  return null;
}

function schoolVacationPart(info: SchoolVacationInfo | null | undefined, tone: MessageTone): string | null {
  if (!info) return null;

  if (info.isRentreeToday) {
    if (tone === 'formal') return `Rentrée scolaire aujourd’hui (zone ${info.zone}).`;
    if (tone === 'humorous') return `Rentrée aujourd’hui (zone ${info.zone}) — courage, le summer body peut attendre !`;
    return `C’est la rentrée scolaire en zone ${info.zone}, bon courage !`;
  }

  if (!info.isVacation || !info.periodName) return null;

  const shortName = info.periodName.replace(/^Vacances /, '').replace(/^de /, '').replace(/^d'/, '').replace(/^la /, '');

  if (info.isRentreeSoon && info.daysRemaining !== undefined) {
    const d = info.daysRemaining;
    if (tone === 'humorous') {
      return d === 0
        ? `Dernier jour des vacances de ${shortName} (zone ${info.zone}) — demain, réveil des champions !`
        : `Plus que ${d} jour${d > 1 ? 's' : ''} de vacances de ${shortName} (zone ${info.zone}) — la rentrée approche.`;
    }
    if (tone === 'formal') {
      return `Fin des vacances de ${shortName} (zone ${info.zone}) dans ${d} jour${d > 1 ? 's' : ''}.`;
    }
    return `Plus que ${d} jour${d > 1 ? 's' : ''} de vacances de ${shortName} en zone ${info.zone} — pensez à préparer la rentrée.`;
  }

  if (tone === 'humorous') {
    return `Vacances de ${shortName} (zone ${info.zone}) — pas d’école, sieste autorisée !`;
  }
  if (tone === 'formal') {
    return `Période de vacances scolaires : ${info.periodName} (zone ${info.zone}).`;
  }
  return `C’est les vacances de ${shortName} en zone ${info.zone}, pas de cours aujourd’hui.`;
}

export function buildWakeMessage(options: {
  date: Date;
  weather: WeatherData | null;
  isHoliday: boolean;
  holidayName?: string;
  isBridge: boolean;
  tone: MessageTone;
  schoolVacation?: SchoolVacationInfo | null;
}): string {
  const { date, weather, isHoliday, holidayName, isBridge, tone, schoolVacation } = options;
  const parts: string[] = [];

  if (isHoliday && holidayName) {
    const custom = HOLIDAY_GREETINGS[holidayName]?.[tone];
    parts.push(custom ?? defaultHolidayGreeting(holidayName, tone));
  } else {
    parts.push(DAY_GREETINGS[date.getDay()][tone]);
  }

  const schoolPart = schoolVacationPart(schoolVacation, tone);
  if (schoolPart) parts.push(schoolPart);

  if (isBridge && tone !== 'formal') {
    parts.push('Demain est férié — vous pourriez faire le pont…');
  }

  if (weather) {
    parts.push(weatherPart(weather, tone));
    const forecast = forecastPart(weather, tone);
    if (forecast) parts.push(forecast);
    const wind = windTip(weather.windSpeed);
    if (wind) parts.push(wind);
  } else {
    parts.push(`Nous sommes ${DAY_NAMES[date.getDay()]}.`);
  }

  return parts.join(' ');
}

export function weatherDisplay(weather: WeatherData | null): { emoji: string; label: string } {
  if (!weather) return { emoji: '🌡️', label: 'Météo indisponible' };
  return {
    emoji: WEATHER_EMOJI[weather.condition],
    label: `${WEATHER_LABELS[weather.condition]} · ${weather.temp}°C`,
  };
}

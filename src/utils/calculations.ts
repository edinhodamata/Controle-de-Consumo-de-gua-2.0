import {
  WaterReading,
  ReadingDelta,
  CalculatedMetrics,
  InvoiceTier,
  InvoiceSimulationResult,
  TierCalculationRow,
  MonthlyConsumptionSummary,
} from '../types/water';

/**
 * Official progressive tariff tiers defined for the residential water & sewage simulation.
 */
export const STANDARD_TIERS: InvoiceTier[] = [
  {
    id: 1,
    name: 'Faixa 1',
    rangeLabel: '0 a 10 m³',
    minM3: 0,
    maxM3: 10,
    waterRate: 6.42,
    sewerRate: 5.13,
  },
  {
    id: 2,
    name: 'Faixa 2',
    rangeLabel: '10 a 20 m³',
    minM3: 10,
    maxM3: 20,
    waterRate: 12.43,
    sewerRate: 9.95,
  },
  {
    id: 3,
    name: 'Faixa 3',
    rangeLabel: '20 a 30 m³',
    minM3: 20,
    maxM3: 30,
    waterRate: 18.98,
    sewerRate: 15.19,
  },
  {
    id: 4,
    name: 'Faixa 4',
    rangeLabel: '30 a 40 m³',
    minM3: 30,
    maxM3: 40,
    waterRate: 25.86,
    sewerRate: 20.69,
  },
  {
    id: 5,
    name: 'Faixa 5',
    rangeLabel: '40 a 60 m³',
    minM3: 40,
    maxM3: 60,
    waterRate: 29.84,
    sewerRate: 23.87,
  },
  {
    id: 6,
    name: 'Faixa 6',
    rangeLabel: 'Acima de 60 m³',
    minM3: 60,
    maxM3: null,
    waterRate: 29.84,
    sewerRate: 23.87,
  },
];

/**
 * Sorts readings in chronological ascending order.
 */
export function sortReadingsChronologically(readings: WaterReading[]): WaterReading[] {
  return [...readings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Computes consecutive deltas and flow rates for each reading.
 */
export function computeReadingDeltas(readings: WaterReading[]): ReadingDelta[] {
  const sorted = sortReadingsChronologically(readings);
  if (sorted.length === 0) return [];

  // Calculate flow rates first to identify peak
  let maxFlow = -1;
  const intermediate: Array<{
    reading: WaterReading;
    previousReading?: WaterReading;
    deltaLiters: number;
    deltaM3: number;
    hoursElapsed: number;
    flowRateLh: number;
  }> = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = i > 0 ? sorted[i - 1] : undefined;

    if (!prev) {
      intermediate.push({
        reading: current,
        deltaLiters: 0,
        deltaM3: 0,
        hoursElapsed: 0,
        flowRateLh: 0,
      });
      continue;
    }

    const deltaLiters = current.value - prev.value;
    const deltaM3 = deltaLiters / 1000;
    const diffMs = new Date(current.timestamp).getTime() - new Date(prev.timestamp).getTime();
    const hoursElapsed = diffMs > 0 ? diffMs / (1000 * 60 * 60) : 0;
    const flowRateLh = hoursElapsed > 0 && deltaLiters > 0 ? deltaLiters / hoursElapsed : 0;

    if (flowRateLh > maxFlow) {
      maxFlow = flowRateLh;
    }

    intermediate.push({
      reading: current,
      previousReading: prev,
      deltaLiters,
      deltaM3,
      hoursElapsed,
      flowRateLh,
    });
  }

  const latestIndex = sorted.length - 1;

  return intermediate.map((item, index) => ({
    ...item,
    isPeak: maxFlow > 0 && Math.abs(item.flowRateLh - maxFlow) < 0.01,
    isLatest: index === latestIndex,
  }));
}

/**
 * Formats duration in hours to human-friendly Portuguese string (e.g., "14 dias e 6 horas").
 */
export function formatPeriodHours(hours: number): string {
  if (hours <= 0) return '0h';
  if (hours < 24) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  if (remainingHours === 0) {
    return days === 1 ? '1 dia' : `${days} dias`;
  }
  const dayStr = days === 1 ? '1 dia' : `${days} dias`;
  return `${dayStr} e ${remainingHours}h`;
}

/**
 * Computes summary indicators for the dashboard.
 */
export function calculateMetrics(readings: WaterReading[]): CalculatedMetrics {
  const sorted = sortReadingsChronologically(readings);

  if (sorted.length < 2) {
    return {
      readingCount: sorted.length,
      hasEnoughData: false,
      firstReading: sorted[0],
      lastReading: sorted[sorted.length - 1],
      totalConsumptionLiters: 0,
      totalConsumptionM3: 0,
      monitoredPeriodHours: 0,
      monitoredPeriodDays: 0,
      monitoredPeriodFormatted: '0h',
      averageRateLh: 0,
      dailyProjectionLiters: 0,
      monthlyProjectionM3: 0,
      peakFlowRateLh: 0,
    };
  }

  const firstReading = sorted[0];
  const lastReading = sorted[sorted.length - 1];

  // Consumo total: última leitura menos primeira leitura em litros
  const totalConsumptionLiters = Math.max(0, lastReading.value - firstReading.value);
  const totalConsumptionM3 = totalConsumptionLiters / 1000;

  // Período monitorado em milissegundos e horas
  const startMs = new Date(firstReading.timestamp).getTime();
  const endMs = new Date(lastReading.timestamp).getTime();
  const periodMs = Math.max(0, endMs - startMs);
  const monitoredPeriodHours = periodMs / (1000 * 60 * 60);
  const monitoredPeriodDays = monitoredPeriodHours / 24;
  const monitoredPeriodFormatted = formatPeriodHours(monitoredPeriodHours);

  // Taxa média: consumo total dividido pelo período em horas, em L/h
  const averageRateLh = monitoredPeriodHours > 0 ? totalConsumptionLiters / monitoredPeriodHours : 0;

  // Projeção diária: taxa média multiplicada por 24, em L/dia
  const dailyProjectionLiters = averageRateLh * 24;
  // Projeção mensal (base 30 dias) em m³
  const monthlyProjectionM3 = (dailyProjectionLiters * 30) / 1000;

  // Pico de consumo: maior variação positiva entre duas leituras consecutivas / intervalo em horas
  let peakFlowRateLh = 0;
  let peakInterval: CalculatedMetrics['peakInterval'] = undefined;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const deltaL = curr.value - prev.value;
    const intervalHours = (new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime()) / (1000 * 60 * 60);

    if (deltaL > 0 && intervalHours > 0) {
      const flow = deltaL / intervalHours;
      if (flow > peakFlowRateLh) {
        peakFlowRateLh = flow;
        peakInterval = {
          from: prev,
          to: curr,
          deltaLiters: deltaL,
          hours: intervalHours,
        };
      }
    }
  }

  return {
    readingCount: sorted.length,
    hasEnoughData: true,
    firstReading,
    lastReading,
    totalConsumptionLiters,
    totalConsumptionM3,
    monitoredPeriodHours,
    monitoredPeriodDays,
    monitoredPeriodFormatted,
    averageRateLh,
    dailyProjectionLiters,
    monthlyProjectionM3,
    peakFlowRateLh,
    peakInterval,
  };
}

/**
 * Calculates progressive water and sewage billing by tier.
 */
export function simulateProgressiveInvoice(
  consumptionM3: number,
  tiers: InvoiceTier[] = STANDARD_TIERS
): InvoiceSimulationResult {
  const safeM3 = Math.max(0, Number(consumptionM3) || 0);
  let remainingM3 = safeM3;

  let totalWater = 0;
  let totalSewer = 0;

  const rows: TierCalculationRow[] = tiers.map((tier) => {
    let billedM3 = 0;

    if (tier.maxM3 === null) {
      // Tier above 60 m³
      billedM3 = Math.max(0, remainingM3);
      remainingM3 = 0;
    } else {
      const tierBandSpan = tier.maxM3 - tier.minM3;
      billedM3 = Math.min(Math.max(0, remainingM3), tierBandSpan);
      remainingM3 = Math.max(0, remainingM3 - billedM3);
    }

    const waterSubtotal = billedM3 * tier.waterRate;
    const sewerSubtotal = billedM3 * tier.sewerRate;
    const tierTotal = waterSubtotal + sewerSubtotal;

    totalWater += waterSubtotal;
    totalSewer += sewerSubtotal;

    return {
      tier,
      billedM3,
      waterSubtotal,
      sewerSubtotal,
      tierTotal,
    };
  });

  return {
    inputM3: safeM3,
    totalWater,
    totalSewer,
    grandTotal: totalWater + totalSewer,
    rows,
  };
}

/**
 * Groups readings by month to allow chronological monthly comparison.
 */
export function groupReadingsByMonth(readings: WaterReading[]): MonthlyConsumptionSummary[] {
  const sorted = sortReadingsChronologically(readings);
  if (sorted.length < 2) return [];

  const groups: { [key: string]: WaterReading[] } = {};

  sorted.forEach((r) => {
    const d = new Date(r.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  return Object.keys(groups)
    .sort()
    .map((yearMonth) => {
      const items = groups[yearMonth];
      const [year, month] = yearMonth.split('-');
      const label = `${monthNames[parseInt(month, 10) - 1]} ${year}`;

      const first = items[0];
      const last = items[items.length - 1];
      const totalLiters = Math.max(0, last.value - first.value);
      const totalM3 = totalLiters / 1000;

      const startMs = new Date(first.timestamp).getTime();
      const endMs = new Date(last.timestamp).getTime();
      const daysSpan = Math.max(1, (endMs - startMs) / (1000 * 60 * 60 * 24));
      const avgDailyLiters = totalLiters / daysSpan;

      return {
        yearMonth,
        label,
        firstReadingValue: first.value,
        lastReadingValue: last.value,
        totalLiters,
        totalM3,
        readingCount: items.length,
        daysSpan: Math.round(daysSpan * 10) / 10,
        avgDailyLiters: Math.round(avgDailyLiters),
      };
    });
}

/**
 * Format currency in Brazilian Real (BRL).
 */
export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format numeric values with pt-BR thousand separators.
 */
export function formatNumberBR(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format date & time in Brazilian format (DD/MM/YYYY às HH:mm).
 */
export function formatDateTimeBR(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}

/**
 * Format short date (DD/MM HH:mm).
 */
export function formatShortDateTimeBR(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month} ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}

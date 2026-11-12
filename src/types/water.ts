/**
 * Types and interfaces for the Água Control residential monitoring system.
 */

export interface WaterReading {
  id: string;
  timestamp: string; // ISO 8601 string: YYYY-MM-DDTHH:mm
  value: number; // Meter reading in integer liters
  notes?: string; // Optional user notes
}

export interface ReadingDelta {
  reading: WaterReading;
  previousReading?: WaterReading;
  deltaLiters: number;
  deltaM3: number;
  hoursElapsed: number;
  flowRateLh: number; // L/h
  isPeak: boolean;
  isLatest: boolean;
}

export interface CalculatedMetrics {
  readingCount: number;
  hasEnoughData: boolean;
  firstReading?: WaterReading;
  lastReading?: WaterReading;
  totalConsumptionLiters: number;
  totalConsumptionM3: number;
  monitoredPeriodHours: number;
  monitoredPeriodDays: number;
  monitoredPeriodFormatted: string;
  averageRateLh: number; // L/h
  dailyProjectionLiters: number; // L/day
  monthlyProjectionM3: number; // m3/month
  peakFlowRateLh: number; // L/h
  peakInterval?: {
    from: WaterReading;
    to: WaterReading;
    deltaLiters: number;
    hours: number;
  };
}

export interface InvoiceTier {
  id: number;
  name: string;
  rangeLabel: string;
  minM3: number;
  maxM3: number | null; // null for above 60
  waterRate: number; // R$/m³
  sewerRate: number; // R$/m³
}

export interface TierCalculationRow {
  tier: InvoiceTier;
  billedM3: number;
  waterSubtotal: number;
  sewerSubtotal: number;
  tierTotal: number;
}

export interface InvoiceSimulationResult {
  inputM3: number;
  totalWater: number;
  totalSewer: number;
  grandTotal: number;
  rows: TierCalculationRow[];
}

export interface MonthlyConsumptionSummary {
  yearMonth: string; // "2026-03"
  label: string; // "Março 2026"
  firstReadingValue: number;
  lastReadingValue: number;
  totalLiters: number;
  totalM3: number;
  readingCount: number;
  daysSpan: number;
  avgDailyLiters: number;
}

export type DataSourceMode = 'demo' | 'local';

export interface ConsumptionAlertSettings {
  enabled: boolean;
  limitM3: number; // Consumption ceiling in m³
  warningThresholdPercent: number; // e.g. 80% (approaching limit)
}

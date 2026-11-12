import React from 'react';
import { CalculatedMetrics, DataSourceMode, ConsumptionAlertSettings } from '../types/water';
import { formatNumberBR, formatDateTimeBR } from '../utils/calculations';
import {
  Droplet,
  Activity,
  Clock,
  Plus,
  Calculator,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Settings,
} from 'lucide-react';

interface OverviewProps {
  metrics: CalculatedMetrics;
  mode: DataSourceMode;
  alertSettings?: ConsumptionAlertSettings;
  onOpenNewReadingForm: () => void;
  onScrollToSimulator: () => void;
  onScrollToSettings?: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  metrics,
  mode,
  alertSettings,
  onOpenNewReadingForm,
  onScrollToSimulator,
  onScrollToSettings,
}) => {
  const latest = metrics.lastReading;

  // Split meter reading into m³ (black background) and fractional liters (red background),
  // just like authentic Brazilian residential water meters (hidrômetro unijato/multijato).
  const formatMeterDigits = (val: number | undefined) => {
    if (val === undefined) return { m3Str: '00000', literStr: '000' };
    const m3 = Math.floor(val / 1000);
    const remainderLiters = val % 1000;
    const m3Str = String(m3).padStart(5, '0');
    const literStr = String(remainderLiters).padStart(3, '0');
    return { m3Str, literStr };
  };

  const { m3Str, literStr } = formatMeterDigits(latest?.value);

  // Consumption Limit Notification calculations
  const currentConsumptionM3 = metrics.hasEnoughData ? metrics.totalConsumptionM3 : 0;
  const ceilingM3 = alertSettings?.limitM3 || 10;
  const warningThreshold = alertSettings?.warningThresholdPercent || 80;
  const isAlertEnabled = alertSettings?.enabled ?? true;

  const percentUsed = ceilingM3 > 0 ? (currentConsumptionM3 / ceilingM3) * 100 : 0;
  const remainingM3 = Math.max(0, ceilingM3 - currentConsumptionM3);
  const exceededM3 = Math.max(0, currentConsumptionM3 - ceilingM3);

  const isExceeded = percentUsed >= 100;
  const isApproaching = percentUsed >= warningThreshold && !isExceeded;

  return (
    <section id="visao-geral" className="scroll-mt-6 mb-8">
      {/* Editorial Title & Welcome */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider mb-1">
            <span>Painel Residencial</span>
            <span aria-hidden="true">·</span>
            <span>{mode === 'demo' ? 'Modo de Demonstração' : 'Armazenamento Local'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Controle do Hidrômetro
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Monitore suas leituras periódicas, identifique alterações no ritmo de consumo e projete o valor da sua fatura mensal de água e esgoto.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenNewReadingForm}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm shadow-sm hover:shadow-sky-500/10 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Leitura</span>
          </button>
          <button
            type="button"
            onClick={onScrollToSimulator}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-sm border border-slate-200 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Simulador</span>
          </button>
        </div>
      </div>

      {/* Hero Residential Card with Physical Meter Visualizer */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs mb-4 transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Authentic Meter Display */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs text-sky-600 dark:text-sky-400 shrink-0">
              <Droplet className="w-8 h-8 fill-sky-500 text-sky-600 dark:text-sky-400" />
            </div>

            <div className="flex-1 w-full">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                <span className="font-medium text-slate-700 dark:text-slate-200">Mostrador do Hidrômetro</span>
                {latest && (
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    Última leitura: {formatDateTimeBR(latest.timestamp)}
                  </span>
                )}
              </div>

              {/* Physical Meter Digit Counter Drums */}
              <div className="inline-flex items-center bg-slate-900 p-2 rounded-xl border-2 border-slate-800 shadow-inner font-mono tracking-widest text-lg sm:text-2xl font-bold select-none overflow-x-auto max-w-full">
                {/* m3 digits (black/white) */}
                <div className="flex gap-1 pr-1.5" title="Consumo faturável em metros cúbicos (m³)">
                  {m3Str.split('').map((digit, i) => (
                    <span
                      key={`m3-${i}`}
                      className="w-7 h-9 sm:w-8 sm:h-10 bg-slate-950 text-white border border-slate-700/60 rounded flex items-center justify-center shadow-xs"
                    >
                      {digit}
                    </span>
                  ))}
                </div>

                <span className="text-slate-500 font-light px-0.5">,</span>

                {/* Liters fractional digits (red on white) */}
                <div className="flex gap-1 pl-1.5 border-l border-slate-700" title="Fração em litros (L)">
                  {literStr.split('').map((digit, i) => (
                    <span
                      key={`lit-${i}`}
                      className="w-7 h-9 sm:w-8 sm:h-10 bg-rose-600 text-white border border-rose-700 rounded flex items-center justify-center shadow-xs"
                    >
                      {digit}
                    </span>
                  ))}
                </div>

                <div className="ml-3 pl-2 border-l border-slate-700/80 flex flex-col justify-center text-[10px] text-slate-400 font-sans tracking-normal leading-tight">
                  <span className="font-semibold text-white">m³</span>
                  <span className="text-rose-400">litros</span>
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>Total registrado no aparelho:</span>
                <strong className="text-slate-800 dark:text-slate-200 font-mono">
                  {latest ? `${formatNumberBR(latest.value)} L` : 'Nenhuma leitura'}
                </strong>
                {latest?.notes && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-600 dark:text-slate-300 italic truncate max-w-xs">{latest.notes}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Quick Status Highlights */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-sky-50/60 dark:bg-sky-950/40 rounded-xl border border-sky-100 dark:border-sky-900/60">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 dark:text-sky-300 mb-1">
                  <Activity className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Ritmo Médio</span>
                </div>
                <div className="text-xl font-bold font-mono text-sky-950 dark:text-sky-100 tabular-nums">
                  {metrics.hasEnoughData ? `${formatNumberBR(metrics.averageRateLh, 1)}` : '—'}
                  <span className="text-xs font-sans font-normal text-sky-700 dark:text-sky-400 ml-1">L/h</span>
                </div>
                <p className="text-[11px] text-sky-800/80 dark:text-sky-300/80 mt-1">
                  {metrics.hasEnoughData
                    ? `~${formatNumberBR(metrics.dailyProjectionLiters, 0)} L/dia`
                    : 'Aguardando 2ª leitura'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Acompanhamento</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {metrics.hasEnoughData ? metrics.monitoredPeriodFormatted : '0h'}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {metrics.readingCount} {metrics.readingCount === 1 ? 'leitura gravada' : 'leituras gravadas'}
                </p>
              </div>
            </div>

            {/* Concise insight line */}
            <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <span>Consumo faturável no período:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                {metrics.hasEnoughData ? `${formatNumberBR(metrics.totalConsumptionM3, 3)} m³` : '0 m³'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Consumption Limit Notification Card in Visão Geral */}
      {isAlertEnabled && (
        <div
          className={`rounded-2xl border p-4.5 sm:p-5 transition-all shadow-xs ${
            isExceeded
              ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
              : isApproaching
              ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
              : 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="flex items-start sm:items-center gap-3">
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isExceeded
                    ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                    : isApproaching
                    ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {isExceeded ? (
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                ) : isApproaching ? (
                  <AlertCircle className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm sm:text-base">
                    {isExceeded
                      ? 'Alerta: Teto de Consumo Ultrapassado!'
                      : isApproaching
                      ? 'Atenção: Consumo se Aproximando do Teto Definido'
                      : 'Consumo sob Controle (Dentro da Meta)'}
                  </h3>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                      isExceeded
                        ? 'bg-rose-200/80 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200'
                        : isApproaching
                        ? 'bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200'
                        : 'bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200'
                    }`}
                  >
                    {percentUsed.toFixed(0)}% do limite
                  </span>
                </div>
                <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                  {isExceeded ? (
                    <>
                      Você consumiu <strong>{formatNumberBR(currentConsumptionM3, 3)} m³</strong>, excedendo a meta estipulada de <strong>{ceilingM3} m³</strong> em <strong>+{formatNumberBR(exceededM3, 3)} m³</strong> (+{formatNumberBR(exceededM3 * 1000)} L).
                    </>
                  ) : isApproaching ? (
                    <>
                      O consumo atual atingiu <strong>{percentUsed.toFixed(1)}%</strong> da sua meta mensal de <strong>{ceilingM3} m³</strong>. Restam apenas <strong>{formatNumberBR(remainingM3, 3)} m³</strong> (~{formatNumberBR(remainingM3 * 1000)} L) até o teto estipulado.
                    </>
                  ) : (
                    <>
                      Consumo atual de <strong>{formatNumberBR(currentConsumptionM3, 3)} m³</strong> está dentro do limite residencial de <strong>{ceilingM3} m³</strong>. Margem disponível: <strong>{formatNumberBR(remainingM3, 3)} m³</strong>.
                    </>
                  )}
                </p>
              </div>
            </div>

            {onScrollToSettings && (
              <button
                type="button"
                onClick={onScrollToSettings}
                className="self-end md:self-center flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/90 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer shrink-0"
                title="Alterar limite de consumo nas configurações"
              >
                <Settings className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Ajustar Teto ({ceilingM3} m³)</span>
              </button>
            )}
          </div>

          {/* Progress Bar of Consumption Ceiling */}
          <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
              <span>0 m³</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Consumo: {formatNumberBR(currentConsumptionM3, 3)} m³ / Meta: {ceilingM3} m³
              </span>
              <span className="font-bold">
                {isExceeded ? `>${ceilingM3} m³` : `${ceilingM3} m³`}
              </span>
            </div>

            <div className="relative w-full h-3 bg-white/80 dark:bg-slate-800 rounded-full overflow-hidden border border-black/10 dark:border-white/10">
              {/* Approaching threshold line (80%) */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-600/60 dark:bg-amber-400/80 z-10"
                style={{ left: `${Math.min(100, warningThreshold)}%` }}
                title={`Aviso de aproximação (${warningThreshold}%)`}
              />

              {/* Progress bar fill */}
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isExceeded
                    ? 'bg-rose-600'
                    : isApproaching
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, percentUsed)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              <span>Nível inicial</span>
              <span className="text-amber-700 dark:text-amber-400 font-medium">Marcador de atenção ({warningThreshold}%)</span>
              <span>Teto ({ceilingM3} m³)</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

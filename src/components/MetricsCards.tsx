import React from 'react';
import { CalculatedMetrics } from '../types/water';
import { formatNumberBR, formatShortDateTimeBR } from '../utils/calculations';
import { Droplet, Calendar, Gauge, TrendingUp, Zap, Info } from 'lucide-react';

interface MetricsCardsProps {
  metrics: CalculatedMetrics;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  if (!metrics.hasEnoughData) {
    return (
      <section id="indicadores" className="scroll-mt-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Indicadores de Consumo
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Métricas calculadas a partir das diferenças entre leituras sucessivas
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center shadow-xs transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400 mx-auto mb-3">
            <Info className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Aguardando pelo menos duas leituras
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            {metrics.readingCount === 0
              ? 'Nenhuma leitura registrada até o momento. Cadastre a primeira leitura do hidrômetro no formulário abaixo.'
              : 'Você já possui 1 leitura cadastrada. Registre uma segunda leitura com data e hora posteriores para calcular consumo total, taxa média e gráficos.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="indicadores" className="scroll-mt-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Indicadores de Desempenho
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cálculos dinâmicos entre {metrics.firstReading ? formatShortDateTimeBR(metrics.firstReading.timestamp) : ''} e {metrics.lastReading ? formatShortDateTimeBR(metrics.lastReading.timestamp) : ''}
          </p>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {metrics.readingCount} leituras analisadas
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Consumo Total */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4.5 shadow-xs hover:border-sky-200 dark:hover:border-sky-800 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Consumo Total</span>
            <div className="p-1.5 bg-sky-50 dark:bg-sky-950/60 rounded-lg text-sky-600 dark:text-sky-400">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatNumberBR(metrics.totalConsumptionLiters)}
            <span className="text-xs font-sans font-normal text-slate-500 dark:text-slate-400 ml-1">L</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Faturável:</span>
            <strong className="font-mono text-slate-900 dark:text-slate-200">
              {formatNumberBR(metrics.totalConsumptionM3, 3)} m³
            </strong>
          </div>
        </div>

        {/* 2. Período Monitorado */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4.5 shadow-xs hover:border-sky-200 dark:hover:border-sky-800 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Período Monitorado</span>
            <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {metrics.monitoredPeriodFormatted}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Total em horas:</span>
            <strong className="font-mono text-slate-900 dark:text-slate-200">
              {formatNumberBR(metrics.monitoredPeriodHours, 1)}h
            </strong>
          </div>
        </div>

        {/* 3. Taxa Média */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4.5 shadow-xs hover:border-sky-200 dark:hover:border-sky-800 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Taxa Média</span>
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatNumberBR(metrics.averageRateLh, 1)}
            <span className="text-xs font-sans font-normal text-slate-500 dark:text-slate-400 ml-1">L/h</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Por minuto:</span>
            <strong className="font-mono text-slate-900 dark:text-slate-200">
              {formatNumberBR(metrics.averageRateLh / 60, 2)} L/min
            </strong>
          </div>
        </div>

        {/* 4. Projeção Diária */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4.5 shadow-xs hover:border-sky-200 dark:hover:border-sky-800 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Projeção Diária</span>
            <div className="p-1.5 bg-sky-50 dark:bg-sky-950/60 rounded-lg text-sky-600 dark:text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
            {formatNumberBR(metrics.dailyProjectionLiters, 0)}
            <span className="text-xs font-sans font-normal text-slate-500 dark:text-slate-400 ml-1">L/dia</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Mês (30 dias):</span>
            <strong className="font-mono text-slate-900 dark:text-slate-200">
              ~{formatNumberBR(metrics.monthlyProjectionM3, 1)} m³
            </strong>
          </div>
        </div>

        {/* 5. Pico de Consumo (Laranja discreto para vazão/alerta) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4.5 shadow-xs hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Pico de Vazão</span>
            <div className="p-1.5 bg-orange-50 dark:bg-orange-950/60 rounded-lg text-orange-600 dark:text-orange-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-orange-700 dark:text-orange-400 tabular-nums">
            {formatNumberBR(metrics.peakFlowRateLh, 1)}
            <span className="text-xs font-sans font-normal text-slate-500 dark:text-slate-400 ml-1">L/h</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 truncate">
            {metrics.peakInterval ? (
              <span title={`Intervalo de ${formatNumberBR(metrics.peakInterval.deltaLiters)} L em ${formatNumberBR(metrics.peakInterval.hours, 1)}h`}>
                {formatShortDateTimeBR(metrics.peakInterval.to.timestamp)}
              </span>
            ) : (
              <span>Sem picos isolados</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { WaterReading } from '../types/water';
import { groupReadingsByMonth, formatNumberBR } from '../utils/calculations';
import { CalendarDays, TrendingUp, Info } from 'lucide-react';

interface MonthlyHistoryProps {
  readings: WaterReading[];
  onSelectMonthForSimulator?: (m3: number) => void;
}

export const MonthlyHistory: React.FC<MonthlyHistoryProps> = ({
  readings,
  onSelectMonthForSimulator,
}) => {
  const monthlyData = groupReadingsByMonth(readings);

  return (
    <section id="historico-mensal" className="scroll-mt-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Comparativo Mensal de Consumo
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe e compare o histórico acumulado por período mensal
          </p>
        </div>
      </div>

      {monthlyData.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mx-auto mb-2.5">
            <CalendarDays className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Histórico mensal em formação
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            Conforme você registrar leituras ao longo dos dias e meses, este painel apresentará o comparativo mensal com total faturável em m³ e média diária por mês.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthlyData.map((item) => (
            <div
              key={item.yearMonth}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-sky-300 dark:hover:border-sky-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-sky-50 dark:bg-sky-950/40 rounded-lg text-sky-700 dark:text-sky-300">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                    {item.readingCount} {item.readingCount === 1 ? 'leitura' : 'leituras'}
                  </span>
                </div>

                <div className="my-2 p-3 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
                  <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                    Consumo Registrado no Mês
                  </span>
                  <div className="flex items-baseline gap-2 font-mono">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                      {formatNumberBR(item.totalM3, 3)}
                    </span>
                    <span className="text-sm font-sans font-semibold text-slate-600 dark:text-slate-300">
                      m³
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                      ({formatNumberBR(item.totalLiters)} L)
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Período coberto:</span>
                    <strong className="font-mono text-slate-800 dark:text-slate-200">
                      ~{formatNumberBR(item.daysSpan, 1)} dias
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Média diária no mês:</span>
                    <strong className="font-mono text-slate-800 dark:text-slate-200">
                      {formatNumberBR(item.avgDailyLiters)} L/dia
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Leituras (início → fim):</span>
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {formatNumberBR(item.firstReadingValue)} L → {formatNumberBR(item.lastReadingValue)} L
                    </span>
                  </div>
                </div>
              </div>

              {onSelectMonthForSimulator && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onSelectMonthForSimulator(item.totalM3)}
                    className="w-full py-1.5 px-3 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:text-sky-800 dark:hover:text-sky-200 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100/70 dark:hover:bg-sky-900/50 border border-sky-100 dark:border-sky-800/60 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Simular Fatura deste Mês ({item.totalM3.toFixed(2)} m³)</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

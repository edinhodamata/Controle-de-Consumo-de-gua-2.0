import React, { useState } from 'react';
import { WaterReading } from '../types/water';
import {
  computeReadingDeltas,
  formatNumberBR,
  formatDateTimeBR,
  formatShortDateTimeBR,
} from '../utils/calculations';
import {
  ClipboardList,
  Edit2,
  Trash2,
  Search,
  Zap,
  ArrowUpRight,
  Sparkles,
  Download,
} from 'lucide-react';

interface ReadingsHistoryProps {
  readings: WaterReading[];
  onEditReading: (reading: WaterReading) => void;
  onRequestDeleteReading: (reading: WaterReading) => void;
  onExportData?: () => void;
}

export const ReadingsHistory: React.FC<ReadingsHistoryProps> = ({
  readings,
  onEditReading,
  onRequestDeleteReading,
  onExportData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const deltas = computeReadingDeltas(readings);

  // Reverse deltas to show latest reading first in table, while preserving computed differences
  const reversedDeltas = [...deltas].reverse();

  // Filter based on date string, notes, or value
  const filtered = reversedDeltas.filter((d) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const dateFormatted = formatDateTimeBR(d.reading.timestamp).toLowerCase();
    const valStr = String(d.reading.value);
    const noteStr = (d.reading.notes || '').toLowerCase();
    return dateFormatted.includes(term) || valStr.includes(term) || noteStr.includes(term);
  });

  return (
    <section id="leituras" className="scroll-mt-6 mb-8">
      {/* Header with Title and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Histórico de Leituras
            </h2>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
              {readings.length} {readings.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhamento cronológico com variações de volume e vazão apuradas
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Filter */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por data ou nota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 w-44 sm:w-56 transition-all"
            />
          </div>

          {onExportData && readings.length > 0 && (
            <button
              type="button"
              onClick={onExportData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shrink-0 shadow-2xs cursor-pointer"
              title="Baixar cópia de segurança em arquivo JSON"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          )}
        </div>
      </div>

      {readings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-xs">
          <ClipboardList className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Nenhuma leitura registrada
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Utilize o formulário acima para registrar sua primeira leitura do hidrômetro.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-800 font-semibold select-none">
                <tr>
                  <th scope="col" className="py-3 px-4">
                    Data e Hora
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Hidrômetro (Litros)
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Variação (Δ)
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Vazão Média
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Observação
                  </th>
                  <th scope="col" className="py-3 px-4 text-center">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((d) => {
                  const isPositive = d.deltaLiters >= 0;
                  return (
                    <tr
                      key={d.reading.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors ${
                        d.isLatest ? 'bg-sky-50/30 dark:bg-sky-950/20' : ''
                      }`}
                    >
                      {/* Date & Tags */}
                      <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {formatDateTimeBR(d.reading.timestamp)}
                          </span>
                          {d.isLatest && (
                            <span className="text-[10px] font-sans font-semibold text-sky-700 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800/60 px-2 py-0.5 rounded-md whitespace-nowrap">
                              Mais recente
                            </span>
                          )}
                          {d.isPeak && (
                            <span className="text-[10px] font-sans font-semibold text-orange-700 dark:text-orange-300 bg-orange-100/80 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-800/60 px-2 py-0.5 rounded-md flex items-center gap-0.5 whitespace-nowrap">
                              <Zap className="w-2.5 h-2.5" />
                              Pico
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Meter Value */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {formatNumberBR(d.reading.value)} L
                        <span className="block text-[11px] font-normal text-slate-400 dark:text-slate-500">
                          {(d.reading.value / 1000).toFixed(3)} m³
                        </span>
                      </td>

                      {/* Delta */}
                      <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                        {d.previousReading ? (
                          <>
                            <span
                              className={`font-semibold ${
                                isPositive ? 'text-slate-800 dark:text-slate-200' : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {isPositive ? '+' : ''}
                              {formatNumberBR(d.deltaLiters)} L
                            </span>
                            <span className="block text-[11px] text-slate-400 dark:text-slate-500">
                              {isPositive ? '+' : ''}
                              {formatNumberBR(d.deltaM3, 3)} m³
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic font-sans">
                            Leitura inicial
                          </span>
                        )}
                      </td>

                      {/* Flow Rate */}
                      <td className="py-3.5 px-4 text-right font-mono whitespace-nowrap">
                        {d.previousReading ? (
                          <>
                            <span
                              className={`font-semibold ${
                                d.isPeak ? 'text-orange-700 dark:text-orange-300 font-bold' : 'text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {formatNumberBR(d.flowRateLh, 1)} L/h
                            </span>
                            <span className="block text-[11px] text-slate-400 dark:text-slate-500">
                              em {formatNumberBR(d.hoursElapsed, 1)}h
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {d.reading.notes ? (
                          <span title={d.reading.notes}>{d.reading.notes}</span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 italic">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditReading(d.reading)}
                            aria-label={`Editar leitura de ${formatShortDateTimeBR(d.reading.timestamp)}`}
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-sky-700 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Editar esta leitura"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRequestDeleteReading(d.reading)}
                            aria-label={`Excluir leitura de ${formatShortDateTimeBR(d.reading.timestamp)}`}
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir esta leitura"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Info Strip */}
          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-850 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between flex-wrap gap-2">
            <span>
              Exibindo <strong className="text-slate-700 dark:text-slate-200">{filtered.length}</strong> de {readings.length} leituras
            </span>
            <span className="text-slate-400 dark:text-slate-500">
              * A variação é calculada em relação à leitura imediatamente anterior no tempo.
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

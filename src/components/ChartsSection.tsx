import React, { useState, useId } from 'react';
import { WaterReading } from '../types/water';
import {
  sortReadingsChronologically,
  computeReadingDeltas,
  formatNumberBR,
  formatShortDateTimeBR,
  formatDateTimeBR,
} from '../utils/calculations';
import { LineChart, Activity, Info, Eye } from 'lucide-react';

interface ChartsSectionProps {
  readings: WaterReading[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ readings }) => {
  const [activeTab, setActiveTab] = useState<'consumption' | 'flow' | 'both'>('both');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const maskId = useId();
  const sorted = sortReadingsChronologically(readings);
  const deltas = computeReadingDeltas(sorted);

  if (sorted.length < 2) {
    return (
      <section id="graficos" className="scroll-mt-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Gráficos de Consumo e Vazão
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evolução do volume acumulado e ritmo horário
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-xs transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/50 flex items-center justify-center text-sky-600 dark:text-sky-400 mx-auto mb-3">
            <LineChart className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Gráficos requerem no mínimo duas leituras
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
            Assim que você cadastrar ao menos duas leituras, o gráfico traçará a curva de consumo acumulado (L) e o comportamento da vazão em litros por hora (L/h).
          </p>
        </div>
      </section>
    );
  }

  // Baseline data points
  const baseValue = sorted[0].value;
  const chartPoints = deltas.map((d, index) => {
    const accumulatedLiters = Math.max(0, d.reading.value - baseValue);
    return {
      index,
      timestamp: d.reading.timestamp,
      dateFormatted: formatShortDateTimeBR(d.reading.timestamp),
      fullDate: formatDateTimeBR(d.reading.timestamp),
      meterValue: d.reading.value,
      accumulatedLiters,
      flowRateLh: d.flowRateLh,
      deltaLiters: d.deltaLiters,
      hoursElapsed: d.hoursElapsed,
      notes: d.reading.notes,
    };
  });

  // Calculate scales
  const maxAccumulated = Math.max(...chartPoints.map((p) => p.accumulatedLiters), 100);
  const maxFlow = Math.max(...chartPoints.map((p) => p.flowRateLh), 10);

  // SVG dimensions
  const width = 800;
  const height = 260;
  const padding = { top: 25, right: 30, bottom: 45, left: 65 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const getX = (idx: number) => {
    if (chartPoints.length <= 1) return padding.left;
    return padding.left + (idx / (chartPoints.length - 1)) * plotWidth;
  };

  const getYAccumulated = (val: number) => {
    const ratio = val / (maxAccumulated * 1.1);
    return padding.top + plotHeight - ratio * plotHeight;
  };

  const getYFlow = (val: number) => {
    const ratio = val / (maxFlow * 1.15);
    return padding.top + plotHeight - ratio * plotHeight;
  };

  // Build SVG Paths
  const accumulatedPath = chartPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getYAccumulated(p.accumulatedLiters).toFixed(1)}`)
    .join(' ');

  const accumulatedArea = `${accumulatedPath} L ${getX(chartPoints.length - 1).toFixed(1)} ${(
    padding.top + plotHeight
  ).toFixed(1)} L ${getX(0).toFixed(1)} ${(padding.top + plotHeight).toFixed(1)} Z`;

  const flowPath = chartPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getYFlow(p.flowRateLh).toFixed(1)}`)
    .join(' ');

  // Y-axis tick values
  const yTicksAccumulated = [0, 0.25, 0.5, 0.75, 1].map((pct) => Math.round((maxAccumulated * 1.1 * pct) / 100) * 100);
  const yTicksFlow = [0, 0.25, 0.5, 0.75, 1].map((pct) => Math.round((maxFlow * 1.15 * pct) / 5) * 5);

  const hoveredPoint = hoverIndex !== null && chartPoints[hoverIndex] ? chartPoints[hoverIndex] : null;

  return (
    <section id="graficos" className="scroll-mt-6 mb-8">
      {/* Header and View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Gráficos de Consumo e Vazão
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Acompanhe o volume acumulado em litros e o ritmo horário (L/h)
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'both'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Visão Geral (Ambos)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('consumption')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'consumption'
                ? 'bg-white dark:bg-slate-700 text-sky-700 dark:text-sky-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Consumo Acumulado (L)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('flow')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'flow'
                ? 'bg-white dark:bg-slate-700 text-orange-700 dark:text-orange-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Vazão (L/h)
          </button>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors">
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-5 text-xs">
            {(activeTab === 'both' || activeTab === 'consumption') && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-sky-500" aria-hidden="true" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Consumo Acumulado (Litros)</span>
              </div>
            )}
            {(activeTab === 'both' || activeTab === 'flow') && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-1 bg-orange-500 rounded-full" aria-hidden="true" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Vazão Registrada (L/h)</span>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Passe o cursor sobre os pontos para ver detalhes</span>
          </div>
        </div>

        {/* Responsive SVG Container */}
        <div className="relative w-full overflow-hidden pt-4">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto max-h-[360px] overflow-visible select-none"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id={`${maskId}-sky-gradient`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {yTicksAccumulated.map((tickVal, i) => {
              const y = getYAccumulated(tickVal);
              return (
                <g key={`grid-${i}`}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeDasharray="4 4"
                  />
                  {/* Left Y-axis label: Accumulated liters */}
                  {(activeTab === 'both' || activeTab === 'consumption') && (
                    <text
                      x={padding.left - 10}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] fill-slate-500 dark:fill-slate-400 font-mono"
                    >
                      {formatNumberBR(tickVal)} L
                    </text>
                  )}
                </g>
              );
            })}

            {/* Right Y-axis labels for Flow Rate when in both mode */}
            {activeTab === 'both' &&
              yTicksFlow.map((flowVal, i) => {
                const y = getYFlow(flowVal);
                return (
                  <text
                    key={`flow-tick-${i}`}
                    x={width - padding.right + 8}
                    y={y + 3}
                    textAnchor="start"
                    className="text-[10px] fill-orange-700 dark:fill-orange-400 font-mono"
                  >
                    {flowVal} L/h
                  </text>
                );
              })}

            {/* Right Y-axis labels for Flow mode only */}
            {activeTab === 'flow' &&
              yTicksFlow.map((flowVal, i) => {
                const y = getYFlow(flowVal);
                return (
                  <text
                    key={`flow-only-tick-${i}`}
                    x={padding.left - 10}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[10px] fill-orange-700 dark:fill-orange-400 font-mono"
                  >
                    {flowVal} L/h
                  </text>
                );
              })}

            {/* Area & Line for Accumulated Consumption */}
            {(activeTab === 'both' || activeTab === 'consumption') && (
              <>
                <path d={accumulatedArea} fill={`url(#${maskId}-sky-gradient)`} />
                <path
                  d={accumulatedPath}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* Line for Flow Rate (Discreet Orange) */}
            {(activeTab === 'both' || activeTab === 'flow') && (
              <path
                d={flowPath}
                fill="none"
                stroke="#ea580c"
                strokeWidth={activeTab === 'flow' ? '2.5' : '1.75'}
                strokeDasharray={activeTab === 'both' ? '3 3' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* X-Axis baseline */}
            <line
              x1={padding.left}
              y1={padding.top + plotHeight}
              x2={width - padding.right}
              y2={padding.top + plotHeight}
              className="stroke-slate-200 dark:stroke-slate-700"
              strokeWidth="1"
            />

            {/* X-Axis Date Labels (Show spaced interval ticks) */}
            {chartPoints.map((p, i) => {
              const x = getX(i);
              const shouldShowLabel =
                chartPoints.length <= 7 ||
                i === 0 ||
                i === chartPoints.length - 1 ||
                i % Math.ceil(chartPoints.length / 6) === 0;

              return (
                <g key={`x-tick-${i}`}>
                  <line
                    x1={x}
                    y1={padding.top + plotHeight}
                    x2={x}
                    y2={padding.top + plotHeight + 5}
                    className="stroke-slate-300 dark:stroke-slate-600"
                  />
                  {shouldShowLabel && (
                    <text
                      x={x}
                      y={padding.top + plotHeight + 18}
                      textAnchor="middle"
                      className="text-[10px] fill-slate-500 dark:fill-slate-400 font-mono"
                    >
                      {p.dateFormatted}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Interactive Data Points and Invisible Hitboxes */}
            {chartPoints.map((p, i) => {
              const x = getX(i);
              const yAcc = getYAccumulated(p.accumulatedLiters);
              const yFlow = getYFlow(p.flowRateLh);
              const isHovered = hoverIndex === i;

              return (
                <g key={`point-${i}`} className="cursor-pointer">
                  {/* Vertical Crosshair Guideline */}
                  {isHovered && (
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + plotHeight}
                      className="stroke-slate-400 dark:stroke-slate-500"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Accumulated Circle */}
                  {(activeTab === 'both' || activeTab === 'consumption') && (
                    <circle
                      cx={x}
                      cy={yAcc}
                      r={isHovered ? 5.5 : 3}
                      className="fill-white dark:fill-slate-900 transition-all"
                      stroke="#0284c7"
                      strokeWidth={isHovered ? 2.5 : 2}
                    />
                  )}

                  {/* Flow Circle */}
                  {(activeTab === 'both' || activeTab === 'flow') && (
                    <circle
                      cx={x}
                      cy={yFlow}
                      r={isHovered ? 5 : 2.5}
                      fill="#ea580c"
                      className="stroke-white dark:stroke-slate-900 transition-all"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Wide invisible hit area for easy hover on mobile/desktop */}
                  <rect
                    x={x - plotWidth / (chartPoints.length * 2)}
                    y={padding.top}
                    width={plotWidth / Math.max(1, chartPoints.length - 1)}
                    height={plotHeight}
                    fill="transparent"
                    onMouseEnter={() => setHoverIndex(i)}
                    onTouchStart={() => setHoverIndex(i)}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Interactive Tooltip Card / Status Bar */}
        <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/80 dark:border-slate-800 min-h-[58px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {hoveredPoint ? (
            <>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {hoveredPoint.fullDate}
                </span>
                {hoveredPoint.notes && (
                  <>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 dark:text-slate-400 italic truncate max-w-xs">
                      {hoveredPoint.notes}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 font-mono">
                <div className="flex items-center gap-1.5 text-sky-800 dark:text-sky-300">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Acumulado:</span>
                  <strong>{formatNumberBR(hoveredPoint.accumulatedLiters)} L</strong>
                </div>
                {hoveredPoint.index > 0 && (
                  <div className="flex items-center gap-1.5 text-orange-800 dark:text-orange-300">
                    <span className="text-slate-500 dark:text-slate-400 font-sans">Vazão:</span>
                    <strong>{formatNumberBR(hoveredPoint.flowRateLh, 1)} L/h</strong>
                  </div>
                )}
                <div className="hidden md:flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Hidrômetro:</span>
                  <span>{formatNumberBR(hoveredPoint.meterValue)} L</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 w-full justify-between">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                Interaja com os pontos do gráfico para inspecionar cada leitura registrada.
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-400 hidden sm:inline">
                Total acumulado: {formatNumberBR(chartPoints[chartPoints.length - 1].accumulatedLiters)} L
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

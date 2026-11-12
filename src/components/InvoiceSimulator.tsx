import React, { useState, useEffect } from 'react';
import {
  simulateProgressiveInvoice,
  formatCurrencyBRL,
  formatNumberBR,
} from '../utils/calculations';
import { Calculator, Droplets, AlertTriangle, ArrowRight, RotateCcw, Info } from 'lucide-react';

interface InvoiceSimulatorProps {
  initialM3?: number;
  calculatedM3?: number;
}

export const InvoiceSimulator: React.FC<InvoiceSimulatorProps> = ({
  initialM3 = 15,
  calculatedM3,
}) => {
  const [consumptionInput, setConsumptionInput] = useState<string>(
    initialM3 > 0 ? String(initialM3) : '15'
  );

  // Sync if initialM3 changes externally
  useEffect(() => {
    if (initialM3 > 0) {
      setConsumptionInput(String(initialM3));
    }
  }, [initialM3]);

  const numericM3 = Math.max(0, parseFloat(consumptionInput) || 0);
  const simulation = simulateProgressiveInvoice(numericM3);

  const presets = [10, 15, 20, 25, 35, 50];

  return (
    <section id="simulador" className="scroll-mt-6 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Simulador de Fatura de Água e Esgoto
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cálculo progressivo por faixas tarifárias com cobrança de água e esgoto
          </p>
        </div>

        {calculatedM3 !== undefined && calculatedM3 > 0 && (
          <button
            type="button"
            onClick={() => setConsumptionInput(calculatedM3.toFixed(2))}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 border border-sky-200/80 dark:border-sky-800/60 rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
            title="Preenche o simulador com o consumo faturável calculado das leituras registradas"
          >
            <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Usar consumo calculado ({calculatedM3.toFixed(2)} m³)</span>
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        {/* Input & Presets Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 items-center">
          {/* Input Box */}
          <div className="lg:col-span-5">
            <label
              htmlFor="sim-consumption-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Consumo Mensal para Simulação (em m³)
            </label>
            <div className="relative">
              <input
                id="sim-consumption-input"
                type="number"
                step="0.1"
                min="0"
                max="500"
                value={consumptionInput}
                onChange={(e) => setConsumptionInput(e.target.value)}
                className="w-full px-4 py-3 text-lg font-mono font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors shadow-2xs"
                placeholder="Ex: 15"
              />
              <span className="absolute right-4 top-3.5 text-sm font-semibold text-slate-400 dark:text-slate-500 select-none font-sans">
                m³
              </span>
            </div>

            {/* Liters conversion hint */}
            <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span>Equivale a: <strong className="text-slate-700 dark:text-slate-200">{formatNumberBR(numericM3 * 1000)} Litros</strong></span>
              {numericM3 > 0 && (
                <span>~{formatNumberBR((numericM3 * 1000) / 30, 0)} L/dia (base 30d)</span>
              )}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Consumos típicos de referência:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {presets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setConsumptionInput(String(val))}
                  className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors cursor-pointer ${
                    numericM3 === val
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {val} m³
                </button>
              ))}
              <button
                type="button"
                onClick={() => setConsumptionInput('0')}
                className="px-2.5 py-1.5 text-xs text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto flex items-center gap-1 cursor-pointer"
                title="Zerar valor"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Zerar</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Summary Financial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          {/* Água */}
          <div className="p-4 bg-sky-50/60 dark:bg-sky-950/30 rounded-xl border border-sky-100 dark:border-sky-800/60">
            <div className="flex items-center justify-between text-xs font-semibold text-sky-800 dark:text-sky-300 mb-1">
              <span>Parcela de Água</span>
              <Droplets className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-sky-950 dark:text-sky-100 tabular-nums">
              {formatCurrencyBRL(simulation.totalWater)}
            </div>
            <p className="text-[11px] text-sky-700/90 dark:text-sky-300/80 mt-1">
              Soma progressiva das faixas de abastecimento
            </p>
          </div>

          {/* Esgoto */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Parcela de Esgoto</span>
              <Droplets className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {formatCurrencyBRL(simulation.totalSewer)}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Coleta e tratamento de esgoto sanitário
            </p>
          </div>

          {/* Total Estimado */}
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-1">
              <span>Total Estimado</span>
              <Calculator className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-950 dark:text-emerald-100 tabular-nums">
              {formatCurrencyBRL(simulation.grandTotal)}
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 mt-1">
              Água + Esgoto para {formatNumberBR(numericM3, 2)} m³
            </p>
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Detalhamento por Faixa Progressiva
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Tarifas padrão de referência
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 dark:bg-slate-850 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 select-none">
                <tr>
                  <th scope="col" className="py-2.5 px-3">
                    Faixa
                  </th>
                  <th scope="col" className="py-2.5 px-3">
                    Intervalo
                  </th>
                  <th scope="col" className="py-2.5 px-3 text-right">
                    Consumo Aplicado
                  </th>
                  <th scope="col" className="py-2.5 px-3 text-right">
                    Tarifa Água
                  </th>
                  <th scope="col" className="py-2.5 px-3 text-right">
                    Tarifa Esgoto
                  </th>
                  <th scope="col" className="py-2.5 px-3 text-right">
                    Subtotal Água
                  </th>
                  <th scope="col" className="py-2.5 px-3 text-right">
                    Subtotal Esgoto
                  </th>
                  <th scope="col" className="py-2.5 px-3 text-right">
                    Total da Faixa
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {simulation.rows.map((row) => {
                  const isActive = row.billedM3 > 0;
                  return (
                    <tr
                      key={row.tier.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors ${
                        isActive ? 'bg-sky-50/20 dark:bg-sky-950/20 font-medium' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {row.tier.name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {row.tier.rangeLabel}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <strong className={isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}>
                          {formatNumberBR(row.billedM3, 2)} m³
                        </strong>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatCurrencyBRL(row.tier.waterRate)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatCurrencyBRL(row.tier.sewerRate)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-sky-800 dark:text-sky-300 whitespace-nowrap">
                        {formatCurrencyBRL(row.waterSubtotal)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {formatCurrencyBRL(row.sewerSubtotal)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {formatCurrencyBRL(row.tierTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 dark:bg-slate-850 font-semibold text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-slate-800 font-mono">
                <tr>
                  <td colSpan={2} className="py-3 px-3 font-sans">
                    Total Faturado
                  </td>
                  <td className="py-3 px-3 text-right text-sky-800 dark:text-sky-300">
                    {formatNumberBR(simulation.inputM3, 2)} m³
                  </td>
                  <td colSpan={2} className="py-3 px-3 text-center text-slate-400 dark:text-slate-500 font-sans text-[11px] font-normal">
                    —
                  </td>
                  <td className="py-3 px-3 text-right text-sky-900 dark:text-sky-200">
                    {formatCurrencyBRL(simulation.totalWater)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-900 dark:text-slate-200">
                    {formatCurrencyBRL(simulation.totalSewer)}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-700 dark:text-emerald-400 text-sm font-bold">
                    {formatCurrencyBRL(simulation.grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Mandatory Legal Disclaimer */}
        <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
          <Info className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200">Aviso importante:</strong> Esta simulação é uma estimativa de consumo progressivo baseada nas faixas tarifárias padrão de água e esgoto. O cálculo <strong>não inclui</strong> taxa mínima de ligação, taxa de iluminação pública, multas, juros, tributos (como PIS/COFINS) ou quaisquer cobranças municipais e regulatórias adicionais da concessionária local.
          </p>
        </div>
      </div>
    </section>
  );
};

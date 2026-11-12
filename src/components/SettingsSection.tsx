import React, { useRef, useState } from 'react';
import { DataSourceMode, ConsumptionAlertSettings } from '../types/water';
import { getStorageStats, ThemeMode } from '../services/storage';
import { formatNumberBR, formatDateTimeBR } from '../utils/calculations';
import {
  Settings,
  HardDrive,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Bell,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Info,
  Sun,
  Moon,
  Wifi,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsSectionProps {
  mode: DataSourceMode;
  readingCount: number;
  theme: ThemeMode;
  onToggleTheme: (theme: ThemeMode) => void;
  alertSettings: ConsumptionAlertSettings;
  onUpdateAlertSettings: (settings: ConsumptionAlertSettings) => void;
  currentConsumptionM3?: number;
  onRequestRestoreDemo: () => void;
  onRequestClearLocal: () => void;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  mode,
  readingCount,
  theme,
  onToggleTheme,
  alertSettings,
  onUpdateAlertSettings,
  currentConsumptionM3 = 0,
  onRequestRestoreDemo,
  onRequestClearLocal,
  onExportJSON,
  onImportJSON,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const stats = getStorageStats();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
      setImportStatus(`Arquivo "${file.name}" carregado com sucesso.`);
      setTimeout(() => setImportStatus(null), 4000);
    }
  };

  const handleToggleEnabled = () => {
    const updated = { ...alertSettings, enabled: !alertSettings.enabled };
    onUpdateAlertSettings(updated);
    showSavedFeedback(updated.enabled ? 'Alertas de consumo ativados.' : 'Alertas de consumo desativados.');
  };

  const handleLimitChange = (valStr: string) => {
    const num = Math.max(1, parseFloat(valStr) || 1);
    const updated = { ...alertSettings, limitM3: num };
    onUpdateAlertSettings(updated);
    showSavedFeedback(`Teto atualizado para ${num} m³.`);
  };

  const handleThresholdChange = (pct: number) => {
    const updated = { ...alertSettings, warningThresholdPercent: pct };
    onUpdateAlertSettings(updated);
    showSavedFeedback(`Aviso configurado para ${pct}% do teto.`);
  };

  const showSavedFeedback = (msg: string) => {
    setSavedFeedback(msg);
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  const presetLimits = [8, 10, 12, 15, 20, 25];
  const percentUsed = alertSettings.limitM3 > 0 ? (currentConsumptionM3 / alertSettings.limitM3) * 100 : 0;
  const isExceeded = percentUsed >= 100;
  const isApproaching = percentUsed >= alertSettings.warningThresholdPercent && !isExceeded;

  return (
    <section id="configuracao" className="scroll-mt-6 mb-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Configuração e Notificações
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aparência do painel, tetos de consumo, armazenamento local e planejamento de nuvem
          </p>
        </div>
      </div>

      {/* Theme Selection Card (Dark Mode Toggle) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs mb-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 rounded-xl border border-sky-100 dark:border-sky-900/50">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Aparência da Interface
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Alterne entre o tema claro editorial e o tema escuro confortável para visualização noturna
              </p>
            </div>
          </div>

          {/* Segmented Button for Theme */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 self-start sm:self-center">
            <button
              type="button"
              onClick={() => {
                onToggleTheme('light');
                showSavedFeedback('Tema Claro ativado.');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Claro</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onToggleTheme('dark');
                showSavedFeedback('Tema Escuro ativado.');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-sky-300" />
              <span>Escuro</span>
            </button>
          </div>
        </div>
      </div>

      {/* Consumption Limit Notification System */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs mb-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200/80 dark:border-amber-900/50">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Notificações de Limite de Consumo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estipule uma meta máxima mensal (em m³) e receba alerta visual na seção 'Visão Geral' quando o consumo se aproximar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={handleToggleEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                alertSettings.enabled ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              role="switch"
              aria-checked={alertSettings.enabled}
              aria-label="Ativar ou desativar notificações de limite de consumo"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  alertSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {alertSettings.enabled ? 'Ativado' : 'Desativado'}
            </span>
          </div>
        </div>

        {savedFeedback && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{savedFeedback}</span>
          </div>
        )}

        {alertSettings.enabled ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Input & Presets */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label
                  htmlFor="ceiling-limit-input"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Teto de Consumo Desejado (m³)
                </label>
                <div className="relative max-w-xs">
                  <input
                    id="ceiling-limit-input"
                    type="number"
                    step="0.5"
                    min="1"
                    max="200"
                    value={alertSettings.limitM3}
                    onChange={(e) => handleLimitChange(e.target.value)}
                    className="w-full px-4 py-2.5 text-base font-mono font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors shadow-2xs"
                  />
                  <span className="absolute right-4 top-2.5 text-xs font-bold text-slate-400 dark:text-slate-500 select-none">
                    m³ / mês
                  </span>
                </div>
                <span className="block mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Equivale a <strong>{formatNumberBR(alertSettings.limitM3 * 1000)} Litros</strong> de água tratada.
                </span>
              </div>

              {/* Quick limit presets */}
              <div>
                <span className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Metas comuns para residências:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {presetLimits.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleLimitChange(String(preset))}
                      className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors cursor-pointer ${
                        alertSettings.limitM3 === preset
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {preset} m³
                    </button>
                  ))}
                </div>
              </div>

              {/* Threshold level selection */}
              <div>
                <span className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Gatilho de aviso prévio (aproximação):
                </span>
                <div className="flex items-center gap-2">
                  {[70, 80, 90].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleThresholdChange(pct)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        alertSettings.warningThresholdPercent === pct
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Avisar aos {pct}%
                    </button>
                  ))}
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                    (dispara em {(alertSettings.limitM3 * (alertSettings.warningThresholdPercent / 100)).toFixed(1)} m³)
                  </span>
                </div>
              </div>
            </div>

            {/* Live Indicator Preview */}
            <div className="lg:col-span-5 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Demonstração da Indicação Visual:
              </span>

              <div
                className={`p-3.5 rounded-xl border transition-all text-xs ${
                  isExceeded
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
                    : isApproaching
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {isExceeded ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  ) : isApproaching ? (
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  <span>
                    {isExceeded
                      ? 'Teto ultrapassado'
                      : isApproaching
                      ? 'Aproximando-se do teto'
                      : 'Dentro da meta'}
                  </span>
                  <span className="ml-auto font-mono text-[11px] font-bold">
                    {percentUsed.toFixed(0)}%
                  </span>
                </div>

                <p className="text-[11px] opacity-90 leading-relaxed">
                  Consumo faturável atual: <strong>{formatNumberBR(currentConsumptionM3, 2)} m³</strong> de{' '}
                  <strong>{alertSettings.limitM3} m³</strong>.
                </p>

                {/* Mini progress bar */}
                <div className="mt-2 w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isExceeded ? 'bg-rose-600' : isApproaching ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, percentUsed)}%` }}
                  />
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                * Este aviso é exibido no topo da página ('Visão Geral') para alertar imediatamente a família.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            As notificações visuais de limite de consumo estão desativadas. Ative a chave acima para definir um teto em m³.
          </div>
        )}
      </div>

      {/* PWA Installation & Service Worker Offline Card */}
      <div className="mb-6">
        <PWAInstallButton variant="card" />
      </div>

      {/* Grid with Local Storage and Future Google Sheets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Local Storage Management */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Armazenamento Local (Navegador)
                  </h3>
                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    Ativo e Persistente neste Dispositivo
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Todas as leituras que você adiciona, edita ou exclui são salvas automaticamente no armazenamento local (<code className="text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px]">localStorage</code>) do seu navegador. Não há dependência de servidores externos para o funcionamento básico.
            </p>

            {/* Storage Diagnostic Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 space-y-2 text-xs mb-5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Modo de operação:</span>
                <strong className="text-slate-800 dark:text-slate-200 font-sans">
                  {mode === 'demo' ? 'Demonstração' : 'Histórico Local'}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Suporte Offline (SW):</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Cache API Ativo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Total de leituras ativas:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{readingCount} registros</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Espaço ocupado estimado:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {formatNumberBR(stats.estimatedBytes / 1024, 2)} KB
                </span>
              </div>
              {stats.lastUpdated && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Última gravação:</span>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                    {formatDateTimeBR(stats.lastUpdated)}
                  </span>
                </div>
              )}
            </div>

            {importStatus && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportJSON}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Backup (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restaurar Backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onRequestRestoreDemo}
                className="w-full py-2 px-3 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-200 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Restaurar Demonstração</span>
              </button>

              <button
                type="button"
                onClick={onRequestClearLocal}
                className="w-full py-2 px-3 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-200 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Limpar Histórico Local</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Future Google Sheets Integration */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 rounded-xl border border-sky-100 dark:border-sky-900/50">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Integração com Google Sheets
                  </h3>
                  <span className="text-[11px] font-medium text-sky-700 dark:text-sky-400">
                    Sincronização em Nuvem (Planejada)
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                Próxima versão
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Para permitir que múltiplos moradores registrem leituras de diferentes celulares e acessem o histórico de qualquer lugar, o <strong>Água Control</strong> está sendo estruturado para conectar-se com uma planilha pessoal no Google Drive.
            </p>

            {/* 3 Planned Steps */}
            <div className="space-y-3 mb-5">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-900/80 text-sky-800 dark:text-sky-200 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Criar ou apontar a planilha
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Você escolherá uma planilha no seu Google Drive com uma aba chamada <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.2 rounded text-[10px]">Leituras</code> contendo as colunas de data/hora, valor em litros e observações.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-900/80 text-sky-800 dark:text-sky-200 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Autorizar o acesso seguro
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Autenticação transparente via Google OAuth, garantindo que apenas a sua conta tenha permissão de leitura e gravação na planilha selecionada.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-900/80 text-sky-800 dark:text-sky-200 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Sincronizar entre múltiplos dispositivos
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Qualquer nova leitura cadastrada no celular ou computador atualiza a planilha em tempo real e recalcula as métricas residenciais instantaneamente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 rounded-xl text-xs text-sky-900 dark:text-sky-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Sem conexões simuladas:</strong> Esta prévia mantém a integridade do seu painel e garante que seus dados estão 100% seguros na memória local até a liberação da autenticação oficial.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

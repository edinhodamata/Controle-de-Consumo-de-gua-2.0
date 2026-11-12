/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { WaterReading, DataSourceMode, ConsumptionAlertSettings } from './types/water';
import {
  getStoredMode,
  setStoredMode,
  loadReadings,
  persistReadings,
  resetToDemo,
  clearLocalReadings,
  exportDataAsJSON,
  getStoredAlertSettings,
  setStoredAlertSettings,
  getStoredTheme,
  setStoredTheme,
  ThemeMode,
} from './services/storage';
import { calculateMetrics, formatNumberBR, formatDateTimeBR } from './utils/calculations';
import { Sidebar } from './components/Sidebar';
import { HeaderBanner } from './components/HeaderBanner';
import { Overview } from './components/Overview';
import { MetricsCards } from './components/MetricsCards';
import { SavingsTips } from './components/SavingsTips';
import { ChartsSection } from './components/ChartsSection';
import { ReadingsForm } from './components/ReadingsForm';
import { ReadingsHistory } from './components/ReadingsHistory';
import { MonthlyHistory } from './components/MonthlyHistory';
import { InvoiceSimulator } from './components/InvoiceSimulator';
import { SettingsSection } from './components/SettingsSection';
import { ConfirmModal } from './components/ConfirmModal';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [mode, setMode] = useState<DataSourceMode>(() => getStoredMode());
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());
  const [readings, setReadings] = useState<WaterReading[]>(() => loadReadings(mode));
  const [editingReading, setEditingReading] = useState<WaterReading | null>(null);

  // Sync theme with document.documentElement for Tailwind dark mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setStoredTheme(newTheme);
  };

  // Selected m³ for invoice simulator (can be updated from monthly card or quick clicks)
  const [simulatorM3, setSimulatorM3] = useState<number>(15);

  // Consumption ceiling alert settings
  const [alertSettings, setAlertSettings] = useState<ConsumptionAlertSettings>(() => getStoredAlertSettings());

  const handleUpdateAlertSettings = (updated: ConsumptionAlertSettings) => {
    setAlertSettings(updated);
    setStoredAlertSettings(updated);
  };

  const handleScrollToSettings = () => {
    const elem = document.querySelector('#configuracao');
    elem?.scrollIntoView({ behavior: 'smooth' });
  };

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: 'danger' | 'warning' | 'primary';
    confirmLabel: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'danger',
    confirmLabel: 'Confirmar',
    action: () => {},
  });

  // Calculate metrics dynamically
  const metrics = useMemo(() => calculateMetrics(readings), [readings]);

  // Synchronize state when switching data source mode
  const handleToggleMode = (newMode: DataSourceMode) => {
    setStoredMode(newMode);
    setMode(newMode);
    const newReadings = loadReadings(newMode);
    setReadings(newReadings);
    setEditingReading(null);
  };

  // Add or edit reading
  const handleSaveReading = (reading: WaterReading) => {
    let updated: WaterReading[];
    const exists = readings.some((r) => r.id === reading.id);

    if (exists) {
      updated = readings.map((r) => (r.id === reading.id ? reading : r));
    } else {
      updated = [...readings, reading];
    }

    setReadings(updated);
    persistReadings(updated, mode);
    setEditingReading(null);
  };

  // Request deletion with confirmation
  const handleRequestDelete = (reading: WaterReading) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Leitura',
      description: `Tem certeza que deseja remover a leitura de ${formatNumberBR(
        reading.value
      )} L registrada em ${formatDateTimeBR(reading.timestamp)}? Os cálculos de consumo e faturamento serão atualizados.`,
      variant: 'danger',
      confirmLabel: 'Excluir Leitura',
      action: () => {
        const updated = readings.filter((r) => r.id !== reading.id);
        setReadings(updated);
        persistReadings(updated, mode);
        if (editingReading?.id === reading.id) {
          setEditingReading(null);
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Restore demonstration dataset with confirmation
  const handleRequestRestoreDemo = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Restaurar Dados de Demonstração',
      description:
        'Deseja restaurar as 15 leituras originais de demonstração? Quaisquer edições ou exclusões feitas no modo demonstração serão redefinidas para o padrão inicial.',
      variant: 'warning',
      confirmLabel: 'Restaurar Demonstração',
      action: () => {
        const fresh = resetToDemo();
        setMode('demo');
        setReadings(fresh);
        setEditingReading(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Clear local storage history with confirmation
  const handleRequestClearLocal = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Limpar Histórico Local',
      description:
        'Atenção: todas as leituras salvas na memória local deste navegador serão apagadas permanentemente. Recomendamos exportar um backup antes de prosseguir.',
      variant: 'danger',
      confirmLabel: 'Apagar Tudo',
      action: () => {
        clearLocalReadings();
        setReadings([]);
        setEditingReading(null);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Export JSON backup
  const handleExportJSON = () => {
    exportDataAsJSON(readings, mode);
  };

  // Import JSON backup
  const handleImportJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        const importedReadings = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed.readings)
          ? parsed.readings
          : null;

        if (!importedReadings) {
          alert('Arquivo JSON inválido. Estrutura de leituras não reconhecida.');
          return;
        }

        setReadings(importedReadings);
        setMode('local');
        setStoredMode('local');
        persistReadings(importedReadings, 'local');
      } catch (err) {
        console.error('Falha ao importar JSON', err);
        alert('Não foi possível ler o arquivo JSON selecionado.');
      }
    };
    reader.readAsText(file);
  };

  // Smooth navigation helpers
  const handleOpenNewReadingForm = () => {
    setEditingReading(null);
    const elem = document.querySelector('#leituras');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
      // Focus reading input after scroll
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('#reading-value');
        input?.focus();
      }, 400);
    }
  };

  const handleScrollToSimulator = (customM3?: number) => {
    if (customM3 !== undefined && customM3 > 0) {
      setSimulatorM3(customM3);
    }
    const elem = document.querySelector('#simulador');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col lg:flex-row antialiased text-slate-800 dark:text-slate-100 transition-colors">
      {/* Sidebar & Mobile Navigation */}
      <Sidebar
        mode={mode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onToggleMode={handleToggleMode}
        onOpenNewReadingForm={handleOpenNewReadingForm}
        readingCount={readings.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Active Data Source Banner */}
        <HeaderBanner
          mode={mode}
          onSwitchMode={handleToggleMode}
          onRequestRestoreDemo={handleRequestRestoreDemo}
          readingCount={readings.length}
        />

        {/* 1. Visão Geral */}
        <Overview
          metrics={metrics}
          mode={mode}
          alertSettings={alertSettings}
          onOpenNewReadingForm={handleOpenNewReadingForm}
          onScrollToSimulator={() => handleScrollToSimulator(metrics.totalConsumptionM3)}
          onScrollToSettings={handleScrollToSettings}
        />

        {/* 2. Indicadores */}
        <MetricsCards metrics={metrics} />

        {/* 2.1 Dicas de Economia Sazonais com Google Search */}
        <SavingsTips metrics={metrics} />

        {/* 3. Gráficos */}
        <ChartsSection readings={readings} />

        {/* 4. Leituras & Formulário */}
        <ReadingsForm
          onSaveReading={handleSaveReading}
          editingReading={editingReading}
          onCancelEdit={() => setEditingReading(null)}
          latestReading={metrics.lastReading}
        />

        <ReadingsHistory
          readings={readings}
          onEditReading={(reading) => {
            setEditingReading(reading);
            const formElem = document.querySelector('#leituras');
            formElem?.scrollIntoView({ behavior: 'smooth' });
          }}
          onRequestDeleteReading={handleRequestDelete}
          onExportData={handleExportJSON}
        />

        {/* 5. Comparativo Mensal */}
        <MonthlyHistory
          readings={readings}
          onSelectMonthForSimulator={handleScrollToSimulator}
        />

        {/* 6. Simulador de Fatura Progressiva */}
        <InvoiceSimulator
          initialM3={simulatorM3}
          calculatedM3={metrics.hasEnoughData ? metrics.totalConsumptionM3 : undefined}
        />

        {/* 7. Configuração & Notificações de Limite */}
        <SettingsSection
          mode={mode}
          readingCount={readings.length}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          alertSettings={alertSettings}
          onUpdateAlertSettings={handleUpdateAlertSettings}
          currentConsumptionM3={metrics.hasEnoughData ? metrics.totalConsumptionM3 : 0}
          onRequestRestoreDemo={handleRequestRestoreDemo}
          onRequestClearLocal={handleRequestClearLocal}
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
        />

        {/* Editorial Residential Footer */}
        <footer className="mt-12 pt-6 pb-8 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">Água Control</span>
            <span aria-hidden="true">·</span>
            <span>Painel Residencial de Hidrômetro</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">v1.0</span>
          </div>

          <div className="text-slate-500 dark:text-slate-400 text-center sm:text-right">
            Dados preservados no navegador via armazenamento local seguro.
          </div>
        </footer>
      </main>

      {/* Offline Toast Indicator */}
      <OfflineIndicator />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        variant={confirmModal.variant}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

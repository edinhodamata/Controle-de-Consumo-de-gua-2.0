import React, { useState } from 'react';
import {
  Droplets,
  LayoutDashboard,
  Gauge,
  Lightbulb,
  LineChart,
  ClipboardList,
  CalendarDays,
  Calculator,
  Settings,
  PlusCircle,
  Menu,
  X,
  Database,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';
import { DataSourceMode } from '../types/water';
import { ThemeMode } from '../services/storage';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  mode: DataSourceMode;
  theme?: ThemeMode;
  onToggleTheme?: (newTheme: ThemeMode) => void;
  onToggleMode: (newMode: DataSourceMode) => void;
  onOpenNewReadingForm: () => void;
  readingCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mode,
  theme = 'light',
  onToggleTheme,
  onToggleMode,
  onOpenNewReadingForm,
  readingCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '#visao-geral', label: 'Visão Geral', icon: LayoutDashboard },
    { href: '#indicadores', label: 'Indicadores', icon: Gauge },
    { href: '#dicas-economia', label: 'Dicas de Economia', icon: Lightbulb },
    { href: '#graficos', label: 'Gráficos de Consumo', icon: LineChart },
    { href: '#leituras', label: 'Leituras & Histórico', icon: ClipboardList, badge: readingCount },
    { href: '#historico-mensal', label: 'Comparativo Mensal', icon: CalendarDays },
    { href: '#simulador', label: 'Simulador de Fatura', icon: Calculator },
    { href: '#configuracao', label: 'Configuração & Nuvem', icon: Settings },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Mobile Top Bar (Strict 1-row 3-zone contract) */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0B2533] border-b border-sky-950/40 px-4 py-3 flex items-center justify-between text-white shadow-sm">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white block leading-none">
              Água Control
            </span>
            <span className="text-[11px] text-sky-200/70 font-medium">
              Painel Residencial
            </span>
          </div>
        </div>

        {/* Zone 2 & 3: Theme switch, Quick CTA and Hamburger Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {onToggleTheme && (
            <button
              type="button"
              onClick={() => onToggleTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
              className="p-1.5 text-sky-200 hover:text-white hover:bg-sky-900/60 rounded-lg transition-colors cursor-pointer"
              title={`Alternar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-sky-300" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onOpenNewReadingForm}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Nova Leitura</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
            className="p-2 text-sky-100 hover:text-white hover:bg-sky-900/60 rounded-lg transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-[#0B2533] text-white h-full flex flex-col p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-sky-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                  <Droplets className="w-5 h-5" />
                </div>
                <span className="font-bold text-base">Água Control</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-sky-300 hover:text-white rounded-lg hover:bg-sky-900/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode switch in mobile drawer */}
            <div className="mt-4 p-3 rounded-xl bg-sky-950/40 border border-sky-900/50">
              <div className="flex items-center justify-between text-xs text-sky-200 mb-2">
                <span className="font-medium">Fonte de dados</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-300">
                  {mode === 'demo' ? 'Demonstração' : 'Histórico Local'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onToggleMode(mode === 'demo' ? 'local' : 'demo');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-1.5 px-3 text-xs font-medium rounded-lg bg-sky-900/80 hover:bg-sky-800 text-sky-100 flex items-center justify-center gap-1.5 transition-colors"
              >
                {mode === 'demo' ? (
                  <>
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mudar para Meus Dados</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ver Demonstração</span>
                  </>
                )}
              </button>
            </div>

            <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => handleNavClick(item.href)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-sky-100 hover:bg-sky-900/50 hover:text-white transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-sky-400" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="text-xs font-mono text-sky-200/80 bg-sky-900/60 px-2 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-sky-900/40 space-y-2">
              <PWAInstallButton variant="sidebar" />
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenNewReadingForm();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 font-semibold text-white text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar Leitura</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 bg-[#0B2533] border-r border-sky-950/40 text-white min-h-screen sticky top-0 h-screen z-30">
        {/* Brand Area */}
        <div className="p-6 pb-5 border-b border-sky-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-inner">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white block leading-tight font-sans">
                Água Control
              </span>
              <span className="text-xs text-sky-200/70 font-medium">
                Monitoramento Residencial
              </span>
            </div>
          </div>
        </div>

        {/* Data Source Switcher Badge */}
        <div className="px-5 pt-4 pb-2">
          <div className="p-3 rounded-xl bg-sky-950/50 border border-sky-900/60">
            <div className="flex items-center justify-between text-xs text-sky-200/90 mb-1.5">
              <span className="font-medium text-[11px] uppercase tracking-wider text-sky-300/80">
                Fonte Ativa
              </span>
              <span className="font-mono text-[11px] text-sky-200">
                {mode === 'demo' ? 'Demonstração' : 'Histórico Local'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onToggleMode(mode === 'demo' ? 'local' : 'demo')}
              className="w-full mt-1 py-1.5 px-3 text-xs font-medium rounded-lg bg-sky-900/70 hover:bg-sky-800 text-sky-100 flex items-center justify-between transition-colors border border-sky-700/40"
              title={mode === 'demo' ? 'Mudar para seus dados locais' : 'Alternar para dados de demonstração'}
            >
              <div className="flex items-center gap-1.5">
                {mode === 'demo' ? (
                  <>
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Usar Meus Dados</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ver Demonstração</span>
                  </>
                )}
              </div>
              <ArrowRight className="w-3 h-3 text-sky-300" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-sky-100/90 hover:bg-sky-900/60 hover:text-white transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-sky-400 group-hover:text-sky-300 transition-colors" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="text-xs font-mono text-sky-200/70 bg-sky-950/60 border border-sky-900/50 px-2 py-0.5 rounded-md">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Primary Action CTA & Theme Toggle */}
        <div className="p-4 border-t border-sky-900/40 bg-[#081c28]">
          {onToggleTheme && (
            <button
              type="button"
              onClick={() => onToggleTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full mb-2.5 py-1.5 px-3 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 text-sky-200 hover:text-white text-xs font-medium flex items-center justify-between border border-sky-900/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Tema {theme === 'dark' ? 'Escuro' : 'Claro'}</span>
              </div>
              <span className="text-[10px] text-sky-400 font-semibold uppercase tracking-wider">
                Mudar
              </span>
            </button>
          )}

          <div className="mb-2.5">
            <PWAInstallButton variant="sidebar" />
          </div>

          <button
            type="button"
            onClick={onOpenNewReadingForm}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-sky-500/20 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Leitura</span>
          </button>
          <p className="mt-2 text-[11px] text-center text-sky-300/60 leading-tight">
            Persistência em armazenamento local
          </p>
        </div>
      </aside>
    </>
  );
};

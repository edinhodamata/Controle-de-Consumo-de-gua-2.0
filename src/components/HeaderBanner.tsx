import React from 'react';
import { Sparkles, Database, RotateCcw, ArrowRight } from 'lucide-react';
import { DataSourceMode } from '../types/water';

interface HeaderBannerProps {
  mode: DataSourceMode;
  onSwitchMode: (newMode: DataSourceMode) => void;
  onRequestRestoreDemo: () => void;
  readingCount: number;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  mode,
  onSwitchMode,
  onRequestRestoreDemo,
  readingCount,
}) => {
  if (mode === 'demo') {
    return (
      <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4 sm:p-4.5 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-amber-950 dark:text-amber-100 transition-colors">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-xl text-amber-700 dark:text-amber-300 shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-amber-950 dark:text-amber-100">
                Modo Demonstração ativo
              </span>
              <span className="text-xs text-amber-700 dark:text-amber-300 font-mono">
                ({readingCount} leituras ilustrativas carregadas)
              </span>
            </div>
            <p className="text-xs text-amber-800/90 dark:text-amber-200/80 mt-0.5 leading-relaxed">
              Você está explorando o painel com leituras residenciais simuladas. Edite ou adicione leituras livremente, ou alterne para seus dados reais.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-auto self-end shrink-0 pt-1 md:pt-0">
          <button
            type="button"
            onClick={onRequestRestoreDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-200 hover:text-amber-950 dark:hover:text-white bg-white dark:bg-amber-900/50 hover:bg-amber-100/60 dark:hover:bg-amber-800/60 border border-amber-300/80 dark:border-amber-700 rounded-lg transition-colors cursor-pointer"
            title="Recarrega as leituras originais de demonstração"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Restaurar demo</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchMode('local')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Usar Meus Dados</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Local storage mode banner
  return (
    <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-4 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-emerald-950 dark:text-emerald-100 transition-colors">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 rounded-xl text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5 sm:mt-0">
          <Database className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-emerald-950 dark:text-emerald-100">
              Histórico Local ativo
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-mono">
              ({readingCount} {readingCount === 1 ? 'leitura salva' : 'leituras salvas'} neste navegador)
            </span>
          </div>
          <p className="text-xs text-emerald-800/90 dark:text-emerald-200/80 mt-0.5 leading-relaxed">
            Seus registros são gravados de forma segura e automática na memória local deste dispositivo.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:self-auto self-end shrink-0 pt-1 md:pt-0">
        <button
          type="button"
          onClick={() => onSwitchMode('demo')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-200 hover:text-emerald-950 dark:hover:text-white bg-white dark:bg-emerald-900/50 hover:bg-emerald-100/60 dark:hover:bg-emerald-800/60 border border-emerald-300/80 dark:border-emerald-700 rounded-lg transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Ver Demonstração</span>
        </button>
      </div>
    </div>
  );
};

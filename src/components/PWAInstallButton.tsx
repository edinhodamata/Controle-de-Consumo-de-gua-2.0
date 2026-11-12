import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Check, X, Share2, PlusSquare } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'card' | 'sidebar';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'compact' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstalledSuccess(true);
        setTimeout(() => setInstalledSuccess(false), 3000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // If already installed and compact/sidebar mode, don't show prompt
  if (isInstalled && variant !== 'card') {
    return null;
  }

  // Card variant (for Settings section)
  if (variant === 'card') {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/60 text-sky-700 dark:text-sky-300 rounded-xl shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Instalar Aplicativo (PWA)</span>
              {isInstalled && (
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-md font-normal flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" />
                  Instalado
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instale o Água Control na tela inicial do celular ou computador para acesso instantâneo e offline.
            </p>
          </div>
        </div>

        {isInstalled ? (
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
            <Check className="w-3.5 h-3.5" />
            <span>App Configurado</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors shadow-2xs flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar Água Control</span>
          </button>
        )}

        {/* iOS Safari Guide Modal */}
        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  Instalar no iPhone ou iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Share2 className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <span>
                    1. No navegador Safari, toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima).
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <PlusSquare className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <span>
                    2. Role a lista e selecione <strong>Adicionar à Tela de Início</strong>.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Sidebar variant
  if (variant === 'sidebar') {
    if (!isInstallable && !isIOS) return null;

    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50/80 dark:bg-sky-950/40 hover:bg-sky-100/80 dark:hover:bg-sky-900/50 border border-sky-100 dark:border-sky-800/60 rounded-xl transition-colors cursor-pointer"
          title="Instalar aplicativo no dispositivo"
        >
          <span className="flex items-center gap-2">
            <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Instalar App</span>
          </span>
          <span className="text-[10px] bg-sky-200/60 dark:bg-sky-800/60 text-sky-800 dark:text-sky-200 px-1.5 py-0.5 rounded">
            PWA
          </span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Instalar no iPhone / iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>1. No Safari, toque no ícone <strong>Compartilhar</strong>.</p>
                <p>2. Toque em <strong>Adicionar à Tela de Início</strong>.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Compact variant (default button)
  if (!isInstallable && !isIOS) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 border border-sky-200 dark:border-sky-800/60 rounded-xl transition-colors cursor-pointer"
        title="Instalar Água Control no dispositivo"
      >
        <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
        <span>Instalar App</span>
      </button>

      {showIOSGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Instalar no iPhone / iPad
              </h3>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p>1. No Safari, toque no ícone <strong>Compartilhar</strong>.</p>
              <p>2. Toque em <strong>Adicionar à Tela de Início</strong>.</p>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

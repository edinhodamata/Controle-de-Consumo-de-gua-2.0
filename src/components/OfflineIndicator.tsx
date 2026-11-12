import React, { useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, X, CheckCircle2 } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  // If back online, reset dismissed state so it reappears if connectivity drops again
  React.useEffect(() => {
    if (isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  if (isOnline || dismissed) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div className="bg-amber-900/95 dark:bg-amber-950/95 text-amber-50 border border-amber-700/80 dark:border-amber-700 rounded-2xl p-3.5 shadow-xl backdrop-blur-xs flex items-start gap-3">
        <div className="p-2 bg-amber-800/80 dark:bg-amber-900/80 rounded-xl shrink-0 mt-0.5">
          <WifiOff className="w-4 h-4 text-amber-200" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-amber-100">Modo Offline Ativo</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <p className="text-xs text-amber-200/90 mt-0.5 leading-relaxed">
            Sem conexão à internet. O Água Control continua funcionando offline: seu histórico, simulações e registros locais estão preservados pelo Service Worker.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dispensar aviso de modo offline"
          className="text-amber-300 hover:text-white p-1 rounded-lg hover:bg-amber-800/60 transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

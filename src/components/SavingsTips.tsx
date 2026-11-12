import React, { useState } from 'react';
import { CalculatedMetrics } from '../types/water';
import {
  DEFAULT_SAVINGS_TIPS,
  DEFAULT_GROUNDING_SOURCES,
  TipItem,
  GroundingSource,
} from '../data/savingsTipsData';
import {
  Sparkles,
  Search,
  DropletOff,
  Wrench,
  Shirt,
  SunMedium,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ExternalLink,
  Info,
} from 'lucide-react';

interface SavingsTipsProps {
  metrics: CalculatedMetrics;
}

// Determine current Brazilian season based on month (Southern Hemisphere)
function getBrazilianSeason(): { name: string; context: string } {
  const month = new Date().getMonth() + 1; // 1 to 12
  if (month >= 12 || month <= 2) {
    return {
      name: 'Verão',
      context: 'Altas temperaturas e maior frequência de lavagem de roupas e banhos',
    };
  }
  if (month >= 3 && month <= 5) {
    return {
      name: 'Outono',
      context: 'Período de transição térmica e início da diminuição das chuvas regionais',
    };
  }
  if (month >= 6 && month <= 8) {
    return {
      name: 'Inverno / Estiagem',
      context: 'Período mais seco do ano com atenção redobrada aos reservatórios e banhos quentes',
    };
  }
  return {
    name: 'Primavera',
    context: 'Aumento gradual das temperaturas e volta do uso de regadores e áreas externas',
  };
}

export const SavingsTips: React.FC<SavingsTipsProps> = ({ metrics }) => {
  const seasonInfo = getBrazilianSeason();
  const [tips, setTips] = useState<TipItem[]>(DEFAULT_SAVINGS_TIPS);
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>(DEFAULT_GROUNDING_SOURCES);
  const [sourceType, setSourceType] = useState<string>('curated_seasonal');
  const [loading, setLoading] = useState<boolean>(false);
  const [quotaNotice, setQuotaNotice] = useState<boolean>(false);

  // Filter tabs
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  // Expanded card steps
  const [expandedId, setExpandedId] = useState<string | null>('leak-toilet');

  const fetchTips = async (focus: string = 'geral') => {
    setLoading(true);
    setQuotaNotice(false);
    try {
      const res = await fetch('/api/savings-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          season: seasonInfo.name,
          consumptionM3: metrics.hasEnoughData ? metrics.totalConsumptionM3 : 15,
          peakFlowRateLh: metrics.hasEnoughData ? metrics.peakFlowRateLh : 25,
          focusArea: focus,
        }),
      });

      if (!res.ok) {
        throw new Error('Falha na comunicação');
      }

      const data = await res.json();
      if (data.tips && Array.isArray(data.tips)) {
        setTips(data.tips);
        if (data.groundingSources && Array.isArray(data.groundingSources)) {
          setGroundingSources(data.groundingSources);
        }
        setSourceType(data.source || 'curated_seasonal');
        if (data.isQuotaExceeded) {
          setQuotaNotice(true);
        }
      }
    } catch {
      // Retain verified default tips
      setSourceType('curated_seasonal');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vazamentos':
        return <Wrench className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'maquina_de_lavar':
        return <Shirt className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'torneiras':
        return <DropletOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'sazonalidade':
      default:
        return <SunMedium className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
    }
  };

  const filteredTips = tips.filter((tip) => {
    if (selectedCategory === 'todos') return true;
    return tip.category === selectedCategory;
  });

  return (
    <section id="dicas-economia" className="scroll-mt-6 mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
            <span className="flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Recomendações Práticas
            </span>
            <span aria-hidden="true">·</span>
            <span>Estação: {seasonInfo.name}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Dicas Sazonais de Economia e Redução de Vazamentos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Recomendações técnicas baseadas na época do ano e no ritmo do hidrômetro
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchTips(selectedCategory)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-2xs self-start sm:self-auto disabled:opacity-60 cursor-pointer"
          title="Consulta dados recentes de concessionárias via Google Search"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-sky-600 dark:text-sky-400 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Consultando Google...' : 'Atualizar com Busca'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition-colors">
        {/* Context bar with seasonal insight & search queries */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 rounded-lg text-emerald-800 dark:text-emerald-300 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Contexto sazonal ({seasonInfo.name}):{' '}
              </span>
              <span className="text-slate-600 dark:text-slate-400">{seasonInfo.context}.</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200/60 dark:border-emerald-800/60 self-start md:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {sourceType === 'google_search_grounded'
                ? 'Atualizado com Google Search ao vivo'
                : 'Catálogo especializado de concessionárias (Sabesp/Sanepar)'}
            </span>
          </div>
        </div>

        {/* Quota notification banner (quiet and informative) */}
        {quotaNotice && (
          <div className="mb-4 p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 rounded-xl text-xs text-sky-900 dark:text-sky-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>
              Dicas verificadas carregadas do acervo técnico de concessionárias (Sabesp/Sanepar).
            </span>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 custom-scrollbar">
          {[
            { id: 'todos', label: 'Todas as Dicas' },
            { id: 'vazamentos', label: 'Vazamentos Comuns' },
            { id: 'maquina_de_lavar', label: 'Máquina de Lavar' },
            { id: 'torneiras', label: 'Torneiras e Arejadores' },
            { id: 'sazonalidade', label: 'Dicas de Clima' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-xs font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tips List */}
        <div className="space-y-4">
          {filteredTips.map((tip) => {
            const isExpanded = expandedId === tip.id;
            return (
              <div
                key={tip.id}
                className="rounded-xl border border-slate-200/90 dark:border-slate-800 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all bg-white dark:bg-slate-900"
              >
                {/* Header row clickable */}
                <div
                  onClick={() => toggleExpand(tip.id)}
                  className="p-4 sm:p-4.5 cursor-pointer flex items-start justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors select-none"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shrink-0 mt-0.5">
                      {getCategoryIcon(tip.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {tip.title}
                        </h3>
                        {tip.tag && (
                          <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {tip.tag}
                          </span>
                        )}
                        {tip.difficulty && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            · {tip.difficulty}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {tip.action}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-center">
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
                        {tip.estimatedSavings}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Economia esperada</span>
                    </div>

                    <div className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Savings indicator */}
                <div className="sm:hidden px-4 pb-2 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Impacto:</span>
                  <span className="font-semibold">{tip.estimatedSavings}</span>
                </div>

                {/* Expanded Step-by-Step Instructions */}
                {isExpanded && (
                  <div className="px-4 pb-4.5 pt-3 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in">
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                        Passo a passo de verificação e correção:
                      </span>
                      {tip.seasonRelevance && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Período chave: <strong>{tip.seasonRelevance}</strong>
                        </span>
                      )}
                    </div>

                    {tip.steps && tip.steps.length > 0 ? (
                      <ol className="space-y-2 list-decimal list-inside text-slate-600 dark:text-slate-400 pl-1">
                        {tip.steps.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{step}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{tip.subtitle}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Grounding Sources Footer (Google Search transparency) */}
        {groundingSources.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>Fontes técnicas consultadas (Concessionárias e Guias):</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {groundingSources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-sky-100 bg-sky-50/70 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-200/60 dark:border-sky-800 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <span className="truncate max-w-xs">{source.title}</span>
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { DEFAULT_SAVINGS_TIPS, DEFAULT_GROUNDING_SOURCES } from './src/data/savingsTipsData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// In-memory cache for search grounded responses to prevent 429 rate limit errors
const cache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

// Initialize GoogleGenAI server-side with User-Agent header
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API endpoint for seasonal savings tips grounded in Google Search
app.post('/api/savings-tips', async (req, res) => {
  const {
    season = 'Outono/Verão Residencial',
    consumptionM3 = 15,
    peakFlowRateLh = 25,
    focusArea = 'geral',
  } = req.body || {};

  const cacheKey = `${season}_${focusArea}_${Math.round(consumptionM3)}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json(cached.data);
  }

  const ai = getGenAIClient();

  if (!ai) {
    const payload = {
      success: true,
      source: 'curated_seasonal',
      season,
      queryUsed: 'Dicas de economia e detecção de vazamentos de concessionárias brasileiras',
      groundingSources: DEFAULT_GROUNDING_SOURCES,
      tips: DEFAULT_SAVINGS_TIPS,
    };
    cache.set(cacheKey, { data: payload, expiresAt: Date.now() + CACHE_TTL_MS });
    return res.json(payload);
  }

  try {
    const prompt = `Você é um engenheiro especialista em gestão hídrica residencial no Brasil.
Contexto do morador:
- Estação do ano / período: ${season}
- Consumo faturável atual: ${consumptionM3} m³/mês
- Vazão de pico detectada no hidrômetro: ${peakFlowRateLh} L/h
- Foco de interesse: ${focusArea} (vazamentos comuns, máquina de lavar roupa, torneiras, banho)

Utilize a ferramenta de busca do Google para obter práticas e recomendações sazonais atuais das concessionárias de água no Brasil (Sabesp, Sanepar, Copasa) para reduzir consumo, verificar vazamentos comuns (especialmente vaso sanitário) e otimizar ciclos de lavadora de roupas.

Responda em formato estritamente JSON contendo um array de 4 dicas práticas:
[
  {
    "id": "identificador_unico",
    "category": "vazamentos" | "maquina_de_lavar" | "torneiras" | "sazonalidade",
    "title": "Título conciso da dica",
    "subtitle": "Subtítulo explicando o impacto",
    "action": "Ação imediata recomendada",
    "estimatedSavings": "Estimativa em Litros e R$/mês",
    "difficulty": "Fácil | Média | Hábito",
    "tag": "Alta prioridade | Sazonal | Rotina eficiente",
    "seasonRelevance": "Estação ou época de maior relevância",
    "steps": ["Passo 1", "Passo 2", "Passo 3"]
  }
]
Retorne APENAS o JSON válido sem formatação markdown extra.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text || '';
    const cleanJson = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsedTips = DEFAULT_SAVINGS_TIPS;
    try {
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsedTips = parsed;
      }
    } catch {
      // Keep verified tips if JSON formatting had an issue
      parsedTips = DEFAULT_SAVINGS_TIPS;
    }

    // Extract search grounding sources
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources = rawChunks
      .map((c: any) => c.web)
      .filter((w: any) => w && w.uri && w.title)
      .slice(0, 5);

    const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    const payload = {
      success: true,
      source: 'google_search_grounded',
      season,
      queryUsed: searchQueries[0] || 'Economia de água residencial e vazamentos no Brasil',
      groundingSources:
        groundingSources.length > 0 ? groundingSources : DEFAULT_GROUNDING_SOURCES,
      tips: parsedTips,
    };

    cache.set(cacheKey, { data: payload, expiresAt: Date.now() + CACHE_TTL_MS });
    return res.json(payload);
  } catch (err: any) {
    // If rate limit (429) or other API exception occurs, serve curated tips gracefully without error logging
    const isQuotaExceeded =
      err?.status === 429 ||
      err?.code === 429 ||
      (typeof err?.message === 'string' && err.message.includes('429'));

    const fallbackPayload = {
      success: true,
      source: isQuotaExceeded ? 'curated_quota_fallback' : 'curated_seasonal',
      isQuotaExceeded: !!isQuotaExceeded,
      season,
      queryUsed: 'Práticas recomendadas de uso racional de água e teste de vazamentos',
      groundingSources: DEFAULT_GROUNDING_SOURCES,
      tips: DEFAULT_SAVINGS_TIPS,
    };

    // Cache fallback so we do not repeatedly retry and hit quota immediately
    cache.set(cacheKey, { data: fallbackPayload, expiresAt: Date.now() + (isQuotaExceeded ? 60000 : CACHE_TTL_MS) });
    return res.json(fallbackPayload);
  }
});

// Serve static assets from public folder (Service Worker, Web App Manifest, PWA Icons)
app.use(
  express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('sw.js')) {
        res.setHeader('Service-Worker-Allowed', '/');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('manifest.json')) {
        res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
      }
    },
  })
);

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Água Control server running on http://localhost:${port}`);
  });
}

startServer();

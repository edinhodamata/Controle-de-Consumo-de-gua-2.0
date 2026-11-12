import { WaterReading } from '../types/water';

/**
 * Realistic residential demonstration dataset.
 * Reflects a 3 to 4 person household monitoring their water meter twice daily or once daily over a 2-week period.
 */
export const DEMO_READINGS: WaterReading[] = [
  {
    id: 'demo-01',
    timestamp: '2026-03-01T08:00',
    value: 142150,
    notes: 'Início do acompanhamento mensal (manhã)',
  },
  {
    id: 'demo-02',
    timestamp: '2026-03-02T08:00',
    value: 142690, // +540 L (24h) -> 22.5 L/h
    notes: 'Segunda-feira normal',
  },
  {
    id: 'demo-03',
    timestamp: '2026-03-03T08:00',
    value: 143210, // +520 L (24h) -> 21.6 L/h
    notes: 'Consumo estável',
  },
  {
    id: 'demo-04',
    timestamp: '2026-03-04T08:00',
    value: 143780, // +570 L (24h) -> 23.75 L/h
    notes: 'Banho e cozinha regulares',
  },
  {
    id: 'demo-05',
    timestamp: '2026-03-05T08:00',
    value: 144290, // +510 L (24h) -> 21.25 L/h
    notes: 'Quinta-feira',
  },
  {
    id: 'demo-06',
    timestamp: '2026-03-06T08:00',
    value: 144830, // +540 L (24h) -> 22.5 L/h
    notes: 'Sexta-feira rotineira',
  },
  {
    id: 'demo-07',
    timestamp: '2026-03-07T08:00',
    value: 145350, // +520 L (24h)
    notes: 'Início do fim de semana',
  },
  {
    id: 'demo-08',
    timestamp: '2026-03-07T14:00',
    value: 146120, // +770 L in 6h -> 128.33 L/h (Pico de consumo: faxina + máquina de lavar)
    notes: 'Pico: 3 ciclos de máquina de lavar + faxina',
  },
  {
    id: 'demo-09',
    timestamp: '2026-03-08T08:00',
    value: 146580, // +460 L in 18h -> 25.55 L/h
    notes: 'Domingo de manhã',
  },
  {
    id: 'demo-10',
    timestamp: '2026-03-09T08:00',
    value: 147110, // +530 L (24h)
    notes: 'Início de nova semana',
  },
  {
    id: 'demo-11',
    timestamp: '2026-03-10T08:00',
    value: 147630, // +520 L (24h)
    notes: 'Rotina residencial',
  },
  {
    id: 'demo-12',
    timestamp: '2026-03-11T08:00',
    value: 148190, // +560 L (24h)
    notes: 'Quarta-feira',
  },
  {
    id: 'demo-13',
    timestamp: '2026-03-12T08:00',
    value: 148730, // +540 L (24h)
    notes: 'Consumo dentro do padrão',
  },
  {
    id: 'demo-14',
    timestamp: '2026-03-13T08:00',
    value: 149260, // +530 L (24h)
    notes: 'Sexta-feira',
  },
  {
    id: 'demo-15',
    timestamp: '2026-03-14T18:00',
    value: 149840, // +580 L in 34h
    notes: 'Última leitura registrada',
  },
];

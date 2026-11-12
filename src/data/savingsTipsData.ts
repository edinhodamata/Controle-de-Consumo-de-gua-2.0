export interface TipItem {
  id: string;
  category: 'vazamentos' | 'maquina_de_lavar' | 'torneiras' | 'sazonalidade' | string;
  title: string;
  subtitle: string;
  action: string;
  estimatedSavings: string;
  difficulty?: string;
  tag?: string;
  seasonRelevance?: string;
  steps?: string[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export const DEFAULT_SAVINGS_TIPS: TipItem[] = [
  {
    id: 'leak-toilet',
    category: 'vazamentos',
    title: 'Vaso Sanitário: Teste da Borra de Café ou Corante',
    subtitle: 'Vazamentos na válvula de descarga podem desperdiçar até 15.000 litros/mês',
    action: 'Jogue um pouco de pó de café ou corante alimentar na bacia. Se descer sem dar descarga, há vazamento na comporta ou válvula.',
    estimatedSavings: '3.000 a 15.000 L/mês (economia de até R$ 180/mês)',
    difficulty: 'Fácil (5 minutos)',
    tag: 'Alta prioridade',
    seasonRelevance: 'Ano todo',
    steps: [
      'Seque a louça e observe se há filete de água contínuo escorrendo na parede da bacia.',
      'Coloque uma colher de borra de café ou gota de corante na água parada do vaso.',
      'Se a água ficar turva ou o pó sumir em 10 minutos sem acionamento, troque a borracha de vedação (obturador) ou regule a torre de entrada.',
    ],
  },
  {
    id: 'washing-machine-cycles',
    category: 'maquina_de_lavar',
    title: 'Máquina de Lavar: Lotação Máxima e Reúso da Água de Enxágue',
    subtitle: 'Cada ciclo de lavagem de 10-12 kg consome entre 100 e 160 litros de água tratada',
    action: 'Acumule peças para atingir a capacidade máxima recomendada pelo fabricante e aproveite a mangueira de drenagem para encher baldes de faxina.',
    estimatedSavings: '1.200 a 3.000 L/mês (economia de cerca de R$ 45/mês)',
    difficulty: 'Fácil',
    tag: 'Rotina eficiente',
    seasonRelevance: 'Verão e Primavera',
    steps: [
      'Nunca ligue a lavadora para poucas peças isoladas; use o cesto de acúmulo.',
      'No último ciclo (enxágue), desvie a mangueira para baldes limpos para lavar calçadas, panos de chão ou o quintal.',
      'Opte pela dosagem exata de sabão para não necessitar de ciclos de enxágue extras.',
    ],
  },
  {
    id: 'faucet-aerators',
    category: 'torneiras',
    title: 'Instalação de Arejadores em Torneiras de Cozinha e Banheiro',
    subtitle: 'Reduz o consumo em até 50% mantendo a sensação de pressão com injeção de ar',
    action: 'Rosqueie bicos arejadores de R$ 10 a R$ 20 na ponta das torneiras existentes.',
    estimatedSavings: '1.500 a 2.500 L/mês',
    difficulty: 'Muito fácil',
    tag: 'Investimento rápido',
    seasonRelevance: 'Ano todo',
    steps: [
      'Desrosqueie a ponta atual da torneira (geralmente rosca universal de 1/2" ou M22/M24).',
      'Rosqueie o arejador com anel de vedação de borracha para evitar vazamento lateral.',
      'Limpe periodicamente a telinha de sedimentos vindos da caixa d’água.',
    ],
  },
  {
    id: 'seasonal-heat',
    category: 'sazonalidade',
    title: 'Ajuste Sazonal: Banhos e Rega de Plantas',
    subtitle: 'Em períodos mais quentes, o consumo residencial chega a subir 20% a 30%',
    action: 'Regue jardins apenas antes das 8h ou após as 19h para diminuir a evaporação em até 60%. Reduza banhos em 3 minutos.',
    estimatedSavings: '2.000 a 4.500 L/mês por morador',
    difficulty: 'Hábito',
    tag: 'Sazonal',
    seasonRelevance: 'Verão e Estiagem',
    steps: [
      'A cada minuto com chuveiro aberto são gastos entre 9 a 15 litros.',
      'Feche o registro enquanto ensaboa o corpo e lava os cabelos.',
      'Na rega de vasos e gramados, utilize regadores manuais em vez de mangueira aberta contínua.',
    ],
  },
];

export const DEFAULT_GROUNDING_SOURCES: GroundingSource[] = [
  {
    title: 'Manual de Uso Racional da Água e Combate a Vazamentos - Sabesp',
    uri: 'https://site.sabesp.com.br/site/interna/Default.aspx?secaoId=140',
  },
  {
    title: 'Guia de Consumo Consciente e Dicas para o Hidrômetro - Sanepar',
    uri: 'https://site.sanepar.com.br/informacoes/dicas-de-consumo-consciente',
  },
];

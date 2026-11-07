import { create } from 'zustand';
export type Language = 'pt-BR' | 'en';
function initialLanguage(): Language {
  try {
    return localStorage.getItem('mk-language') === 'en' ? 'en' : 'pt-BR';
  } catch {
    return 'pt-BR';
  }
}
export const useLanguage = create<{
  language: Language;
  setLanguage: (language: Language) => void;
}>((set) => ({
  language: initialLanguage(),
  setLanguage: (language) => {
    if (language !== 'en' && language !== 'pt-BR') return;
    try {
      localStorage.setItem('mk-language', language);
    } catch {
      /* The session can still change languages when storage is blocked. */
    }
    set({ language });
  },
}));
export const locale = () => (useLanguage.getState().language === 'en' ? 'en-US' : 'pt-BR');
export const ptBR: Record<string, string> = {
  'Test realm': 'Reino de testes',
  'Resources per second': 'Recursos por segundo',
  'Resources per hour': 'Recursos por hora',
  'Advance time': 'Avançar tempo',
  'Advances production, construction, training, research and the village clock. Requirements and costs still apply.':
    'Avança produção, construções, tropas, pesquisas e o relógio da aldeia. Custos e requisitos continuam valendo.',
  Lighting: 'Iluminação',
  Weather: 'Clima',
  Auto: 'Automático',
  Morning: 'Manhã',
  Day: 'Dia',
  Dusk: 'Entardecer',
  Night: 'Noite',
  Clear: 'Céu limpo',
  Rain: 'Chuva',
  Farmer: 'Fazendeiro',
  Soldier: 'Soldado',
  'Building names': 'Nomes dos edifícios',
  'Construction sites': 'Locais de construção',
  'Visual upgrades every 5 levels': 'Evolução visual a cada 5 níveis',
  'Choose a valid time advance.': 'Escolha um avanço de tempo válido.',

  'Village Overview': 'Visão geral da aldeia',
  Buildings: 'Edifícios',
  Military: 'Militar',
  Research: 'Pesquisas',
  'Rally Point': 'Praça de Reunião',
  Reports: 'Relatórios',
  Settings: 'Configurações',
  Headquarters: 'Edifício Principal',
  'Timber Camp': 'Bosque',
  'Clay Pit': 'Poço de Argila',
  'Iron Mine': 'Mina de Ferro',
  Farm: 'Fazenda',
  Warehouse: 'Armazém',
  'Hiding Place': 'Esconderijo',
  Barracks: 'Quartel',
  Smithy: 'Ferreiro',
  Stable: 'Estábulo',
  Wall: 'Muralha',
  Church: 'Igreja',
  'The heart of your realm. Direct construction and unlock the foundations of a flourishing kingdom.':
    'O coração do seu reino. Coordene construções e libere as bases de um reino próspero.',
  'Foresters harvest the ancient woodland, supplying timber for a growing village.':
    'Lenhadores exploram a floresta e fornecem madeira para o crescimento da aldeia.',
  'Rich earth is shaped into the bricks that will become your kingdom.':
    'A terra rica fornece a argila usada nos tijolos que erguerão seu reino.',
  'Miners work the rocky hillside to supply tools, armor, and weapons.':
    'Mineiros extraem ferro das encostas para produzir ferramentas, armaduras e armas.',
  'Golden fields and full granaries sustain your villagers and soldiers.':
    'Campos dourados e celeiros cheios sustentam os moradores e soldados.',
  'Keep the fruits of your labor safe in spacious timber storehouses.':
    'Guarde os frutos do seu trabalho em depósitos espaçosos de madeira.',
  'Concealed cellars protect a portion of each resource from future raids.':
    'Depósitos ocultos protegem parte de cada recurso contra futuros saques.',
  'A gathering place for the banners of your army. Muster troops and prepare future expeditions.':
    'Reúna as tropas sob seu estandarte e prepare futuras expedições.',
  'Train disciplined infantry to defend your home and carry your banner.':
    'Treine uma infantaria disciplinada para defender sua aldeia e levar seu estandarte.',
  'The ringing of hammer on anvil heralds new military knowledge.':
    'O som do martelo na bigorna anuncia novos conhecimentos militares.',
  'Breed strong horses and train the mounted warriors of your realm.':
    'Crie cavalos fortes e treine os guerreiros montados do seu reino.',
  'A sturdy ring of stone protects your village and strengthens its defenders.':
    'Um sólido anel de pedra protege sua aldeia e fortalece seus defensores.',
  'A beacon of faith and fellowship that strengthens the resolve of your people.':
    'Um símbolo de fé e união que fortalece a determinação do seu povo.',
  'Construction speed': 'Velocidade de construção',
  'Wood production': 'Produção de madeira',
  'Clay production': 'Produção de argila',
  'Iron production': 'Produção de ferro',
  'Population capacity': 'Capacidade populacional',
  'Storage per resource': 'Armazenamento por recurso',
  'Protected resources': 'Recursos protegidos',
  'Army command': 'Comando do exército',
  'Infantry training': 'Treinamento de infantaria',
  'Military research': 'Pesquisa militar',
  'Cavalry training': 'Treinamento de cavalaria',
  'Defense bonus': 'Bônus de defesa',
  'Morale bonus': 'Bônus de moral',
  Spearman: 'Lanceiro',
  Swordsman: 'Espadachim',
  Axeman: 'Guerreiro de Machado',
  Archer: 'Arqueiro',
  'Light Cavalry': 'Cavalaria Leve',
  'Heavy Cavalry': 'Cavalaria Pesada',
  'Reliable guardians against mounted enemies.': 'Defensores confiáveis contra inimigos montados.',
  'Armored infantry with a steadfast defense.': 'Infantaria com armadura e defesa sólida.',
  'Fearless infantry built for the front line.':
    'Infantaria destemida preparada para a linha de frente.',
  'Patient marksmen watching over your walls.': 'Atiradores atentos que vigiam suas muralhas.',
  'Swift riders with room for supplies.':
    'Cavaleiros velozes com espaço para carregar suprimentos.',
  'The armored fist of a powerful kingdom.': 'A força blindada de um reino poderoso.',
  'Improved Spears': 'Lanças Aprimoradas',
  'Reinforced Armor': 'Armadura Reforçada',
  'Advanced Swordsmithing': 'Forja Avançada de Espadas',
  'Archery Training': 'Treinamento de Arqueria',
  'Cavalry Equipment': 'Equipamento de Cavalaria',
  'Hardened spearheads hold the line against charging horsemen.':
    'Pontas de lança reforçadas resistem às investidas dos cavaleiros.',
  'Layered armor gives every soldier greater staying power.':
    'Armaduras reforçadas aumentam a resistência de todos os soldados.',
  'Balanced steel blades bring professional infantry to your ranks.':
    'Lâminas de aço equilibradas trazem infantaria profissional às suas fileiras.',
  'Well-drilled bowmen add a new layer to your village defense.':
    'Arqueiros bem treinados acrescentam uma nova camada de defesa à aldeia.',
  'Strong saddles and fitted tack prepare your mounted companies.':
    'Selas resistentes e arreios ajustados preparam suas companhias de cavalaria.',
  '+15% spearman cavalry defense': '+15% de defesa dos lanceiros contra cavalaria',
  '+10% all troop defense': '+10% de defesa de todas as tropas',
  'Unlock swordsmen; +15% infantry attack': 'Libera espadachins; +15% de ataque da infantaria',
  'Unlock archers; +10% ranged defense':
    'Libera arqueiros; +10% de defesa contra ataques à distância',
  'Unlock cavalry; +10% cavalry attack': 'Libera cavalaria; +10% de ataque da cavalaria',
  'Lv.': 'Nv.',
  Queued: 'Na fila',
  'Not yet constructed': 'Ainda não construído',
  'Army command available': 'Comando do exército disponível',
  'BUILDING DETAILS': 'DETALHES DO EDIFÍCIO',
  'Close building details': 'Fechar detalhes do edifício',
  UNBUILT: 'NÃO CONSTRUÍDO',
  'Current benefit': 'Benefício atual',
  Level: 'Nível',
  'UNLOCK REQUIREMENTS': 'REQUISITOS PARA LIBERAR',
  'FULLY DEVELOPED': 'TOTALMENTE DESENVOLVIDO',
  'Building locked': 'Edifício bloqueado',
  'Maximum level': 'Nível máximo',
  'Construction queue full': 'Fila de construção cheia',
  'More resources needed': 'Recursos insuficientes',
  'Upgrade building': 'Melhorar edifício',
  'Construct building': 'Construir edifício',
  Open: 'Abrir',
  'army command': 'comando do exército',
  research: 'pesquisas',
  recruitment: 'recrutamento',
  'Your progress is saved automatically.': 'Seu progresso é salvo automaticamente.',
  'THE STRENGTH OF YOUR REALM': 'A FORÇA DO SEU REINO',
  'Raise your banners': 'Erga seus estandartes',
  'Recruit loyal soldiers. Build an army worthy of your kingdom.':
    'Recrute soldados leais. Forme um exército digno do seu reino.',
  Garrison: 'Guarnição',
  troops: 'tropas',
  Population: 'População',
  'Wall defense': 'Defesa da muralha',
  'in village': 'na aldeia',
  Attack: 'Ataque',
  'Inf. defense': 'Defesa contra infantaria',
  'Cav. defense': 'Defesa contra cavalaria',
  'Ranged def.': 'Defesa à distância',
  Travel: 'Deslocamento',
  'min / tile': 'min / campo',
  Carry: 'Carga',
  Locked: 'Bloqueado',
  Recruit: 'Recrutar',
  queue: '— fila',
  'Your trainers await new recruits.': 'Seus instrutores aguardam novos recrutas.',
  'KNOWLEDGE FORGES POWER': 'O CONHECIMENTO FORJA O PODER',
  'The art of advancement': 'A arte de evoluir',
  'Turn the knowledge of your smiths into strength on the battlefield.':
    'Transforme o conhecimento dos ferreiros em força no campo de batalha.',
  'Knowledge mastered': 'Conhecimento dominado',
  Researched: 'Pesquisado',
  'Research in progress': 'Pesquisa em andamento',
  'Requirements not met': 'Requisitos não atendidos',
  'Research technology': 'Pesquisar tecnologia',
  'UNDER ONE BANNER': 'SOB UM ÚNICO ESTANDARTE',
  'The rally point': 'A praça de reunião',
  'Your army, gathered at the heart of the village.': 'Seu exército reunido no coração da aldeia.',
  'Establish your Rally Point': 'Construa sua Praça de Reunião',
  'Reach Headquarters level 3, then construct the Rally Point to open army command.':
    'Evolua o Edifício Principal até o nível 3 e construa a Praça de Reunião para acessar o comando do exército.',
  'Village garrison': 'Guarnição da aldeia',
  Unit: 'Unidade',
  Available: 'Disponível',
  Capacity: 'Capacidade',
  'Defensive strength': 'Força defensiva',
  'Wall bonus': 'Bônus da muralha',
  'Regional morale': 'Moral regional',
  'Protected per resource': 'Proteção por recurso',
  'Troop movements': 'Movimentações de tropas',
  'Your troops are stationed at home. Attacks, reinforcements, and travel are planned for the multiplayer expansion.':
    'Suas tropas estão na aldeia. Ataques, reforços e viagens estão previstos para a expansão multijogador.',
  'MAKE IT YOUR OWN': 'DEIXE SUA MARCA',
  'Your realm, your rules': 'Seu reino, suas regras',
  'Manage your village and learn about the realm.': 'Gerencie sua aldeia e conheça seu reino.',
  'Village identity': 'Identidade da aldeia',
  'Village name': 'Nome da aldeia',
  Saved: 'Salvo',
  'Save village name': 'Salvar nome da aldeia',
  'Realm information': 'Informações do reino',
  'Realm speed': 'Velocidade do reino',
  'Construction queue': 'Fila de construção',
  buildings: 'edifícios',
  Persistence: 'Salvamento',
  'Automatic · SQLite': 'Automático · SQLite',
  'Production, construction, training, and research continue while you are away. All rates and timers reflect this realm’s speed.':
    'Produção, construções, treinamentos e pesquisas continuam enquanto você está fora. Todas as taxas e os tempos refletem a velocidade deste reino.',
  'This is a single-player village realm. World maps, combat, and alliances are reserved for a future expansion.':
    'Este é um reino com uma aldeia para um jogador. Mapa mundial, combates e alianças estão previstos para uma expansão futura.',
  Language: 'Idioma',
  'Interface language': 'Idioma da interface',
  'Choose the language used on this device.': 'Escolha o idioma utilizado neste dispositivo.',
  'Dismiss notification': 'Fechar notificação',
  All: 'Todos',
  'Preparing your realm…': 'Preparando seu reino…',
  'Try again': 'Tentar novamente',
  'Kingdom crest': 'Brasão do reino',
  'BUILD YOUR LEGACY': 'CONSTRUA SEU LEGADO',
  'Oakheart Valley': 'Vale de Oakheart',
  'Peaceful realm ·': 'Reino pacífico ·',
  '× speed': '× de velocidade',
  'YOUR KINGDOM': 'SEU REINO',
  'A kingdom takes root.': 'Um reino cria raízes.',
  'Great things begin with': 'Grandes feitos começam com',
  'a well-tended village.': 'uma aldeia bem cuidada.',
  'A lord’s handbook': 'Manual do governante',
  'The Steward': 'O Regente',
  'Lord of': 'Governante de',
  'Close navigation': 'Fechar navegação',
  'Open navigation': 'Abrir navegação',
  'Time until storage is full': 'Tempo até o armazém ficar cheio',
  Full: 'Cheio',
  'View notifications': 'Ver notificações',
  'Your kingdom': 'Seu reino',
  'A village. A vision. A kingdom.': 'Uma aldeia. Uma visão. Um reino.',
  'Every great kingdom begins with a single village. This one is yours.':
    'Todo grande reino começa com uma única aldeia. Esta é a sua.',
  'Shape the future of your growing realm.': 'Construa o futuro do seu reino em expansão.',
  'Year 1 · The Age of Beginnings': 'Ano 1 · A Era dos Começos',
  Spring: 'Primavera',
  'A new dawn': 'Um novo amanhecer',
  'YOUR VILLAGE': 'SUA ALDEIA',
  points: 'pontos',
  'Village at peace': 'Aldeia em paz',
  villagers: 'habitantes',
  'Select a building to manage': 'Selecione um edifício para gerenciar',
  Construction: 'Construção',
  'Your next chapter awaits': 'Seu próximo capítulo aguarda',
  'Choose a building and start an upgrade.': 'Escolha um edifício e inicie uma melhoria.',
  'Construction continues while you’re away.': 'A construção continua enquanto você está fora.',
  'A growing realm': 'Um reino em crescimento',
  'CHAPTER I': 'CAPÍTULO I',
  'Lay the foundations': 'Estabeleça as bases',
  'A stronger Headquarters opens the way to a military of your own.':
    'Um Edifício Principal mais forte abre caminho para seu próprio exército.',
  'Headquarters level 3': 'Edifício Principal nível 3',
  'Build your barracks': 'Construa seu quartel',
  'Develop your headquarters': 'Evolua seu Edifício Principal',
  'Your legacy is safely recorded.': 'Seu legado está registrado com segurança.',
  'THE ROOTS OF A KINGDOM RUN DEEP.': 'AS RAÍZES DE UM REINO SÃO PROFUNDAS.',
  'Connected to realm': 'Conectado ao reino',
  'STONE BY STONE': 'PEDRA POR PEDRA',
  'Build a lasting legacy': 'Construa um legado duradouro',
  'Develop your village. New possibilities emerge as your realm grows.':
    'Desenvolva sua aldeia. Novas possibilidades surgem com o crescimento do reino.',
  Economy: 'Economia',
  Village: 'Aldeia',
  'Select a building to start construction.': 'Selecione um edifício para iniciar a construção.',
  'THE CHRONICLES OF': 'AS CRÔNICAS DE',
  'A record of your reign': 'O registro do seu reinado',
  'News, milestones, and the quiet progress of your village.':
    'Notícias, conquistas e o progresso da sua aldeia.',
  'Mark all read': 'Marcar todos como lidos',
  'Dismiss error': 'Fechar erro',
  'Village news': 'Notícias da aldeia',
  'Close notifications': 'Fechar notificações',
  'View the chronicles': 'Ver as crônicas',
  'Close handbook': 'Fechar manual',
  'Plant the seeds of a kingdom.': 'Plante as sementes de um reino.',
  'Your timber camp, clay pit, and iron mine produce resources continuously, even while you’re away. Upgrade them to grow your economy.':
    'Seu bosque, poço de argila e mina de ferro produzem recursos continuamente, mesmo enquanto você está fora. Melhore-os para expandir sua economia.',
  'Build your foundations.': 'Estabeleça suas bases.',
  'Click a village building to upgrade it. Your Headquarters unlocks new buildings and speeds up construction.':
    'Toque em um edifício para melhorá-lo. O Edifício Principal libera novas construções e reduz os tempos de construção.',
  'Make room to grow.': 'Abra espaço para crescer.',
  'Expand the Warehouse before resources fill up. Upgrade the Farm to support buildings and troops.':
    'Amplie o Armazém antes que os recursos atinjam o limite. Melhore a Fazenda para sustentar edifícios e tropas.',
  'Raise a garrison.': 'Forme uma guarnição.',
  'Reach Headquarters level 3 and construct a Barracks. Train spearmen and axemen to begin your army.':
    'Evolua o Edifício Principal até o nível 3 e construa um Quartel. Treine lanceiros e guerreiros de machado para iniciar seu exército.',
  'Advance your knowledge.': 'Amplie seus conhecimentos.',
  'Unlock the Smithy with Headquarters 5 and Barracks 3. Research equipment and new units.':
    'Libere o Ferreiro com Edifício Principal 5 e Quartel 3. Pesquise equipamentos e novas unidades.',
  'Costs are paid when a job is queued. Buildings share one construction lane; Barracks, Stable, and Smithy each work independently. Recruitment arrives as a completed batch.':
    'Os custos são pagos ao adicionar uma tarefa à fila. Os edifícios compartilham uma fila de construção; Quartel, Estábulo e Ferreiro trabalham de forma independente. Os recrutas chegam quando o lote inteiro é concluído.',
  'My village awaits': 'Minha aldeia me espera',
  'Recording your decree…': 'Registrando seu decreto…',
  'Army muster plan': 'Plano de formação do exército',
  selected: 'selecionadas',
  'Organize a company for future expeditions. Saving a plan keeps your troops stationed safely at home.':
    'Organize uma companhia para futuras expedições. Ao salvar um plano, suas tropas continuam estacionadas na aldeia.',
  available: 'disponíveis',
  attack: 'de ataque',
  'carrying capacity': 'de capacidade de carga',
  'No troops selected': 'Nenhuma tropa selecionada',
  'Rally Point required': 'Praça de Reunião necessária',
  'Muster plan saved': 'Plano de formação salvo',
  'Save muster plan': 'Salvar plano de formação',
  'Interactive isometric map of your village': 'Mapa isométrico interativo da sua aldeia',
  'Zoom out village map': 'Diminuir zoom do mapa',
  'Zoom in village map': 'Aumentar zoom do mapa',
  'A living village. A growing legacy.': 'Uma aldeia viva. Um legado em crescimento.',
  'OAKHEART VALLEY': 'VALE DE OAKHEART',
  'A new chapter begins': 'Um novo capítulo começa',
  'Your banner flies over Oakheart. Grow your economy and build a realm to endure.':
    'Seu estandarte tremula sobre Oakheart. Desenvolva sua economia e construa um reino duradouro.',
  'Expand your warehouse or invest in your village.':
    'Amplie seu armazém ou invista na sua aldeia.',
  'A new building is available for construction.':
    'Um novo edifício está disponível para construção.',
  'Troops ready': 'Tropas prontas',
  'Not enough resources. Let your economy grow.':
    'Recursos insuficientes. Aguarde sua economia produzir mais.',
  'Unknown building.': 'Edifício desconhecido.',
  'Building requirements are not met.': 'Os requisitos do edifício não foram atendidos.',
  'Construction queue is full.': 'A fila de construção está cheia.',
  'Maximum level reached.': 'Nível máximo atingido.',
  'Your farm needs more capacity.': 'Sua fazenda precisa de mais capacidade.',
  'Choose between 1 and 10,000 troops.': 'Escolha entre 1 e 10.000 tropas.',
  'Unit requirements are not met.': 'Os requisitos da unidade não foram atendidos.',
  'Recruitment queue is full.': 'A fila de recrutamento está cheia.',
  'Not enough population capacity. Upgrade your farm.':
    'Capacidade populacional insuficiente. Melhore sua fazenda.',
  'Unknown technology.': 'Tecnologia desconhecida.',
  'Already researched or in progress.': 'Já pesquisado ou em andamento.',
  'The smithy is already researching.': 'O ferreiro já está realizando uma pesquisa.',
  'Research requirements are not met.': 'Os requisitos da pesquisa não foram atendidos.',
  'Construct a Rally Point before organizing an army.':
    'Construa uma Praça de Reunião antes de organizar um exército.',
  'Choose an army composition.': 'Escolha a composição do exército.',
  'Your army plan exceeds the available garrison.':
    'Seu plano de formação excede as tropas disponíveis.',
  'Use a village name between 1 and 32 characters.': 'Use um nome de aldeia com 1 a 32 caracteres.',
  'Unknown action.': 'Ação desconhecida.',
  'Village changed. Please try again.': 'A aldeia foi alterada. Tente novamente.',
  'A valid request ID is required.': 'É necessário um identificador de solicitação válido.',
  'Origin is not allowed.': 'Origem não permitida.',
  'Unable to update village.': 'Não foi possível atualizar a aldeia.',
  'Failed to fetch': 'Não foi possível conectar ao servidor.',
  'Load failed': 'Falha ao conectar ao servidor.',
  wood: 'madeira',
  clay: 'argila',
  iron: 'ferro',
  Wood: 'Madeira',
  Clay: 'Argila',
  Iron: 'Ferro',
};
// Translate legacy persisted reports at display time; stable game IDs and saved names stay intact.
function translateDynamic(text: string): string {
  const rules: [RegExp, (...args: string[]) => string][] = [
    [/^(.+) \/ second \(base\)$/, (_, n) => `${n} / segundo (base)`],
    [/^UPGRADE TO LEVEL (\d+)$/, (_, n) => `MELHORAR PARA O NÍVEL ${n}`],
    [/^LEVEL (\d+)$/, (_, n) => `NÍVEL ${n}`],
    [/^Level (\d+)$/, (_, n) => `Nível ${n}`],
    [/^Smithy level (\d+)$/, (_, n) => `Ferreiro nível ${n}`],
    [/^Research tier (\d+)$/, (_, n) => `Nível de pesquisa ${n}`],
    [/^(.+) \/ hour \(base\)$/, (_, n) => `${n} / hora (base)`],
    [/^(.+) protected per resource$/, (_, n) => `${n} protegidos por recurso`],
    [/^(.+) per resource$/, (_, n) => `${n} por recurso`],
    [/^(.+) population$/, (_, n) => `${n} de população`],
    [/^(.+)% faster construction$/, (_, n) => `${n}% de redução no tempo de construção`],
    [/^(.+)% faster recruitment$/, (_, n) => `${n}% de redução no tempo de recrutamento`],
    [/^(.+)% defense$/, (_, n) => `${n}% de defesa`],
    [/^(.+)% morale$/, (_, n) => `${n}% de moral`],
    [/^(.+) completed$/, (_, name) => `${t(name)}: construção concluída`],
    [/^Your (.+) is now level (\d+)\.$/, (_, name, n) => `${t(name)} agora está no nível ${n}.`],
    [/^(.+) unlocked$/, (_, name) => `${t(name)} liberado`],
    [/^(.+) researched$/, (_, name) => `${t(name)}: pesquisa concluída`],
    [
      /^(Wood|Clay|Iron) storage is full$/,
      (_, r) => `O armazenamento de ${t(r.toLowerCase())} está cheio`,
    ],
    [
      /^(\d+) (.+) joined your garrison\.$/,
      (_, n, name) => `${n} × ${t(name)} chegaram à sua guarnição.`,
    ],
    [/^(.+), level (\d+)$/, (_, name, n) => `${t(name)}, nível ${n}`],
    [/^(.+) illustration$/, (_, name) => `Ilustração de ${t(name)}`],
    [/^(.+) quantity$/, (_, name) => `Quantidade de ${t(name)}`],
    [/^Muster (.+)$/, (_, name) => `Selecionar ${t(name)}`],
    [/^(wood|clay|iron) cost$/, (_, r) => `Custo em ${t(r)}`],
    [/^Peaceful realm · (.+)× speed$/, (_, n) => `Reino pacífico · velocidade ${n}×`],
    [/^(.+) troops$/, (_, n) => `${n} tropas`],
    [/^(.+) min \/ tile$/, (_, n) => `${n} min / campo`],
  ];
  for (const [pattern, render] of rules) {
    const match = text.match(pattern);
    if (match) return render(...match);
  }
  return text;
}
/** Localizes display strings only; non-string React children retain their original identity. */
export function t<T>(value: T): T {
  if (typeof value !== 'string' || useLanguage.getState().language === 'en') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  const result = ptBR[trimmed] ?? translateDynamic(trimmed);
  return (value.slice(0, value.indexOf(trimmed)) +
    result +
    value.slice(value.indexOf(trimmed) + trimmed.length)) as T;
}

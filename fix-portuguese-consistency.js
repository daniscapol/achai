import pkg from 'pg';
const { Pool } = pkg;

// Database connection
const pool = new Pool({
  user: 'achai',
  host: 'achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com',
  database: 'achai',
  password: process.env.DB_PASSWORD || 'TrinityPW1',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

function analyzeAndFixPortugueseDescription(product) {
  const { id, name, description_pt, description_en, product_type } = product;
  
  if (!description_pt || description_pt === 'null') {
    return {
      needsFix: true,
      reason: 'Missing Portuguese description',
      severity: 'high',
      originalText: description_pt,
      fixedText: generatePortugueseDescription(name, description_en, product_type)
    };
  }

  let fixedText = description_pt;
  let issues = [];

  // 1. Replace AI with IA in Portuguese context
  if (fixedText.includes(' AI ') || fixedText.includes('AI ') || fixedText.endsWith(' AI') || fixedText.includes('AI,') || fixedText.includes('AI.')) {
    fixedText = fixedText
      .replace(/\bAI\b/g, 'IA')
      .replace(/\bai\b/g, 'IA');
    issues.push('AI → IA');
  }

  // 2. Fix common English words that should be Portuguese
  const englishToPortuguese = {
    // Technology terms
    'server': 'servidor',
    'servers': 'servidores',
    'client': 'cliente',
    'clients': 'clientes',
    'agent': 'agente',
    'agents': 'agentes',
    'framework': 'framework',
    'platform': 'plataforma',
    'tool': 'ferramenta',
    'tools': 'ferramentas',
    'system': 'sistema',
    'systems': 'sistemas',
    'application': 'aplicação',
    'applications': 'aplicações',
    'service': 'serviço',
    'services': 'serviços',
    'database': 'banco de dados',
    'web': 'web',
    'website': 'site',
    'interface': 'interface',
    'development': 'desenvolvimento',
    'programming': 'programação',
    'coding': 'codificação',
    'automation': 'automação',
    'integration': 'integração',
    'management': 'gerenciamento',
    'monitoring': 'monitoramento',
    'analysis': 'análise',
    'analytics': 'análise',
    'processing': 'processamento',
    'generation': 'geração',
    'recognition': 'reconhecimento',
    'search': 'busca',
    'retrieval': 'recuperação',
    'storage': 'armazenamento',
    'security': 'segurança',
    'authentication': 'autenticação',
    'configuration': 'configuração',
    'deployment': 'implantação',
    'testing': 'teste',
    'optimization': 'otimização',
    'performance': 'desempenho',
    'workflow': 'fluxo de trabalho',
    'pipeline': 'pipeline',
    'model': 'modelo',
    'models': 'modelos',
    'data': 'dados',
    'file': 'arquivo',
    'files': 'arquivos',
    'document': 'documento',
    'documents': 'documentos',
    'content': 'conteúdo',
    'text': 'texto',
    'image': 'imagem',
    'images': 'imagens',
    'video': 'vídeo',
    'audio': 'áudio',
    'voice': 'voz',
    'speech': 'fala',
    'language': 'linguagem',
    'natural language': 'linguagem natural',
    'machine learning': 'aprendizado de máquina',
    'deep learning': 'aprendizado profundo',
    'neural network': 'rede neural',
    'artificial intelligence': 'inteligência artificial',
    'conversation': 'conversação',
    'chat': 'chat',
    'messaging': 'mensagem',
    'communication': 'comunicação',
    'collaboration': 'colaboração',
    'productivity': 'produtividade',
    'assistant': 'assistente',
    'helper': 'auxiliar',
    'support': 'suporte',
    'control': 'controle',
    'access': 'acesso',
    'connection': 'conexão',
    'network': 'rede',
    'cloud': 'nuvem',
    'browser': 'navegador',
    'mobile': 'móvel',
    'desktop': 'desktop',
    'terminal': 'terminal',
    'command': 'comando',
    'script': 'script',
    'code': 'código',
    'software': 'software',
    'hardware': 'hardware',
    'device': 'dispositivo',
    'user': 'usuário',
    'users': 'usuários',
    'customer': 'cliente',
    'business': 'negócio',
    'enterprise': 'empresa',
    'organization': 'organização',
    'project': 'projeto',
    'task': 'tarefa',
    'workflow': 'fluxo de trabalho',
    'process': 'processo',
    'operation': 'operação',
    'function': 'função',
    'feature': 'recurso',
    'capability': 'capacidade',
    'solution': 'solução',
    'product': 'produto',
    'library': 'biblioteca',
    'package': 'pacote',
    'module': 'módulo',
    'component': 'componente',
    'extension': 'extensão',
    'plugin': 'plugin',
    'addon': 'complemento',
    'update': 'atualização',
    'upgrade': 'atualização',
    'version': 'versão',
    'release': 'lançamento',
    'installation': 'instalação',
    'setup': 'configuração',
    'configuration': 'configuração',
    'customization': 'personalização',
    'personalization': 'personalização',
    'backup': 'backup',
    'restore': 'restauração',
    'sync': 'sincronização',
    'synchronization': 'sincronização',
    'real-time': 'tempo real',
    'live': 'ao vivo',
    'streaming': 'streaming',
    'download': 'download',
    'upload': 'upload',
    'transfer': 'transferência',
    'sharing': 'compartilhamento',
    'export': 'exportação',
    'import': 'importação',
    'backup': 'backup',
    'migration': 'migração',
    'transformation': 'transformação',
    'conversion': 'conversão',
    'translation': 'tradução',
    'localization': 'localização',
    'internationalization': 'internacionalização',
    'multilingual': 'multilíngue',
    'global': 'global',
    'local': 'local',
    'remote': 'remoto',
    'distributed': 'distribuído',
    'scalable': 'escalável',
    'flexible': 'flexível',
    'portable': 'portátil',
    'compatible': 'compatível',
    'reliable': 'confiável',
    'stable': 'estável',
    'robust': 'robusto',
    'efficient': 'eficiente',
    'fast': 'rápido',
    'quick': 'rápido',
    'instant': 'instantâneo',
    'immediate': 'imediato',
    'easy': 'fácil',
    'simple': 'simples',
    'complex': 'complexo',
    'advanced': 'avançado',
    'basic': 'básico',
    'professional': 'profissional',
    'enterprise': 'empresarial',
    'commercial': 'comercial',
    'free': 'gratuito',
    'open source': 'código aberto',
    'proprietary': 'proprietário',
    'license': 'licença',
    'copyright': 'direitos autorais',
    'patent': 'patente',
    'trademark': 'marca registrada',
    'legal': 'legal',
    'compliance': 'conformidade',
    'regulation': 'regulamentação',
    'standard': 'padrão',
    'specification': 'especificação',
    'protocol': 'protocolo',
    'format': 'formato',
    'type': 'tipo',
    'category': 'categoria',
    'class': 'classe',
    'group': 'grupo',
    'collection': 'coleção',
    'list': 'lista',
    'array': 'array',
    'object': 'objeto',
    'item': 'item',
    'element': 'elemento',
    'node': 'nó',
    'tree': 'árvore',
    'graph': 'gráfico',
    'chart': 'gráfico',
    'table': 'tabela',
    'database': 'banco de dados',
    'query': 'consulta',
    'search': 'busca',
    'filter': 'filtro',
    'sort': 'classificação',
    'order': 'ordem',
    'ranking': 'classificação',
    'rating': 'avaliação',
    'review': 'revisão',
    'feedback': 'feedback',
    'comment': 'comentário',
    'note': 'nota',
    'message': 'mensagem',
    'notification': 'notificação',
    'alert': 'alerta',
    'warning': 'aviso',
    'error': 'erro',
    'bug': 'bug',
    'issue': 'problema',
    'problem': 'problema',
    'solution': 'solução',
    'fix': 'correção',
    'patch': 'correção',
    'repair': 'reparo',
    'maintenance': 'manutenção',
    'support': 'suporte',
    'help': 'ajuda',
    'assistance': 'assistência',
    'guidance': 'orientação',
    'tutorial': 'tutorial',
    'guide': 'guia',
    'manual': 'manual',
    'documentation': 'documentação',
    'instruction': 'instrução',
    'example': 'exemplo',
    'sample': 'amostra',
    'demo': 'demonstração',
    'preview': 'visualização',
    'test': 'teste',
    'trial': 'teste',
    'beta': 'beta',
    'alpha': 'alfa',
    'stable': 'estável',
    'development': 'desenvolvimento',
    'production': 'produção',
    'staging': 'preparação',
    'deployment': 'implantação',
    'release': 'lançamento',
    'launch': 'lançamento',
    'start': 'início',
    'stop': 'parada',
    'pause': 'pausa',
    'resume': 'retomar',
    'continue': 'continuar',
    'finish': 'finalizar',
    'complete': 'completar',
    'end': 'fim',
    'close': 'fechar',
    'open': 'abrir',
    'save': 'salvar',
    'load': 'carregar',
    'create': 'criar',
    'build': 'construir',
    'make': 'fazer',
    'generate': 'gerar',
    'produce': 'produzir',
    'design': 'design',
    'develop': 'desenvolver',
    'implement': 'implementar',
    'execute': 'executar',
    'run': 'executar',
    'operate': 'operar',
    'manage': 'gerenciar',
    'organize': 'organizar',
    'structure': 'estrutura',
    'arrange': 'organizar',
    'plan': 'planejar',
    'schedule': 'agendar',
    'calendar': 'calendário',
    'time': 'tempo',
    'date': 'data',
    'year': 'ano',
    'month': 'mês',
    'week': 'semana',
    'day': 'dia',
    'hour': 'hora',
    'minute': 'minuto',
    'second': 'segundo',
    'moment': 'momento',
    'period': 'período',
    'duration': 'duração',
    'interval': 'intervalo',
    'frequency': 'frequência',
    'rate': 'taxa',
    'speed': 'velocidade',
    'performance': 'desempenho',
    'efficiency': 'eficiência',
    'productivity': 'produtividade',
    'quality': 'qualidade',
    'quantity': 'quantidade',
    'amount': 'quantidade',
    'number': 'número',
    'count': 'contagem',
    'total': 'total',
    'sum': 'soma',
    'average': 'média',
    'minimum': 'mínimo',
    'maximum': 'máximo',
    'value': 'valor',
    'price': 'preço',
    'cost': 'custo',
    'budget': 'orçamento',
    'investment': 'investimento',
    'return': 'retorno',
    'profit': 'lucro',
    'revenue': 'receita',
    'income': 'renda',
    'expense': 'despesa',
    'payment': 'pagamento',
    'transaction': 'transação',
    'purchase': 'compra',
    'sale': 'venda',
    'order': 'pedido',
    'delivery': 'entrega',
    'shipping': 'envio',
    'logistics': 'logística',
    'supply': 'fornecimento',
    'demand': 'demanda',
    'market': 'mercado',
    'customer': 'cliente',
    'client': 'cliente',
    'consumer': 'consumidor',
    'buyer': 'comprador',
    'seller': 'vendedor',
    'vendor': 'fornecedor',
    'supplier': 'fornecedor',
    'partner': 'parceiro',
    'competitor': 'concorrente',
    'industry': 'indústria',
    'sector': 'setor',
    'field': 'campo',
    'area': 'área',
    'domain': 'domínio',
    'scope': 'escopo',
    'range': 'faixa',
    'limit': 'limite',
    'boundary': 'limite',
    'border': 'borda',
    'edge': 'borda',
    'corner': 'canto',
    'center': 'centro',
    'middle': 'meio',
    'top': 'topo',
    'bottom': 'fundo',
    'left': 'esquerda',
    'right': 'direita',
    'front': 'frente',
    'back': 'atrás',
    'side': 'lado',
    'inside': 'dentro',
    'outside': 'fora',
    'above': 'acima',
    'below': 'abaixo',
    'over': 'sobre',
    'under': 'sob',
    'next': 'próximo',
    'previous': 'anterior',
    'first': 'primeiro',
    'last': 'último',
    'new': 'novo',
    'old': 'antigo',
    'recent': 'recente',
    'latest': 'mais recente',
    'current': 'atual',
    'past': 'passado',
    'future': 'futuro',
    'present': 'presente',
    'today': 'hoje',
    'yesterday': 'ontem',
    'tomorrow': 'amanhã',
    'now': 'agora',
    'then': 'então',
    'when': 'quando',
    'where': 'onde',
    'what': 'o que',
    'who': 'quem',
    'why': 'por que',
    'how': 'como',
    'which': 'qual',
    'this': 'este',
    'that': 'aquele',
    'these': 'estes',
    'those': 'aqueles',
    'all': 'todos',
    'some': 'alguns',
    'many': 'muitos',
    'few': 'poucos',
    'several': 'vários',
    'multiple': 'múltiplos',
    'single': 'único',
    'individual': 'individual',
    'personal': 'pessoal',
    'private': 'privado',
    'public': 'público',
    'shared': 'compartilhado',
    'common': 'comum',
    'general': 'geral',
    'specific': 'específico',
    'particular': 'particular',
    'special': 'especial',
    'unique': 'único',
    'different': 'diferente',
    'similar': 'similar',
    'same': 'mesmo',
    'equal': 'igual',
    'identical': 'idêntico',
    'equivalent': 'equivalente',
    'comparable': 'comparável',
    'related': 'relacionado',
    'connected': 'conectado',
    'linked': 'vinculado',
    'associated': 'associado',
    'attached': 'anexado',
    'included': 'incluído',
    'excluded': 'excluído',
    'added': 'adicionado',
    'removed': 'removido',
    'deleted': 'deletado',
    'updated': 'atualizado',
    'modified': 'modificado',
    'changed': 'alterado',
    'improved': 'melhorado',
    'enhanced': 'aprimorado',
    'optimized': 'otimizado',
    'upgraded': 'atualizado',
    'downgraded': 'rebaixado',
    'increased': 'aumentado',
    'decreased': 'diminuído',
    'reduced': 'reduzido',
    'expanded': 'expandido',
    'extended': 'estendido',
    'shortened': 'encurtado',
    'compressed': 'comprimido',
    'decompressed': 'descomprimido',
    'encrypted': 'criptografado',
    'decrypted': 'descriptografado',
    'encoded': 'codificado',
    'decoded': 'decodificado',
    'converted': 'convertido',
    'transformed': 'transformado',
    'translated': 'traduzido',
    'interpreted': 'interpretado',
    'compiled': 'compilado',
    'executed': 'executado',
    'processed': 'processado',
    'analyzed': 'analisado',
    'evaluated': 'avaliado',
    'tested': 'testado',
    'verified': 'verificado',
    'validated': 'validado',
    'confirmed': 'confirmado',
    'approved': 'aprovado',
    'rejected': 'rejeitado',
    'accepted': 'aceito',
    'denied': 'negado',
    'allowed': 'permitido',
    'forbidden': 'proibido',
    'blocked': 'bloqueado',
    'unblocked': 'desbloqueado',
    'enabled': 'habilitado',
    'disabled': 'desabilitado',
    'activated': 'ativado',
    'deactivated': 'desativado',
    'online': 'online',
    'offline': 'offline',
    'connected': 'conectado',
    'disconnected': 'desconectado',
    'available': 'disponível',
    'unavailable': 'indisponível',
    'accessible': 'acessível',
    'inaccessible': 'inacessível',
    'visible': 'visível',
    'invisible': 'invisível',
    'hidden': 'oculto',
    'shown': 'mostrado',
    'displayed': 'exibido',
    'rendered': 'renderizado',
    'generated': 'gerado',
    'created': 'criado',
    'built': 'construído',
    'made': 'feito',
    'produced': 'produzido',
    'designed': 'projetado',
    'developed': 'desenvolvido',
    'implemented': 'implementado',
    'deployed': 'implantado',
    'installed': 'instalado',
    'uninstalled': 'desinstalado',
    'configured': 'configurado',
    'customized': 'personalizado',
    'personalized': 'personalizado',
    'tailored': 'adaptado',
    'adapted': 'adaptado',
    'adjusted': 'ajustado',
    'fine-tuned': 'ajustado finamente',
    'calibrated': 'calibrado',
    'balanced': 'equilibrado',
    'stable': 'estável',
    'unstable': 'instável',
    'consistent': 'consistente',
    'inconsistent': 'inconsistente',
    'reliable': 'confiável',
    'unreliable': 'não confiável',
    'secure': 'seguro',
    'insecure': 'inseguro',
    'safe': 'seguro',
    'unsafe': 'inseguro',
    'protected': 'protegido',
    'unprotected': 'desprotegido',
    'encrypted': 'criptografado',
    'unencrypted': 'não criptografado',
    'authenticated': 'autenticado',
    'unauthenticated': 'não autenticado',
    'authorized': 'autorizado',
    'unauthorized': 'não autorizado',
    'licensed': 'licenciado',
    'unlicensed': 'não licenciado',
    'registered': 'registrado',
    'unregistered': 'não registrado',
    'verified': 'verificado',
    'unverified': 'não verificado',
    'validated': 'validado',
    'invalidated': 'invalidado',
    'confirmed': 'confirmado',
    'unconfirmed': 'não confirmado',
    'approved': 'aprovado',
    'unapproved': 'não aprovado',
    'certified': 'certificado',
    'uncertified': 'não certificado',
    'qualified': 'qualificado',
    'unqualified': 'não qualificado',
    'eligible': 'elegível',
    'ineligible': 'não elegível',
    'compatible': 'compatível',
    'incompatible': 'incompatível',
    'supported': 'suportado',
    'unsupported': 'não suportado',
    'maintained': 'mantido',
    'unmaintained': 'não mantido',
    'updated': 'atualizado',
    'outdated': 'desatualizado',
    'current': 'atual',
    'deprecated': 'obsoleto',
    'legacy': 'legado',
    'modern': 'moderno',
    'contemporary': 'contemporâneo',
    'traditional': 'tradicional',
    'conventional': 'convencional',
    'standard': 'padrão',
    'custom': 'personalizado',
    'default': 'padrão',
    'optional': 'opcional',
    'required': 'obrigatório',
    'mandatory': 'obrigatório',
    'necessary': 'necessário',
    'essential': 'essencial',
    'important': 'importante',
    'critical': 'crítico',
    'vital': 'vital',
    'crucial': 'crucial',
    'significant': 'significativo',
    'relevant': 'relevante',
    'useful': 'útil',
    'helpful': 'útil',
    'beneficial': 'benéfico',
    'valuable': 'valioso',
    'worthwhile': 'válido',
    'meaningful': 'significativo',
    'purposeful': 'proposital',
    'intentional': 'intencional',
    'deliberate': 'deliberado',
    'planned': 'planejado',
    'scheduled': 'agendado',
    'organized': 'organizado',
    'structured': 'estruturado',
    'systematic': 'sistemático',
    'methodical': 'metódico',
    'logical': 'lógico',
    'rational': 'racional',
    'reasonable': 'razoável',
    'sensible': 'sensato',
    'practical': 'prático',
    'realistic': 'realista',
    'feasible': 'viável',
    'possible': 'possível',
    'impossible': 'impossível',
    'likely': 'provável',
    'unlikely': 'improvável',
    'probable': 'provável',
    'improbable': 'improvável',
    'certain': 'certo',
    'uncertain': 'incerto',
    'definite': 'definitivo',
    'indefinite': 'indefinido',
    'clear': 'claro',
    'unclear': 'não claro',
    'obvious': 'óbvio',
    'obscure': 'obscuro',
    'transparent': 'transparente',
    'opaque': 'opaco',
    'visible': 'visível',
    'invisible': 'invisível',
    'apparent': 'aparente',
    'hidden': 'oculto',
    'exposed': 'exposto',
    'concealed': 'oculto',
    'revealed': 'revelado',
    'disclosed': 'divulgado',
    'published': 'publicado',
    'unpublished': 'não publicado',
    'released': 'lançado',
    'unreleased': 'não lançado',
    'available': 'disponível',
    'unavailable': 'indisponível',
    'accessible': 'acessível',
    'inaccessible': 'inacessível',
    'reachable': 'alcançável',
    'unreachable': 'inalcançável',
    'obtainable': 'obtenível',
    'unobtainable': 'inobtível',
    'achievable': 'alcançável',
    'unachievable': 'inalcançável',
    'attainable': 'atingível',
    'unattainable': 'inatingível',
    'manageable': 'gerenciável',
    'unmanageable': 'ingerenciável',
    'controllable': 'controlável',
    'uncontrollable': 'incontrolável',
    'predictable': 'previsível',
    'unpredictable': 'imprevisível',
    'expected': 'esperado',
    'unexpected': 'inesperado',
    'anticipated': 'antecipado',
    'unanticipated': 'não antecipado',
    'planned': 'planejado',
    'unplanned': 'não planejado',
    'intended': 'pretendido',
    'unintended': 'não pretendido',
    'desired': 'desejado',
    'undesired': 'indesejado',
    'wanted': 'desejado',
    'unwanted': 'indesejado',
    'needed': 'necessário',
    'unneeded': 'desnecessário',
    'required': 'obrigatório',
    'unrequired': 'não obrigatório',
    'requested': 'solicitado',
    'unrequested': 'não solicitado',
    'demanded': 'exigido',
    'supplied': 'fornecido',
    'provided': 'fornecido',
    'given': 'dado',
    'taken': 'tomado',
    'received': 'recebido',
    'sent': 'enviado',
    'delivered': 'entregue',
    'shipped': 'enviado',
    'transported': 'transportado',
    'transferred': 'transferido',
    'moved': 'movido',
    'relocated': 'realocado',
    'migrated': 'migrado',
    'imported': 'importado',
    'exported': 'exportado',
    'uploaded': 'carregado',
    'downloaded': 'baixado',
    'synchronized': 'sincronizado',
    'backed up': 'copiado',
    'restored': 'restaurado',
    'recovered': 'recuperado',
    'repaired': 'reparado',
    'fixed': 'corrigido',
    'solved': 'resolvido',
    'resolved': 'resolvido',
    'addressed': 'abordado',
    'handled': 'tratado',
    'managed': 'gerenciado',
    'controlled': 'controlado',
    'monitored': 'monitorado',
    'tracked': 'rastreado',
    'traced': 'rastreado',
    'logged': 'registrado',
    'recorded': 'gravado',
    'documented': 'documentado',
    'reported': 'relatado',
    'notified': 'notificado',
    'informed': 'informado',
    'updated': 'atualizado',
    'refreshed': 'atualizado',
    'renewed': 'renovado',
    'revived': 'revivido',
    'restarted': 'reiniciado',
    'rebooted': 'reiniciado',
    'reset': 'reiniciado',
    'cleared': 'limpo',
    'cleaned': 'limpo',
    'purged': 'limpo',
    'deleted': 'deletado',
    'removed': 'removido',
    'eliminated': 'eliminado',
    'destroyed': 'destruído',
    'terminated': 'terminado',
    'ended': 'finalizado',
    'stopped': 'parado',
    'halted': 'interrompido',
    'paused': 'pausado',
    'suspended': 'suspenso',
    'resumed': 'retomado',
    'continued': 'continuado',
    'proceeded': 'prosseguido',
    'advanced': 'avançado',
    'progressed': 'progredido',
    'developed': 'desenvolvido',
    'evolved': 'evoluído',
    'improved': 'melhorado',
    'enhanced': 'aprimorado',
    'optimized': 'otimizado',
    'refined': 'refinado',
    'polished': 'polido',
    'perfected': 'aperfeiçoado',
    'completed': 'completado',
    'finished': 'finalizado',
    'accomplished': 'realizado',
    'achieved': 'alcançado',
    'reached': 'alcançado',
    'attained': 'atingido',
    'obtained': 'obtido',
    'acquired': 'adquirido',
    'gained': 'ganho',
    'earned': 'ganho',
    'won': 'ganho',
    'lost': 'perdido',
    'missed': 'perdido',
    'failed': 'falhou',
    'succeeded': 'teve sucesso',
    'passed': 'passou',
    'completed': 'completou',
    'graduated': 'graduou',
    'qualified': 'qualificou',
    'certified': 'certificou',
    'licensed': 'licenciou',
    'registered': 'registrou',
    'enrolled': 'inscreveu',
    'subscribed': 'inscreveu',
    'joined': 'juntou',
    'participated': 'participou',
    'contributed': 'contribuiu',
    'collaborated': 'colaborou',
    'cooperated': 'cooperou',
    'partnered': 'fez parceria',
    'associated': 'associou',
    'affiliated': 'afiliou',
    'connected': 'conectou',
    'linked': 'vinculou',
    'related': 'relacionou',
    'compared': 'comparou',
    'contrasted': 'contrastou',
    'differentiated': 'diferenciou',
    'distinguished': 'distinguiu',
    'identified': 'identificou',
    'recognized': 'reconheceu',
    'discovered': 'descobriu',
    'found': 'encontrou',
    'located': 'localizou',
    'positioned': 'posicionou',
    'placed': 'colocou',
    'installed': 'instalou',
    'mounted': 'montou',
    'attached': 'anexou',
    'connected': 'conectou',
    'linked': 'vinculou',
    'joined': 'juntou',
    'combined': 'combinou',
    'merged': 'mesclou',
    'integrated': 'integrou',
    'incorporated': 'incorporou',
    'included': 'incluiu',
    'added': 'adicionou',
    'inserted': 'inseriu',
    'embedded': 'incorporou',
    'implanted': 'implantou',
    'injected': 'injetou',
    'introduced': 'introduziu',
    'launched': 'lançou',
    'started': 'iniciou',
    'began': 'começou',
    'initiated': 'iniciou',
    'commenced': 'começou',
    'opened': 'abriu',
    'activated': 'ativou',
    'enabled': 'habilitou',
    'turned on': 'ligou',
    'powered on': 'ligou',
    'switched on': 'ligou',
    'turned off': 'desligou',
    'powered off': 'desligou',
    'switched off': 'desligou',
    'disabled': 'desabilitou',
    'deactivated': 'desativou',
    'closed': 'fechou',
    'shut down': 'desligou',
    'terminated': 'terminou',
    'ended': 'terminou',
    'completed': 'completou',
    'finished': 'terminou'
  };

  // Apply word-by-word replacements
  for (const [english, portuguese] of Object.entries(englishToPortuguese)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    if (regex.test(fixedText)) {
      fixedText = fixedText.replace(regex, portuguese);
      issues.push(`${english} → ${portuguese}`);
    }
  }

  // 3. Fix specific patterns common in our database
  
  // Fix "Servidor MCP para X" consistency
  fixedText = fixedText.replace(/Servidor MCP para/g, 'Servidor MCP para');
  
  // Fix "Agent" patterns
  fixedText = fixedText.replace(/\bAgent\b/g, 'Agente');
  fixedText = fixedText.replace(/\bagent\b/g, 'agente');
  
  // Fix "MCP server" patterns
  fixedText = fixedText.replace(/MCP server/g, 'servidor MCP');
  fixedText = fixedText.replace(/mcp server/g, 'servidor MCP');
  
  // Fix "AI agent" patterns
  fixedText = fixedText.replace(/AI agent/g, 'agente de IA');
  fixedText = fixedText.replace(/ai agent/g, 'agente de IA');
  
  // Fix "multi-agent" patterns  
  fixedText = fixedText.replace(/multi-agent/g, 'multi-agente');
  fixedText = fixedText.replace(/Multi-agent/g, 'Multi-agente');
  
  // Fix "framework" consistency
  fixedText = fixedText.replace(/\bFramework\b/g, 'Framework');
  
  // Fix "for" in Portuguese context
  fixedText = fixedText.replace(/ for /g, ' para ');
  fixedText = fixedText.replace(/^for /g, 'para ');
  
  // Fix "and" in Portuguese context
  fixedText = fixedText.replace(/ and /g, ' e ');
  
  // Fix "with" in Portuguese context
  fixedText = fixedText.replace(/ with /g, ' com ');
  
  // Fix "the" in Portuguese context
  fixedText = fixedText.replace(/ the /g, ' o ');
  
  // Fix "using" patterns
  fixedText = fixedText.replace(/using /g, 'usando ');
  fixedText = fixedText.replace(/ using /g, ' usando ');
  
  // 4. Capitalize first letter
  fixedText = fixedText.charAt(0).toUpperCase() + fixedText.slice(1);

  // 5. Clean up extra spaces and punctuation
  fixedText = fixedText.replace(/\s+/g, ' ').trim();
  
  if (fixedText !== description_pt) {
    return {
      needsFix: true,
      reason: `Portuguese consistency issues: ${issues.join(', ')}`,
      severity: 'medium',
      originalText: description_pt,
      fixedText: fixedText,
      issues: issues
    };
  }

  return {
    needsFix: false,
    reason: 'Portuguese description is good',
    severity: 'none',
    originalText: description_pt,
    fixedText: description_pt
  };
}

function generatePortugueseDescription(name, description_en, product_type) {
  if (!description_en) {
    if (product_type === 'ai_agent') {
      return `Agente de IA ${name} para automação inteligente e assistência em tarefas específicas`;
    } else if (product_type === 'mcp_server') {
      return `Servidor MCP ${name} para integração com Claude e sistemas de IA`;
    } else {
      return `Produto ${name} para soluções tecnológicas avançadas`;
    }
  }
  
  // Basic translation of English description
  let translated = description_en.toLowerCase();
  
  const basicTranslations = {
    'ai agent': 'agente de IA',
    'mcp server': 'servidor MCP',
    'framework': 'framework',
    'platform': 'plataforma',
    'tool': 'ferramenta',
    'system': 'sistema',
    'application': 'aplicação',
    'service': 'serviço',
    'integration': 'integração',
    'automation': 'automação',
    'assistant': 'assistente',
    'for': 'para',
    'and': 'e',
    'with': 'com',
    'using': 'usando',
    'the': 'o',
    'a': 'um',
    'an': 'um'
  };
  
  for (const [english, portuguese] of Object.entries(basicTranslations)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translated = translated.replace(regex, portuguese);
  }
  
  // Capitalize first letter
  translated = translated.charAt(0).toUpperCase() + translated.slice(1);
  
  return translated;
}

async function fixPortugueseConsistency() {
  console.log('🇧🇷 Portuguese Description Consistency Fixer');
  console.log('🔍 Fetching all products from database...\n');

  try {
    // Fetch all products
    const result = await pool.query('SELECT id, name, description_pt, description_en, product_type FROM products ORDER BY id');
    const products = result.rows;
    
    console.log(`📋 Found ${products.length} products in database`);
    console.log('🔍 Analyzing Portuguese descriptions for consistency...\n');

    const analysisResults = products.map(product => ({
      ...product,
      analysis: analyzeAndFixPortugueseDescription(product)
    }));

    // Group results by fix status
    const needsFix = analysisResults.filter(p => p.analysis.needsFix);
    const goodQuality = analysisResults.filter(p => !p.analysis.needsFix);

    console.log('📊 Analysis Results:');
    console.log(`  - Good quality: ${goodQuality.length}`);
    console.log(`  - Needs fixing: ${needsFix.length}`);
    console.log(`  - Total analyzed: ${products.length}\n`);

    if (needsFix.length === 0) {
      console.log('🎉 All Portuguese descriptions are already consistent!');
      return;
    }

    console.log('🔧 Products needing consistency fixes:\n');

    needsFix.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name || 'Unknown'} (ID: ${product.id})`);
      console.log(`   Current PT: "${product.analysis.originalText}"`);
      console.log(`   Issue: ${product.analysis.reason} (${product.analysis.severity})`);
      if (product.analysis.issues) {
        console.log(`   Changes: ${product.analysis.issues.join(', ')}`);
      }
      console.log(`   Fixed PT: "${product.analysis.fixedText}"\n`);
    });

    console.log('🛠️  Fixing Portuguese descriptions...\n');

    let fixedCount = 0;
    let failedCount = 0;

    for (const [index, product] of needsFix.entries()) {
      try {
        const updateQuery = 'UPDATE products SET description_pt = $1 WHERE id = $2';
        await pool.query(updateQuery, [product.analysis.fixedText, product.id]);
        
        console.log(`[${index + 1}/${needsFix.length}] ✅ Fixed: ${product.name || 'Unknown'}`);
        fixedCount++;

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        console.log(`[${index + 1}/${needsFix.length}] ❌ Error fixing ${product.name || 'Unknown'}: ${error.message}`);
        failedCount++;
      }
    }

    console.log('\n🎉 Portuguese consistency fixing completed!');
    console.log(`📊 Final Summary:`);
    console.log(`  - Products analyzed: ${products.length}`);
    console.log(`  - Already good quality: ${goodQuality.length}`);
    console.log(`  - Needed fixing: ${needsFix.length}`);
    console.log(`  - Successfully fixed: ${fixedCount}`);
    console.log(`  - Failed to fix: ${failedCount}`);
    console.log(`  - Success rate: ${((fixedCount / needsFix.length) * 100).toFixed(1)}%`);
    
    console.log('\n✅ Portuguese descriptions have been improved for consistency!');
    console.log('🔍 Key improvements:');
    console.log('  - AI → IA in Portuguese context');
    console.log('  - English words → Portuguese equivalents');
    console.log('  - Consistent technical terminology');
    console.log('  - Proper Portuguese grammar patterns');

  } catch (error) {
    console.error('❌ Error during Portuguese consistency fixing:', error);
  } finally {
    await pool.end();
  }
}

// Run the consistency fixer
fixPortugueseConsistency();
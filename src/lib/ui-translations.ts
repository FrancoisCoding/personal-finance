import { defaultUserLocale } from '@/lib/user-preferences'

export const supportedUiLocales = [
  'en-US',
  'pt-BR',
  'es-ES',
  'fr-FR',
  'hi-IN',
] as const

export type TUiLocale = (typeof supportedUiLocales)[number]

type TTranslationRow = [string, string, string, string, string]

const translationRows: TTranslationRow[] = [
  ['Overview', 'Visao geral', 'Resumen', 'Vue d ensemble', 'Avalokan'],
  ['Accounts', 'Contas', 'Cuentas', 'Comptes', 'Khate'],
  ['Transactions', 'Transacoes', 'Transacciones', 'Transactions', 'Len-den'],
  [
    'Subscriptions',
    'Assinaturas',
    'Suscripciones',
    'Abonnements',
    'Subscriptions',
  ],
  ['Budgets', 'Orcamentos', 'Presupuestos', 'Budgets', 'Budget'],
  ['Billing', 'Cobranca', 'Facturacion', 'Facturation', 'Billing'],
  [
    'Security & Privacy',
    'Seguranca e privacidade',
    'Seguridad y privacidad',
    'Securite et confidentialite',
    'Suraksha aur gopniyata',
  ],
  [
    'Financial Assistant',
    'Assistente financeiro',
    'Asistente financiero',
    'Assistant financier',
    'Financial Assistant',
  ],
  ['Profile', 'Perfil', 'Perfil', 'Profil', 'Profile'],
  [
    'Contact support',
    'Contatar suporte',
    'Contactar soporte',
    'Contacter le support',
    'Support se sampark',
  ],
  ['Sign out', 'Sair', 'Cerrar sesion', 'Se deconnecter', 'Sign out'],
  [
    'Exit demo',
    'Sair da demonstracao',
    'Salir de la demostracion',
    'Quitter la demo',
    'Demo se bahar niklen',
  ],
  [
    'Welcome back',
    'Bem-vindo de volta',
    'Bienvenido de nuevo',
    'Bon retour',
    'Dobara swagat hai',
  ],
  [
    'Your financial overview is ready.',
    'Sua visao financeira esta pronta.',
    'Tu resumen financiero esta listo.',
    'Votre apercu financier est pret.',
    'Aapka financial overview taiyar hai.',
  ],
  [
    'Search transactions',
    'Buscar transacoes',
    'Buscar transacciones',
    'Rechercher des transactions',
    'Transactions khojen',
  ],
  [
    'Add Transaction',
    'Adicionar transacao',
    'Agregar transaccion',
    'Ajouter une transaction',
    'Transaction joden',
  ],
  [
    'Connect Bank Account',
    'Conectar conta bancaria',
    'Conectar cuenta bancaria',
    'Connecter un compte bancaire',
    'Bank account joden',
  ],
  [
    'Start walkthrough',
    'Iniciar guia',
    'Iniciar recorrido',
    'Demarrer la visite',
    'Walkthrough shuru karen',
  ],
  [
    'Reset tour',
    'Redefinir tour',
    'Restablecer recorrido',
    'Reinitialiser la visite',
    'Tour reset karen',
  ],
  ['New thread', 'Nova conversa', 'Nuevo hilo', 'Nouveau fil', 'Naya thread'],
  [
    'Refresh detection',
    'Atualizar deteccao',
    'Actualizar deteccion',
    'Actualiser la detection',
    'Detection refresh karen',
  ],
  ['Open', 'Abrir', 'Abrir', 'Ouvrir', 'Kholen'],
  ['Delete', 'Excluir', 'Eliminar', 'Supprimer', 'Delete'],
  ['Save', 'Salvar', 'Guardar', 'Enregistrer', 'Save'],
  ['Cancel', 'Cancelar', 'Cancelar', 'Annuler', 'Cancel'],
  ['Close', 'Fechar', 'Cerrar', 'Fermer', 'Band karen'],
  ['Refresh', 'Atualizar', 'Actualizar', 'Actualiser', 'Refresh'],
  [
    'Export CSV',
    'Exportar CSV',
    'Exportar CSV',
    'Exporter CSV',
    'CSV export karen',
  ],
  ['Prev', 'Anterior', 'Anterior', 'Precedent', 'Pichhla'],
  ['Next', 'Proximo', 'Siguiente', 'Suivant', 'Agla'],
  ['Loading...', 'Carregando...', 'Cargando...', 'Chargement...', 'Loading...'],
  [
    'No subscriptions found.',
    'Nenhuma assinatura encontrada.',
    'No se encontraron suscripciones.',
    'Aucun abonnement trouve.',
    'Koi subscription nahin mili.',
  ],
  [
    'No support messages yet.',
    'Nenhuma mensagem de suporte ainda.',
    'Aun no hay mensajes de soporte.',
    'Aucun message de support pour le moment.',
    'Abhi koi support message nahin hai.',
  ],
  ['Sign in', 'Entrar', 'Iniciar sesion', 'Se connecter', 'Sign in'],
  ['Sign up', 'Criar conta', 'Registrarse', 'S inscrire', 'Sign up'],
  [
    'Continue with Google',
    'Continuar com Google',
    'Continuar con Google',
    'Continuer avec Google',
    'Google ke saath jari rakhen',
  ],
  [
    'Or continue with',
    'Ou continue com',
    'O continua con',
    'Ou continuer avec',
    'Ya phir jari rakhen',
  ],
  [
    'Email address',
    'Email',
    'Correo electronico',
    'Adresse e-mail',
    'Email address',
  ],
  ['Password', 'Senha', 'Contrasena', 'Mot de passe', 'Password'],
  [
    'Confirm password',
    'Confirmar senha',
    'Confirmar contrasena',
    'Confirmer le mot de passe',
    'Password confirm karen',
  ],
  [
    'Create account',
    'Criar conta',
    'Crear cuenta',
    'Creer un compte',
    'Account banayen',
  ],
  [
    'Creating account...',
    'Criando conta...',
    'Creando cuenta...',
    'Creation du compte...',
    'Account ban raha hai...',
  ],
  [
    'Signing in...',
    'Entrando...',
    'Iniciando sesion...',
    'Connexion...',
    'Sign in ho raha hai...',
  ],
  [
    'Welcome back',
    'Bem-vindo de volta',
    'Bienvenido de nuevo',
    'Bon retour',
    'Dobara swagat hai',
  ],
  [
    'Create your account',
    'Crie sua conta',
    'Crea tu cuenta',
    'Creez votre compte',
    'Apna account banayen',
  ],
  [
    'Try the live demo',
    'Experimentar demonstracao',
    'Probar demo en vivo',
    'Essayer la demo en direct',
    'Live demo azmayein',
  ],
  [
    'Explore with sample data',
    'Explorar com dados de exemplo',
    'Explorar con datos de ejemplo',
    'Explorer avec des donnees d exemple',
    'Sample data ke saath explore karen',
  ],
  [
    'No signup',
    'Sem cadastro',
    'Sin registro',
    'Sans inscription',
    'Signup ki zarurat nahin',
  ],
  [
    'Invalid email or password',
    'Email ou senha invalidos',
    'Correo o contrasena invalidos',
    'E-mail ou mot de passe invalide',
    'Email ya password galat hai',
  ],
  [
    'Something went wrong. Please try again.',
    'Algo deu errado. Tente novamente.',
    'Algo salio mal. Intentalo de nuevo.',
    'Un probleme est survenu. Veuillez reessayer.',
    'Kuch galat ho gaya. Dobara koshish karen.',
  ],
  [
    'Passwords do not match',
    'As senhas nao coincidem',
    'Las contrasenas no coinciden',
    'Les mots de passe ne correspondent pas',
    'Passwords match nahin karte',
  ],
  ['Error', 'Erro', 'Error', 'Erreur', 'Error'],
  ['Success', 'Sucesso', 'Exito', 'Succes', 'Success'],
  [
    'Message sent',
    'Mensagem enviada',
    'Mensaje enviado',
    'Message envoye',
    'Message bheja gaya',
  ],
  [
    'Message failed',
    'Falha ao enviar',
    'No se pudo enviar',
    'Echec de l envoi',
    'Message bhejne mein dikkat',
  ],
  ['Sending', 'Enviando', 'Enviando', 'Envoi en cours', 'Bheja ja raha hai'],
  [
    'Send message',
    'Enviar mensagem',
    'Enviar mensaje',
    'Envoyer le message',
    'Message bhejen',
  ],
  ['Name', 'Nome', 'Nombre', 'Nom', 'Naam'],
  ['Subject', 'Assunto', 'Asunto', 'Objet', 'Vishay'],
  ['Message', 'Mensagem', 'Mensaje', 'Message', 'Message'],
  [
    'Contact support',
    'Contatar suporte',
    'Contactar soporte',
    'Contacter le support',
    'Support se sampark',
  ],
  ['Support', 'Suporte', 'Soporte', 'Support', 'Support'],
  [
    'Support that keeps you moving.',
    'Suporte que mantem voce em movimento.',
    'Soporte que te mantiene avanzando.',
    'Un support qui vous fait avancer.',
    'Support jo aapko aage badhata hai.',
  ],
  [
    'Frequently asked questions',
    'Perguntas frequentes',
    'Preguntas frecuentes',
    'Questions frequentes',
    'Frequently asked questions',
  ],
  [
    'Regional preferences',
    'Preferencias regionais',
    'Preferencias regionales',
    'Preferences regionales',
    'Regional preferences',
  ],
  [
    'Display language',
    'Idioma de exibicao',
    'Idioma de visualizacion',
    'Langue d affichage',
    'Display language',
  ],
  [
    'Display currency',
    'Moeda de exibicao',
    'Moneda de visualizacion',
    'Devise d affichage',
    'Display currency',
  ],
  [
    'Use connected account currency',
    'Usar moeda da conta conectada',
    'Usar moneda de la cuenta conectada',
    'Utiliser la devise du compte connecte',
    'Connected account ki currency use karen',
  ],
  [
    'Preferences updated',
    'Preferencias atualizadas',
    'Preferencias actualizadas',
    'Preferences mises a jour',
    'Preferences update ho gayi',
  ],
  [
    'Update failed',
    'Falha na atualizacao',
    'Error de actualizacion',
    'Echec de la mise a jour',
    'Update fail ho gaya',
  ],
  [
    'Language and currency settings were updated across your workspace.',
    'As configuracoes de idioma e moeda foram atualizadas em todo o workspace.',
    'La configuracion de idioma y moneda se actualizo en todo tu espacio de trabajo.',
    'Les parametres de langue et de devise ont ete mis a jour dans tout votre espace.',
    'Language aur currency settings poore workspace mein update ho gayi.',
  ],
  [
    'Connected accounts',
    'Contas conectadas',
    'Cuentas conectadas',
    'Comptes connectes',
    'Connected accounts',
  ],
  [
    'Transactions tracked',
    'Transacoes monitoradas',
    'Transacciones registradas',
    'Transactions suivies',
    'Tracked transactions',
  ],
  [
    'Account status',
    'Status da conta',
    'Estado de la cuenta',
    'Statut du compte',
    'Account status',
  ],
  ['Active', 'Ativo', 'Activo', 'Actif', 'Active'],
  [
    'Account details',
    'Detalhes da conta',
    'Detalles de la cuenta',
    'Details du compte',
    'Account details',
  ],
  [
    'Locale preview',
    'Pre-visualizacao de localidade',
    'Vista previa de configuracion regional',
    'Apercu de la langue regionale',
    'Locale preview',
  ],
  [
    'Currency formatting preview',
    'Pre-visualizacao de formato de moeda',
    'Vista previa del formato de moneda',
    'Apercu du format de devise',
    'Currency format preview',
  ],
  [
    'By default, currency follows your latest synced Teller account.',
    'Por padrao, a moeda segue sua conta Teller sincronizada mais recente.',
    'De forma predeterminada, la moneda sigue tu cuenta Teller sincronizada mas reciente.',
    'Par defaut, la devise suit votre compte Teller synchronise le plus recent.',
    'Default mein currency latest synced Teller account follow karti hai.',
  ],
  [
    'Skip to main content',
    'Ir para o conteudo principal',
    'Saltar al contenido principal',
    'Aller au contenu principal',
    'Main content par jayen',
  ],
  [
    'Smart finance',
    'Financas inteligentes',
    'Finanzas inteligentes',
    'Finance intelligente',
    'Smart finance',
  ],
  ['Dashboard', 'Painel', 'Panel', 'Tableau de bord', 'Dashboard'],
  [
    "Here's your financial overview for this month",
    'Aqui esta sua visao financeira deste mes',
    'Aqui esta tu resumen financiero de este mes',
    'Voici votre apercu financier de ce mois',
    'Yah aapka is mahine ka financial overview hai',
  ],
  [
    'Ask a question or jump to a page',
    'Faca uma pergunta ou va para uma pagina',
    'Haz una pregunta o ve a una pagina',
    'Posez une question ou allez a une page',
    'Sawal puchhen ya kisi page par jayen',
  ],
  [
    'Total Balance',
    'Saldo total',
    'Saldo total',
    'Solde total',
    'Total balance',
  ],
  [
    'Across all accounts',
    'Em todas as contas',
    'En todas las cuentas',
    'Sur tous les comptes',
    'Sabhi accounts mein',
  ],
  [
    'Monthly Income',
    'Receita mensal',
    'Ingresos mensuales',
    'Revenu mensuel',
    'Monthly income',
  ],
  [
    'Monthly Expenses',
    'Despesas mensais',
    'Gastos mensuales',
    'Depenses mensuelles',
    'Monthly expenses',
  ],
  ['Net Income', 'Renda liquida', 'Ingreso neto', 'Revenu net', 'Net income'],
  ['This month', 'Neste mes', 'Este mes', 'Ce mois-ci', 'Is mahine'],
  [
    'Credit Utilization',
    'Utilizacao de credito',
    'Utilizacion de credito',
    'Utilisation du credit',
    'Credit utilization',
  ],
  [
    'Credit cards',
    'Cartoes de credito',
    'Tarjetas de credito',
    'Cartes de credit',
    'Credit cards',
  ],
  [
    'Savings Rate',
    'Taxa de economia',
    'Tasa de ahorro',
    'Taux d epargne',
    'Savings rate',
  ],
  [
    'Of income saved',
    'Da renda poupada',
    'Del ingreso ahorrado',
    'Du revenu epargne',
    'Income ka bacha hua hissa',
  ],
  [
    'Cash Flow Planning Strip',
    'Faixa de planejamento de fluxo de caixa',
    'Franja de planificacion de flujo de caja',
    'Bande de planification des flux de tresorerie',
    'Cash flow planning strip',
  ],
  [
    'Projected income and outflows over the next 14 and 30 days.',
    'Receitas e saidas projetadas para os proximos 14 e 30 dias.',
    'Ingresos y salidas proyectados para los proximos 14 y 30 dias.',
    'Entrees et sorties projetees sur les 14 et 30 prochains jours.',
    'Agle 14 aur 30 dinon ke projected inflow aur outflow.',
  ],
  [
    'Low-cash threshold:',
    'Limiar de caixa baixo:',
    'Umbral de efectivo bajo:',
    'Seuil de tresorerie basse :',
    'Low-cash threshold:',
  ],
  [
    'Next 14 days',
    'Proximos 14 dias',
    'Proximos 14 dias',
    '14 prochains jours',
    'Agle 14 din',
  ],
  [
    'Next 30 days',
    'Proximos 30 dias',
    'Proximos 30 dias',
    '30 prochains jours',
    'Agle 30 din',
  ],
  [
    'Low-cash days',
    'Dias de caixa baixo',
    'Dias de efectivo bajo',
    'Jours de tresorerie basse',
    'Low-cash days',
  ],
  [
    'Starting cash',
    'Caixa inicial',
    'Efectivo inicial',
    'Tresorerie initiale',
    'Starting cash',
  ],
  [
    'Upcoming expected cash events',
    'Proximos eventos de caixa esperados',
    'Proximos eventos de efectivo esperados',
    'Prochains evenements de tresorerie attendus',
    'Aane wale expected cash events',
  ],
  ['Today', 'Hoje', 'Hoy', 'Aujourd hui', 'Aaj'],
  ['Day 14', 'Dia 14', 'Dia 14', 'Jour 14', 'Din 14'],
  ['Day 30', 'Dia 30', 'Dia 30', 'Jour 30', 'Din 30'],
  [
    'Budget Forecast',
    'Previsao de orcamento',
    'Pronostico de presupuesto',
    'Prevision budgetaire',
    'Budget forecast',
  ],
  [
    'Snapshot only. Open budgets for full analysis.',
    'Apenas resumo. Abra orcamentos para analise completa.',
    'Solo resumen. Abre presupuestos para un analisis completo.',
    'Apercu uniquement. Ouvrez les budgets pour une analyse complete.',
    'Sirf snapshot. Poori analysis ke liye budgets kholen.',
  ],
  ['Over risk', 'Alto risco', 'Riesgo alto', 'Risque eleve', 'High risk'],
  ['Warning', 'Alerta', 'Advertencia', 'Alerte', 'Warning'],
  [
    'Projected overrun',
    'Estouro projetado',
    'Exceso proyectado',
    'Depassement projete',
    'Projected overrun',
  ],
  ['Watch', 'Atencao', 'Vigilar', 'Surveiller', 'Watch'],
  [
    'On track',
    'No caminho certo',
    'En camino',
    'Sur la bonne voie',
    'On track',
  ],
  [
    'Spending Breakdown',
    'Detalhamento de gastos',
    'Desglose de gastos',
    'Repartition des depenses',
    'Spending breakdown',
  ],
  ['Categories', 'Categorias', 'Categorias', 'Categories', 'Categories'],
  ['of total', 'do total', 'del total', 'du total', 'of total'],
  [
    'Spending forecast',
    'Previsao de gastos',
    'Pronostico de gastos',
    'Prevision des depenses',
    'Spending forecast',
  ],
  [
    '7-day avg',
    'media de 7 dias',
    'promedio de 7 dias',
    'moyenne sur 7 jours',
    '7-day avg',
  ],
  [
    'Projected month',
    'mes projetado',
    'mes proyectado',
    'mois projete',
    'Projected month',
  ],
  [
    'Daily range',
    'faixa diaria',
    'rango diario',
    'plage quotidienne',
    'Daily range',
  ],
  [
    'Last 30 days',
    'ultimos 30 dias',
    'ultimos 30 dias',
    '30 derniers jours',
    'Last 30 days',
  ],
  ['Low', 'Minimo', 'Minimo', 'Faible', 'Low'],
  ['Typical', 'Tipico', 'Tipico', 'Typique', 'Typical'],
  ['High', 'Maximo', 'Maximo', 'Eleve', 'High'],
  [
    'Recent Transactions',
    'Transacoes recentes',
    'Transacciones recientes',
    'Transactions recentes',
    'Recent transactions',
  ],
  [
    'Your latest financial activity',
    'Sua atividade financeira mais recente',
    'Tu actividad financiera mas reciente',
    'Votre activite financiere la plus recente',
    'Aapki latest financial activity',
  ],
  [
    'No transactions yet',
    'Ainda sem transacoes',
    'Aun no hay transacciones',
    'Aucune transaction pour le moment',
    'Abhi koi transaction nahin hai',
  ],
  [
    'Start tracking your finances by adding your first transaction.',
    'Comece a acompanhar suas financas adicionando sua primeira transacao.',
    'Empieza a seguir tus finanzas agregando tu primera transaccion.',
    'Commencez a suivre vos finances en ajoutant votre premiere transaction.',
    'Apni pehli transaction jodkar finances track karna shuru karen.',
  ],
  [
    'Budget Progress',
    'Progresso do orcamento',
    'Progreso del presupuesto',
    'Progression du budget',
    'Budget progress',
  ],
  [
    "This month's spending",
    'Gastos deste mes',
    'Gasto de este mes',
    'Depenses de ce mois',
    'Is mahine ka spending',
  ],
  [
    'No budgets yet',
    'Ainda sem orcamentos',
    'Aun no hay presupuestos',
    'Aucun budget pour le moment',
    'Abhi koi budget nahin hai',
  ],
  [
    'Create a budget to track monthly spending.',
    'Crie um orcamento para acompanhar os gastos mensais.',
    'Crea un presupuesto para seguir el gasto mensual.',
    'Creez un budget pour suivre les depenses mensuelles.',
    'Monthly spending track karne ke liye budget banayen.',
  ],
  [
    'Create budget',
    'Criar orcamento',
    'Crear presupuesto',
    'Creer un budget',
    'Budget banayen',
  ],
  [
    'Financial Goals',
    'Metas financeiras',
    'Metas financieras',
    'Objectifs financiers',
    'Financial goals',
  ],
  [
    'Track your progress',
    'Acompanhe seu progresso',
    'Sigue tu progreso',
    'Suivez votre progression',
    'Apni progress track karen',
  ],
  [
    'No goals yet',
    'Ainda sem metas',
    'Aun no hay metas',
    'Aucun objectif pour le moment',
    'Abhi koi goal nahin hai',
  ],
  [
    'Add a goal to keep progress visible.',
    'Adicione uma meta para manter o progresso visivel.',
    'Agrega una meta para mantener el progreso visible.',
    'Ajoutez un objectif pour garder la progression visible.',
    'Progress visible rakhne ke liye goal joden.',
  ],
  [
    'Set a goal',
    'Definir meta',
    'Establecer meta',
    'Definir un objectif',
    'Goal set karen',
  ],
  [
    'No spending history yet.',
    'Ainda sem historico de gastos.',
    'Aun no hay historial de gastos.',
    'Pas encore d historique de depenses.',
    'Abhi spending history nahin hai.',
  ],
  [
    'Connect accounts to see your net worth highlights.',
    'Conecte contas para ver seus destaques de patrimonio liquido.',
    'Conecta cuentas para ver tus puntos clave de patrimonio neto.',
    'Connectez des comptes pour voir les points forts de votre patrimoine net.',
    'Net worth highlights dekhne ke liye accounts connect karen.',
  ],
  [
    'Net worth',
    'Patrimonio liquido',
    'Patrimonio neto',
    'Patrimoine net',
    'Net worth',
  ],
  ['Up', 'Alta', 'Sube', 'Hausse', 'Up'],
  ['Down', 'Queda', 'Baja', 'Baisse', 'Down'],
  [
    '% from last month',
    '% em relacao ao mes passado',
    '% vs el mes pasado',
    '% par rapport au mois dernier',
    '% pichhle mahine se',
  ],
  [
    '% vs last month',
    '% em relacao ao mes passado',
    '% vs el mes pasado',
    '% par rapport au mois dernier',
    '% pichhle mahine se',
  ],
  ['Get Started', 'Comecar', 'Comenzar', 'Commencer', 'Shuru karen'],
  ['Support', 'Suporte', 'Soporte', 'Support', 'Support'],
  ['Privacy', 'Privacidade', 'Privacidad', 'Confidentialite', 'Privacy'],
  ['Terms', 'Termos', 'Terminos', 'Conditions', 'Terms'],
]

const localeIndexMap: Record<TUiLocale, number> = {
  'en-US': 0,
  'pt-BR': 1,
  'es-ES': 2,
  'fr-FR': 3,
  'hi-IN': 4,
}

const buildLocaleDictionary = (locale: TUiLocale) => {
  const index = localeIndexMap[locale]
  return Object.fromEntries(
    translationRows.map((row) => [row[0], row[index] || row[0]])
  ) as Record<string, string>
}

const uiTranslationDictionary: Record<TUiLocale, Record<string, string>> = {
  'en-US': buildLocaleDictionary('en-US'),
  'pt-BR': buildLocaleDictionary('pt-BR'),
  'es-ES': buildLocaleDictionary('es-ES'),
  'fr-FR': buildLocaleDictionary('fr-FR'),
  'hi-IN': buildLocaleDictionary('hi-IN'),
}

export const normalizeUiLocale = (locale: string): TUiLocale => {
  return supportedUiLocales.includes(locale as TUiLocale)
    ? (locale as TUiLocale)
    : (defaultUserLocale as TUiLocale)
}

export const translateUiText = (text: string, locale: string) => {
  const normalizedLocale = normalizeUiLocale(locale)
  if (normalizedLocale === 'en-US') return text

  const leadingWhitespace = text.match(/^\s*/)?.[0] ?? ''
  const trailingWhitespace = text.match(/\s*$/)?.[0] ?? ''
  const trimmedText = text.trim()
  if (!trimmedText) return text

  const dictionary = uiTranslationDictionary[normalizedLocale]
  const translatedText = dictionary[trimmedText] ?? trimmedText

  if (translatedText !== trimmedText) {
    return `${leadingWhitespace}${translatedText}${trailingWhitespace}`
  }

  const welcomeBackMatch = trimmedText.match(/^Welcome back,\s*(.+)!$/)
  if (welcomeBackMatch) {
    const translatedGreeting = dictionary['Welcome back'] ?? 'Welcome back'
    return `${leadingWhitespace}${translatedGreeting}, ${welcomeBackMatch[1]}!${trailingWhitespace}`
  }

  const percentFromLastMonthMatch = trimmedText.match(
    /^(Up|Down)\s+(\d+(?:[.,]\d+)?)%\s+from\s+last\s+month$/
  )
  if (percentFromLastMonthMatch) {
    const direction =
      dictionary[percentFromLastMonthMatch[1]] ?? percentFromLastMonthMatch[1]
    const suffix = dictionary['% from last month'] ?? '% from last month'
    return `${leadingWhitespace}${direction} ${percentFromLastMonthMatch[2]}${suffix}${trailingWhitespace}`
  }

  const percentVsLastMonthMatch = trimmedText.match(
    /^(Up|Down)\s+(\d+(?:[.,]\d+)?)%\s+vs\s+last\s+month$/
  )
  if (percentVsLastMonthMatch) {
    const direction =
      dictionary[percentVsLastMonthMatch[1]] ?? percentVsLastMonthMatch[1]
    const suffix = dictionary['% vs last month'] ?? '% vs last month'
    return `${leadingWhitespace}${direction} ${percentVsLastMonthMatch[2]}${suffix}${trailingWhitespace}`
  }

  return `${leadingWhitespace}${translatedText}${trailingWhitespace}`
}

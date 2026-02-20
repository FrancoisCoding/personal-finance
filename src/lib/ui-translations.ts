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
  ['Overview', 'Visao geral', 'Resumen general', "Vue d'ensemble", 'Overview'],
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
  ['Billing', 'Faturamento', 'Facturacion', 'Facturation', 'Billing'],
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
    'Welcome back,',
    'Bem-vindo de volta,',
    'Bienvenido de nuevo,',
    'Bon retour,',
    'Dobara swagat hai,',
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
    'All Categories',
    'Todas as categorias',
    'Todas las categorias',
    'Toutes les categories',
    'Sabhi categories',
  ],
  [
    'All Types',
    'Todos os tipos',
    'Todos los tipos',
    'Tous les types',
    'Sabhi types',
  ],
  ['Type', 'Tipo', 'Tipo', 'Type', 'Type'],
  ['Income', 'Receita', 'Ingresos', 'Revenus', 'Income'],
  ['Expense', 'Despesa', 'Gasto', 'Depense', 'Expense'],
  ['Columns', 'Colunas', 'Columnas', 'Colonnes', 'Columns'],
  [
    'Toggle columns',
    'Alternar colunas',
    'Alternar columnas',
    'Basculer les colonnes',
    'Columns toggle karen',
  ],
  ['Export', 'Exportar', 'Exportar', 'Exporter', 'Export'],
  ['Description', 'Descricao', 'Descripcion', 'Description', 'Description'],
  ['Category', 'Categoria', 'Categoria', 'Categorie', 'Category'],
  ['Account', 'Conta', 'Cuenta', 'Compte', 'Account'],
  ['Amount', 'Valor', 'Importe', 'Montant', 'Amount'],
  ['Action', 'Acao', 'Accion', 'Action', 'Action'],
  [
    'Categorizing',
    'Categorizando',
    'Categorizando',
    'Categorisation',
    'Categorizing',
  ],
  ['Categorize', 'Categorizar', 'Categorizar', 'Categoriser', 'Categorize'],
  [
    'Loading transactions...',
    'Carregando transacoes...',
    'Cargando transacciones...',
    'Chargement des transactions...',
    'Transactions load ho rahi hain...',
  ],
  [
    'No transactions found',
    'Nenhuma transacao encontrada',
    'No se encontraron transacciones',
    'Aucune transaction trouvee',
    'Koi transaction nahin mili',
  ],
  [
    'Try adjusting your filters or search terms.',
    'Tente ajustar seus filtros ou termos de busca.',
    'Intenta ajustar tus filtros o terminos de busqueda.',
    'Essayez d ajuster vos filtres ou termes de recherche.',
    'Apne filters ya search terms samayojit karen.',
  ],
  [
    'Rows per page:',
    'Linhas por pagina:',
    'Filas por pagina:',
    'Lignes par page :',
    'Rows per page:',
  ],
  [
    'Rows per page',
    'Linhas por pagina',
    'Filas por pagina',
    'Lignes par page',
    'Rows per page',
  ],
  [
    'Previous page',
    'Pagina anterior',
    'Pagina anterior',
    'Page precedente',
    'Previous page',
  ],
  [
    'Next page',
    'Proxima pagina',
    'Pagina siguiente',
    'Page suivante',
    'Next page',
  ],
  ['Showing', 'Mostrando', 'Mostrando', 'Affichage', 'Showing'],
  ['Page', 'Pagina', 'Pagina', 'Page', 'Page'],
  ['of', 'de', 'de', 'de', 'of'],
  ['to', 'a', 'a', 'a', 'to'],
  ['result', 'resultado', 'resultado', 'resultat', 'result'],
  ['results', 'resultados', 'resultados', 'resultats', 'results'],
  [
    'No data available.',
    'Nenhum dado disponivel.',
    'No hay datos disponibles.',
    'Aucune donnee disponible.',
    'No data available.',
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
    'Iniciar tour',
    'Iniciar recorrido',
    'Demarrer la visite',
    'Walkthrough shuru karen',
  ],
  [
    'Reset tour',
    'Reiniciar tour',
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
  ['Sign up', 'Criar conta', 'Registrarse', "S'inscrire", 'Sign up'],
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
    'Alerts center',
    'Central de alertas',
    'Centro de alertas',
    'Centre des alertes',
    'Alerts center',
  ],
  [
    'You are all caught up.',
    'Voce esta em dia com tudo.',
    'Estas al dia con todo.',
    'Vous etes a jour.',
    'You are all caught up.',
  ],
  ['History', 'Historico', 'Historial', 'Historique', 'History'],
  ['Rules', 'Regras', 'Reglas', 'Regles', 'Rules'],
  [
    'Mark all read',
    'Marcar todas como lidas',
    'Marcar todo como leido',
    'Tout marquer comme lu',
    'Mark all read',
  ],
  [
    'Clear read',
    'Limpar lidas',
    'Limpiar leidas',
    'Effacer les lues',
    'Clear read',
  ],
  ['Clear all', 'Limpar tudo', 'Limpiar todo', 'Tout effacer', 'Clear all'],
  ['All', 'Todos', 'Todos', 'Tous', 'All'],
  ['Unread', 'Nao lidas', 'No leidas', 'Non lues', 'Unread'],
  ['Read', 'Lidas', 'Leidas', 'Lues', 'Read'],
  [
    'No notifications',
    'Sem notificacoes',
    'Sin notificaciones',
    'Aucune notification',
    'No notifications',
  ],
  [
    'Everything is up to date.',
    'Tudo esta atualizado.',
    'Todo esta actualizado.',
    'Tout est a jour.',
    'Everything is up to date.',
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
    'Choose language',
    'Escolher idioma',
    'Elegir idioma',
    'Choisir la langue',
    'Choose language',
  ],
  [
    'Display currency',
    'Moeda de exibicao',
    'Moneda de visualizacion',
    'Devise d affichage',
    'Display currency',
  ],
  [
    'Choose currency',
    'Escolher moeda',
    'Elegir moneda',
    'Choisir la devise',
    'Choose currency',
  ],
  ['Email', 'Email', 'Correo', 'E-mail', 'Email'],
  [
    'Display name',
    'Nome de exibicao',
    'Nombre para mostrar',
    'Nom d affichage',
    'Display name',
  ],
  [
    'Security center',
    'Central de seguranca',
    'Centro de seguridad',
    'Centre de securite',
    'Security center',
  ],
  [
    'Open security center',
    'Abrir central de seguranca',
    'Abrir centro de seguridad',
    'Ouvrir le centre de securite',
    'Open security center',
  ],
  ['Add', 'Adicionar', 'Agregar', 'Ajouter', 'Add'],
  [
    'These settings update date, time, and currency formatting across your workspace.',
    'Essas configuracoes atualizam a formatacao de data, hora e moeda em todo o seu workspace.',
    'Estos ajustes actualizan el formato de fecha, hora y moneda en todo tu espacio de trabajo.',
    'Ces reglages mettent a jour le format de date, d heure et de devise dans tout votre espace.',
    'Yeh settings poore workspace mein date, time aur currency formatting update karti hain.',
  ],
  [
    'Default behavior follows your latest synced Teller account.',
    'O comportamento padrao segue sua conta Teller sincronizada mais recente.',
    'El comportamiento predeterminado sigue tu cuenta Teller sincronizada mas reciente.',
    'Le comportement par defaut suit votre compte Teller synchronise le plus recent.',
    'Default behavior aapke latest synced Teller account ko follow karta hai.',
  ],
  [
    'No email on file',
    'Nenhum email cadastrado',
    'No hay correo registrado',
    'Aucun e-mail enregistre',
    'No email on file',
  ],
  ['User', 'Usuario', 'Usuario', 'Utilisateur', 'User'],
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
    'Aqui esta seu resumo financeiro deste mes',
    'Aqui tienes tu resumen financiero de este mes',
    'Voici votre resume financier de ce mois',
    "Here's your financial overview for this month",
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
    'Receitas do mes',
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
  ['Net Income', 'Saldo liquido', 'Ingreso neto', 'Revenu net', 'Net income'],
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
    'Taxa de poupanca',
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
    'Linha de planejamento de fluxo de caixa',
    'Panel de planificacion de flujo de caja',
    'Plan de tresorerie',
    'Cash Flow Planning Strip',
  ],
  [
    'Projected income and outflows over the next 14 and 30 days.',
    'Receitas e saidas previstas para os proximos 14 e 30 dias.',
    'Ingresos y salidas previstos para los proximos 14 y 30 dias.',
    'Entrees et sorties prevues pour les 14 et 30 prochains jours.',
    'Projected income and outflows over the next 14 and 30 days.',
  ],
  [
    'Low-cash threshold:',
    'Limite de caixa baixo:',
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
    'Dias com caixa baixo',
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
    'Proximos eventos de caixa previstos',
    'Proximos eventos de efectivo previstos',
    'Prochains evenements de tresorerie prevus',
    'Upcoming expected cash events',
  ],
  ['subscription', 'assinatura', 'suscripcion', 'abonnement', 'subscription'],
  [
    'predicted pattern',
    'padrao previsto',
    'patron previsto',
    'modele predit',
    'predicted pattern',
  ],
  [
    'Not enough recurring signal yet',
    'Ainda nao ha sinal recorrente suficiente',
    'Aun no hay senal recurrente suficiente',
    'Pas encore assez de signal recurrent',
    'Not enough recurring signal yet',
  ],
  [
    'Add recurring transactions or subscriptions to generate forward cash planning.',
    'Adicione transacoes recorrentes ou assinaturas para gerar previsao de caixa.',
    'Agrega transacciones recurrentes o suscripciones para generar planificacion futura de efectivo.',
    'Ajoutez des transactions recurrentes ou des abonnements pour generer une projection de tresorerie.',
    'Add recurring transactions or subscriptions to generate forward cash planning.',
  ],
  [
    'Refreshing subscription schedule...',
    'Atualizando agenda de assinaturas...',
    'Actualizando calendario de suscripciones...',
    'Actualisation du calendrier des abonnements...',
    'Refreshing subscription schedule...',
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
    'Visao rapida. Abra Orcamentos para analise completa.',
    'Vista rapida. Abre Presupuestos para un analisis completo.',
    'Apercu rapide. Ouvrez Budgets pour une analyse complete.',
    'Snapshot only. Open budgets for full analysis.',
  ],
  ['Over risk', 'Em risco', 'En riesgo', 'A risque', 'Over risk'],
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
    'Projecao do mes',
    'Proyeccion del mes',
    'Mois projete',
    'Projected month',
  ],
  [
    'Daily range',
    'Faixa diaria',
    'Rango diario',
    'Plage quotidienne',
    'Daily range',
  ],
  [
    'Last 30 days',
    'Ultimos 30 dias',
    'Ultimos 30 dias',
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
    'Ainda nao ha transacoes',
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
    'Gastos de este mes',
    'Depenses de ce mois',
    "This month's spending",
  ],
  [
    'No budgets yet',
    'Ainda nao ha orcamentos',
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
    'Ainda nao ha metas',
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
    'Establecer una meta',
    'Definir un objectif',
    'Set a goal',
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
  ['Up', 'Subiu', 'Subio', 'En hausse de', 'Up'],
  ['Down', 'Caiu', 'Bajo', 'En baisse de', 'Down'],
  [
    '% from last month',
    '% em relacao ao mes passado',
    '% frente al mes pasado',
    '% par rapport au mois dernier',
    '% from last month',
  ],
  [
    '% vs last month',
    '% em relacao ao mes passado',
    '% frente al mes pasado',
    '% par rapport au mois dernier',
    '% vs last month',
  ],
  ['Reminders', 'Lembretes', 'Recordatorios', 'Rappels', 'Reminders'],
  [
    'Reminder due soon',
    'Lembrete proximo',
    'Recordatorio proximo',
    'Rappel imminent',
    'Reminder due soon',
  ],
  [
    'Reminder overdue',
    'Lembrete atrasado',
    'Recordatorio vencido',
    'Rappel en retard',
    'Reminder overdue',
  ],
  [
    'is due within 24 hours.',
    'vence em ate 24 horas.',
    'vence dentro de 24 horas.',
    'arrive a echeance dans les 24 heures.',
    'is due within 24 hours.',
  ],
  [
    'is overdue.',
    'esta atrasado.',
    'esta vencido.',
    'est en retard.',
    'is overdue.',
  ],
  [
    'Stay ahead of bills, goals, and recurring tasks.',
    'Fique a frente de contas, metas e tarefas recorrentes.',
    'Mantente al dia con pagos, metas y tareas recurrentes.',
    'Gardez une longueur d avance sur les factures, objectifs et taches recurrentes.',
    'Stay ahead of bills, goals, and recurring tasks.',
  ],
  ['Upcoming', 'Proximos', 'Proximos', 'A venir', 'Upcoming'],
  ['Done', 'Concluido', 'Hecho', 'Termine', 'Done'],
  [
    'No upcoming reminders',
    'Nenhum lembrete proximo',
    'No hay recordatorios proximos',
    'Aucun rappel a venir',
    'No upcoming reminders',
  ],
  [
    'Add a reminder to keep tasks on track.',
    'Adicione um lembrete para manter suas tarefas em dia.',
    'Agrega un recordatorio para mantener tus tareas en curso.',
    'Ajoutez un rappel pour garder vos taches sur la bonne voie.',
    'Add a reminder to keep tasks on track.',
  ],
  ['Completed', 'Concluidos', 'Completados', 'Termines', 'Completed'],
  [
    'Clearing...',
    'Limpando...',
    'Limpiando...',
    'Suppression...',
    'Clearing...',
  ],
  [
    'Clear completed',
    'Limpar concluidos',
    'Limpiar completados',
    'Effacer les termines',
    'Clear completed',
  ],
  ['High', 'Alta', 'Alta', 'Eleve', 'High'],
  ['Medium', 'Media', 'Media', 'Moyen', 'Medium'],
  ['Low', 'Baixa', 'Baja', 'Faible', 'Low'],
  [
    'Add Reminder',
    'Adicionar lembrete',
    'Agregar recordatorio',
    'Ajouter un rappel',
    'Add Reminder',
  ],
  [
    'Set a reminder for important financial tasks and deadlines.',
    'Defina um lembrete para tarefas e prazos financeiros importantes.',
    'Configura un recordatorio para tareas y plazos financieros importantes.',
    'Definissez un rappel pour les taches et echeances financieres importantes.',
    'Set a reminder for important financial tasks and deadlines.',
  ],
  ['Title', 'Titulo', 'Titulo', 'Titre', 'Title'],
  [
    'e.g., Pay credit card bill',
    'ex.: Pagar fatura do cartao',
    'ej.: Pagar factura de tarjeta',
    'ex.: Payer la facture de carte',
    'e.g., Pay credit card bill',
  ],
  [
    'Description (Optional)',
    'Descricao (Opcional)',
    'Descripcion (Opcional)',
    'Description (Optionnel)',
    'Description (Optional)',
  ],
  [
    'Add any additional details...',
    'Adicione detalhes adicionais...',
    'Agrega cualquier detalle adicional...',
    'Ajoutez des details supplementaires...',
    'Add any additional details...',
  ],
  [
    'Date and time',
    'Data e hora',
    'Fecha y hora',
    'Date et heure',
    'Date and time',
  ],
  ['Schedule', 'Agendamento', 'Horario', 'Horaire', 'Schedule'],
  [
    'Select date',
    'Selecionar data',
    'Seleccionar fecha',
    'Selectionner une date',
    'Select date',
  ],
  ['Hour', 'Hora', 'Hora', 'Heure', 'Hour'],
  ['Minute', 'Minuto', 'Minuto', 'Minute', 'Minute'],
  ['Period', 'Periodo', 'Periodo', 'Periode', 'Period'],
  ['Type', 'Tipo', 'Tipo', 'Type', 'Type'],
  ['Priority', 'Prioridade', 'Prioridad', 'Priorite', 'Priority'],
  [
    'Bill Payment',
    'Pagamento de conta',
    'Pago de factura',
    'Paiement de facture',
    'Bill Payment',
  ],
  [
    'Budget Review',
    'Revisao de orcamento',
    'Revision de presupuesto',
    'Revision de budget',
    'Budget Review',
  ],
  [
    'Goal Check-in',
    'Revisao de meta',
    'Revision de meta',
    'Suivi d objectif',
    'Goal Check-in',
  ],
  ['Custom', 'Personalizado', 'Personalizado', 'Personnalise', 'Custom'],
  [
    'Missing title',
    'Titulo ausente',
    'Falta el titulo',
    'Titre manquant',
    'Missing title',
  ],
  [
    'Please enter a reminder title.',
    'Informe um titulo para o lembrete.',
    'Ingresa un titulo para el recordatorio.',
    'Veuillez saisir un titre de rappel.',
    'Please enter a reminder title.',
  ],
  [
    'Invalid date',
    'Data invalida',
    'Fecha invalida',
    'Date invalide',
    'Invalid date',
  ],
  [
    'Please choose a valid reminder date and time.',
    'Escolha uma data e hora validas para o lembrete.',
    'Elige una fecha y hora validas para el recordatorio.',
    'Veuillez choisir une date et une heure de rappel valides.',
    'Please choose a valid reminder date and time.',
  ],
  [
    'Reminder added',
    'Lembrete adicionado',
    'Recordatorio agregado',
    'Rappel ajoute',
    'Reminder added',
  ],
  ['Error', 'Erro', 'Error', 'Erreur', 'Error'],
  [
    'Failed to add reminder. Please try again.',
    'Falha ao adicionar lembrete. Tente novamente.',
    'No se pudo agregar el recordatorio. Intentalo de nuevo.',
    "Echec de l'ajout du rappel. Veuillez reessayer.",
    'Failed to add reminder. Please try again.',
  ],
  [
    'AI Financial Insights',
    'Insights financeiros com IA',
    'Insights financieros con IA',
    'Insights financiers IA',
    'AI Financial Insights',
  ],
  ['AI Powered', 'Com IA', 'Con IA', 'Propulse par IA', 'AI Powered'],
  [
    'Last analyzed:',
    'Ultima analise:',
    'Ultimo analisis:',
    'Derniere analyse :',
    'Last analyzed:',
  ],
  [
    'High Spending in',
    'Gasto elevado em',
    'Gasto elevado en',
    'Depenses elevees en',
    'High Spending in',
  ],
  ['accounts for', 'representa', 'representa', 'represente', 'accounts for'],
  [
    'of your total spending.',
    'dos seus gastos totais.',
    'de tu gasto total.',
    'de vos depenses totales.',
    'of your total spending.',
  ],
  [
    'Over Budget:',
    'Acima do orcamento:',
    'Sobre presupuesto:',
    'Hors budget :',
    'Over Budget:',
  ],
  [
    'Budget Warning:',
    'Alerta de orcamento:',
    'Alerta de presupuesto:',
    'Alerte budget :',
    'Budget Warning:',
  ],
  [
    "You've exceeded your",
    'Voce excedeu seu',
    'Has excedido tu',
    'Vous avez depasse votre',
    "You've exceeded your",
  ],
  ['budget by', 'orcamento em', 'presupuesto en', 'budget de', 'budget by'],
  ["You're at", 'Voce esta em', 'Estas en', 'Vous etes a', "You're at"],
  ['of your', 'do seu', 'de tu', 'de votre', 'of your'],
  ['budget.', 'orcamento.', 'presupuesto.', 'budget.', 'budget.'],
  [
    'Behind on Goal:',
    'Atrasado na meta:',
    'Atrasado en la meta:',
    'Retard sur l objectif :',
    'Behind on Goal:',
  ],
  [
    'Goal Achieved:',
    'Meta alcancada:',
    'Meta alcanzada:',
    'Objectif atteint :',
    'Goal Achieved:',
  ],
  ['goal.', 'meta.', 'meta.', 'objectif.', 'goal.'],
  [
    "Congratulations! You've reached your",
    'Parabens! Voce alcancou sua',
    'Felicidades! Alcanzaste tu',
    'Felicitations ! Vous avez atteint votre',
    "Congratulations! You've reached your",
  ],
  ['Found', 'Encontramos', 'Encontramos', 'Trouve', 'Found'],
  [
    'transaction(s)',
    'transacao(oes)',
    'transaccion(es)',
    'transaction(s)',
    'transaction(s)',
  ],
  [
    'significantly larger than your average.',
    'significativamente maior(es) que sua media.',
    'significativamente mayor(es) que tu promedio.',
    'nettement superieure(s) a votre moyenne.',
    'significantly larger than your average.',
  ],
  [
    'Analyzing your finances...',
    'Analisando suas financas...',
    'Analizando tus finanzas...',
    'Analyse de vos finances...',
    'Analyzing your finances...',
  ],
  ['Progress', 'Progresso', 'Progreso', 'Progression', 'Progress'],
  [
    'Recommendations:',
    'Recomendacoes:',
    'Recomendaciones:',
    'Recommandations :',
    'Recommendations:',
  ],
  ['Confidence:', 'Confianca:', 'Confianza:', 'Confiance :', 'Confidence:'],
  [
    'Next step:',
    'Proximo passo:',
    'Siguiente paso:',
    'Prochaine etape :',
    'Next step:',
  ],
  [
    'No insights available',
    'Nenhum insight disponivel',
    'No hay insights disponibles',
    'Aucun insight disponible',
    'No insights available',
  ],
  [
    'Add more transactions to get personalized insights.',
    'Adicione mais transacoes para receber insights personalizados.',
    'Agrega mas transacciones para obtener insights personalizados.',
    'Ajoutez plus de transactions pour obtenir des insights personnalises.',
    'Add more transactions to get personalized insights.',
  ],
  [
    'Analyzing...',
    'Analisando...',
    'Analizando...',
    'Analyse...',
    'Analyzing...',
  ],
  [
    'Refresh Insights',
    'Atualizar insights',
    'Actualizar insights',
    'Actualiser les insights',
    'Refresh Insights',
  ],
  ['HIGH', 'ALTA', 'ALTA', 'ELEVEE', 'HIGH'],
  ['MEDIUM', 'MEDIA', 'MEDIA', 'MOYENNE', 'MEDIUM'],
  ['LOW', 'BAIXA', 'BAJA', 'FAIBLE', 'LOW'],
  [
    'Cash Flow',
    'Fluxo de caixa',
    'Flujo de caja',
    'Flux de tresorerie',
    'Cash Flow',
  ],
  [
    'Net cash flow',
    'Fluxo de caixa liquido',
    'Flujo de caja neto',
    'Flux de tresorerie net',
    'Net cash flow',
  ],
  [
    'Total Income',
    'Receita total',
    'Ingresos totales',
    'Revenus totaux',
    'Total Income',
  ],
  [
    'Total Expenses',
    'Despesas totais',
    'Gastos totales',
    'Depenses totales',
    'Total Expenses',
  ],
  ['Net Flow', 'Fluxo liquido', 'Flujo neto', 'Flux net', 'Net Flow'],
  ['Income', 'Receita', 'Ingresos', 'Revenus', 'Income'],
  ['Expenses', 'Despesas', 'Gastos', 'Depenses', 'Expenses'],
  ['Income:', 'Receita:', 'Ingresos:', 'Revenus :', 'Income:'],
  ['Expenses:', 'Despesas:', 'Gastos:', 'Depenses :', 'Expenses:'],
  ['Net:', 'Liquido:', 'Neto:', 'Net :', 'Net:'],
  [
    'Credit Utilization',
    'Utilizacao de credito',
    'Utilizacion de credito',
    'Utilisation du credit',
    'Credit Utilization',
  ],
  [
    'Monitor balances, limits, and paydown momentum.',
    'Monitore saldos, limites e ritmo de quitacao.',
    'Supervisa saldos, limites y ritmo de pago.',
    'Surveillez soldes, plafonds et dynamique de remboursement.',
    'Monitor balances, limits, and paydown momentum.',
  ],
  [
    'No credit cards added',
    'Nenhum cartao de credito adicionado',
    'No hay tarjetas de credito agregadas',
    'Aucune carte de credit ajoutee',
    'No credit cards added',
  ],
  [
    'Add your credit cards to track utilization.',
    'Adicione seus cartoes de credito para acompanhar a utilizacao.',
    'Agrega tus tarjetas de credito para seguir la utilizacion.',
    "Ajoutez vos cartes de credit pour suivre l'utilisation.",
    'Add your credit cards to track utilization.',
  ],
  [
    'Overall Utilization',
    'Utilizacao geral',
    'Utilizacion general',
    'Utilisation globale',
    'Overall Utilization',
  ],
  [
    'Total Balance',
    'Saldo total',
    'Saldo total',
    'Solde total',
    'Total Balance',
  ],
  ['Across', 'Em', 'En', 'Sur', 'Across'],
  ['cards', 'cartoes', 'tarjetas', 'cartes', 'cards'],
  [
    'Available Credit',
    'Credito disponivel',
    'Credito disponible',
    'Credit disponible',
    'Available Credit',
  ],
  ['of', 'de', 'de', 'de', 'of'],
  [
    'Monthly Interest Cost',
    'Custo mensal de juros',
    'Costo mensual de intereses',
    "Cout mensuel d'interets",
    'Monthly Interest Cost',
  ],
  ['Based on', 'Com base em', 'Basado en', 'Base sur', 'Based on'],
  ['average APR', 'APR medio', 'APR promedio', 'TAEG moyen', 'average APR'],
  [
    'Individual Cards',
    'Cartoes individuais',
    'Tarjetas individuales',
    'Cartes individuelles',
    'Individual Cards',
  ],
  [
    'Excellent Credit Utilization',
    'Excelente utilizacao de credito',
    'Excelente utilizacion de credito',
    'Excellente utilisation du credit',
    'Excellent Credit Utilization',
  ],
  [
    'Your credit utilization is in the excellent range. Keep it up!',
    'Sua utilizacao de credito esta em nivel excelente. Continue assim!',
    'Tu utilizacion de credito esta en un nivel excelente. Sigue asi!',
    'Votre utilisation du credit est excellente. Continuez ainsi !',
    'Your credit utilization is in the excellent range. Keep it up!',
  ],
  [
    'Good Credit Utilization',
    'Boa utilizacao de credito',
    'Buena utilizacion de credito',
    'Bonne utilisation du credit',
    'Good Credit Utilization',
  ],
  [
    'Your credit utilization is in a healthy range.',
    'Sua utilizacao de credito esta em uma faixa saudavel.',
    'Tu utilizacion de credito esta en un rango saludable.',
    'Votre utilisation du credit est dans une plage saine.',
    'Your credit utilization is in a healthy range.',
  ],
  [
    'Fair Credit Utilization',
    'Utilizacao de credito moderada',
    'Utilizacion de credito moderada',
    'Utilisation du credit moyenne',
    'Fair Credit Utilization',
  ],
  [
    'Your credit utilization is getting high. Consider reducing balances.',
    'Sua utilizacao de credito esta subindo. Considere reduzir os saldos.',
    'Tu utilizacion de credito esta subiendo. Considera reducir saldos.',
    'Votre utilisation du credit augmente. Envisagez de reduire les soldes.',
    'Your credit utilization is getting high. Consider reducing balances.',
  ],
  [
    'High Credit Utilization',
    'Utilizacao de credito alta',
    'Utilizacion de credito alta',
    'Utilisation du credit elevee',
    'High Credit Utilization',
  ],
  [
    'Your credit utilization is very high and may hurt your credit score.',
    'Sua utilizacao de credito esta muito alta e pode prejudicar seu score.',
    'Tu utilizacion de credito es muy alta y puede perjudicar tu puntaje.',
    'Votre utilisation du credit est tres elevee et peut nuire a votre score.',
    'Your credit utilization is very high and may hurt your credit score.',
  ],
  [
    'Consider requesting credit limit increases',
    'Considere solicitar aumento de limite',
    'Considera solicitar aumento de limite',
    'Envisagez de demander une hausse de plafond',
    'Consider requesting credit limit increases',
  ],
  [
    'Continue paying balances in full',
    'Continue pagando os saldos integralmente',
    'Sigue pagando los saldos completos',
    'Continuez a payer les soldes en totalite',
    'Continue paying balances in full',
  ],
  [
    'Aim to keep utilization below 30%',
    'Busque manter a utilizacao abaixo de 30%',
    'Busca mantener la utilizacion por debajo del 30%',
    'Visez une utilisation inferieure a 30 %',
    'Aim to keep utilization below 30%',
  ],
  [
    'Pay balances before statement closing',
    'Pague os saldos antes do fechamento da fatura',
    'Paga saldos antes del cierre del estado de cuenta',
    'Payez les soldes avant la cloture du releve',
    'Pay balances before statement closing',
  ],
  [
    'Pay down balances to improve credit score',
    'Reduza saldos para melhorar seu score de credito',
    'Reduce saldos para mejorar tu puntaje de credito',
    'Reduisez les soldes pour ameliorer votre score de credit',
    'Pay down balances to improve credit score',
  ],
  [
    'Avoid new credit applications',
    'Evite novas solicitacoes de credito',
    'Evita nuevas solicitudes de credito',
    'Evitez de nouvelles demandes de credit',
    'Avoid new credit applications',
  ],
  [
    'Prioritize paying down high balances',
    'Priorize reduzir saldos altos',
    'Prioriza reducir saldos altos',
    'Priorisez la reduction des soldes eleves',
    'Prioritize paying down high balances',
  ],
  [
    'Consider debt consolidation',
    'Considere consolidacao de dividas',
    'Considera consolidacion de deudas',
    'Envisagez une consolidation de dettes',
    'Consider debt consolidation',
  ],
  [
    'Avoid new purchases',
    'Evite novas compras',
    'Evita nuevas compras',
    'Evitez de nouveaux achats',
    'Avoid new purchases',
  ],
  [
    'Financial Analytics',
    'Analises financeiras',
    'Analitica financiera',
    'Analyses financieres',
    'Financial Analytics',
  ],
  [
    'Snapshot of trends, spending, and budget health.',
    'Resumo de tendencias, gastos e saude do orcamento.',
    'Resumen de tendencias, gastos y salud del presupuesto.',
    'Apercu des tendances, depenses et sante du budget.',
    'Snapshot of trends, spending, and budget health.',
  ],
  ['Advanced', 'Avancado', 'Avanzado', 'Avance', 'Advanced'],
  [
    'Avg Daily Spend',
    'Gasto medio diario',
    'Gasto diario promedio',
    'Depense quotidienne moyenne',
    'Avg Daily Spend',
  ],
  [
    'Spending by Category',
    'Gastos por categoria',
    'Gasto por categoria',
    'Depenses par categorie',
    'Spending by Category',
  ],
  [
    'No spending data',
    'Sem dados de gastos',
    'Sin datos de gasto',
    'Aucune donnee de depense',
    'No spending data',
  ],
  [
    'Add expenses to see category breakdowns.',
    'Adicione despesas para ver o detalhamento por categoria.',
    'Agrega gastos para ver el desglose por categoria.',
    'Ajoutez des depenses pour voir la repartition par categorie.',
    'Add expenses to see category breakdowns.',
  ],
  [
    'Monthly Spending Trend',
    'Tendencia mensal de gastos',
    'Tendencia mensual de gastos',
    'Tendance mensuelle des depenses',
    'Monthly Spending Trend',
  ],
  [
    'Budget Performance',
    'Desempenho do orcamento',
    'Rendimiento del presupuesto',
    'Performance du budget',
    'Budget Performance',
  ],
  [
    'Over Budget',
    'Acima do orcamento',
    'Sobre presupuesto',
    'Hors budget',
    'Over Budget',
  ],
  [
    'On Track',
    'No caminho certo',
    'En camino',
    'Sur la bonne voie',
    'On Track',
  ],
  [
    'Reporting & Export',
    'Relatorios e exportacao',
    'Reportes y exportacion',
    'Rapports et exportation',
    'Reporting & Export',
  ],
  [
    'Clean CSV and PDF exports with scheduling built in.',
    'Exportacoes CSV e PDF com agendamento integrado.',
    'Exportaciones CSV y PDF con programacion integrada.',
    'Exports CSV et PDF avec planification integree.',
    'Clean CSV and PDF exports with scheduling built in.',
  ],
  ['Reports', 'Relatorios', 'Reportes', 'Rapports', 'Reports'],
  ['Exports', 'Exportacoes', 'Exportaciones', 'Exports', 'Exports'],
  [
    'Summary, transactions, budgets, and goals in one report.',
    'Resumo, transacoes, orcamentos e metas em um so relatorio.',
    'Resumen, transacciones, presupuestos y metas en un solo reporte.',
    'Resume, transactions, budgets et objectifs dans un seul rapport.',
    'Summary, transactions, budgets, and goals in one report.',
  ],
  ['Export PDF', 'Exportar PDF', 'Exportar PDF', 'Exporter PDF', 'Export PDF'],
  [
    'Set Alerts',
    'Definir alertas',
    'Configurar alertas',
    'Definir des alertes',
    'Set Alerts',
  ],
  [
    'Schedule reports',
    'Agendar relatorios',
    'Programar reportes',
    'Programmer des rapports',
    'Schedule reports',
  ],
  [
    'Automate weekly or monthly exports.',
    'Automatize exportacoes semanais ou mensais.',
    'Automatiza exportaciones semanales o mensuales.',
    'Automatisez les exports hebdomadaires ou mensuels.',
    'Automate weekly or monthly exports.',
  ],
  ['Paused', 'Pausado', 'Pausado', 'En pause', 'Paused'],
  ['Pause', 'Pausar', 'Pausar', 'Mettre en pause', 'Pause'],
  ['Enable', 'Ativar', 'Activar', 'Activer', 'Enable'],
  ['Frequency', 'Frequencia', 'Frecuencia', 'Frequence', 'Frequency'],
  [
    'Select frequency',
    'Selecione a frequencia',
    'Selecciona la frecuencia',
    'Selectionnez la frequence',
    'Select frequency',
  ],
  ['Weekly', 'Semanal', 'Semanal', 'Hebdomadaire', 'Weekly'],
  ['Monthly', 'Mensal', 'Mensual', 'Mensuel', 'Monthly'],
  [
    'Day of week',
    'Dia da semana',
    'Dia de la semana',
    'Jour de la semaine',
    'Day of week',
  ],
  ['Day of month', 'Dia do mes', 'Dia del mes', 'Jour du mois', 'Day of month'],
  [
    'Select day',
    'Selecione o dia',
    'Selecciona el dia',
    'Selectionnez le jour',
    'Select day',
  ],
  ['Time', 'Horario', 'Hora', 'Heure', 'Time'],
  ['Delivery', 'Entrega', 'Entrega', 'Livraison', 'Delivery'],
  ['Download', 'Baixar', 'Descargar', 'Telecharger', 'Download'],
  [
    'Next scheduled report',
    'Proximo relatorio agendado',
    'Proximo reporte programado',
    'Prochain rapport planifie',
    'Next scheduled report',
  ],
  [
    'Save schedule',
    'Salvar agendamento',
    'Guardar programacion',
    'Enregistrer la planification',
    'Save schedule',
  ],
  [
    'No data to export',
    'Sem dados para exportar',
    'No hay datos para exportar',
    'Aucune donnee a exporter',
    'No data to export',
  ],
  [
    'Add transactions, budgets, or goals to generate a report.',
    'Adicione transacoes, orcamentos ou metas para gerar um relatorio.',
    'Agrega transacciones, presupuestos o metas para generar un reporte.',
    'Ajoutez des transactions, budgets ou objectifs pour generer un rapport.',
    'Add transactions, budgets, or goals to generate a report.',
  ],
  [
    'CSV exported',
    'CSV exportado',
    'CSV exportado',
    'CSV exporte',
    'CSV exported',
  ],
  [
    'Your analytics report is ready to download.',
    'Seu relatorio analitico esta pronto para download.',
    'Tu reporte analitico esta listo para descargar.',
    'Votre rapport analytique est pret au telechargement.',
    'Your analytics report is ready to download.',
  ],
  [
    'Popup blocked',
    'Popup bloqueado',
    'Popup bloqueado',
    'Popup bloquee',
    'Popup blocked',
  ],
  [
    'Enable popups to export the PDF report.',
    'Ative popups para exportar o relatorio em PDF.',
    'Habilita popups para exportar el reporte en PDF.',
    'Activez les popups pour exporter le rapport PDF.',
    'Enable popups to export the PDF report.',
  ],
  ['PDF ready', 'PDF pronto', 'PDF listo', 'PDF pret', 'PDF ready'],
  [
    'Your PDF report is open and ready to print or save.',
    'Seu relatorio PDF esta aberto e pronto para imprimir ou salvar.',
    'Tu reporte PDF esta abierto y listo para imprimir o guardar.',
    'Votre rapport PDF est ouvert et pret a etre imprime ou enregistre.',
    'Your PDF report is open and ready to print or save.',
  ],
  [
    'Schedule disabled',
    'Agendamento desativado',
    'Programacion desactivada',
    'Planification desactivee',
    'Schedule disabled',
  ],
  [
    'Enable scheduled reports before saving.',
    'Ative os relatorios agendados antes de salvar.',
    'Activa los reportes programados antes de guardar.',
    'Activez les rapports planifies avant de sauvegarder.',
    'Enable scheduled reports before saving.',
  ],
  [
    'Report schedule updated',
    'Agendamento de relatorio atualizado',
    'Programacion de reportes actualizada',
    'Planification des rapports mise a jour',
    'Report schedule updated',
  ],
  [
    'Schedule saved',
    'Agendamento salvo',
    'Programacion guardada',
    'Planification enregistree',
    'Schedule saved',
  ],
  [
    'Spending alert enabled',
    'Alerta de gastos ativado',
    'Alerta de gastos activada',
    'Alerte de depenses activee',
    'Spending alert enabled',
  ],
  [
    'We will notify you if monthly expenses rise 10% above your recent average.',
    'Vamos avisar voce se as despesas mensais subirem 10% acima da sua media recente.',
    'Te avisaremos si los gastos mensuales suben 10% por encima de tu promedio reciente.',
    'Nous vous informerons si les depenses mensuelles depassent de 10 % votre moyenne recente.',
    'We will notify you if monthly expenses rise 10% above your recent average.',
  ],
  [
    'View alerts',
    'Ver alertas',
    'Ver alertas',
    'Voir les alertes',
    'View alerts',
  ],
  [
    'Giving & Donations',
    'Doacoes e contribuicoes',
    'Donaciones y aportes',
    'Dons et contributions',
    'Giving & Donations',
  ],
  [
    'Track churches, charities, and community support.',
    'Acompanhe igrejas, caridades e apoio comunitario.',
    'Sigue iglesias, organizaciones beneficas y apoyo comunitario.',
    'Suivez les eglises, associations caritatives et le soutien communautaire.',
    'Track churches, charities, and community support.',
  ],
  ['recipient', 'destinatario', 'destinatario', 'destinataire', 'recipient'],
  [
    'recipients',
    'destinatarios',
    'destinatarios',
    'destinataires',
    'recipients',
  ],
  ['recurring', 'recorrentes', 'recurrentes', 'recurrents', 'recurring'],
  ['Last', 'Ultimo', 'Ultimo', 'Dernier', 'Last'],
  ['Next', 'Proximo', 'Siguiente', 'Prochain', 'Next'],
  [
    'Top recipients',
    'Principais destinatarios',
    'Principales destinatarios',
    'Principaux destinataires',
    'Top recipients',
  ],
  ['donation', 'doacao', 'donacion', 'don', 'donation'],
  ['donations', 'doacoes', 'donaciones', 'dons', 'donations'],
  [
    'Cause breakdown',
    'Detalhamento por causa',
    'Desglose por causa',
    'Repartition par cause',
    'Cause breakdown',
  ],
  [
    'Causes will appear as giving grows.',
    'As causas aparecerao conforme as doacoes aumentarem.',
    'Las causas apareceran a medida que crezcan las donaciones.',
    'Les causes apparaitront a mesure que les dons augmenteront.',
    'Causes will appear as giving grows.',
  ],
  [
    'Recurring giving',
    'Doacoes recorrentes',
    'Donaciones recurrentes',
    'Dons recurrents',
    'Recurring giving',
  ],
  [
    'No recurring patterns detected yet.',
    'Nenhum padrao recorrente detectado ainda.',
    'Aun no se detectaron patrones recurrentes.',
    'Aucun modele recurrent detecte pour le moment.',
    'No recurring patterns detected yet.',
  ],
  [
    'No donations yet',
    'Nenhuma doacao ainda',
    'Aun no hay donaciones',
    'Pas encore de dons',
    'No donations yet',
  ],
  [
    'Donations will appear here once they are categorized.',
    'As doacoes aparecerao aqui quando forem categorizadas.',
    'Las donaciones apareceran aqui cuando se categoricen.',
    'Les dons apparaitront ici une fois categorises.',
    'Donations will appear here once they are categorized.',
  ],
  [
    'Data Quality Center',
    'Central de qualidade de dados',
    'Centro de calidad de datos',
    'Centre de qualite des donnees',
    'Data Quality Center',
  ],
  [
    'Keep transactions accurate before insights and forecasts.',
    'Mantenha as transacoes corretas antes de gerar insights e previsoes.',
    'Mantiene las transacciones precisas antes de generar insights y pronosticos.',
    'Gardez des transactions exactes avant les insights et previsions.',
    'Keep transactions accurate before insights and forecasts.',
  ],
  [
    'Review data',
    'Revisar dados',
    'Revisar datos',
    'Verifier les donnees',
    'Review data',
  ],
  [
    'Uncategorized',
    'Sem categoria',
    'Sin categoria',
    'Non categorise',
    'Uncategorized',
  ],
  [
    'Transactions ready for category review.',
    'Transacoes prontas para revisao de categoria.',
    'Transacciones listas para revision de categoria.',
    'Transactions pretes pour revision de categorie.',
    'Transactions ready for category review.',
  ],
  [
    'Possible duplicates',
    'Possiveis duplicadas',
    'Posibles duplicados',
    'Doublons possibles',
    'Possible duplicates',
  ],
  [
    'Similar entries on the same day and amount.',
    'Lancamentos similares no mesmo dia e valor.',
    'Entradas similares en el mismo dia e importe.',
    'Entrees similaires le meme jour et montant.',
    'Similar entries on the same day and amount.',
  ],
  [
    'Stale accounts',
    'Contas desatualizadas',
    'Cuentas desactualizadas',
    'Comptes obsoletes',
    'Stale accounts',
  ],
  [
    'Accounts not refreshed in the last 7 days.',
    'Contas sem atualizacao nos ultimos 7 dias.',
    'Cuentas no actualizadas en los ultimos 7 dias.',
    'Comptes non actualises au cours des 7 derniers jours.',
    'Accounts not refreshed in the last 7 days.',
  ],
  [
    'Food & Dining',
    'Alimentacao',
    'Comida y restaurantes',
    'Alimentation',
    'Food & Dining',
  ],
  [
    'Food and Dining',
    'Alimentacao',
    'Comida y restaurantes',
    'Alimentation',
    'Food and Dining',
  ],
  ['Transportation', 'Transporte', 'Transporte', 'Transport', 'Transportation'],
  ['Shopping', 'Compras', 'Compras', 'Achats', 'Shopping'],
  [
    'Entertainment',
    'Entretenimento',
    'Entretenimiento',
    'Divertissement',
    'Entertainment',
  ],
  ['Healthcare', 'Saude', 'Salud', 'Sante', 'Healthcare'],
  [
    'Utilities',
    'Servicos basicos',
    'Servicios basicos',
    'Services publics',
    'Utilities',
  ],
  ['Housing', 'Moradia', 'Vivienda', 'Logement', 'Housing'],
  ['Education', 'Educacao', 'Educacion', 'Education', 'Education'],
  ['Travel', 'Viagens', 'Viajes', 'Voyage', 'Travel'],
  ['Insurance', 'Seguro', 'Seguro', 'Assurance', 'Insurance'],
  ['Investment', 'Investimentos', 'Inversion', 'Investissement', 'Investment'],
  ['Salary', 'Salario', 'Salario', 'Salaire', 'Salary'],
  ['Freelance', 'Freelance', 'Freelance', 'Freelance', 'Freelance'],
  ['Gifts', 'Presentes', 'Regalos', 'Cadeaux', 'Gifts'],
  [
    'Subscriptions',
    'Assinaturas',
    'Suscripciones',
    'Abonnements',
    'Subscriptions',
  ],
  ['Services', 'Servicos', 'Servicios', 'Services', 'Services'],
  ['Technology', 'Tecnologia', 'Tecnologia', 'Technologie', 'Technology'],
  ['Business', 'Negocios', 'Negocios', 'Affaires', 'Business'],
  [
    'Personal Care',
    'Cuidados pessoais',
    'Cuidado personal',
    'Soin personnel',
    'Personal Care',
  ],
  [
    'Fitness',
    'Condicionamento fisico',
    'Acondicionamiento fisico',
    'Fitness',
    'Fitness',
  ],
  ['Pets', 'Pets', 'Mascotas', 'Animaux', 'Pets'],
  ['Charity', 'Caridade', 'Caridad', 'Charite', 'Charity'],
  ['Legal', 'Juridico', 'Legal', 'Juridique', 'Legal'],
  ['Taxes', 'Impostos', 'Impuestos', 'Impots', 'Taxes'],
  ['Other', 'Outros', 'Otros', 'Autres', 'Other'],
  [
    'Review items',
    'Itens para revisar',
    'Elementos para revisar',
    'Elements a examiner',
    'Review items',
  ],
  [
    'High-value expenses in the last 14 days.',
    'Despesas de alto valor nos ultimos 14 dias.',
    'Gastos de alto valor en los ultimos 14 dias.',
    'Depenses elevees sur les 14 derniers jours.',
    'High-value expenses in the last 14 days.',
  ],
  [
    'Account connections monitored in one place.',
    'Conexoes de conta monitoradas em um so lugar.',
    'Conexiones de cuenta monitorizadas en un solo lugar.',
    'Connexions de compte suivies en un seul endroit.',
    'Account connections monitored in one place.',
  ],
  [
    'Credit cards tracked',
    'Cartoes de credito monitorados',
    'Tarjetas de credito monitorizadas',
    'Cartes de credit suivies',
    'Credit cards tracked',
  ],
  [
    'Cards included in utilization and alert checks.',
    'Cartoes incluidos nas verificacoes de utilizacao e alerta.',
    'Tarjetas incluidas en verificaciones de utilizacion y alertas.',
    "Cartes incluses dans les verifications d'utilisation et d'alerte.",
    'Cards included in utilization and alert checks.',
  ],
  [
    'Add Credit Card',
    'Adicionar cartao de credito',
    'Agregar tarjeta de credito',
    'Ajouter une carte de credit',
    'Add Credit Card',
  ],
  [
    'Add a new credit card to track your utilization and payments.',
    'Adicione um novo cartao de credito para acompanhar utilizacao e pagamentos.',
    'Agrega una nueva tarjeta de credito para seguir utilizacion y pagos.',
    "Ajoutez une nouvelle carte de credit pour suivre l'utilisation et les paiements.",
    'Add a new credit card to track your utilization and payments.',
  ],
  [
    'Card Name',
    'Nome do cartao',
    'Nombre de la tarjeta',
    'Nom de la carte',
    'Card Name',
  ],
  [
    'Current Balance',
    'Saldo atual',
    'Saldo actual',
    'Solde actuel',
    'Current Balance',
  ],
  [
    'Credit Limit',
    'Limite de credito',
    'Limite de credito',
    'Plafond de credit',
    'Credit Limit',
  ],
  [
    'Due Date',
    'Data de vencimento',
    'Fecha de vencimiento',
    "Date d'echeance",
    'Due Date',
  ],
  [
    'Add Card',
    'Adicionar cartao',
    'Agregar tarjeta',
    'Ajouter une carte',
    'Add Card',
  ],
  [
    'Credit card added',
    'Cartao de credito adicionado',
    'Tarjeta de credito agregada',
    'Carte de credit ajoutee',
    'Credit card added',
  ],
  [
    'Failed to add credit card. Please try again.',
    'Falha ao adicionar cartao de credito. Tente novamente.',
    'No se pudo agregar la tarjeta de credito. Intentalo de nuevo.',
    "Echec de l'ajout de la carte de credit. Veuillez reessayer.",
    'Failed to add credit card. Please try again.',
  ],
  [
    'Ask Financial Assistant',
    'Perguntar ao Assistente Financeiro',
    'Preguntar al Asistente Financiero',
    "Demander a l'Assistant financier",
    'Ask Financial Assistant',
  ],
  ['Navigate', 'Navegar', 'Navegar', 'Naviguer', 'Navigate'],
  ['Recent', 'Recentes', 'Recientes', 'Recents', 'Recent'],
  [
    'Ask again',
    'Perguntar novamente',
    'Preguntar de nuevo',
    'Demander encore',
    'Ask again',
  ],
  [
    'Suggested questions',
    'Perguntas sugeridas',
    'Preguntas sugeridas',
    'Questions suggerees',
    'Suggested questions',
  ],
  ['Ask', 'Perguntar', 'Preguntar', 'Demander', 'Ask'],
  [
    'Credit Score',
    'Pontuacao de credito',
    'Puntaje de credito',
    'Score de credit',
    'Credit Score',
  ],
  [
    'Credit score lab & report',
    'Laboratorio de score de credito e relatorio',
    'Laboratorio de puntaje de credito e informe',
    'Laboratoire de score de credit et rapport',
    'Credit score lab & report',
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

const uiTranslationOverrides: Record<TUiLocale, Record<string, string>> = {
  'en-US': {},
  'pt-BR': {
    'Subscription plans': 'Planos de assinatura',
    'Choose between Basic and Pro. Both include a 7-day free trial.':
      'Escolha entre Basico e Pro. Ambos incluem teste gratis de 7 dias.',
    'Choose between Starter and Pro. Both include a 7-day free trial.':
      'Escolha entre Starter e Pro. Ambos incluem teste gratis de 7 dias.',
    'Your account is in live-locked mode until you choose a paid plan. You can still continue in demo mode anytime.':
      'Sua conta esta bloqueada para modo real ate escolher um plano pago. Voce ainda pode continuar no modo demonstracao a qualquer momento.',
    'Start in demo mode, or unlock live account features with Basic or Pro. AI chat is available on paid plans only.':
      'Comece no modo demonstracao ou desbloqueie recursos reais com Basico ou Pro. O chat de IA esta disponivel apenas em planos pagos.',
    'Superuser access is active on this account. Pro features are enabled without billing.':
      'Acesso superusuario esta ativo nesta conta. Recursos Pro estao habilitados sem cobranca.',
    'Current subscription': 'Assinatura atual',
    'Plan:': 'Plano:',
    'Status:': 'Status:',
    'Trial ends:': 'Teste termina em:',
    'Opening portal...': 'Abrindo portal...',
    'Manage subscription': 'Gerenciar assinatura',
    'Demo mode': 'Modo demonstracao',
    'Explore the full interface with curated sample data before paying.':
      'Explore a interface completa com dados de exemplo antes de pagar.',
    'Instant access, no payment required':
      'Acesso imediato, sem pagamento necessario',
    'Sample transactions and walkthrough':
      'Transacoes de exemplo e tour guiado',
    'Safe environment for trying features':
      'Ambiente seguro para testar recursos',
    'Enter demo mode': 'Entrar no modo demonstracao',
    'Core finance tracking with structured monthly planning.':
      'Controle financeiro essencial com planejamento mensal estruturado.',
    'Accounts and transactions': 'Contas e transacoes',
    'Budgets and reminders': 'Orcamentos e lembretes',
    'Subscription tracking': 'Monitoramento de assinaturas',
    'AI Assistant access with standard request limits (up to 40 req/min).':
      'Acesso ao Assistente de IA com limites padrao de requisicoes (ate 40 req/min).',
    'AI Assistant access with guarded limits (30 req/min, 150 messages every 4 hours, auto reset).':
      'Acesso ao Assistente de IA com limites protegidos (30 req/min, 150 mensagens a cada 4 horas, reset automatico).',
    '7-day free trial': 'Teste gratis de 7 dias',
    'Everything in Basic plus premium AI guidance and power-user features.':
      'Tudo do Basico mais orientacao premium com IA e recursos avancados.',
    'Everything in Basic': 'Tudo do Basico',
    'Everything in Starter plus premium AI guidance and power-user features.':
      'Tudo do Starter mais orientacao premium com IA e recursos avancados.',
    'Everything in Starter': 'Tudo do Starter',
    'Financial Assistant access': 'Acesso ao Assistente Financeiro',
    'High-throughput AI Assistant access with fair-use safeguards (200 req/min, 5,000 messages every 4 hours).':
      'Acesso de alta capacidade ao Assistente de IA com protecoes de uso justo (200 req/min, 5.000 mensagens a cada 4 horas).',
    'High-throughput AI Assistant access with soft fair-use safeguards.':
      'Acesso de alta capacidade ao Assistente de IA com protecoes de uso justo.',
    'Advanced AI insights': 'Insights avancados de IA',
    'Priority support': 'Suporte prioritario',
    'Redirecting...': 'Redirecionando...',
    'Superuser access enabled': 'Acesso superusuario habilitado',
    'Current plan': 'Plano atual',
    'Start Basic trial': 'Iniciar teste do Basico',
    'Start Starter trial': 'Iniciar teste do Starter',
    'Start Pro trial': 'Iniciar teste do Pro',
    'Billing error': 'Erro de faturamento',
    'Unable to start checkout.': 'Nao foi possivel iniciar o checkout.',
    'Unable to open customer portal.':
      'Nao foi possivel abrir o portal do cliente.',
    'Checkout session URL was not returned.':
      'URL da sessao de checkout nao foi retornada.',
    'Customer portal URL was not returned.':
      'URL do portal do cliente nao foi retornada.',
    'Loading plan options...': 'Carregando opcoes de plano...',
    'Refresh status': 'Atualizar status',
    'Refreshing...': 'Atualizando...',
    'Plan status updated': 'Status do plano atualizado',
    'Plan details have been refreshed.':
      'Os detalhes do plano foram atualizados.',
    'Unable to refresh plan status.':
      'Nao foi possivel atualizar o status do plano.',
    'Friendly financial guidance, on demand.':
      'Orientacao financeira amigavel, sob demanda.',
    'Ask about spending, cash flow, or subscriptions and get clear next steps based on your activity.':
      'Pergunte sobre gastos, fluxo de caixa ou assinaturas e receba proximos passos claros com base na sua atividade.',
    'Using the last 90 days of activity.':
      'Usando os ultimos 90 dias de atividade.',
    'Ready to help': 'Pronto para ajudar',
    'Suggested prompts': 'Sugestoes de prompts',
    'Pick a starting point and I will take it from there.':
      'Escolha um ponto de partida e eu sigo daqui.',
    'Spending snapshot': 'Resumo de gastos',
    'Top categories': 'Principais categorias',
    'Cash position': 'Posicao de caixa',
    'Recurring charges': 'Cobrancas recorrentes',
    'Trend check': 'Verificar tendencia',
    'Next best step': 'Proximo melhor passo',
    'Context snapshot': 'Resumo de contexto',
    'What I can see right now.': 'O que posso ver agora.',
    'How I can help': 'Como posso ajudar',
    "Hi, I'm your Financial Assistant.": 'Oi, sou seu Assistente Financeiro.',
    'I can translate your data into clear, friendly guidance.':
      'Posso transformar seus dados em orientacoes claras e amigaveis.',
    'Try a prompt to get started.': 'Experimente um prompt para comecar.',
    'Press Enter to send, Shift + Enter for a new line.':
      'Pressione Enter para enviar, Shift + Enter para nova linha.',
    Send: 'Enviar',
    Thinking: 'Pensando',
    'Gathering insights...': 'Coletando insights...',
    You: 'Voce',
    Assistant: 'Assistente',
    'Pro feature': 'Recurso Pro',
    'Paid feature': 'Recurso pago',
    'Financial Assistant is available on the Pro plan.':
      'O Assistente Financeiro esta disponivel no plano Pro.',
    'Financial Assistant is available on Basic and Pro plans.':
      'O Assistente Financeiro esta disponivel nos planos Basico e Pro.',
    'Financial Assistant is available on Starter and Pro plans.':
      'O Assistente Financeiro esta disponivel nos planos Starter e Pro.',
    'Basic includes guarded AI usage limits, and Pro includes high-throughput access with fair-use safeguards.':
      'O Basico inclui limites protegidos de uso de IA e o Pro inclui acesso de alta capacidade com protecoes de uso justo.',
    'Upgrade to Pro to unlock AI guidance, advanced insight prompts, and personalized recommendations.':
      'Faca upgrade para Pro para desbloquear orientacoes com IA, prompts avancados e recomendacoes personalizadas.',
    'Starter includes standard AI usage limits, and Pro includes high-throughput access with soft fair-use safeguards.':
      'O Starter inclui limites padrao de uso de IA e o Pro inclui acesso de alta capacidade com protecoes de uso justo.',
    'Choose a plan': 'Escolher um plano',
    'Upgrade to Pro': 'Fazer upgrade para Pro',
    'Credit Score Lab': 'Laboratorio de Score de Credito',
    'Card Perks': 'Beneficios de cartao',
    'Credit Card Perk Insights': 'Insights de beneficios de cartao',
    'Track monthly credits and benefits for premium cards, with usage detection from your transactions.':
      'Acompanhe creditos e beneficios mensais de cartoes premium com deteccao de uso pelas suas transacoes.',
    'Loading card perk insights...':
      'Carregando insights de beneficios de cartao...',
    'Card perk insights are available on the Pro plan.':
      'Insights de beneficios de cartao estao disponiveis no plano Pro.',
    'Upgrade to Pro to unlock monthly perk tracking, expiration reminders, and merchant-level usage detection.':
      'Faca upgrade para Pro para desbloquear rastreamento mensal de beneficios, lembretes de expiracao e deteccao por estabelecimento.',
    'Eligible cards': 'Cartoes elegiveis',
    'Perks tracked': 'Beneficios monitorados',
    'Used this month': 'Usado neste mes',
    'Unused value': 'Valor nao utilizado',
    'No supported perk cards detected':
      'Nenhum cartao com beneficios suportados detectado',
    'Add or rename a credit card account to match supported perk programs such as American Express Gold.':
      'Adicione ou renomeie uma conta de cartao de credito para corresponder a programas suportados, como American Express Gold.',
    'Perk usage by card': 'Uso de beneficios por cartao',
    'Monthly credits and how much value you have already captured.':
      'Creditos mensais e quanto valor voce ja aproveitou.',
    Program: 'Programa:',
    Used: 'Usado',
    Partial: 'Parcial',
    Unused: 'Nao utilizado',
    Merchants: 'Estabelecimentos',
    'Expires in': 'Expira em',
    'No eligible transactions yet this month.':
      'Nenhuma transacao elegivel neste mes.',
    'expiring soon': 'expirando em breve',
    'Card perk expiring soon': 'Beneficio de cartao expirando em breve',
    'Remind when monthly card credits are still unused.':
      'Lembre quando creditos mensais do cartao ainda nao foram usados.',
    'Unused credit expiring within': 'Credito nao utilizado expirando em',
    'Pro-only credit health simulation and action plan.':
      'Simulacao de saude de credito e plano de acao exclusivos do Pro.',
    'Manage plan': 'Gerenciar plano',
    'Estimated score': 'Pontuacao estimada',
    'Educational estimate. Not an official bureau score.':
      'Estimativa educacional. Nao e uma pontuacao oficial de bureaus.',
    Excellent: 'Excelente',
    Good: 'Bom',
    Fair: 'Razoavel',
    'Needs attention': 'Requer atencao',
    Current: 'Atual',
    'If below 30%': 'Se abaixo de 30%',
    'If below 10%': 'Se abaixo de 10%',
    'Target paydown': 'Meta de amortizacao',
    Utilization: 'Utilizacao',
    'used of': 'usado de',
    'Payment load': 'Carga de pagamento',
    'Estimated monthly card payments against':
      'Pagamentos mensais estimados de cartao contra',
    'monthly income.': 'renda mensal.',
    'Score factors': 'Fatores da pontuacao',
    'Weighted internal model calibrated for practical decision support.':
      'Modelo interno ponderado calibrado para suporte pratico a decisoes.',
    'Utilization impact': 'Impacto da utilizacao',
    'Add credit limits to generate utilization analysis':
      'Adicione limites de credito para gerar analise de utilizacao',
    'Debt-to-income pressure': 'Pressao divida/renda',
    'Estimated minimum payments': 'Pagamentos minimos estimados',
    '/ month': '/ mes',
    'Cashflow reliability': 'Confiabilidade do fluxo de caixa',
    'monthly net cashflow margin': 'margem mensal de fluxo de caixa liquido',
    'Payment activity signal': 'Sinal de atividade de pagamento',
    'potential payment events in the last 90 days':
      'possiveis eventos de pagamento nos ultimos 90 dias',
    'Credit mix depth': 'Profundidade do mix de credito',
    'credit card account connected': 'conta de cartao de credito conectada',
    'credit card accounts connected': 'contas de cartao de credito conectadas',
    'Improvement actions': 'Acoes de melhoria',
    'Highest impact changes to raise your score trajectory.':
      'Mudancas de maior impacto para elevar sua trajetoria de score.',
    'This report is informational and should not be treated as an official lending score from Equifax, Experian, or TransUnion.':
      'Este relatorio e informativo e nao deve ser tratado como score oficial de credito da Equifax, Experian ou TransUnion.',
    'Account-level utilization report': 'Relatorio de utilizacao por conta',
    'Identify which cards to pay down first for the fastest score impact.':
      'Identifique quais cartoes amortizar primeiro para maior impacto no score.',
    'Add credit cards in Overview to unlock account-level reporting.':
      'Adicione cartoes de credito na Visao geral para liberar relatorios por conta.',
    'Current utilization': 'Utilizacao atual',
    Balance: 'Saldo',
    Limit: 'Limite',
    'To 30%': 'Ate 30%',
    Prioritize: 'Priorizar',
    'Unlock Pro to access score modeling, utilization simulations, and account-level improvement plans.':
      'Desbloqueie o Pro para acessar modelagem de score, simulacoes de utilizacao e planos de melhoria por conta.',
    'Basic covers live tracking. Pro adds deeper credit analytics and strategy guidance.':
      'O Basico cobre monitoramento em tempo real. O Pro adiciona analise de credito aprofundada e orientacao estrategica.',
    'Starter covers live tracking. Pro adds deeper credit analytics and strategy guidance.':
      'O Starter cobre monitoramento em tempo real. O Pro adiciona analise de credito aprofundada e orientacao estrategica.',
    'Loading your report...': 'Carregando seu relatorio...',
    'Budget planning': 'Planejamento de orcamento',
    'Forecast month-end utilization, catch overruns early, and keep each category on track.':
      'Preveja a utilizacao no fim do mes, antecipe estouros e mantenha cada categoria no caminho certo.',
    'Active budgets': 'Orcamentos ativos',
    'Total budgeted': 'Total orcado',
    'Spent to date': 'Gasto ate agora',
    'Budget Command Center': 'Central de comando de orcamentos',
    'Filter the workspace and prioritize highest-risk budgets.':
      'Filtre o workspace e priorize os orcamentos com maior risco.',
    'Reset filters': 'Redefinir filtros',
    'All status': 'Todos os status',
    Over: 'Estourado',
    Healthy: 'Saudavel',
    'All periods': 'Todos os periodos',
    Daily: 'Diario',
    Weekly: 'Semanal',
    Monthly: 'Mensal',
    Yearly: 'Anual',
    'Coverage Opportunities': 'Oportunidades de cobertura',
    'High-spend categories without a matching budget this month.':
      'Categorias de alto gasto sem orcamento correspondente neste mes.',
    'No uncovered category spend detected this month.':
      'Nenhum gasto sem cobertura detectado neste mes.',
    'Risk Timeline': 'Linha do tempo de risco',
    'Expected overrun sequence based on current spending pace.':
      'Sequencia esperada de estouro com base no ritmo atual de gastos.',
    'Already over': 'Ja estourado',
    'Projected risk': 'Risco projetado',
    'Estimated overrun date:': 'Data estimada de estouro:',
    'Overrun already reached in this window.':
      'O estouro ja foi atingido nesta janela.',
    'Projected overrun:': 'Estouro projetado:',
    'No near-term overruns detected with current filters.':
      'Nenhum estouro de curto prazo detectado com os filtros atuais.',
    'Quick Notes': 'Notas rapidas',
    'Fast interpretation of the current budget posture.':
      'Interpretacao rapida da situacao atual de orcamento.',
    'Active filter result:': 'Resultado do filtro ativo:',
    'Current filter status:': 'Status atual do filtro:',
    'Current filter period:': 'Periodo atual do filtro:',
    'Use filters to isolate risk clusters, then adjust budget amounts or category scope.':
      'Use filtros para isolar grupos de risco e depois ajuste valores ou escopo das categorias.',
    'Actionable Insights': 'Insights acionaveis',
    'Highest-impact adjustments based on current budget behavior.':
      'Ajustes de maior impacto com base no comportamento atual do orcamento.',
    'Period Mix': 'Mix de periodos',
    'Allocation across budget cadences.':
      'Distribuicao entre cadencias de orcamento.',
    Forecast: 'Previsao',
    'No budgets match the current filters':
      'Nenhum orcamento corresponde aos filtros atuais',
    'Adjust status or period filters to view more forecasts.':
      'Ajuste os filtros de status ou periodo para ver mais previsoes.',
    'Current utilization by budget.': 'Utilizacao atual por orcamento.',
    'Runway Guidance': 'Orientacao de folego',
    'Daily caps to prevent overruns before the budget window closes.':
      'Limites diarios para evitar estouros antes do fim da janela do orcamento.',
    'Remaining:': 'Restante:',
    'Days left:': 'Dias restantes:',
    'Daily cap:': 'Limite diario:',
    'No runway guidance available for current filters.':
      'Nenhuma orientacao de folego disponivel para os filtros atuais.',
    'Coverage Quality': 'Qualidade da cobertura',
    "How much this month's spend is represented by active budgets.":
      'Quanto do gasto deste mes esta representado por orcamentos ativos.',
    Coverage: 'Cobertura',
    'Covered expenses:': 'Despesas cobertas:',
    'Uncategorized expenses:': 'Despesas sem categoria:',
    'Category-scoped budgets:': 'Orcamentos com escopo por categoria:',
    'Unscoped budgets:': 'Orcamentos sem escopo:',
    'is projected over budget': 'esta projetado para estourar o orcamento',
    'is nearing its limit': 'esta se aproximando do limite',
    'Recommended daily cap:': 'Limite diario recomendado:',
    'Uncategorized expenses are reducing forecast accuracy':
      'Despesas sem categoria estao reduzindo a precisao da previsao',
    'is uncategorized this month.': 'esta sem categoria neste mes.',
    'Some budgets are not category-scoped':
      'Alguns orcamentos nao estao vinculados a categoria',
    'budget(s) apply broadly and can overlap reporting.':
      'orcamento(s) se aplicam de forma ampla e podem sobrepor relatorios.',
    'Budgets are currently on track': 'Orcamentos estao no caminho certo',
    'No projected overruns across active budget windows.':
      'Nenhum estouro projetado nas janelas ativas.',
    'Create your first budget to unlock forecasting':
      'Crie seu primeiro orcamento para desbloquear previsoes',
    'Add category-scoped budgets for the clearest insights.':
      'Adicione orcamentos por categoria para insights mais claros.',
    'Likely over around': 'Provavel estouro por volta de',
    'Remaining runway:': 'Folego restante:',
    'Active subscriptions only': 'Somente assinaturas ativas',
    'Projected annual spend': 'Gasto anual projetado',
    'monthly estimated ·': 'estimativa mensal ·',
    'high-risk alerts': 'alertas de alto risco',
    'Next 30 days of renewals.': 'Proximos 30 dias de renovacoes.',
    'Renewal risk, price changes, and likely-unused subscriptions from recent billing activity.':
      'Risco de renovacao, mudancas de preco e assinaturas possivelmente nao utilizadas com base na atividade recente.',
    'High-risk renewals': 'Renovacoes de alto risco',
    'Price increases': 'Aumentos de preco',
    'Likely unused': 'Possivelmente nao utilizada',
    'Estimated monthly savings': 'Economia mensal estimada',
    'No intelligence alerts right now': 'Nenhum alerta inteligente no momento',
    'As new charges arrive, this section will highlight risks and optimization opportunities.':
      'Quando novas cobrancas chegarem, esta secao destacara riscos e oportunidades de otimizacao.',
    'High risk': 'Alto risco',
    Stable: 'Estavel',
    '/month equivalent': '/mes equivalente',
    'Renews soon': 'Renova em breve',
    'Upgrade to Pro for cancellation and spend optimization recommendations.':
      'Faca upgrade para o Pro para recomendacoes de cancelamento e otimizacao de gastos.',
    'Pro unlocks price-change detection, likely-unused subscriptions, and projected monthly savings recommendations.':
      'O Pro desbloqueia deteccao de mudanca de preco, assinaturas possivelmente nao utilizadas e recomendacoes de economia mensal.',
    'Manage the subscriptions you are currently tracking.':
      'Gerencie as assinaturas que voce esta acompanhando.',
    'No active subscriptions yet': 'Ainda nao ha assinaturas ativas',
    'Add a detected subscription to start tracking renewals.':
      'Adicione uma assinatura detectada para comecar a acompanhar renovacoes.',
    Paused: 'Pausada',
    billing: 'cobranca',
    'Cancel subscription': 'Cancelar assinatura',
    'We will pause this subscription and guide you to finish cancellation with the provider.':
      'Vamos pausar esta assinatura e orientar voce a concluir o cancelamento com o provedor.',
    'Visit the provider billing page.':
      'Visite a pagina de cobranca do provedor.',
    'Confirm cancellation and save the confirmation email.':
      'Confirme o cancelamento e salve o email de confirmacao.',
    'Remove saved payment methods if required.':
      'Remova metodos de pagamento salvos se necessario.',
    'Keep active': 'Manter ativa',
    'Pause and start cancel': 'Pausar e iniciar cancelamento',
    'Transaction activity': 'Atividade de transacoes',
    'Net amount': 'Valor liquido',
    'Transaction History': 'Historico de transacoes',
    'All Categories': 'Todas as categorias',
    'All Types': 'Todos os tipos',
    Income: 'Receita',
    Expense: 'Despesa',
    'Toggle columns': 'Alternar colunas',
    'No transactions found': 'Nenhuma transacao encontrada',
    'Try adjusting your filters or search terms.':
      'Tente ajustar seus filtros ou termos de busca.',
    Categorizing: 'Categorizando',
    Categorize: 'Categorizar',
    'Loading transactions...': 'Carregando transacoes...',
    'Accounts overview': 'Visao geral de contas',
    'Manage your bank accounts, credit cards, and balances in one place.':
      'Gerencie suas contas bancarias, cartoes de credito e saldos em um so lugar.',
    'Hide Balances': 'Ocultar saldos',
    'Show Balances': 'Mostrar saldos',
    'Delete All': 'Excluir tudo',
    Across: 'Em',
    accounts: 'contas',
    'checking account': 'conta corrente',
    'checking accounts': 'contas correntes',
    'savings account': 'conta poupanca',
    'savings accounts': 'contas poupanca',
    'account connected': 'conta conectada',
    'accounts connected': 'contas conectadas',
    'Add New Account': 'Adicionar nova conta',
    'Add a bank account or credit card to track your finances.':
      'Adicione uma conta bancaria ou cartao de credito para acompanhar suas financas.',
    'Account Name': 'Nome da conta',
    'e.g., Chase Checking, Amex Gold': 'ex.: Conta Chase, Amex Gold',
    'Account Type': 'Tipo de conta',
    'Credit Card': 'Cartao de credito',
    Investment: 'Investimento',
    'Institution (Optional)': 'Instituicao (Opcional)',
    'Account Number (Optional)': 'Numero da conta (Opcional)',
    'Description (Optional)': 'Descricao (Opcional)',
    'Additional notes...': 'Notas adicionais...',
    'Your accounts': 'Suas contas',
    'No accounts yet': 'Ainda nao ha contas',
    'Add your first account to start tracking your finances.':
      'Adicione sua primeira conta para comecar a acompanhar suas financas.',
    'Add Your First Account': 'Adicionar sua primeira conta',
    'No recent activity': 'Sem atividade recente',
    'Last Activity': 'Ultima atividade',
    Showing: 'Mostrando',
    'Delete Account': 'Excluir conta',
    'Are you sure you want to delete this account? This action cannot be undone and will also delete all associated transactions.':
      'Tem certeza de que deseja excluir esta conta? Esta acao nao pode ser desfeita e tambem excluira todas as transacoes associadas.',
    'Deleting...': 'Excluindo...',
    'Delete All Accounts': 'Excluir todas as contas',
    'This is irreversible. All accounts, connected data, and transactions will be permanently deleted.':
      'Isto e irreversivel. Todas as contas, dados conectados e transacoes serao excluidos permanentemente.',
    'Create a Budget': 'Criar um orcamento',
    'Set spending limits for different categories':
      'Defina limites de gastos para diferentes categorias',
    'Create Budget': 'Criar orcamento',
    'Create Budge': 'Criar orcamento',
    'Budget Name': 'Nome do orcamento',
    'e.g., Groceries, Entertainment, Transportation':
      'ex.: Mercado, Entretenimento, Transporte',
    'Budget Amount': 'Valor do orcamento',
    'Category (Optional)': 'Categoria (Opcional)',
    'No specific category': 'Nenhuma categoria especifica',
    'Recurring Budget': 'Orcamento recorrente',
    'Start Date': 'Data de inicio',
    'End Date (Optional)': 'Data de termino (Opcional)',
    'Missing information': 'Informacoes ausentes',
    'Please enter a budget name.': 'Digite um nome para o orcamento.',
    'Please enter a valid budget amount.':
      'Digite um valor de orcamento valido.',
    'Missing date': 'Data ausente',
    'Please select a start date.': 'Selecione uma data de inicio.',
    'Please fill in all required fields.':
      'Preencha todos os campos obrigatorios.',
    'transactions match your filters':
      'transacoes correspondem aos seus filtros',
    'Renews in': 'Renova em',
    In: 'Em',
    days: 'dias',
    Sync: 'Sincronizar',
    Edit: 'Editar',
    'AI Financial Insights': 'Insights financeiros com IA',
    'AI Powered': 'Com IA',
    'Last analyzed:': 'Ultima analise:',
    'Analyzing your finances...': 'Analisando suas financas...',
    'Recommendations:': 'Recomendacoes:',
    'Refresh Insights': 'Atualizar insights',
    'Analyze Spending': 'Analisar gastos',
    'Review Goals': 'Revisar metas',
    'No insights yet': 'Ainda nao ha insights',
    'No insights available': 'Nenhum insight disponivel',
    'Add more transactions to get personalized insights.':
      'Adicione mais transacoes para receber insights personalizados.',
    'Track and manage your transaction history with smart categorization.':
      'Acompanhe e gerencie seu historico de transacoes com categorizacao inteligente.',
    'Detected subscriptions': 'Assinaturas detectadas',
    'Upcoming renewals': 'Proximas renovacoes',
    'No recurring patterns detected yet':
      'Nenhum padrao recorrente detectado ainda',
    'Add more transactions to improve detection accuracy.':
      'Adicione mais transacoes para melhorar a precisao da deteccao.',
    'Confirmed recurring charges': 'Cobrancas recorrentes confirmadas',
    'Review security activity, control access sessions, and manage data handling preferences.':
      'Revise atividade de seguranca, controle sessoes de acesso e gerencie preferencias de dados.',
    'Audit activity, access sessions, and data controls.':
      'Audite atividade, sessoes de acesso e controles de dados.',
    'Get fast answers, contact support, and resolve common issues without breaking your workflow.':
      'Obtenha respostas rapidas, contate o suporte e resolva problemas comuns sem interromper seu fluxo.',
    'Email support': 'Suporte por email',
    'Send account and billing questions to support@financeflow.dev.':
      'Envie duvidas de conta e cobranca para support@financeflow.dev.',
    'In-app chat': 'Chat no app',
    'Chat with a specialist during business hours for quick help.':
      'Converse com um especialista no horario comercial para ajuda rapida.',
    'Service updates': 'Atualizacoes do servico',
    'Review live platform status and maintenance notices.':
      'Revise o status da plataforma em tempo real e avisos de manutencao.',
    'How do I connect a new account?': 'Como conecto uma nova conta?',
    'Go to Dashboard, select Connect Bank Account, and complete the secure prompt.':
      'Va para o Dashboard, selecione Conectar conta bancaria e conclua o fluxo seguro.',
    'How do I update my subscription?': 'Como atualizo minha assinatura?',
    'Open Billing to change plans, update payment methods, or cancel your subscription.':
      'Abra Faturamento para trocar de plano, atualizar formas de pagamento ou cancelar sua assinatura.',
    'How can I export my data?': 'Como posso exportar meus dados?',
    'Use Export in Transactions to download your filtered activity.':
      'Use Exportar em Transacoes para baixar sua atividade filtrada.',
    'Your name': 'Seu nome',
    'you@example.com': 'voce@exemplo.com',
    'What do you need help with?': 'Com o que voce precisa de ajuda?',
    'Share the issue, your browser, and what you already tried.':
      'Descreva o problema, seu navegador e o que voce ja tentou.',
    'We usually reply within one business day.':
      'Normalmente respondemos em ate um dia util.',
    'Message sent successfully.': 'Mensagem enviada com sucesso.',
    'Unable to submit your message.': 'Nao foi possivel enviar sua mensagem.',
    'Sponsored tools': 'Ferramentas patrocinadas',
    'Add Account': 'Adicionar conta',
    'No credit cards connected': 'Nenhum cartao de credito conectado',
    'Current Balance': 'Saldo atual',
    'Credit Limit': 'Limite de credito',
    'Not scheduled': 'Nao agendado',
    'Add another low-fee card over time to improve your credit mix profile.':
      'Adicione outro cartao de baixa tarifa ao longo do tempo para melhorar seu mix de credito.',
    'Your savings rate is': 'Sua taxa de poupanca e',
    'Financial experts recommend saving at least':
      'Especialistas financeiros recomendam guardar pelo menos',
    'of your income.': 'da sua renda.',
    'Friendly, clear answers from your real data.':
      'Respostas claras e amigaveis com base nos seus dados reais.',
    'Supported popular cards': 'Cartoes populares suportados',
    'Pick a popular card template, then adjust values before saving.':
      'Escolha um modelo de cartao popular e ajuste os valores antes de salvar.',
    'Add credit card': 'Adicionar cartao de credito',
    'Add a card here to activate perk tracking and credit report analysis.':
      'Adicione um cartao aqui para ativar o rastreio de beneficios e a analise de credito.',
    'Card name': 'Nome do cartao',
    'Credit limit': 'Limite de credito',
    'Current balance': 'Saldo atual',
    'Adding card...': 'Adicionando cartao...',
    'Add card': 'Adicionar cartao',
    'Supported cards': 'Cartoes suportados',
    'Use this card': 'Usar este cartao',
    'Suggested limit:': 'Limite sugerido:',
    'Add credit cards here to unlock account-level reporting and utilization tracking.':
      'Adicione cartoes de credito aqui para liberar relatorios por conta e acompanhamento de utilizacao.',
    Basic: 'Basico',
    Starter: 'Inicial',
    Pro: 'Pro',
    'AI Assistant chat is disabled in demo mode':
      'O chat do Assistente de IA esta desativado no modo demonstracao',
    'AI chat is available on paid plans only.':
      'O chat de IA esta disponivel apenas em planos pagos.',
    'AI Assistant is unavailable in Starter/demo mode. Upgrade to Basic or Pro.':
      'O Assistente de IA nao esta disponivel no modo Starter/demonstracao. Faca upgrade para Basico ou Pro.',
    'A paid Basic or Pro subscription is required.':
      'E necessario um plano pago Basico ou Pro.',
    'Basic AI message window reached. Please wait for reset and try again.':
      'A janela de mensagens de IA do Basico foi atingida. Aguarde o reset e tente novamente.',
    'AI fair-use window reached. Please wait for reset and retry.':
      'A janela de uso justo da IA foi atingida. Aguarde o reset e tente novamente.',
    'Basic daily AI limit reached. Please try again after reset.':
      'O limite diario de IA do Basico foi atingido. Tente novamente apos o reset.',
    'Daily AI fair-use safeguard reached. Please try again after reset.':
      'A protecao diaria de uso justo da IA foi atingida. Tente novamente apos o reset.',
    'Low Savings Rate': 'Baixa taxa de poupanca',
    'Set up automatic transfers to savings account':
      'Configure transferencias automaticas para a conta de poupanca',
    'Review and reduce non-essential expenses':
      'Revise e reduza despesas nao essenciais',
    'Ask about spending, cash flow, or subscriptions...':
      'Pergunte sobre gastos, fluxo de caixa ou assinaturas...',
    'Rows per page:': 'Linhas por pagina:',
    'Rows per page': 'Linhas por pagina',
    Columns: 'Colunas',
    Export: 'Exportar',
    Previous: 'Anterior',
    Next: 'Proximo',
    'Previous page': 'Pagina anterior',
    'Next page': 'Proxima pagina',
    '0 results': '0 resultados',
    Description: 'Descricao',
    Category: 'Categoria',
    Account: 'Conta',
    Amount: 'Valor',
    Action: 'Acao',
    'Total income': 'Receita total',
    'Total expenses': 'Despesas totais',
    'Filtered transactions': 'Transacoes filtradas',
    'Outflows this view': 'Saidas nesta visualizacao',
    'Income minus expenses': 'Receita menos despesas',
    'Auto-detected subscriptions': 'Assinaturas detectadas automaticamente',
    'We detect recurring charges from your transactions and suggest subscriptions to track.':
      'Detectamos cobrancas recorrentes nas suas transacoes e sugerimos assinaturas para acompanhar.',
    'Active subscriptions': 'Assinaturas ativas',
    'Monthly cost': 'Custo mensal',
    'Yearly cost': 'Custo anual',
    'Detected candidates': 'Candidatos detectados',
    'Review these recurring charges and add the ones you want to track.':
      'Revise essas cobrancas recorrentes e adicione as assinaturas que deseja acompanhar.',
    'Subscription optimizer': 'Otimizador de assinaturas',
    'No recurring patterns detected yet.':
      'Nenhum padrao recorrente detectado ainda.',
    'At risk': 'Em risco',
    'Projected month-end utilization and overrun risk.':
      'Utilizacao projetada para o fim do mes e risco de estouro.',
    spent: 'gasto',
    budget: 'orcamento',
    Page: 'Pagina',
    of: 'de',
    to: 'a',
    'Projected:': 'Projetado:',
    result: 'resultado',
    results: 'resultados',
    'recent transactions': 'transacoes recentes',
    Hide: 'Ocultar',
    Show: 'Mostrar',
    'Last 4 digits': 'Ultimos 4 digitos',
    'e.g., Chase Bank, American Express': 'ex.: Chase Bank, American Express',
    Activate: 'Ativar',
    'Save changes': 'Salvar alteracoes',
    'Detected from recurring transactions':
      'Detectado de transacoes recorrentes',
    'Detected subscriptions are up to date.':
      'As assinaturas detectadas estao atualizadas.',
    'Scan complete': 'Verificacao concluida',
    'Subscription added': 'Assinatura adicionada',
    'Renewal reminder set': 'Lembrete de renovacao definido',
    'Renews within 24h': 'Renova em ate 24h',
    'Create Subscription': 'Criar assinatura',
    'Create a Subscription': 'Criar uma assinatura',
    'Track your recurring payments and subscriptions':
      'Acompanhe seus pagamentos e assinaturas recorrentes',
    'Add any additional notes about this subscription...':
      'Adicione notas adicionais sobre esta assinatura...',
    'Increase Savings': 'Aumentar poupanca',
    'Review Budget': 'Revisar orcamento',
    'Monitor Spending': 'Monitorar gastos',
    'Adjust Budget': 'Ajustar orcamento',
    'Review Transactions': 'Revisar transacoes',
    'Unusual Spending Detected': 'Gasto incomum detectado',
    'Consider setting a specific budget for this category':
      'Considere definir um orcamento especifico para esta categoria',
    'Look for ways to reduce spending in this area':
      'Procure formas de reduzir os gastos nesta area',
    'Review if this spending aligns with your financial goals':
      'Revise se este gasto esta alinhado com seus objetivos financeiros',
    'Consider the 50/30/20 budgeting rule':
      'Considere a regra de orcamento 50/30/20',
    'Review recent transactions in this category':
      'Revise transacoes recentes nesta categoria',
    'Consider increasing your budget for next month':
      'Considere aumentar seu orcamento para o proximo mes',
    'Monitor your spending closely for the rest of the month':
      'Monitore seus gastos de perto no restante do mes',
    'Consider reducing non-essential purchases':
      'Considere reduzir compras nao essenciais',
    'Review your budget allocation': 'Revise a alocacao do seu orcamento',
    'Increase your monthly savings contribution':
      'Aumente sua contribuicao mensal de poupanca',
    'Look for additional income opportunities':
      'Procure oportunidades adicionais de renda',
    'Review your goal timeline': 'Revise o cronograma da sua meta',
    'Consider setting a new financial goal':
      'Considere definir uma nova meta financeira',
    'Celebrate your achievement!': 'Comemore sua conquista!',
    'Review your next financial priorities':
      'Revise suas proximas prioridades financeiras',
    "Review these transactions to ensure they're legitimate":
      'Revise estas transacoes para garantir que sejam legitimas',
    'Consider if these are one-time expenses or recurring':
      'Considere se sao despesas pontuais ou recorrentes',
    'Update your budget if these are expected expenses':
      'Atualize seu orcamento se estas despesas forem esperadas',
    'No response generated.': 'Nenhuma resposta gerada.',
    'Assistant error': 'Erro do assistente',
    'Failed to get a response. Please check your OpenRouter setup.':
      'Nao foi possivel obter resposta. Verifique sua configuracao do OpenRouter.',
    'Failed to get a response. Please try again.':
      'Nao foi possivel obter resposta. Tente novamente.',
    'Track alerts, rules, and financial signals.':
      'Acompanhe alertas, regras e sinais financeiros.',
    'No alerts yet': 'Ainda nao ha alertas',
    'Not triggered yet': 'Ainda nao acionado',
    'New subscription added': 'Nova assinatura adicionada',
    'New recurring charge added.': 'Nova cobranca recorrente adicionada.',
    'Alert when a new recurring charge is detected.':
      'Alerta quando uma nova cobranca recorrente e detectada.',
    'Subscription due soon': 'Assinatura vence em breve',
    'Remind you before a subscription renews.':
      'Lembrar voce antes de uma assinatura renovar.',
    'Budget exceeded': 'Orcamento excedido',
    'Critical alert when a budget is overspent.':
      'Alerta critico quando um orcamento e ultrapassado.',
    'Budget nearing limit': 'Orcamento perto do limite',
    'Heads-up when a budget is close to its cap.':
      'Aviso quando um orcamento estiver perto do limite.',
    'Low cash balance': 'Saldo em caixa baixo',
    'Warn when combined checking and savings dip too low.':
      'Avisar quando conta corrente e poupanca combinadas ficarem muito baixas.',
    'Income trending down': 'Renda em queda',
    'Warn when income dips compared to last month.':
      'Avisar quando a renda cair em relacao ao mes passado.',
    'Spending spike detected': 'Pico de gastos detectado',
    'Detect unusual week-over-week spending increases.':
      'Detectar aumentos incomuns de gastos semana a semana.',
    'Large transaction': 'Transacao grande',
    'Flag unusually large expenses that need review.':
      'Sinalizar despesas incomuns de alto valor que precisam de revisao.',
    'Credit utilization elevated': 'Utilizacao de credito elevada',
    'Alert when credit card utilization stays high.':
      'Alerta quando a utilizacao do cartao de credito permanecer alta.',
    'Goal achieved': 'Meta alcancada',
    'Goal hits 100% funding.': 'Meta atinge 100% de financiamento.',
    'Goal deadline approaching': 'Prazo da meta se aproximando',
    'Prompt when goals are behind schedule.':
      'Alertar quando metas estiverem atrasadas.',
    'New goal added': 'Nova meta adicionada',
    'New goal created.': 'Nova meta criada.',
    'Confirm new goals are set up correctly.':
      'Confirme se novas metas foram configuradas corretamente.',
    'Close notifications': 'Fechar notificacoes',
    'Dismiss notification': 'Dispensar notificacao',
  },
  'es-ES': {},
  'fr-FR': {},
  'hi-IN': {},
}

const mergedUiTranslationDictionary: Record<
  TUiLocale,
  Record<string, string>
> = {
  'en-US': {
    ...uiTranslationDictionary['en-US'],
    ...uiTranslationOverrides['en-US'],
  },
  'pt-BR': {
    ...uiTranslationDictionary['pt-BR'],
    ...uiTranslationOverrides['pt-BR'],
  },
  'es-ES': {
    ...uiTranslationDictionary['es-ES'],
    ...uiTranslationOverrides['es-ES'],
  },
  'fr-FR': {
    ...uiTranslationDictionary['fr-FR'],
    ...uiTranslationOverrides['fr-FR'],
  },
  'hi-IN': {
    ...uiTranslationDictionary['hi-IN'],
    ...uiTranslationOverrides['hi-IN'],
  },
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

  const dictionary = mergedUiTranslationDictionary[normalizedLocale]
  const applyLocalizedPercentSpacing = (value: string) =>
    value.replace(/(\d+(?:[.,]\d+)?)%/g, '$1 %')
  const escapeForRegex = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const translatedText = dictionary[trimmedText] ?? trimmedText

  if (translatedText !== trimmedText) {
    return `${leadingWhitespace}${applyLocalizedPercentSpacing(
      translatedText
    )}${trailingWhitespace}`
  }

  const normalizedWhitespaceText = trimmedText.replace(/\s+/g, ' ').trim()
  const normalizedWhitespaceTranslation = dictionary[normalizedWhitespaceText]
  if (normalizedWhitespaceTranslation) {
    return `${leadingWhitespace}${applyLocalizedPercentSpacing(
      normalizedWhitespaceTranslation
    )}${trailingWhitespace}`
  }

  const detectRecurringSubscriptionsMatch = trimmedText.match(
    /^We detect recurring charges from your transactions and suggest\s+subscriptions to track\.?$/
  )
  if (detectRecurringSubscriptionsMatch) {
    const sentence =
      dictionary[
        'We detect recurring charges from your transactions and suggest subscriptions to track.'
      ] ??
      'We detect recurring charges from your transactions and suggest subscriptions to track.'
    return `${leadingWhitespace}${sentence}${trailingWhitespace}`
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

  const reminderDueSoonMatch = trimmedText.match(
    /^(.+)\s+is due within 24 hours\.$/
  )
  if (reminderDueSoonMatch) {
    const suffix =
      dictionary['is due within 24 hours.'] ?? 'is due within 24 hours.'
    return `${leadingWhitespace}${reminderDueSoonMatch[1]} ${suffix}${trailingWhitespace}`
  }

  const reminderOverdueMatch = trimmedText.match(/^(.+)\s+is overdue\.$/)
  if (reminderOverdueMatch) {
    const suffix = dictionary['is overdue.'] ?? 'is overdue.'
    return `${leadingWhitespace}${reminderOverdueMatch[1]} ${suffix}${trailingWhitespace}`
  }

  const recipientCountMatch = trimmedText.match(/^(\d+)\s+recipient(?:s)?$/)
  if (recipientCountMatch) {
    const count = recipientCountMatch[1]
    const singular = dictionary['recipient'] ?? 'recipient'
    const plural = dictionary['recipients'] ?? 'recipients'
    const nextLabel = count === '1' ? singular : plural
    return `${leadingWhitespace}${count} ${nextLabel}${trailingWhitespace}`
  }

  const recurringCountMatch = trimmedText.match(/^(\d+)\s+recurring$/)
  if (recurringCountMatch) {
    const recurringLabel = dictionary['recurring'] ?? 'recurring'
    return `${leadingWhitespace}${recurringCountMatch[1]} ${recurringLabel}${trailingWhitespace}`
  }

  const donationCountDateMatch = trimmedText.match(
    /^(\d+)\s+donation(?:s)?\s+·\s+(.+)$/
  )
  if (donationCountDateMatch) {
    const count = donationCountDateMatch[1]
    const singular = dictionary['donation'] ?? 'donation'
    const plural = dictionary['donations'] ?? 'donations'
    const donationLabel = count === '1' ? singular : plural
    return `${leadingWhitespace}${count} ${donationLabel} · ${donationCountDateMatch[2]}${trailingWhitespace}`
  }

  const cadenceLastNextMatch = trimmedText.match(
    /^(.+)\s+[·\u00b7]\s+Last\s+(.+?)(?:\s+[·\u00b7]\s+Next\s+(.+))?$/
  )
  if (cadenceLastNextMatch) {
    const cadence =
      dictionary[cadenceLastNextMatch[1]] ?? cadenceLastNextMatch[1]
    const lastLabel = dictionary['Last'] ?? 'Last'
    const nextLabel = dictionary['Next'] ?? 'Next'
    if (cadenceLastNextMatch[3]) {
      return `${leadingWhitespace}${cadence} · ${lastLabel} ${cadenceLastNextMatch[2]} · ${nextLabel} ${cadenceLastNextMatch[3]}${trailingWhitespace}`
    }
    return `${leadingWhitespace}${cadence} · ${lastLabel} ${cadenceLastNextMatch[2]}${trailingWhitespace}`
  }

  const lastDateMatch = trimmedText.match(/^Last\s+(.+)$/)
  if (lastDateMatch) {
    const label = dictionary['Last'] ?? 'Last'
    return `${leadingWhitespace}${label} ${lastDateMatch[1]}${trailingWhitespace}`
  }

  const nextDateMatch = trimmedText.match(/^Next\s+(?!step:)(.+)$/i)
  if (nextDateMatch) {
    const label = dictionary['Next'] ?? 'Next'
    return `${leadingWhitespace}${label} ${nextDateMatch[1]}${trailingWhitespace}`
  }

  const confidenceMatch = trimmedText.match(
    /^Confidence:\s*(\d+(?:[.,]\d+)?)%$/
  )
  if (confidenceMatch) {
    const label = dictionary['Confidence:'] ?? 'Confidence:'
    return `${leadingWhitespace}${label} ${applyLocalizedPercentSpacing(
      `${confidenceMatch[1]}%`
    )}${trailingWhitespace}`
  }

  const confidenceWithNextStepMatch = trimmedText.match(
    /^Confidence:\s*(\d+(?:[.,]\d+)?)%\s*Next step:\s*(.+)$/
  )
  if (confidenceWithNextStepMatch) {
    const confidenceLabel = dictionary['Confidence:'] ?? 'Confidence:'
    const nextStepLabel = dictionary['Next step:'] ?? 'Next step:'
    const localizedNextStep =
      dictionary[confidenceWithNextStepMatch[2]] ??
      confidenceWithNextStepMatch[2]
    const confidenceValue = applyLocalizedPercentSpacing(
      `${confidenceWithNextStepMatch[1]}%`
    )
    return `${leadingWhitespace}${confidenceLabel} ${confidenceValue} ${nextStepLabel} ${localizedNextStep}${trailingWhitespace}`
  }

  const localizedConfidenceLabel = dictionary['Confidence:'] ?? 'Confidence:'
  const localizedNextStepLabel = dictionary['Next step:'] ?? 'Next step:'
  const localizedConfidenceWithNextStepMatch = trimmedText.match(
    new RegExp(
      `^${escapeForRegex(localizedConfidenceLabel)}\\s*(\\d+(?:[.,]\\d+)?)%\\s*${escapeForRegex(localizedNextStepLabel)}\\s*(.+)$`,
      'i'
    )
  )
  if (localizedConfidenceWithNextStepMatch) {
    const localizedNextStep =
      dictionary[localizedConfidenceWithNextStepMatch[2]] ??
      localizedConfidenceWithNextStepMatch[2]
    const confidenceValue = applyLocalizedPercentSpacing(
      `${localizedConfidenceWithNextStepMatch[1]}%`
    )
    return `${leadingWhitespace}${localizedConfidenceLabel} ${confidenceValue} ${localizedNextStepLabel} ${localizedNextStep}${trailingWhitespace}`
  }

  const nextStepMatch = trimmedText.match(/^Next step:\s+(.+)$/)
  if (nextStepMatch) {
    const label = dictionary['Next step:'] ?? 'Next step:'
    const localizedNextStep = dictionary[nextStepMatch[1]] ?? nextStepMatch[1]
    return `${leadingWhitespace}${label} ${localizedNextStep}${trailingWhitespace}`
  }

  const localizedNextStepMatch = trimmedText.match(
    new RegExp(`^${escapeForRegex(localizedNextStepLabel)}\\s+(.+)$`, 'i')
  )
  if (localizedNextStepMatch) {
    const localizedNextStep =
      dictionary[localizedNextStepMatch[1]] ?? localizedNextStepMatch[1]
    return `${leadingWhitespace}${localizedNextStepLabel} ${localizedNextStep}${trailingWhitespace}`
  }

  const highSpendingMatch = trimmedText.match(/^High Spending in\s+(.+)$/)
  if (highSpendingMatch) {
    const label = dictionary['High Spending in'] ?? 'High Spending in'
    return `${leadingWhitespace}${label} ${highSpendingMatch[1]}${trailingWhitespace}`
  }

  const accountsForMatch = trimmedText.match(
    /^(.+)\s+accounts for\s+(\d+(?:[.,]\d+)?)%\s+of your total spending\.$/
  )
  if (accountsForMatch) {
    const accountsForLabel = dictionary['accounts for'] ?? 'accounts for'
    const suffix =
      dictionary['of your total spending.'] ?? 'of your total spending.'
    const percentageValue = applyLocalizedPercentSpacing(
      `${accountsForMatch[2]}%`
    )
    return `${leadingWhitespace}${accountsForMatch[1]} ${accountsForLabel} ${percentageValue} ${suffix}${trailingWhitespace}`
  }

  const overBudgetTitleMatch = trimmedText.match(/^Over Budget:\s+(.+)$/)
  if (overBudgetTitleMatch) {
    const label = dictionary['Over Budget:'] ?? 'Over Budget:'
    return `${leadingWhitespace}${label} ${overBudgetTitleMatch[1]}${trailingWhitespace}`
  }

  const budgetWarningTitleMatch = trimmedText.match(/^Budget Warning:\s+(.+)$/)
  if (budgetWarningTitleMatch) {
    const label = dictionary['Budget Warning:'] ?? 'Budget Warning:'
    return `${leadingWhitespace}${label} ${budgetWarningTitleMatch[1]}${trailingWhitespace}`
  }

  const exceededBudgetMatch = trimmedText.match(
    /^You've exceeded your\s+(.+)\s+budget by\s+(.+)\.$/
  )
  if (exceededBudgetMatch) {
    const firstPart =
      dictionary["You've exceeded your"] ?? "You've exceeded your"
    const secondPart = dictionary['budget by'] ?? 'budget by'
    return `${leadingWhitespace}${firstPart} ${exceededBudgetMatch[1]} ${secondPart} ${exceededBudgetMatch[2]}.${trailingWhitespace}`
  }

  const budgetProgressMatch = trimmedText.match(
    /^You're at\s+(\d+(?:[.,]\d+)?)%\s+of your\s+(.+)\s+budget\.$/
  )
  if (budgetProgressMatch) {
    const firstPart = dictionary["You're at"] ?? "You're at"
    const middle = dictionary['of your'] ?? 'of your'
    const suffix = dictionary['budget.'] ?? 'budget.'
    const percentageValue = applyLocalizedPercentSpacing(
      `${budgetProgressMatch[1]}%`
    )
    return `${leadingWhitespace}${firstPart} ${percentageValue} ${middle} ${budgetProgressMatch[2]} ${suffix}${trailingWhitespace}`
  }

  const behindGoalMatch = trimmedText.match(/^Behind on Goal:\s+(.+)$/)
  if (behindGoalMatch) {
    const label = dictionary['Behind on Goal:'] ?? 'Behind on Goal:'
    return `${leadingWhitespace}${label} ${behindGoalMatch[1]}${trailingWhitespace}`
  }

  const achievedGoalMatch = trimmedText.match(/^Goal Achieved:\s+(.+)$/)
  if (achievedGoalMatch) {
    const label = dictionary['Goal Achieved:'] ?? 'Goal Achieved:'
    return `${leadingWhitespace}${label} ${achievedGoalMatch[1]}${trailingWhitespace}`
  }

  const goalProgressMatch = trimmedText.match(
    /^You're at\s+(\d+(?:[.,]\d+)?)%\s+of your\s+(.+)\s+goal\.$/
  )
  if (goalProgressMatch) {
    const firstPart = dictionary["You're at"] ?? "You're at"
    const middle = dictionary['of your'] ?? 'of your'
    const suffix = dictionary['goal.'] ?? 'goal.'
    const percentageValue = applyLocalizedPercentSpacing(
      `${goalProgressMatch[1]}%`
    )
    return `${leadingWhitespace}${firstPart} ${percentageValue} ${middle} ${goalProgressMatch[2]} ${suffix}${trailingWhitespace}`
  }

  const goalCompletedDescriptionMatch = trimmedText.match(
    /^Congratulations!\s+You've reached your\s+(.+)\s+goal\.$/
  )
  if (goalCompletedDescriptionMatch) {
    const firstPart =
      dictionary["Congratulations! You've reached your"] ??
      "Congratulations! You've reached your"
    const suffix = dictionary['goal.'] ?? 'goal.'
    return `${leadingWhitespace}${firstPart} ${goalCompletedDescriptionMatch[1]} ${suffix}${trailingWhitespace}`
  }

  const unusualTransactionsMatch = trimmedText.match(
    /^Found\s+(\d+)\s+transaction\(s\)\s+significantly larger than your average\.$/
  )
  if (unusualTransactionsMatch) {
    const firstPart = dictionary['Found'] ?? 'Found'
    const secondPart = dictionary['transaction(s)'] ?? 'transaction(s)'
    const thirdPart =
      dictionary['significantly larger than your average.'] ??
      'significantly larger than your average.'
    return `${leadingWhitespace}${firstPart} ${unusualTransactionsMatch[1]} ${secondPart} ${thirdPart}${trailingWhitespace}`
  }

  const transactionsMatchFilterMatch = trimmedText.match(
    /^(\d+)\s+transactions\s+match\s+your\s+filters$/
  )
  if (transactionsMatchFilterMatch) {
    const suffix =
      dictionary['transactions match your filters'] ??
      'transactions match your filters'
    return `${leadingWhitespace}${transactionsMatchFilterMatch[1]} ${suffix}${trailingWhitespace}`
  }

  const recentTransactionsMatch = trimmedText.match(
    /^(\d+)\s+recent\s+transactions$/
  )
  if (recentTransactionsMatch) {
    const count = recentTransactionsMatch[1]
    const suffix = dictionary['recent transactions'] ?? 'recent transactions'
    return `${leadingWhitespace}${count} ${suffix}${trailingWhitespace}`
  }

  const pageCountMatch = trimmedText.match(/^Page\s+(\d+)\s+of\s+(\d+)$/)
  if (pageCountMatch) {
    const pageLabel = dictionary['Page'] ?? 'Page'
    const ofLabel = dictionary['of'] ?? 'of'
    return `${leadingWhitespace}${pageLabel} ${pageCountMatch[1]} ${ofLabel} ${pageCountMatch[2]}${trailingWhitespace}`
  }

  const showingResultsMatch = trimmedText.match(
    /^Showing\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)\s+results$/
  )
  if (showingResultsMatch) {
    const showingLabel = dictionary['Showing'] ?? 'Showing'
    const toLabel = dictionary['to'] ?? 'to'
    const ofLabel = dictionary['of'] ?? 'of'
    const resultsLabel = dictionary['results'] ?? 'results'
    return `${leadingWhitespace}${showingLabel} ${showingResultsMatch[1]} ${toLabel} ${showingResultsMatch[2]} ${ofLabel} ${showingResultsMatch[3]} ${resultsLabel}${trailingWhitespace}`
  }

  const compactRangeResultsMatch = trimmedText.match(
    /^(\d+)-(\d+)\s+of\s+(\d+)$/
  )
  if (compactRangeResultsMatch) {
    const ofLabel = dictionary['of'] ?? 'of'
    return `${leadingWhitespace}${compactRangeResultsMatch[1]}-${compactRangeResultsMatch[2]} ${ofLabel} ${compactRangeResultsMatch[3]}${trailingWhitespace}`
  }

  const resultCountMatch = trimmedText.match(/^(\d+)\s+result(?:s)?$/)
  if (resultCountMatch) {
    const count = resultCountMatch[1]
    const singular = dictionary['result'] ?? 'result'
    const plural = dictionary['results'] ?? 'results'
    return `${leadingWhitespace}${count} ${count === '1' ? singular : plural}${trailingWhitespace}`
  }

  const statusCountMatch = trimmedText.match(
    /^(Over|Warning|Healthy)\s+\((\d+)\)$/
  )
  if (statusCountMatch) {
    const label = dictionary[statusCountMatch[1]] ?? statusCountMatch[1]
    return `${leadingWhitespace}${label} (${statusCountMatch[2]})${trailingWhitespace}`
  }

  const monthlyEstimateMatch = trimmedText.match(
    /^(.+)\s+monthly estimated(?:\s+[·\u00b7]\s+(\d+)\s+high-risk alerts)?$/
  )
  if (monthlyEstimateMatch) {
    const monthlyLabel =
      dictionary['monthly estimated ·'] ?? 'monthly estimated ·'
    if (monthlyEstimateMatch[2]) {
      const highRiskLabel = dictionary['high-risk alerts'] ?? 'high-risk alerts'
      return `${leadingWhitespace}${monthlyEstimateMatch[1]} ${monthlyLabel} ${monthlyEstimateMatch[2]} ${highRiskLabel}${trailingWhitespace}`
    }
    const monthlyWithoutDot = monthlyLabel.replace(/\s*[·\u00b7]\s*$/, '')
    return `${leadingWhitespace}${monthlyEstimateMatch[1]} ${monthlyWithoutDot}${trailingWhitespace}`
  }

  const spentBudgetMatch = trimmedText.match(
    /^(.+)\s+spent\s+[·\u00b7]\s+(.+)\s+budget$/
  )
  if (spentBudgetMatch) {
    const spentLabel = dictionary['spent'] ?? 'spent'
    const budgetLabel = dictionary['budget'] ?? 'budget'
    return `${leadingWhitespace}${spentBudgetMatch[1]} ${spentLabel} · ${spentBudgetMatch[2]} ${budgetLabel}${trailingWhitespace}`
  }

  const projectedUtilizationMatch = trimmedText.match(
    /^Projected:\s+(.+)\s+\((\d+(?:[.,]\d+)?)%\)$/
  )
  if (projectedUtilizationMatch) {
    const projectedLabel = dictionary['Projected:'] ?? 'Projected:'
    const percentageValue = applyLocalizedPercentSpacing(
      `${projectedUtilizationMatch[2]}%`
    )
    return `${leadingWhitespace}${projectedLabel} ${projectedUtilizationMatch[1]} (${percentageValue})${trailingWhitespace}`
  }

  const remainingRunwayMatch = trimmedText.match(
    /^Remaining runway:\s+(.+)\.?$/
  )
  if (remainingRunwayMatch) {
    const label = dictionary['Remaining runway:'] ?? 'Remaining runway:'
    return `${leadingWhitespace}${label} ${remainingRunwayMatch[1]}.${trailingWhitespace}`
  }

  const minimumPaymentsMatch = trimmedText.match(
    /^Estimated minimum payments\s+(.+)\s+\/\s*month$/
  )
  if (minimumPaymentsMatch) {
    const label =
      dictionary['Estimated minimum payments'] ?? 'Estimated minimum payments'
    const suffix = dictionary['/ month'] ?? '/ month'
    return `${leadingWhitespace}${label} ${minimumPaymentsMatch[1]} ${suffix}${trailingWhitespace}`
  }

  const monthlyCashflowMarginMatch = trimmedText.match(
    /^(\d+(?:[.,]\d+)?)%\s+monthly net cashflow margin$/
  )
  if (monthlyCashflowMarginMatch) {
    const suffix =
      dictionary['monthly net cashflow margin'] ?? 'monthly net cashflow margin'
    const percentageValue = applyLocalizedPercentSpacing(
      `${monthlyCashflowMarginMatch[1]}%`
    )
    return `${leadingWhitespace}${percentageValue} ${suffix}${trailingWhitespace}`
  }

  const paymentEventsMatch = trimmedText.match(
    /^(\d+)\s+potential payment events in the last 90 days$/
  )
  if (paymentEventsMatch) {
    const suffix =
      dictionary['potential payment events in the last 90 days'] ??
      'potential payment events in the last 90 days'
    return `${leadingWhitespace}${paymentEventsMatch[1]} ${suffix}${trailingWhitespace}`
  }

  const creditCardAccountsConnectedMatch = trimmedText.match(
    /^(\d+)\s+credit card account(?:s)?\s+connected$/
  )
  if (creditCardAccountsConnectedMatch) {
    const count = creditCardAccountsConnectedMatch[1]
    const singular =
      dictionary['credit card account connected'] ??
      'credit card account connected'
    const plural =
      dictionary['credit card accounts connected'] ??
      'credit card accounts connected'
    return `${leadingWhitespace}${count} ${count === '1' ? singular : plural}${trailingWhitespace}`
  }

  const accountsAcrossMatch = trimmedText.match(/^Across\s+(\d+)\s+accounts$/)
  if (accountsAcrossMatch) {
    const prefix = dictionary['Across'] ?? 'Across'
    const suffix = dictionary['accounts'] ?? 'accounts'
    return `${leadingWhitespace}${prefix} ${accountsAcrossMatch[1]} ${suffix}${trailingWhitespace}`
  }

  const checkingAccountsMatch = trimmedText.match(
    /^(\d+)\s+checking\s+account(?:s)?$/
  )
  if (checkingAccountsMatch) {
    const count = checkingAccountsMatch[1]
    const singular = dictionary['checking account'] ?? 'checking account'
    const plural = dictionary['checking accounts'] ?? 'checking accounts'
    return `${leadingWhitespace}${count} ${
      count === '1' ? singular : plural
    }${trailingWhitespace}`
  }

  const savingsAccountsMatch = trimmedText.match(
    /^(\d+)\s+savings\s+account(?:s)?$/
  )
  if (savingsAccountsMatch) {
    const count = savingsAccountsMatch[1]
    const singular = dictionary['savings account'] ?? 'savings account'
    const plural = dictionary['savings accounts'] ?? 'savings accounts'
    return `${leadingWhitespace}${count} ${
      count === '1' ? singular : plural
    }${trailingWhitespace}`
  }

  const connectedAccountsMatch = trimmedText.match(
    /^(\d+)\s+account(?:s)?\s+connected$/
  )
  if (connectedAccountsMatch) {
    const count = connectedAccountsMatch[1]
    const singular = dictionary['account connected'] ?? 'account connected'
    const plural = dictionary['accounts connected'] ?? 'accounts connected'
    return `${leadingWhitespace}${count} ${
      count === '1' ? singular : plural
    }${trailingWhitespace}`
  }

  const renewsInDaysMatch = trimmedText.match(/^Renews in\s+(\d+)\s+days$/)
  if (renewsInDaysMatch) {
    const prefix = dictionary['Renews in'] ?? 'Renews in'
    const suffix = dictionary['days'] ?? 'days'
    return `${leadingWhitespace}${prefix} ${renewsInDaysMatch[1]} ${suffix}${trailingWhitespace}`
  }

  const inDaysMatch = trimmedText.match(/^In\s+(\d+)\s+days$/)
  if (inDaysMatch) {
    const prefix = dictionary['In'] ?? 'In'
    const suffix = dictionary['days'] ?? 'days'
    return `${leadingWhitespace}${prefix} ${inDaysMatch[1]} ${suffix}${trailingWhitespace}`
  }

  const lastNinetyDaysSummaryMatch = trimmedText.match(
    /^Using the last 90 days of activity\.\s+(.+)$/
  )
  if (lastNinetyDaysSummaryMatch) {
    const prefix =
      dictionary['Using the last 90 days of activity.'] ??
      'Using the last 90 days of activity.'
    return `${leadingWhitespace}${prefix} ${lastNinetyDaysSummaryMatch[1]}${trailingWhitespace}`
  }

  const monthlyLastNextMatch = trimmedText.match(
    /^Monthly\s+[·\u00b7]\s+Last\s+(.+)\s+[·\u00b7]\s+Next\s+(.+)$/
  )
  if (monthlyLastNextMatch) {
    const monthlyLabel = dictionary['Monthly'] ?? 'Monthly'
    const lastLabel = dictionary['Last'] ?? 'Last'
    const nextLabel = dictionary['Next'] ?? 'Next'
    return `${leadingWhitespace}${monthlyLabel} · ${lastLabel} ${monthlyLastNextMatch[1]} · ${nextLabel} ${monthlyLastNextMatch[2]}${trailingWhitespace}`
  }

  const savingsRateSentenceMatch = trimmedText.match(
    /^Your savings rate is\s+(\d+(?:[.,]\d+)?)%\.\s+Financial experts recommend saving at least\s+(\d+(?:[.,]\d+)?)%\s+of your income\.$/
  )
  if (savingsRateSentenceMatch) {
    const prefix = dictionary['Your savings rate is'] ?? 'Your savings rate is'
    const middle =
      dictionary['Financial experts recommend saving at least'] ??
      'Financial experts recommend saving at least'
    const suffix = dictionary['of your income.'] ?? 'of your income.'
    const currentRate = applyLocalizedPercentSpacing(
      `${savingsRateSentenceMatch[1]}%`
    )
    const targetRate = applyLocalizedPercentSpacing(
      `${savingsRateSentenceMatch[2]}%`
    )
    return `${leadingWhitespace}${prefix} ${currentRate}. ${middle} ${targetRate} ${suffix}${trailingWhitespace}`
  }

  return `${leadingWhitespace}${applyLocalizedPercentSpacing(
    translatedText
  )}${trailingWhitespace}`
}

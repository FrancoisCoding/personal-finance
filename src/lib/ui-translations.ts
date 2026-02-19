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

  const translatedText =
    uiTranslationDictionary[normalizedLocale][trimmedText] ?? trimmedText
  return `${leadingWhitespace}${translatedText}${trailingWhitespace}`
}

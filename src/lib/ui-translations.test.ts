import { normalizeUiLocale, translateUiText } from '@/lib/ui-translations'

describe('ui translations', () => {
  it('normalizes unsupported locales to default', () => {
    expect(normalizeUiLocale('unknown')).toBe('en-US')
    expect(normalizeUiLocale('pt-BR')).toBe('pt-BR')
  })

  it('translates known labels', () => {
    expect(translateUiText('Overview', 'pt-BR')).toBe('Visao geral')
    expect(translateUiText('Sign out', 'es-ES')).toBe('Cerrar sesion')
    expect(translateUiText('Support', 'fr-FR')).toBe('Support')
    expect(translateUiText('Budget Forecast', 'pt-BR')).toBe(
      'Previsao de orcamento'
    )
    expect(translateUiText('Cash Flow Planning Strip', 'pt-BR')).toBe(
      'Linha de planejamento de fluxo de caixa'
    )
  })

  it('preserves whitespace around translated values', () => {
    expect(translateUiText('  Save  ', 'pt-BR')).toBe('  Salvar  ')
  })

  it('returns source text when translation key is missing', () => {
    expect(translateUiText('Completely Unknown Label', 'pt-BR')).toBe(
      'Completely Unknown Label'
    )
  })

  it('translates welcome heading template with dynamic user names', () => {
    expect(translateUiText('Welcome back, Isaiah!', 'pt-BR')).toBe(
      'Bem-vindo de volta, Isaiah!'
    )
  })

  it('translates month-over-month trend templates', () => {
    expect(translateUiText('Up 5.3% from last month', 'pt-BR')).toBe(
      'Subiu 5.3% em relacao ao mes passado'
    )
    expect(translateUiText('Down 12.0% vs last month', 'pt-BR')).toBe(
      'Caiu 12.0% em relacao ao mes passado'
    )
  })

  it('uses contextual phrasing for dashboard helper copy', () => {
    expect(
      translateUiText("Here's your financial overview for this month", 'es-ES')
    ).toBe('Aqui tienes tu resumen financiero de este mes')
    expect(translateUiText('Over risk', 'fr-FR')).toBe('A risque')
  })

  it('translates reminder and donation dynamic templates', () => {
    expect(translateUiText('Mortgage is due within 24 hours.', 'pt-BR')).toBe(
      'Mortgage vence em ate 24 horas.'
    )
    expect(translateUiText('Gym is overdue.', 'es-ES')).toBe(
      'Gym esta vencido.'
    )
    expect(translateUiText('2 recipients', 'fr-FR')).toBe('2 destinataires')
    expect(translateUiText('1 donation · Feb 19, 2026', 'pt-BR')).toBe(
      '1 doacao · Feb 19, 2026'
    )
  })

  it('translates AI insight dynamic templates', () => {
    expect(translateUiText('High Spending in Housing', 'pt-BR')).toBe(
      'Gasto elevado em Housing'
    )
    expect(
      translateUiText(
        'Housing accounts for 71.4% of your total spending.',
        'es-ES'
      )
    ).toBe('Housing representa 71.4 % de tu gasto total.')
    expect(translateUiText('Confidence: 85%', 'fr-FR')).toBe('Confiance : 85 %')
    expect(translateUiText('Next step: Review Budget', 'pt-BR')).toBe(
      'Proximo passo: Revisar orcamento'
    )
    expect(
      translateUiText('Confianca: 92%Proximo passo: Increase Savings', 'pt-BR')
    ).toBe('Confianca: 92 % Proximo passo: Aumentar poupanca')
    expect(translateUiText('Next step: Increase Savings', 'pt-BR')).toBe(
      'Proximo passo: Aumentar poupanca'
    )
  })

  it('translates account and transaction count templates', () => {
    expect(translateUiText('53 transactions match your filters', 'pt-BR')).toBe(
      '53 transacoes correspondem aos seus filtros'
    )
    expect(translateUiText('Across 4 accounts', 'pt-BR')).toBe('Em 4 contas')
    expect(translateUiText('1 checking account', 'pt-BR')).toBe(
      '1 conta corrente'
    )
    expect(translateUiText('3 savings accounts', 'pt-BR')).toBe(
      '3 contas poupanca'
    )
    expect(translateUiText('2 accounts connected', 'pt-BR')).toBe(
      '2 contas conectadas'
    )
  })

  it('translates renewal and activity summary templates', () => {
    expect(translateUiText('Renews in 11 days', 'pt-BR')).toBe(
      'Renova em 11 dias'
    )
    expect(translateUiText('In 5 days', 'pt-BR')).toBe('Em 5 dias')
    expect(
      translateUiText(
        'Using the last 90 days of activity. 53 transactions | 1 accounts | 2 subscriptions',
        'pt-BR'
      )
    ).toBe(
      'Usando os ultimos 90 dias de atividade. 53 transactions | 1 accounts | 2 subscriptions'
    )
  })

  it('translates pagination and range summary templates', () => {
    expect(translateUiText('Page 1 of 3', 'pt-BR')).toBe('Pagina 1 de 3')
    expect(translateUiText('20 results', 'pt-BR')).toBe('20 resultados')
    expect(translateUiText('Rows per page:', 'pt-BR')).toBe(
      'Linhas por pagina:'
    )
    expect(translateUiText('Rows per page', 'pt-BR')).toBe('Linhas por pagina')
    expect(translateUiText('Showing 1 to 20 of 53 results', 'pt-BR')).toBe(
      'Mostrando 1 a 20 de 53 resultados'
    )
    expect(translateUiText('1-20 of 53', 'pt-BR')).toBe('1-20 de 53')
    expect(translateUiText('Previous', 'pt-BR')).toBe('Anterior')
    expect(translateUiText('Next', 'pt-BR')).toBe('Proximo')
    expect(translateUiText('Columns', 'pt-BR')).toBe('Colunas')
    expect(translateUiText('Export', 'pt-BR')).toBe('Exportar')
  })

  it('translates transaction table columns and controls', () => {
    expect(translateUiText('Description', 'pt-BR')).toBe('Descricao')
    expect(translateUiText('Category', 'pt-BR')).toBe('Categoria')
    expect(translateUiText('Account', 'pt-BR')).toBe('Conta')
    expect(translateUiText('Amount', 'pt-BR')).toBe('Valor')
    expect(translateUiText('Action', 'pt-BR')).toBe('Acao')
    expect(translateUiText('Type', 'pt-BR')).toBe('Tipo')
    expect(translateUiText('All Categories', 'pt-BR')).toBe(
      'Todas as categorias'
    )
    expect(translateUiText('All Types', 'pt-BR')).toBe('Todos os tipos')
    expect(translateUiText('Income', 'pt-BR')).toBe('Receita')
    expect(translateUiText('Expense', 'pt-BR')).toBe('Despesa')
    expect(translateUiText('Categorize', 'pt-BR')).toBe('Categorizar')
    expect(translateUiText('Categorizing', 'pt-BR')).toBe('Categorizando')
    expect(translateUiText('No transactions found', 'pt-BR')).toBe(
      'Nenhuma transacao encontrada'
    )
    expect(
      translateUiText('Try adjusting your filters or search terms.', 'pt-BR')
    ).toBe('Tente ajustar seus filtros ou termos de busca.')
  })

  it('translates dynamic budget and subscription helper templates', () => {
    expect(translateUiText('Over (2)', 'pt-BR')).toBe('Estourado (2)')
    expect(translateUiText('R$ 0,00 spent · R$ 50,00 budget', 'pt-BR')).toBe(
      'R$ 0,00 gasto · R$ 50,00 orcamento'
    )
    expect(translateUiText('Projected: R$ 0,00 (0%)', 'pt-BR')).toBe(
      'Projetado: R$ 0,00 (0 %)'
    )
    expect(translateUiText('R$ 0,00 monthly estimated', 'pt-BR')).toBe(
      'R$ 0,00 estimativa mensal'
    )
  })

  it('translates support page copy and placeholder text', () => {
    expect(
      translateUiText(
        'Get fast answers, contact support, and resolve common issues without breaking your workflow.',
        'pt-BR'
      )
    ).toBe(
      'Obtenha respostas rapidas, contate o suporte e resolva problemas comuns sem interromper seu fluxo.'
    )
    expect(
      translateUiText(
        'Get fast answers, contact support, and resolve common issues without\n            breaking your workflow.',
        'pt-BR'
      )
    ).toBe(
      'Obtenha respostas rapidas, contate o suporte e resolva problemas comuns sem interromper seu fluxo.'
    )
    expect(translateUiText('Email support', 'pt-BR')).toBe('Suporte por email')
    expect(translateUiText('In-app chat', 'pt-BR')).toBe('Chat no app')
    expect(translateUiText('Service updates', 'pt-BR')).toBe(
      'Atualizacoes do servico'
    )
    expect(translateUiText('Your name', 'pt-BR')).toBe('Seu nome')
    expect(translateUiText('you@example.com', 'pt-BR')).toBe('voce@exemplo.com')
    expect(translateUiText('What do you need help with?', 'pt-BR')).toBe(
      'Com o que voce precisa de ajuda?'
    )
    expect(
      translateUiText(
        'Share the issue, your browser, and what you already tried.',
        'pt-BR'
      )
    ).toBe('Descreva o problema, seu navegador e o que voce ja tentou.')
  })

  it('translates alerts center labels and empty states', () => {
    expect(translateUiText('Alerts center', 'pt-BR')).toBe('Central de alertas')
    expect(translateUiText('You are all caught up.', 'pt-BR')).toBe(
      'Voce esta em dia com tudo.'
    )
    expect(translateUiText('History', 'pt-BR')).toBe('Historico')
    expect(translateUiText('Rules', 'pt-BR')).toBe('Regras')
    expect(translateUiText('Mark all read', 'pt-BR')).toBe(
      'Marcar todas como lidas'
    )
    expect(translateUiText('Clear read', 'pt-BR')).toBe('Limpar lidas')
    expect(translateUiText('Clear all', 'pt-BR')).toBe('Limpar tudo')
    expect(translateUiText('All', 'pt-BR')).toBe('Todos')
    expect(translateUiText('Unread', 'pt-BR')).toBe('Nao lidas')
    expect(translateUiText('Read', 'pt-BR')).toBe('Lidas')
    expect(translateUiText('No notifications', 'pt-BR')).toBe(
      'Sem notificacoes'
    )
    expect(translateUiText('Everything is up to date.', 'pt-BR')).toBe(
      'Tudo esta atualizado.'
    )
  })

  it('translates create budget modal labels and helper text', () => {
    expect(translateUiText('Create a Budget', 'pt-BR')).toBe(
      'Criar um orcamento'
    )
    expect(
      translateUiText('Set spending limits for different categories', 'pt-BR')
    ).toBe('Defina limites de gastos para diferentes categorias')
    expect(translateUiText('Create Budget', 'pt-BR')).toBe('Criar orcamento')
    expect(translateUiText('Create Budge', 'pt-BR')).toBe('Criar orcamento')
    expect(translateUiText('Budget Name', 'pt-BR')).toBe('Nome do orcamento')
    expect(
      translateUiText('e.g., Groceries, Entertainment, Transportation', 'pt-BR')
    ).toBe('ex.: Mercado, Entretenimento, Transporte')
    expect(translateUiText('Budget Amount', 'pt-BR')).toBe('Valor do orcamento')
    expect(translateUiText('Category (Optional)', 'pt-BR')).toBe(
      'Categoria (Opcional)'
    )
    expect(translateUiText('No specific category', 'pt-BR')).toBe(
      'Nenhuma categoria especifica'
    )
    expect(translateUiText('Recurring Budget', 'pt-BR')).toBe(
      'Orcamento recorrente'
    )
    expect(translateUiText('Start Date', 'pt-BR')).toBe('Data de inicio')
    expect(translateUiText('End Date (Optional)', 'pt-BR')).toBe(
      'Data de termino (Opcional)'
    )
    expect(translateUiText('Please enter a budget name.', 'pt-BR')).toBe(
      'Digite um nome para o orcamento.'
    )
    expect(
      translateUiText('Please enter a valid budget amount.', 'pt-BR')
    ).toBe('Digite um valor de orcamento valido.')
    expect(translateUiText('Missing date', 'pt-BR')).toBe('Data ausente')
    expect(translateUiText('Please select a start date.', 'pt-BR')).toBe(
      'Selecione uma data de inicio.'
    )
  })

  it('translates profile page regional and security labels', () => {
    expect(translateUiText('Display name', 'pt-BR')).toBe('Nome de exibicao')
    expect(translateUiText('Email', 'pt-BR')).toBe('Email')
    expect(translateUiText('Security center', 'pt-BR')).toBe(
      'Central de seguranca'
    )
    expect(translateUiText('Open security center', 'pt-BR')).toBe(
      'Abrir central de seguranca'
    )
    expect(translateUiText('Add', 'pt-BR')).toBe('Adicionar')
    expect(translateUiText('Choose language', 'pt-BR')).toBe('Escolher idioma')
    expect(translateUiText('Choose currency', 'pt-BR')).toBe('Escolher moeda')
    expect(
      translateUiText(
        'These settings update date, time, and currency formatting across your workspace.',
        'pt-BR'
      )
    ).toBe(
      'Essas configuracoes atualizam a formatacao de data, hora e moeda em todo o seu workspace.'
    )
    expect(
      translateUiText(
        'Default behavior follows your latest synced Teller account.',
        'pt-BR'
      )
    ).toBe(
      'O comportamento padrao segue sua conta Teller sincronizada mais recente.'
    )
    expect(translateUiText('No email on file', 'pt-BR')).toBe(
      'Nenhum email cadastrado'
    )
    expect(translateUiText('User', 'pt-BR')).toBe('Usuario')
  })

  it('translates updated Basic and Pro chat access copy', () => {
    expect(
      translateUiText(
        'Choose between Basic and Pro. Both include a 7-day free trial.',
        'pt-BR'
      )
    ).toBe('Escolha entre Basico e Pro. Ambos incluem teste gratis de 7 dias.')
    expect(
      translateUiText(
        'Start in demo mode, or unlock live account features with Basic or Pro. AI chat is available on paid plans only.',
        'pt-BR'
      )
    ).toBe(
      'Comece no modo demonstracao ou desbloqueie recursos reais com Basico ou Pro. O chat de IA esta disponivel apenas em planos pagos.'
    )
    expect(
      translateUiText(
        'Financial Assistant is available on Basic and Pro plans.',
        'pt-BR'
      )
    ).toBe('O Assistente Financeiro esta disponivel nos planos Basico e Pro.')
    expect(
      translateUiText(
        'AI Assistant access with guarded limits (30 req/min, 150 messages every 4 hours, auto reset).',
        'pt-BR'
      )
    ).toBe(
      'Acesso ao Assistente de IA com limites protegidos (30 req/min, 150 mensagens a cada 4 horas, reset automatico).'
    )
  })
})

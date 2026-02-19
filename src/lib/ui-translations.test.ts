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
    ).toBe('Housing representa 71.4% de tu gasto total.')
    expect(translateUiText('Confidence: 85%', 'fr-FR')).toBe('Confiance : 85%')
    expect(translateUiText('Next step: Review Budget', 'pt-BR')).toBe(
      'Proximo passo: Review Budget'
    )
  })
})

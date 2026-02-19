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
  })

  it('preserves whitespace around translated values', () => {
    expect(translateUiText('  Save  ', 'pt-BR')).toBe('  Salvar  ')
  })

  it('returns source text when translation key is missing', () => {
    expect(translateUiText('Completely Unknown Label', 'pt-BR')).toBe(
      'Completely Unknown Label'
    )
  })
})

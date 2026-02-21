import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import type { ReactElement } from 'react'
import { AdSlot } from './ad-slot'

const { mockUsePathname } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
}))

const buildRichContent = () =>
  'FinanceFlow explains cashflow, savings strategy, debt planning, and taxes. '.repeat(
    40
  )

const renderAdSlot = (element: ReactElement, mainContent = '') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <SessionProvider session={null}>
      <QueryClientProvider client={queryClient}>
        <main>
          <p>{mainContent}</p>
          {element}
        </main>
      </QueryClientProvider>
    </SessionProvider>
  )
}

describe('AdSlot', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/')
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = ''
    window.adsbygoogle = []
    localStorage.clear()
    document.getElementById('financeflow-adsense-script')?.remove()
  })

  it('does not render on utility routes', () => {
    const readyStateGetterSpy = vi
      .spyOn(document, 'readyState', 'get')
      .mockReturnValue('complete')
    mockUsePathname.mockReturnValue('/dashboard')

    renderAdSlot(<AdSlot slotId="slot-1" />, buildRichContent())

    expect(screen.queryByLabelText('Sponsored')).not.toBeInTheDocument()
    readyStateGetterSpy.mockRestore()
  })

  it('does not render while the page is still loading', () => {
    const readyStateGetterSpy = vi
      .spyOn(document, 'readyState', 'get')
      .mockReturnValue('loading')

    renderAdSlot(<AdSlot slotId="slot-1" />, buildRichContent())

    expect(screen.queryByLabelText('Sponsored')).not.toBeInTheDocument()
    readyStateGetterSpy.mockRestore()
  })

  it('does not render on low-content pages', () => {
    const readyStateGetterSpy = vi
      .spyOn(document, 'readyState', 'get')
      .mockReturnValue('complete')

    renderAdSlot(<AdSlot slotId="slot-1" />, 'Short page copy.')

    expect(screen.queryByLabelText('Sponsored')).not.toBeInTheDocument()
    readyStateGetterSpy.mockRestore()
  })
})

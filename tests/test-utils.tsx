import React, { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const createQueryWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return { wrapper, queryClient }
}

export const createFetchResponse = <T,>({
  ok = true,
  status = ok ? 200 : 500,
  statusText = ok ? 'OK' : 'Error',
  json,
  text,
}: {
  ok?: boolean
  status?: number
  statusText?: string
  json?: T
  text?: string
}) => ({
  ok,
  status,
  statusText,
  json: async () => json,
  text: async () => text ?? '',
})

import { renderHook, act } from '@testing-library/react'

describe('toast state', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.resetModules()
  })

  it('handles reducer actions', async () => {
    const { reducer } = await import('./use-toast')
    const initial = { toasts: [] }
    const added = reducer(initial, {
      type: 'ADD_TOAST',
      toast: { id: '1', title: 'Hello', open: true },
    })

    expect(added.toasts).toHaveLength(1)

    const updated = reducer(added, {
      type: 'UPDATE_TOAST',
      toast: { id: '1', title: 'Updated' },
    })
    expect(updated.toasts[0].title).toBe('Updated')

    const ignoredUpdate = reducer(updated, {
      type: 'UPDATE_TOAST',
      toast: { id: 'missing', title: 'Ignored' },
    })
    expect(ignoredUpdate.toasts[0].title).toBe('Updated')

    const dismissed = reducer(updated, {
      type: 'DISMISS_TOAST',
      toastId: '1',
    })
    expect(dismissed.toasts[0].open).toBe(false)

    const dismissedAll = reducer(updated, {
      type: 'DISMISS_TOAST',
    })
    expect(dismissedAll.toasts[0].open).toBe(false)

    const removed = reducer(dismissed, {
      type: 'REMOVE_TOAST',
      toastId: '1',
    })
    expect(removed.toasts).toHaveLength(0)

    const cleared = reducer(
      { toasts: [{ id: '2', open: true }] },
      { type: 'REMOVE_TOAST' }
    )
    expect(cleared.toasts).toHaveLength(0)
  })

  it('keeps unrelated toasts open when dismissing a missing id', async () => {
    const { reducer } = await import('./use-toast')
    const initial = {
      toasts: [
        { id: '1', open: true },
        { id: '2', open: true },
      ],
    }

    const dismissed = reducer(initial, {
      type: 'DISMISS_TOAST',
      toastId: 'missing',
    })

    expect(dismissed.toasts[0].open).toBe(true)
    expect(dismissed.toasts[1].open).toBe(true)
  })

  it('manages toast lifecycle through the hook', async () => {
    vi.useFakeTimers()
    const { useToast } = await import('./use-toast')

    const { result, unmount } = renderHook(() => useToast())

    act(() => {
      const toastResult = result.current.toast({
        title: 'Welcome',
        description: 'Hello',
      })
      toastResult.update({ id: toastResult.id, title: 'Updated' })
      toastResult.dismiss()
    })

    expect(result.current.toasts[0]?.open).toBe(false)

    act(() => {
      vi.runAllTimers()
    })

    expect(result.current.toasts).toHaveLength(0)

    act(() => {
      result.current.toast({ title: 'Another' })
      result.current.dismiss()
    })

    act(() => {
      vi.runAllTimers()
    })

    expect(result.current.toasts).toHaveLength(0)

    unmount()
  })

  it('handles repeated dismissals and onOpenChange', async () => {
    vi.useFakeTimers()
    const { useToast } = await import('./use-toast')
    const { result } = renderHook(() => useToast())

    let toastId = ''
    act(() => {
      const toastResult = result.current.toast({ title: 'Hello' })
      toastId = toastResult.id
    })

    act(() => {
      result.current.toasts[0]?.onOpenChange?.(true)
      result.current.toasts[0]?.onOpenChange?.(false)
      result.current.dismiss(toastId)
      result.current.dismiss(toastId)
    })

    act(() => {
      vi.runAllTimers()
    })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('keeps cleanup safe when listeners are missing', async () => {
    const { useToast } = await import('./use-toast')
    const { unmount } = renderHook(() => useToast())

    const indexSpy = vi.spyOn(Array.prototype, 'indexOf').mockReturnValue(-1)
    unmount()
    indexSpy.mockRestore()
  })
})

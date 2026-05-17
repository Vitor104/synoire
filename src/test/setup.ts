import '@testing-library/jest-dom/vitest'

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin = ''
  readonly scrollMargin = ''
  readonly thresholds: readonly number[] = []
  #callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.#callback = callback
  }

  observe(target: Element) {
    this.#callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this,
    )
  }

  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})

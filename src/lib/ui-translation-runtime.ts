import { translateUiText } from '@/lib/ui-translations'

const translatableAttributes = ['placeholder', 'title', 'aria-label'] as const

const trackedTextNodes = new WeakMap<Text, string>()
const trackedAttributes = new WeakMap<Element, Map<string, string>>()
let activeLocale = 'en-US'

const shouldSkipElement = (element: Element | null) => {
  if (!element) return true
  if (element.closest('[data-no-translate="true"]')) return true

  const tagName = element.tagName
  return (
    tagName === 'SCRIPT' ||
    tagName === 'STYLE' ||
    tagName === 'NOSCRIPT' ||
    tagName === 'SVG' ||
    tagName === 'CODE' ||
    tagName === 'PRE' ||
    tagName === 'TEXTAREA'
  )
}

const getTrackedSourceText = (textNode: Text) => {
  const currentText = textNode.nodeValue ?? ''
  const trackedSource = trackedTextNodes.get(textNode)

  if (!trackedSource) {
    trackedTextNodes.set(textNode, currentText)
    return currentText
  }

  const previousTranslatedText = translateUiText(trackedSource, activeLocale)
  if (currentText === trackedSource || currentText === previousTranslatedText) {
    return trackedSource
  }

  trackedTextNodes.set(textNode, currentText)
  return currentText
}

const translateTextNode = (textNode: Text, locale: string) => {
  if (shouldSkipElement(textNode.parentElement)) return

  const sourceText = getTrackedSourceText(textNode)
  if (!sourceText.trim()) return

  const nextText =
    locale === 'en-US' ? sourceText : translateUiText(sourceText, locale)
  if (nextText !== textNode.nodeValue) {
    textNode.nodeValue = nextText
  }
}

const getTrackedSourceAttribute = (element: Element, attributeName: string) => {
  const currentValue = element.getAttribute(attributeName)
  if (typeof currentValue !== 'string') return null

  const trackedByAttribute = trackedAttributes.get(element) ?? new Map()
  const trackedSource = trackedByAttribute.get(attributeName)

  if (!trackedSource) {
    trackedByAttribute.set(attributeName, currentValue)
    trackedAttributes.set(element, trackedByAttribute)
    return currentValue
  }

  const previousTranslatedText = translateUiText(trackedSource, activeLocale)
  if (
    currentValue === trackedSource ||
    currentValue === previousTranslatedText
  ) {
    return trackedSource
  }

  trackedByAttribute.set(attributeName, currentValue)
  trackedAttributes.set(element, trackedByAttribute)
  return currentValue
}

const translateElementAttributes = (element: Element, locale: string) => {
  if (shouldSkipElement(element)) return

  translatableAttributes.forEach((attributeName) => {
    const sourceValue = getTrackedSourceAttribute(element, attributeName)
    if (!sourceValue || !sourceValue.trim()) return

    const translatedValue =
      locale === 'en-US' ? sourceValue : translateUiText(sourceValue, locale)
    if (translatedValue !== element.getAttribute(attributeName)) {
      element.setAttribute(attributeName, translatedValue)
    }
  })
}

const translateNodeTree = (node: Node, locale: string) => {
  if (node.nodeType === Node.TEXT_NODE) {
    translateTextNode(node as Text, locale)
    return
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return
  }

  const element = node as Element
  translateElementAttributes(element, locale)

  const textWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  let currentTextNode = textWalker.nextNode() as Text | null
  while (currentTextNode) {
    translateTextNode(currentTextNode, locale)
    currentTextNode = textWalker.nextNode() as Text | null
  }

  translatableAttributes.forEach((attributeName) => {
    element
      .querySelectorAll(`[${attributeName}]`)
      .forEach((childElement) =>
        translateElementAttributes(childElement, locale)
      )
  })
}

export const startUiTranslationRuntime = (locale: string) => {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const root = document.body
  if (!root) {
    return () => undefined
  }

  translateNodeTree(root, locale)

  const observer = new MutationObserver((mutationList) => {
    mutationList.forEach((mutation) => {
      if (
        mutation.type === 'characterData' &&
        mutation.target.nodeType === Node.TEXT_NODE
      ) {
        translateTextNode(mutation.target as Text, locale)
        return
      }

      if (
        mutation.type === 'attributes' &&
        mutation.target.nodeType === Node.ELEMENT_NODE
      ) {
        translateElementAttributes(mutation.target as Element, locale)
        return
      }

      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((addedNode) => {
          translateNodeTree(addedNode, locale)
        })
      }
    })
  })

  observer.observe(root, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [...translatableAttributes],
  })

  activeLocale = locale

  return () => {
    observer.disconnect()
    activeLocale = locale
  }
}

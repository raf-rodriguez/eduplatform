import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { mangle } from 'marked-mangle'

// Configure marked with mangle extension
marked.use(mangle())

// Configure marked renderer for safe defaults
const renderer = new marked.Renderer()

// Override link renderer to always add rel="noopener noreferrer"
renderer.link = ({ href, title, text }) => {
  // Block javascript: and data: URLs in links
  if (href && (href.startsWith('javascript:') || href.startsWith('data:'))) {
    return ''
  }
  const rel = 'noopener noreferrer'
  const target = '_blank'
  const titleAttr = title ? ` title="${title}"` : ''
  return `<a href="${href}" target="${target}" rel="${rel}"${titleAttr}>${text}</a>`
}

// Override image renderer to only allow safe sources
renderer.image = ({ href, title, text }) => {
  const src = href || ''

  // Only allow https:// URLs and data: images
  const isAllowedSource =
    src.startsWith('https://') ||
    src.startsWith('data:image/')

  if (!isAllowedSource) {
    return ''
  }

  // Block data: URLs that aren't images
  if (src.startsWith('data:') && !src.startsWith('data:image/')) {
    return ''
  }

  const alt = text || ''
  const titleAttr = title ? ` title="${title}"` : ''
  return `<img src="${src}" alt="${alt}" class="max-w-full rounded-lg my-3"${titleAttr} loading="lazy" />`
}

marked.setOptions({
  renderer,
  gfm: true,
  breaks: false,
})

// DOMPurify configuration
const ALLOWED_TAGS = [
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'em', 'b', 'i',
  'ul', 'ol', 'li',
  'a', 'img', 'br', 'div', 'span',
  'blockquote', 'pre', 'code',
  'hr',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'target', 'rel',
  'class', 'loading',
]

/**
 * Sanitize markdown string and convert to safe HTML
 * @param markdown - Raw markdown string
 * @returns Sanitized HTML string
 */
export function sanitizeMarkdown(markdown: string): string {
  if (!markdown) return ''

  // Step 1: Convert markdown to HTML
  const rawHtml = marked.parse(markdown) as string

  // Step 2: Sanitize HTML with DOMPurify
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
    ADD_ATTR: ['loading'],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SANITIZE_DOM: true,
    USE_PROFILES: {
      html: true,
    },
    HOOKS: {
      afterSanitizeAttributes: (node) => {
        // Ensure all links have rel="noopener noreferrer"
        if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
          const currentRel = node.getAttribute('rel') || ''
          if (!currentRel.includes('noopener') || !currentRel.includes('noreferrer')) {
            node.setAttribute('rel', 'noopener noreferrer')
          }
        }

        // Double-check image sources
        if (node.tagName === 'IMG') {
          const src = node.getAttribute('src') || ''
          if (
            !src.startsWith('https://') &&
            !src.startsWith('data:image/')
          ) {
            node.removeAttribute('src')
          }
        }
      },
    },
  })

  return cleanHtml
}

/**
 * React hook for safely rendering markdown
 * @param markdown - Raw markdown string
 * @returns Sanitized HTML string
 *
 * @example
 * function MyComponent() {
 *   const safeHtml = useMarkdownSafe(content)
 *   return <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
 * }
 */
export function useMarkdownSafe(markdown: string | undefined | null): string {
  return useMemo(() => {
    return sanitizeMarkdown(markdown || '')
  }, [markdown])
}

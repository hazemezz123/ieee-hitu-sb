/**
 * Safely injects JSON-LD structured data.
 * Server-safe: no 'use client'.
 * @param {{ data: object | object[] }} props
 */
export default function JsonLd({ data }) {
  const json = Array.isArray(data) ? data : [data]
  const safe = JSON.stringify(json).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safe }} />
}

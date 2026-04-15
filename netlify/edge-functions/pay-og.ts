import type { Config, Context } from '@netlify/edge-functions'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default async function handler(req: Request, context: Context) {
  const url    = new URL(req.url)
  const items  = url.searchParams.getAll('item')
  const images = url.searchParams.getAll('image')
  const total  = url.searchParams.get('total')

  // Pass through to the SPA HTML
  const response = await context.next()
  const html     = await response.text()

  // Build OG values
  const title       = items.length > 0 ? `Deposit – ${items.join(', ')}` : 'Pay Deposit – Mes Decor'
  const description = total
    ? `Total: $${total}. Click to pay your deposit securely.`
    : 'Click to pay your deposit securely via Mes Decor.'
  const image = images[0]
    ? `${url.origin}${images[0]}`
    : `${url.origin}/logo.png`

  const ogTags = `
    <meta property="og:type"        content="website" />
    <meta property="og:url"         content="${escapeHtml(req.url)}" />
    <meta property="og:title"       content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image"       content="${escapeHtml(image)}" />
    <meta property="og:site_name"   content="Mes Decor" />
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:title"       content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image"       content="${escapeHtml(image)}" />
  `

  const modified = html.replace('</head>', `${ogTags}\n  </head>`)

  return new Response(modified, {
    status:  response.status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}

export const config: Config = {
  path: '/pay',
}

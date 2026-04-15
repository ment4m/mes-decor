import type { Config, Context } from '@netlify/edge-functions'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default async function handler(req: Request, context: Context) {
  const url   = new URL(req.url)
  const item  = url.searchParams.get('item')
  const image = url.searchParams.get('image')

  // Pass through to the SPA HTML
  const response = await context.next()
  const html     = await response.text()

  const title       = item ? `Review – ${item} | Mes Decor` : 'Leave a Review – Mes Decor'
  const description = item
    ? `Had a great experience with ${item}? We'd love to hear from you!`
    : 'Share your experience with Mes Decor. Leave us a review!'
  const ogImage = image
    ? `${url.origin}${image}`
    : `${url.origin}/logo.png`

  const ogTags = `
    <meta property="og:type"        content="website" />
    <meta property="og:url"         content="${escapeHtml(req.url)}" />
    <meta property="og:title"       content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image"       content="${escapeHtml(ogImage)}" />
    <meta property="og:site_name"   content="Mes Decor" />
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:title"       content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image"       content="${escapeHtml(ogImage)}" />
  `

  const modified = html.replace('</head>', `${ogTags}\n  </head>`)

  return new Response(modified, {
    status:  response.status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}

export const config: Config = {
  path: '/review',
}

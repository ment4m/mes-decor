import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  const { password } = JSON.parse(event.body ?? '{}')
  const correct = process.env.ADMIN_PASSWORD

  if (!correct || password !== correct) {
    return { statusCode: 401, body: JSON.stringify({ ok: false }) }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) }
}

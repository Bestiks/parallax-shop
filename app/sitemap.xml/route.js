export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.vercel.app'
  const urls = ['/', '/catalog', '/auth/login', '/auth/register', '/legal/privacy', '/legal/terms']
  const now = new Date().toISOString()
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map(u => `<url><loc>${base}${u}</loc><lastmod>${now}</lastmod></url>`).join('') +
    `</urlset>`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
}
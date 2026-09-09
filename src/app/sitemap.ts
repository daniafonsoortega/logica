import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://logica-mente.vercel.app'
  const now = new Date()

  return [
    { url: base,                     lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/puzzles`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/questoes`,       lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/desafio-diario`, lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/ranking`,        lastModified: now, changeFrequency: 'daily',   priority: 0.6 },
    { url: `${base}/sobre`,          lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/termos`,         lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/privacidade`,    lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/cookies`,        lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]
}

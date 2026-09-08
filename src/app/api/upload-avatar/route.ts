import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const userId = form.get('userId') as string | null

    if (!file || !userId) {
      return NextResponse.json({ error: 'file e userId obrigatórios' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const allowed = ['jpg','jpeg','png','webp','gif']
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: 'Formato não suportado. Use JPG, PNG ou WEBP.' }, { status: 400 })
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 2 MB.' }, { status: 400 })
    }

    const path = `${userId}/avatar.${ext}`
    const bytes = await file.arrayBuffer()

    // Garantir que o bucket existe
    const { error: bucketErr } = await supabaseAdmin.storage.createBucket('avatars', { public: true })
    if (bucketErr && !bucketErr.message.includes('already exists')) {
      console.error('bucket error:', bucketErr)
    }

    // Upload (upsert para substituir foto antiga)
    const { error: uploadErr } = await supabaseAdmin.storage
      .from('avatars')
      .upload(path, bytes, { contentType: file.type, upsert: true })

    if (uploadErr) {
      return NextResponse.json({ error: uploadErr.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabaseAdmin.storage.from('avatars').getPublicUrl(path)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase-browser'

export default function NewPostPage() {
  const router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [filmName, setFilmName] = useState('')
  const [camera, setCamera] = useState('')
  const [lens, setLens] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const t = useTranslations('post')

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!imageFile) { setError(t('no_image_error')); return }
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const ext = imageFile.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('post-images').upload(fileName, imageFile)
    if (uploadError) { setError(t('upload_error')); setLoading(false); return }

    const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(fileName)
    const { error: postError } = await supabase.from('posts').insert({
      user_id: user.id, image_url: urlData.publicUrl,
      film_name: filmName || null, camera: camera || null, lens: lens || null,
    })
    if (postError) { setError(t('post_error')); setLoading(false); return }

    router.push('/timeline')
    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-40 px-4 py-4 border-b border-[#E8E0D8]/60">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="text-muted hover:text-primary transition-colors">{t('cancel')}</button>
          <h1 className="font-mincho text-lg">{t('new_title')}</h1>
          <div className="w-16" />
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <label className="block cursor-pointer">
          <div className={`relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-[#E8E0D8] flex items-center justify-center bg-card hover:border-accent transition-colors ${imagePreview ? 'border-transparent' : ''}`}>
            {imagePreview ? (
              <Image src={imagePreview} alt="preview" fill className="object-cover" />
            ) : (
              <div className="text-center">
                <div className="text-4xl text-[#E8E0D8] mb-3">+</div>
                <p className="text-muted text-sm">{t('select_photo')}</p>
                <p className="text-muted text-xs mt-1">{t('tap_to_add')}</p>
              </div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1.5">{t('film')}</label>
            <input type="text" value={filmName} onChange={(e) => setFilmName(e.target.value)}
              className="w-full bg-card border border-[#E8E0D8] rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-accent transition-colors"
              placeholder="Kodak Portra 400" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">{t('camera')}</label>
            <input type="text" value={camera} onChange={(e) => setCamera(e.target.value)}
              className="w-full bg-card border border-[#E8E0D8] rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-accent transition-colors"
              placeholder="Nikon F3" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">{t('lens')}</label>
            <input type="text" value={lens} onChange={(e) => setLens(e.target.value)}
              className="w-full bg-card border border-[#E8E0D8] rounded-lg px-4 py-3 text-primary focus:outline-none focus:border-accent transition-colors"
              placeholder="Nikkor 50mm f/1.4" />
          </div>
        </div>

        {error && <p className="text-accent text-sm">{error}</p>}
        <button type="submit" disabled={loading || !imageFile}
          className="w-full bg-accent text-white rounded-lg py-3 font-medium hover:bg-[#C05530] transition-colors disabled:opacity-60">
          {loading ? t('submitting') : t('submit')}
        </button>
      </form>
    </div>
  )
}

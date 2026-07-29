import { useState, useEffect, useCallback } from 'react'
import SectionsBuilder from '../../components/sections-builder'
import { api } from '../../services/api/client'
import { useMeereo } from '../../hooks/useMeereoStore'

export default function PageBuilder() {
  const [sections, setSections] = useState(null)
  const [loading, setLoading] = useState(true)
  const { store, showToast } = useMeereo()
  const slug = store.user?.slug || store.user?.publicId
  const publicUrl = slug ? `${window.location.origin}/pro/${slug}` : null

  // Champs dérivés du profil — injectés dans les sections hero/coord-footer
  // pour que companyName, category, location et verified ne soient jamais saisis.
  const od = store.onboardingData || {}
  const profileOverrides = {
    companyName: od.entreprise || store.user?.company || store.user?.name || '',
    category: (od.secteurs || []).join(' · ') || '',
    location: [od.ville || store.user?.ville || '', od.pays || ''].filter(Boolean).join(', '),
    verified: store.user?.verified || false,
  }

  useEffect(() => {
    api.usersApi.getPageSections()
      .then(res => {
        const loaded = res.sections || []
        // Sync cockpitTeam members into team sections
        const team = od.cockpitTeam || []
        if (team.length > 0) {
          loaded.forEach(s => {
            if (s.type?.startsWith('team') && s.data) {
              const existing = s.data.members || []
              const existingNames = new Set(existing.map(m => m.name || m.nom))
              const toAdd = team.filter(t => !existingNames.has(t.name || t.nom)).map(t => ({
                id: 'tm-' + Date.now() + Math.random().toString(36).slice(2, 6),
                nom: t.nom || t.name || '', name: t.name || t.nom || '',
                role: t.role || t.poste || '', bio: '', specialties: '',
                photoSrc: t.photoUrl || t.photo || '', isPublic: true,
              }))
              if (toAdd.length > 0) s.data.members = [...existing, ...toAdd]
            }
          })
        }
        setSections(loaded)
      })
      .catch(() => setSections([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = useCallback(async (newSections) => {
    try {
      await api.usersApi.savePageSections(newSections)
      setSections(newSections)
    } catch (e) {
      showToast?.('Erreur lors de la sauvegarde', 'red')
    }
  }, [showToast])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', opacity: .4 }}>
      <div style={{ width: 24, height: 24, border: '2.5px solid var(--border)', borderTopColor: 'var(--tx)', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
      <SectionsBuilder
        initialSections={sections}
        pageTitle="Ma page pro"
        onSave={handleSave}
        onPublish={handleSave}
        onClose={() => window.history.back()}
        publicUrl={publicUrl}
        profileOverrides={profileOverrides}
        existingTeam={od.cockpitTeam || []}
      />
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import SectionsBuilder from '../../components/sections-builder'
import { api } from '../../services/api/client'
import { useMeereo } from '../../hooks/useMeereoStore'

export default function PageBuilder() {
  const [sections, setSections] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useMeereo()

  useEffect(() => {
    api.usersApi.getPageSections()
      .then(res => setSections(res.sections || []))
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
      />
    </div>
  )
}

import { useState } from 'react'

/**
 * InviteProfessionalModal — Inviter un professionnel à répondre à un AO
 *
 * @param {boolean} open
 * @param {object} ao - L'AO concerné
 * @param {Array} professionals - Liste des pros sur la plateforme
 * @param {Function} onInvite - (data) => void
 * @param {Function} onClose
 */
const TRADES = ['Architecte', 'Ingénieur structure', 'BET', 'Entreprise BTP', 'Électricien', 'Plombier', 'Menuisier', 'Peintre', 'Carreleur', 'Autre']

export default function InviteProfessionalModal({ open, ao, professionals = [], onInvite, onClose }) {
  const [tab, setTab] = useState('interne')
  const [search, setSearch] = useState('')
  const [extForm, setExtForm] = useState({ email: '', phone: '', name: '', trade: '', message: '' })
  const [sending, setSending] = useState(false)

  if (!open || !ao) return null

  const filtered = professionals.filter(p => {
    const q = search.toLowerCase()
    return (p.name || '').toLowerCase().includes(q) || (p.company || '').toLowerCase().includes(q) || (p.trade || '').toLowerCase().includes(q)
  })

  const handleInviteInternal = (pro) => {
    onInvite({ aoId: ao.id, targetUserId: pro.id, targetName: pro.name, targetTrade: pro.trade || '' })
  }

  const handleInviteExternal = () => {
    if (!extForm.email.includes('@') || !extForm.trade) return
    setSending(true)
    onInvite({
      aoId: ao.id,
      targetEmail: extForm.email,
      targetPhone: extForm.phone,
      targetName: extForm.name,
      targetTrade: extForm.trade,
      message: extForm.message,
    })
    setSending(false)
    setExtForm({ email: '', phone: '', name: '', trade: '', message: '' })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 500, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid #E5E5E5', flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 4 }}>Inviter un professionnel</div>
          <div style={{ fontSize: 12, color: '#6B6B6B' }}>{ao.titre || ao.title} · {ao.ref || ao.id}</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E5E5E5', flexShrink: 0 }}>
          {[['interne', 'Sur MEEREO'], ['externe', 'Externe']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: '10px 16px', fontSize: 13, fontWeight: tab === id ? 700 : 500,
              color: tab === id ? '#111' : '#6B6B6B', background: 'transparent', border: 'none',
              borderBottom: tab === id ? '2px solid #111' : '2px solid transparent',
              cursor: 'pointer', fontFamily: 'var(--f)', transition: 'all .15s',
            }}>{label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>

          {tab === 'interne' && (
            <>
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un professionnel..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: 13, fontFamily: 'var(--f)', marginBottom: 12, boxSizing: 'border-box', outline: 'none' }}
              />
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#6B6B6B', fontSize: 13 }}>
                  Aucun professionnel trouvé.
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => setTab('externe')} style={{ fontSize: 12, color: '#111', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--f)' }}>Inviter par email →</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {filtered.slice(0, 10).map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, border: '1px solid #E5E5E5', background: '#fff' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F6F6F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#6B6B6B', flexShrink: 0 }}>
                        {(p.name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#6B6B6B' }}>{p.trade}{p.company ? ' · ' + p.company : ''}</div>
                      </div>
                      <button onClick={() => handleInviteInternal(p)} style={{ padding: '6px 14px', borderRadius: 10, background: '#111', color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', flexShrink: 0 }}>Inviter</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'externe' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 5 }}>Email <span style={{ color: '#ba1a1a' }}>*</span></label>
                <input type="email" value={extForm.email} onChange={e => setExtForm(p => ({ ...p, email: e.target.value }))} placeholder="contact@cabinet.ci" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: 13, fontFamily: 'var(--f)', boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 5 }}>Métier ciblé <span style={{ color: '#ba1a1a' }}>*</span></label>
                <select value={extForm.trade} onChange={e => setExtForm(p => ({ ...p, trade: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: 13, fontFamily: 'var(--f)', boxSizing: 'border-box', outline: 'none', background: '#fff' }}>
                  <option value="">Sélectionner un métier</option>
                  {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="modal-row" style={{ gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 5 }}>Nom</label>
                  <input value={extForm.name} onChange={e => setExtForm(p => ({ ...p, name: e.target.value }))} placeholder="Jean Koné" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: 13, fontFamily: 'var(--f)', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 5 }}>Téléphone</label>
                  <input value={extForm.phone} onChange={e => setExtForm(p => ({ ...p, phone: e.target.value }))} placeholder="+225 07 00 00 00" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: 13, fontFamily: 'var(--f)', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 5 }}>Message (optionnel)</label>
                <textarea value={extForm.message} onChange={e => setExtForm(p => ({ ...p, message: e.target.value }))} placeholder="Bonjour, je vous invite à consulter cet appel d'offres..." rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E5E5E5', fontSize: 13, fontFamily: 'var(--f)', boxSizing: 'border-box', outline: 'none', resize: 'vertical' }} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #E5E5E5', display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 12, background: '#F6F6F6', color: '#6B6B6B', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Annuler</button>
          {tab === 'externe' && (
            <button onClick={handleInviteExternal} disabled={!extForm.email.includes('@') || !extForm.trade || sending} style={{ padding: '10px 18px', borderRadius: 12, background: extForm.email.includes('@') && extForm.trade ? '#111' : '#ddd', color: extForm.email.includes('@') && extForm.trade ? '#fff' : '#999', border: 'none', fontSize: 13, fontWeight: 600, cursor: extForm.email.includes('@') && extForm.trade ? 'pointer' : 'not-allowed', fontFamily: 'var(--f)' }}>
              {sending ? 'Envoi...' : 'Envoyer l\u2019invitation'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

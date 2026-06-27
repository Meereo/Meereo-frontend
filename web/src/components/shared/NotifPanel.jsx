import { createPortal } from 'react-dom'
import { useMeereo, formatDate } from '../../hooks/useMeereoStore'
import { api } from '../../services/api/client'
import { CheckCircle2, Megaphone, AlertTriangle, XCircle, MessageSquare, Bell } from 'lucide-react'
import './NotifPanel.css'

const ICONS = {
  green: <CheckCircle2 size={16} color="var(--ok)" />,
  blue: <Megaphone size={16} color="var(--inf)" />,
  orange: <AlertTriangle size={16} color="var(--wrn)" />,
  red: <XCircle size={16} color="var(--err)" />,
  info: <MessageSquare size={16} color="var(--t3)" />,
}

const PAGE_LABELS = {
  projets: 'Projet', bourse: 'Appel d\'offres', offres: 'Offre', marches: 'Marché',
  paiements: 'Paiement', finance: 'Finance', documents: 'Document', messages: 'Message',
  parametres: 'Paramètres', dashboard: 'Tableau de bord', commandes: 'Commande',
  marketplace: 'Marketplace', catalogue: 'Catalogue', decisions: 'Décision',
  avancement: 'Avancement', budget: 'Budget',
}

export default function NotifPanel() {
  const { store, notifOpen, setNotifOpen, markNotifRead, markNotifsRead, updateStore } = useMeereo()
  const userType = store.user?.type

  if (!notifOpen) return null

  const filtered = store.notifications.filter(n => !n.role || n.role === userType)
  const unreadCount = filtered.filter(n => !n.read).length

  const handleClick = (n) => {
    if (!n.read) markNotifRead(n.id)
    if (n.page) {
      window.dispatchEvent(new CustomEvent('meereo-navigate', { detail: n.page }))
    }
    setNotifOpen(false)
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    updateStore(prev => ({
      ...prev,
      notifications: (prev.notifications || []).filter(n => n.id !== id)
    }))
    api.notifications.delete(id).catch(() => {})
  }

  const handleClearAll = () => {
    updateStore(prev => ({ ...prev, notifications: [] }))
    api.notifications.deleteAll().catch(() => {})
    setNotifOpen(false)
  }

  return createPortal(
    <>
      <div className="notif-backdrop" onClick={() => setNotifOpen(false)} />
      <div className="notif-panel">
        {/* Header */}
        <div className="notif-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Notifications</span>
            {unreadCount > 0 && <span className="notif-panel-count">{unreadCount}</span>}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {unreadCount > 0 && (
              <button onClick={markNotifsRead}>Tout marquer lu</button>
            )}
            {filtered.length > 0 && (
              <button onClick={handleClearAll} style={{ color: 'var(--err)' }}>Tout effacer</button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="notif-panel-list">
          {filtered.length === 0 ? (
            <div className="notif-empty-state">
              <div style={{ marginBottom: 8, opacity: .25, display: 'flex', justifyContent: 'center' }}><Bell size={28} strokeWidth={1.5} /></div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>Aucune notification</div>
              <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 4 }}>Les alertes importantes apparaîtront ici.</div>
            </div>
          ) : (
            filtered.slice(0, 30).map(n => (
              <div
                key={n.id}
                className={`notif-item ${n.read ? 'read' : 'unread'}`}
                onClick={() => handleClick(n)}
              >
                <span className="notif-icon">{ICONS[n.type] || <MessageSquare size={16} color="var(--t3)" />}</span>
                <div className="notif-content">
                  <div className="notif-msg-text">{n.msg}</div>
                  <div className="notif-meta">
                    {n.page && (
                      <span className="notif-page-tag">{PAGE_LABELS[n.page] || n.page} →</span>
                    )}
                    <span className="notif-time">{formatDate(n.ts)}</span>
                  </div>
                </div>
                <div className="notif-actions">
                  {!n.read && <span className="notif-unread-dot" />}
                  <button className="notif-delete-btn" onClick={(e) => handleDelete(e, n.id)} title="Supprimer">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>,
    document.body
  )
}

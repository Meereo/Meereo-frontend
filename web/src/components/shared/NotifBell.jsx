import { useMeereo } from '../../hooks/useMeereoStore'

export default function NotifBell() {
  const { setNotifOpen, store } = useMeereo()
  const userType = store.user?.type
  const notifUnread = store.notifications.filter(n => !n.read && (!n.role || n.role === userType)).length
  const msgUnread = (store.conversations || []).reduce((s, c) => s + (c.unread || 0), 0)
  // For clients: pending offers act as unread if no server notification was pushed for them
  const pendingOffers = userType === 'client'
    ? (store.offers || []).filter(o => o.statut === 'pending' || o.statut === 'en_attente' || o.statut === 'En attente').length
    : 0
  const unread = notifUnread + msgUnread + pendingOffers

  return (
    <button
      className="notif-bell"
      onClick={() => setNotifOpen(p => !p)}
      title="Notifications"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
      {unread > 0 && (
        <span className="notif-bell-badge">{unread > 9 ? '9+' : unread}</span>
      )}
    </button>
  )
}

/**
 * MEEREO Socket Service — Socket.IO client
 *
 * L'URL de connexion est '/' car Vite proxifie /socket.io → backend (port 3001).
 * En production, pointer vers le domaine du backend.
 *
 * Note : React Strict Mode en dev monte/démonte les effets deux fois.
 * On laisse un délai court avant la reconnexion pour éviter le message
 * "WebSocket is closed before the connection is established".
 */
import { io } from 'socket.io-client'

let socket = null
let connectTimer = null  // debounce pour éviter connect/disconnect immédiat (Strict Mode)

/**
 * Initialiser (ou récupérer) la connexion Socket.IO.
 * @param {string} token — JWT Bearer token de l'utilisateur connecté
 * @returns {import('socket.io-client').Socket}
 */
export function getSocket(token) {
  if (socket && socket.connected) return socket

  // Annuler une reconnexion en attente (Strict Mode cleanup → remount rapide)
  if (connectTimer) {
    clearTimeout(connectTimer)
    connectTimer = null
  }

  // Si le socket existait mais déconnecté, le détruire proprement
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }

  socket = io('/', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000,
    reconnectionDelayMax: 5000,
  })

  socket.on('connect_error', (err) => {
    console.warn('[socket] connexion échouée :', err.message)
  })

  return socket
}

/** Rejoindre la room d'une conversation. */
export function joinConversation(conversationId) {
  socket?.emit('conversation:join', conversationId)
}

/** Quitter la room d'une conversation. */
export function leaveConversation(conversationId) {
  socket?.emit('conversation:leave', conversationId)
}

/**
 * Envoyer un message via WebSocket.
 * @param {Object} data - { conversationId, text, type?, fileUrl?, fileName? }
 * @param {Function} [ack] - Callback de confirmation { message } | { error }
 */
export function sendSocketMessage(data, ack) {
  if (!socket) return typeof ack === 'function' && ack({ error: 'Non connecté' })
  socket.emit('message:send', data, ack)
}

/** Écouter les nouveaux messages. */
export function onNewMessage(handler) {
  socket?.on('message:new', handler)
}

/** Retirer l'écouteur de nouveaux messages. */
export function offNewMessage(handler) {
  socket?.off('message:new', handler)
}

/** Écouter les mises à jour de conversation (depuis d'autres onglets/utilisateurs). */
export function onConversationUpdated(handler) {
  socket?.on('conversation:updated', handler)
}

export function offConversationUpdated(handler) {
  socket?.off('conversation:updated', handler)
}

/** Écouter les mises à jour de commande (tracking temps réel). */
export function onOrderUpdated(handler) {
  socket?.on('order:updated', handler)
}

export function offOrderUpdated(handler) {
  socket?.off('order:updated', handler)
}

/** Écouter les indicateurs de frappe. */
export function onTyping(handler) {
  socket?.on('typing', handler)
}

export function offTyping(handler) {
  socket?.off('typing', handler)
}

/** Émettre l'indicateur de frappe. */
export function emitTypingStart(conversationId) {
  socket?.emit('typing:start', { conversationId })
}

export function emitTypingStop(conversationId) {
  socket?.emit('typing:stop', { conversationId })
}

/** Marquer une conversation comme lue. */
export function emitRead(conversationId) {
  socket?.emit('read', { conversationId })
}

/** Déconnecter le socket (appelé au logout). */
export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
}


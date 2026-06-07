/**
 * MEEREO Socket.io service — real-time messaging
 * Module-level singleton: one connection per browser session.
 */
import { io } from 'socket.io-client'

// Base URL without /api suffix
const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '')

let socket = null

function getToken() {
  try {
    const store = JSON.parse(localStorage.getItem('meereo_store_v2') || '{}')
    return store._token || null
  } catch { return null }
}

/**
 * Connect (or return existing) socket.
 * @returns {import('socket.io-client').Socket}
 */
export function getSocket() {
  if (socket && socket.connected) return socket
  // Disconnect stale socket if any
  if (socket) { socket.disconnect(); socket = null }

  socket = io(SOCKET_URL, {
    auth: { token: getToken() },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    path: '/socket.io',
  })

  socket.on('connect_error', (err) => {
    console.warn('[socket] connect error:', err.message)
  })

  return socket
}

/**
 * Join a conversation room to receive real-time messages.
 * @param {string} convId
 */
export function joinConversation(convId) {
  if (!convId) return
  getSocket().emit('join_conversation', convId)
}

/**
 * Leave a conversation room.
 * @param {string} convId
 */
export function leaveConversation(convId) {
  if (!convId || !socket) return
  socket.emit('leave_conversation', convId)
}

/**
 * Send a message via WebSocket (saved to DB server-side).
 * @param {{ conversationId: string, contenu: string, userId: string, tempId?: string }} payload
 */
export function sendSocketMessage(payload) {
  getSocket().emit('send_message', payload)
}

/**
 * Listen for new_message events.
 * @param {function} handler
 */
export function onNewMessage(handler) {
  getSocket().on('new_message', handler)
}

/**
 * Remove new_message listener.
 * @param {function} handler
 */
export function offNewMessage(handler) {
  if (socket) socket.off('new_message', handler)
}

/**
 * Disconnect socket (call on logout).
 */
export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null }
}

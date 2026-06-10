/**
 * MEEREO Socket — Mock (no backend)
 * Interface identique, toutes les fonctions sont des no-ops silencieux.
 */

export function getSocket()             { return null }
export function joinConversation()      {}
export function leaveConversation()     {}
export function sendSocketMessage()     {}
export function onNewMessage()          {}
export function offNewMessage()         {}
export function disconnectSocket()      {}

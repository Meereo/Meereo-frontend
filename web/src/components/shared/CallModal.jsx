/**
 * MSG-05 — Modal d'appel audio/vidéo
 *
 * Infrastructure UI pour les appels intégrés. Le prestataire réel (Twilio, LiveKit, etc.)
 * sera branché ultérieurement — ce composant gère la signalisation et l'interface.
 *
 * Utilisable depuis une conversation : boutons appel audio/vidéo dans le header de chat.
 */

import { useState, useEffect, useCallback } from 'react'
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff } from 'lucide-react'
import { emitCallStart, emitCallAccept, emitCallEnd, onCallIncoming, offCallIncoming, onCallEvent, offCallEvent } from '../../services/socket'

/**
 * Boutons d'appel à intégrer dans le header de conversation.
 */
export function CallButtons({ conversationId, partnerName, disabled }) {
  const [calling, setCalling] = useState(false)
  const [callType, setCallType] = useState(null)

  const startCall = (type) => {
    setCallType(type)
    setCalling(true)
    emitCallStart(conversationId, type)
  }

  const endCall = () => {
    setCalling(false)
    setCallType(null)
    emitCallEnd(conversationId)
  }

  if (calling) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, animation: 'pulse 1.5s infinite' }}>
          Appel {callType === 'video' ? 'vidéo' : 'audio'} en cours...
        </span>
        <button
          onClick={endCall}
          style={{ width: 32, height: 32, borderRadius: '50%', background: '#DC2626', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Raccrocher"
        >
          <PhoneOff size={14} />
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button
        onClick={() => startCall('audio')}
        disabled={disabled}
        style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(22,163,74,.1)', border: '1px solid rgba(22,163,74,.2)', color: '#16A34A', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : 1 }}
        title="Appel audio"
      >
        <Phone size={14} />
      </button>
      <button
        onClick={() => startCall('video')}
        disabled={disabled}
        style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(37,99,235,.1)', border: '1px solid rgba(37,99,235,.2)', color: '#2563EB', cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : 1 }}
        title="Appel vidéo"
      >
        <Video size={14} />
      </button>
    </div>
  )
}

/**
 * Modal plein écran pour un appel entrant.
 */
export function IncomingCallModal({ visible, callerName, callType, onAccept, onReject }) {
  if (!visible) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99998, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'pulse 1.5s infinite' }}>
          {callType === 'video' ? <Video size={36} /> : <Phone size={36} />}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{callerName || 'Appel entrant'}</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', marginBottom: 32 }}>
          Appel {callType === 'video' ? 'vidéo' : 'audio'} entrant...
        </div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
          <button
            onClick={onReject}
            style={{ width: 56, height: 56, borderRadius: '50%', background: '#DC2626', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(220,38,38,.4)' }}
          >
            <PhoneOff size={24} />
          </button>
          <button
            onClick={onAccept}
            style={{ width: 56, height: 56, borderRadius: '50%', background: '#16A34A', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(22,163,74,.4)' }}
          >
            <Phone size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default CallButtons

// ═══════════════════════════════════════════════════════
//  KAi Thinking Card — 3 bouncing dots indicator
//  Spec v1.0 : kai-bounce, 1.1s, delays 0/.15s/.3s
// ═══════════════════════════════════════════════════════

import KaiAvatar from './KaiAvatar'

/**
 * KaiThinkingCard — shows KAi is reflecting/processing.
 * Autonomous state — does not auto-transform into a message.
 *
 * Props:
 *   inline — use inline (28px) avatar size (default: false → 36px)
 */
export default function KaiThinkingCard({ inline = false }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <KaiAvatar size={inline ? 'inline' : 'auto'} idle={false} presence={false} />
      <div className="kai-thinking-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  )
}

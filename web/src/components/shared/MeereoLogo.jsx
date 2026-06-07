// ═══════════════════════════════════════════════════════
//  MEEREO — Logo officiel
//  Source de vérité : identique à la page login/onboarding
//  Réutilisé partout dans la plateforme
// ═══════════════════════════════════════════════════════

export default function MeereoLogo({ size = 36 }) {
  const s = size
  const vb = 44
  const fs = 11.5 * (s / 36)
  return (
    <svg width={s} height={s} viewBox={`0 0 ${vb} ${vb}`} fill="none" style={{ borderRadius: Math.round(s * 0.28), flexShrink: 0 }}>
      <rect width={vb} height={vb} fill="#1D1D1F" />
      <rect x="2" y="2" width={vb - 4} height={vb - 4} stroke="#FFFFFF" strokeWidth="2" />
      <text x="7" y="19" fontFamily="'Inter',-apple-system,sans-serif" fontSize="11.5" fontWeight="300" letterSpacing="2.5" fill="#FFFFFF">MEE</text>
      <text x="7" y="34" fontFamily="'Inter',-apple-system,sans-serif" fontSize="11.5" fontWeight="300" letterSpacing="2.5" fill="#FFFFFF">REO</text>
    </svg>
  )
}

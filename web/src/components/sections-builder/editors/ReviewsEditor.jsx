/* AVS-01: la création/gestion manuelle des avis est SUPPRIMÉE de l'éditeur.
   Les avis sont entièrement générés par le système à la fin de chaque mission.
   Cet éditeur est en lecture seule — il affiche les avis réels depuis l'API. */

export default function ReviewsEditor({ data, sectionType }) {
  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ padding: '12px 14px', background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.15)', borderRadius: 10, fontSize: 12, color: 'var(--t3)', lineHeight: 1.6 }}>
        <strong>Section automatique.</strong> Les avis sont générés par le système à la fin de chaque mission validée. Cette section ne peut pas être modifiée manuellement.
      </div>
      {data.reviews && data.reviews.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--t4)' }}>
          {data.reviews.length} avis affichés sur votre page.
        </div>
      )}
    </div>
  );
}

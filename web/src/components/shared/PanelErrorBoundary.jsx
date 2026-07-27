import React from 'react'

/**
 * AOF-05 — Frontière d'erreur locale.
 *
 * Placée au niveau d'un PANNEAU (modal de détail, carte, section), pas de la page :
 * une erreur de rendu dans le détail d'un marché ne doit détruire ni la liste,
 * ni la navigation. L'utilisateur conserve son contexte.
 *
 * Usage :
 *   <PanelErrorBoundary label="détail du marché" onClose={() => setDetail(null)}>
 *     <MarketDetail market={detail} />
 *   </PanelErrorBoundary>
 */
export default class PanelErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // Journaliser sans casser l'UI — utile pour remonter les champs mal typés (FIN-04)
    console.error(`[PanelErrorBoundary] Erreur de rendu (${this.props.label || 'panneau'}):`, error, info)
  }

  componentDidUpdate(prevProps) {
    // Réarmer la frontière quand le contenu change (ex. on ouvre un autre marché)
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            Ce contenu n'a pas pu être affiché
          </div>
          <div style={{ fontSize: 12, color: 'var(--t2, #888)', marginBottom: 14 }}>
            Une donnée de ce {this.props.label || 'panneau'} est invalide. Le reste de la page reste utilisable.
          </div>
          {this.props.onClose && (
            <button className="btn btn-sm" onClick={this.props.onClose}>Fermer</button>
          )}
        </div>
      )
    }
    return this.props.children
  }
}

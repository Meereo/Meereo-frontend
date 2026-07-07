import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { MeereoProvider } from './hooks/useMeereoStore'
import { DeviseProvider } from './hooks/useDevise'
import './styles/index.css'
import './styles/tokens.css'
import './styles/global.css'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('MEEREO Error Boundary:', error, info) }
  render() {
    if (this.state.error) {
      return React.createElement('div', { style: { padding: 40, fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 600, margin: '80px auto' } },
        React.createElement('h2', { style: { color: '#dc2626', fontSize: 18, marginBottom: 12 } }, 'Une erreur est survenue'),
        React.createElement('pre', { style: { background: '#f5f5f5', padding: 16, borderRadius: 8, fontSize: 12, whiteSpace: 'pre-wrap', color: '#333', marginBottom: 16 } }, String(this.state.error?.message || this.state.error)),
        React.createElement('button', {
          onClick: () => { try { sessionStorage.clear() } catch {} window.location.reload() },
          style: { padding: '10px 20px', background: '#191c1d', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }
        }, 'Réinitialiser et recharger')
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <MeereoProvider>
          <DeviseProvider>
            <App />
          </DeviseProvider>
        </MeereoProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)

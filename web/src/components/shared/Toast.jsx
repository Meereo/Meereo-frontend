import { useMeereo } from '../../hooks/useMeereoStore'
import './Toast.css'

export default function Toast() {
  const { toasts } = useMeereo()
  const colors = { green: '#16a34a', blue: '#2563eb', orange: '#ea580c', red: '#dc2626', info: '#1d1d1f' }

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast-item" style={{ background: colors[t.color] || colors.info }}>
          {t.msg}
        </div>
      ))}
    </div>
  )
}

import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import useUserIdentity from '../../hooks/useUserIdentity'
import './CockpitLayout.css'

export default function CockpitLayout({ activePage, onNavigate, children }) {
  const id = useUserIdentity()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="layout">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        identity={id}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main">
        <Topbar activePage={activePage} onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="page-wrap">
          <div className="scroll">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

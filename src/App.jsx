import { useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './auth'
import { DataProvider } from './data'
import { FocusProvider } from './focus'
import DataGate from './components/DataGate'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import { PageLoader } from './components/ui'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Focus from './pages/Focus'
import Profile from './pages/Profile'
import Progress from './pages/Progress'
import Schedule from './pages/Schedule'
import SmartPlan from './pages/SmartPlan'
import Subjects from './pages/Subjects'
import Tasks from './pages/Tasks'

/** Protected layout: redirects to /login without a user, otherwise provides shared data + focus timer. */
function Layout() {
  const { user, loading } = useAuth(), loc = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  useEffect(() => { setNavOpen(false); window.scrollTo(0, 0) }, [loc.pathname])
  if (loading) return <PageLoader fullscreen text="Loading your study data…" />
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />
  return (
    <DataProvider>
      <FocusProvider>
        <div className="app">
          <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
          {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} aria-hidden="true" />}
          <div className="main">
            <Header onMenu={() => setNavOpen(true)} />
            <main className="content"><DataGate><Outlet /></DataGate></main>
          </div>
        </div>
      </FocusProvider>
    </DataProvider>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/smart-plan" element={<SmartPlan />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Profile settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

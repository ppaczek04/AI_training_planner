import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import './App.css'
import TrainingSurvey from './components/TrainingSurvey'
import MyPlans from './components/MyPlans'
import AIConvo from './components/AIConvo'

function App() {
  const [view, setView] = useState('survey')
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0()

  const handleLogin = () => loginWithRedirect()
  const handleLogout = () => logout({ logoutParams: { returnTo: window.location.origin } })

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg app-nav sticky-top">
        <div className="container">
          <span className="navbar-brand fw-bold">TrainerAI</span>
          <div className="d-flex align-items-center gap-2">
            {isLoading ? (
              <span className="text-muted small">Loading...</span>
            ) : isAuthenticated ? (
              <>
                <span className="user-email small">{user?.email || user?.name}</span>
                <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <button className="btn btn-outline-primary btn-sm" onClick={handleLogin}>
                Log in / Register
              </button>
            )}
            <button
              className={`btn btn-sm ${view === 'survey' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setView('survey')}
            >
              Generate Training Plan
            </button>
            <button
              className={`btn btn-sm ${view === 'plans' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setView('plans')}
            >
              My Plans
            </button>
            <button
              className={`btn btn-sm ${view === 'ai' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setView('ai')}
            >
              AI Convo
            </button>
          </div>
        </div>
      </nav>
      <div className="container py-4">
        {view === 'survey' && <TrainingSurvey />}
        {view === 'plans' && <MyPlans />}
        {view === 'ai' && <AIConvo />}
      </div>
    </div>
  )
}

export default App

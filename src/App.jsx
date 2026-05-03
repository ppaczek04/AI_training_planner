import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import './App.css'
import TrainingSurvey from './components/TrainingSurvey'
import MyPlans from './components/MyPlans'

function App() {
  const [view, setView] = useState('survey')
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0()

  const handleLogin = () => loginWithRedirect()
  const handleLogout = () => logout({ logoutParams: { returnTo: window.location.origin } })

  return (
    <div className="App">
      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
        <div className="container">
          <span className="navbar-brand fw-bold">TrainerAI</span>
          <div className="d-flex align-items-center gap-2">
            {isLoading ? (
              <span className="text-muted small">Loading...</span>
            ) : isAuthenticated ? (
              <>
                <span className="text-muted small">{user?.email || user?.name}</span>
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
          </div>
        </div>
      </nav>
      <div className="container py-4">
        {view === 'survey' ? <TrainingSurvey /> : <MyPlans />}
      </div>
    </div>
  )
}

export default App

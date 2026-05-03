import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export default function MyPlans() {
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

  useEffect(() => {
    const fetchPlans = async () => {
      if (!isAuthenticated) return
      setLoading(true)
      setError('')
      try {
        const audience = import.meta.env.VITE_AUTH0_AUDIENCE
        const token = await getAccessTokenSilently(
          audience ? { authorizationParams: { audience } } : undefined
        )
        const response = await fetch(`${apiBaseUrl}/api/my-plans`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error('Failed to load plans')
        }
        const data = await response.json()
        setPlans(Array.isArray(data.plans) ? data.plans : [])
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [apiBaseUrl, getAccessTokenSilently, isAuthenticated])

  if (isLoading) {
    return <div className="text-muted">Loading auth...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-5">
        <p className="text-muted mb-3">Log in to see your saved plans.</p>
        <button className="btn btn-primary" onClick={() => loginWithRedirect()}>
          Log in / Register
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4">My Plans</h2>
      {loading && <div className="text-muted">Loading plans...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && plans.length === 0 && (
        <div className="text-muted">No plans yet. Generate one first.</div>
      )}
      <div className="row g-3">
        {plans.map(plan => (
          <div className="col-md-6 col-lg-4" key={plan.rowKey || plan.surveyId}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{plan.planName || 'Training Plan'}</h5>
                <p className="card-text mb-1">
                  <strong>Days:</strong> {plan.daysRequested || plan.daysPerWeek || '-'}
                </p>
                <p className="card-text mb-1">
                  <strong>Experience:</strong> {plan.experienceLevel || '-'}
                </p>
                <p className="card-text mb-1">
                  <strong>Generated:</strong> {plan.timestamp ? new Date(plan.timestamp).toLocaleString() : '-'}
                </p>
                <p className="card-text">
                  <strong>Equipment:</strong> {plan.availableEquipment || '-'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

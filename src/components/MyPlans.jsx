import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export default function MyPlans() {
  const { isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

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

  const fetchPlanDetail = async (planId) => {
    if (!planId) return
    setSelectedPlanId(planId)
    setDetail(null)
    setDetailError('')
    setDetailLoading(true)
    try {
      const audience = import.meta.env.VITE_AUTH0_AUDIENCE
      const token = await getAccessTokenSilently(
        audience ? { authorizationParams: { audience } } : undefined
      )
      const response = await fetch(`${apiBaseUrl}/api/my-plans/${encodeURIComponent(planId)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to load plan details')
      }
      const data = await response.json()
      setDetail(data)
    } catch (fetchError) {
      setDetailError(fetchError.message)
    } finally {
      setDetailLoading(false)
    }
  }

  const renderPlanDays = (planData) => {
    const days = Array.isArray(planData?.days) ? planData.days : []
    if (days.length === 0) {
      return <div className="text-muted">No exercises found in this plan.</div>
    }
    return days.map(day => (
      <div className="mb-3" key={day.day_number || day.day_name}>
        <h5 className="mb-2">{day.day_name || `Day ${day.day_number}`}</h5>
        <div className="text-muted mb-2">{day.focus}</div>
        <ul className="list-group">
          {day.exercises?.map((exercise, index) => (
            <li className="list-group-item" key={`${exercise.name}-${index}`}>
              <strong>{exercise.name}</strong> — {exercise.sets} x {exercise.reps} reps, {exercise.rest_seconds}s rest
            </li>
          ))}
        </ul>
      </div>
    ))
  }

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
            <div
              className={`card h-100 shadow-sm ${selectedPlanId === plan.surveyId ? 'border-primary' : ''}`}
              role="button"
              onClick={() => fetchPlanDetail(plan.surveyId)}
            >
              <div className="card-body">
                <h5 className="card-title">
                  {(plan.planName || 'Training Plan').replace(/^\d+\s*-\s*Day\s+/i, '')}
                </h5>
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

      {selectedPlanId && (
        <div className="card shadow-sm mt-4">
          <div className="card-body">
            <h3 className="mb-3 text-center">Plan Details</h3>
            {detailLoading && <div className="text-muted">Loading details...</div>}
            {detailError && <div className="alert alert-danger">{detailError}</div>}
            {detail && (
              <>
                <div className="mb-4">
                  {renderPlanDays(detail.plan)}
                </div>
                <div>
                  <h4 className="mb-2">AI Trainer Description</h4>
                  <div className="alert alert-info" style={{ whiteSpace: 'pre-wrap' }}>
                    {detail.description}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

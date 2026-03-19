import React, { useState } from 'react'
import './TrainingSurvey.css'

export default function TrainingSurvey() {
  const [formData, setFormData] = useState({
    daysPerWeek: '',
    weight: '',
    sex: '',
    height: ''
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!formData.daysPerWeek || !formData.weight || !formData.sex || !formData.height) {
      setMessage('Please fill in all fields')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/save-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daysPerWeek: parseInt(formData.daysPerWeek),
          weight: parseFloat(formData.weight),
          sex: formData.sex,
          height: parseFloat(formData.height),
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save survey data')
      }

      const data = await response.json()
      setMessage('✓ Survey saved successfully!')
      setFormData({
        daysPerWeek: '',
        weight: '',
        sex: '',
        height: ''
      })
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="survey-container">
      <div className="card shadow-lg border-0">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">Training Profile Survey</h2>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            {/* Days Per Week */}
            <div className="mb-4">
              <label htmlFor="daysPerWeek" className="form-label fw-bold">
                How many days per week can you train?
              </label>
              <select
                id="daysPerWeek"
                name="daysPerWeek"
                className="form-select form-select-lg"
                value={formData.daysPerWeek}
                onChange={handleChange}
              >
                <option value="">Select number of days</option>
                {[1, 2, 3, 4, 5, 6, 7].map(day => (
                  <option key={day} value={day}>{day} day{day !== 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            {/* Weight */}
            <div className="mb-4">
              <label htmlFor="weight" className="form-label fw-bold">
                Weight (kg)
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                className="form-control form-control-lg"
                placeholder="e.g., 75"
                value={formData.weight}
                onChange={handleChange}
                step="0.1"
                min="0"
              />
            </div>

            {/* Sex */}
            <div className="mb-4">
              <label className="form-label fw-bold">Sex</label>
              <div className="btn-group w-100" role="group">
                {['Male', 'Female', 'Other'].map(option => (
                  <React.Fragment key={option}>
                    <input
                      type="radio"
                      className="btn-check"
                      name="sex"
                      id={`sex-${option}`}
                      value={option}
                      checked={formData.sex === option}
                      onChange={handleChange}
                    />
                    <label className="btn btn-outline-primary" htmlFor={`sex-${option}`}>
                      {option}
                    </label>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Height */}
            <div className="mb-4">
              <label htmlFor="height" className="form-label fw-bold">
                Height (cm)
              </label>
              <input
                type="number"
                id="height"
                name="height"
                className="form-control form-control-lg"
                placeholder="e.g., 180"
                value={formData.height}
                onChange={handleChange}
                step="0.1"
                min="0"
              />
            </div>

            {/* Message */}
            {message && (
              <div className={`alert ${message.includes('✓') ? 'alert-success' : 'alert-danger'} mb-4`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : (
                'Submit Survey'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import './TrainingSurvey.css'

export default function TrainingSurvey() {
  const [formData, setFormData] = useState({
    daysPerWeek: '',
    weight: '',
    sex: '',
    height: '',
    age: '',
    experienceLevel: '',
    availableEquipment: []
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === 'checkbox') {
      setFormData(prev => {
        const equipment = [...prev.availableEquipment]
        if (checked) {
          equipment.push(value)
        } else {
          const index = equipment.indexOf(value)
          if (index > -1) equipment.splice(index, 1)
        }
        return { ...prev, availableEquipment: equipment }
      })
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!formData.daysPerWeek || !formData.weight || !formData.sex || !formData.height || !formData.age || !formData.experienceLevel) {
      setMessage('Please fill in all required fields')
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
          age: parseInt(formData.age),
          experienceLevel: formData.experienceLevel,
          availableEquipment: formData.availableEquipment,
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
        height: '',
        age: '',
        experienceLevel: '',
        availableEquipment: []
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

            {/* Age */}
            <div className="mb-4">
              <label htmlFor="age" className="form-label fw-bold">
                Age
              </label>
              <input
                type="number"
                id="age"
                name="age"
                className="form-control form-control-lg"
                placeholder="e.g., 25"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="120"
              />
            </div>

            {/* Experience Level */}
            <div className="mb-4">
              <label htmlFor="experienceLevel" className="form-label fw-bold">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                className="form-select form-select-lg"
                value={formData.experienceLevel}
                onChange={handleChange}
              >
                <option value="">Select your experience level</option>
                <option value="beginner">Beginner - New to training</option>
                <option value="intermediate">Intermediate - 1-3 years experience</option>
                <option value="advanced">Advanced - 3+ years experience</option>
              </select>
            </div>

            {/* Available Equipment */}
            <div className="mb-4">
              <label className="form-label fw-bold">
                Available Equipment (select all that apply)
              </label>
              <div className="row">
                {[
                  { value: 'barbell', label: 'Barbell' },
                  { value: 'dumbbell', label: 'Dumbbells' },
                  { value: 'bench', label: 'Bench' },
                  { value: 'machine', label: 'Machines' },
                  { value: 'cable_machine', label: 'Cable Machine' },
                  { value: 'pullup_bar', label: 'Pull-up Bar' },
                  { value: 'squat_rack', label: 'Squat Rack' },
                  { value: 'bodyweight', label: 'Bodyweight Only' }
                ].map(equipment => (
                  <div key={equipment.value} className="col-md-6 mb-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`equipment-${equipment.value}`}
                        name="availableEquipment"
                        value={equipment.value}
                        checked={formData.availableEquipment.includes(equipment.value)}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor={`equipment-${equipment.value}`}>
                        {equipment.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
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

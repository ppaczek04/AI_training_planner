import { useRef, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

export default function AIConvo() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef(null)
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

  const handleInput = (event) => {
    const nextValue = event.target.value
    setMessage(nextValue)

    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  const handleSend = async () => {
    const trimmed = message.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    setAnswer('')
    try {
      let authHeader = {}
      if (isAuthenticated) {
        const audience = import.meta.env.VITE_AUTH0_AUDIENCE
        const token = await getAccessTokenSilently(
          audience ? { authorizationParams: { audience } } : undefined
        )
        authHeader = { Authorization: `Bearer ${token}` }
      }

      const response = await fetch(`${apiBaseUrl}/api/ai-convo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
        body: JSON.stringify({ message: trimmed }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      setAnswer(data.answer || '')
    } catch (sendError) {
      setError(sendError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-convo-page">
      <div className="ai-convo card shadow-sm">
        <div className="card-body">
        <div className="ai-convo-title">This is your AI assistant!</div>
        <div className="ai-convo-subtitle">Wanna talk about your progress in the gym?</div>
        <div className="ai-convo-input">
          <textarea
            ref={textareaRef}
            className="form-control"
            rows={3}
            placeholder="Type your message..."
            value={message}
            onInput={handleInput}
          />
          <button
            className="ai-convo-send"
            type="button"
            onClick={handleSend}
            aria-label="Send message"
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M3 11.5L21 3l-8.5 18-1.9-6.1L3 11.5z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        {loading && <div className="text-muted mt-3">Waiting for response...</div>}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
        {answer && (
          <div className="ai-convo-answer mt-4">
            <div className="ai-convo-answer-title">Your trainer answered:</div>
            <div className="alert alert-info" style={{ whiteSpace: 'pre-wrap' }}>
              {answer}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

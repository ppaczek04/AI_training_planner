import { useRef, useState } from 'react'

export default function AIConvo() {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)

  const handleInput = (event) => {
    const nextValue = event.target.value
    setMessage(nextValue)

    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  const handleSend = () => {
    // Placeholder for OpenAI request.
    // We'll wire this up to the backend later.
  }

  return (
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
          <button className="ai-convo-send" type="button" onClick={handleSend} aria-label="Send message">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M3 11.5L21 3l-8.5 18-1.9-6.1L3 11.5z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function FormField({
  label, id, type = 'text', placeholder, value, onChange,
  error, onKeyPress, maxLength, autoComplete, disabled,
  hint,
}) {
  const [showPw, setShowPw] = useState(false)
  const isPw = type === 'password'
  const inputType = isPw ? (showPw ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5 mb-4">
      {label && (
        <label htmlFor={id} className="text-xs font-medium uppercase tracking-wider text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          maxLength={maxLength}
          autoComplete={autoComplete}
          disabled={disabled}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all disabled:opacity-50"
          style={{
            background:   'var(--bg2)',
            border:       `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
            color:        'var(--t1)',
            fontFamily:   'DM Sans, sans-serif',
            paddingRight: isPw ? '40px' : undefined,
          }}
          onFocus={e => { e.target.style.borderColor = error ? 'var(--red)' : 'var(--accent)' }}
          onBlur={e => { e.target.style.borderColor  = error ? 'var(--red)' : 'var(--border)' }}
        />
        {isPw && (
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs" style={{ color: 'var(--red)' }}>{error}</p>}
    </div>
  )
}

// Password strength indicator
export function PwStrength({ password }) {
  if (!password) return null
  let score = 0
  if (password.length >= 8)                         score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password))                       score++
  if (/[^a-zA-Z0-9]/.test(password))               score++

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'var(--red)', 'var(--gold)', 'var(--green)', 'var(--green)']
  const widths = ['0%', '25%', '50%', '75%', '100%']

  return (
    <div className="mb-4">
      <div className="h-1 rounded-full overflow-hidden mb-1" style={{ background: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: widths[score], background: colors[score] }}
        />
      </div>
      {score > 0 && (
        <p className="text-xs" style={{ color: colors[score] }}>{labels[score]} password</p>
      )}
    </div>
  )
}

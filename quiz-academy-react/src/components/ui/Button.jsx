import { forwardRef } from 'react'
import Spinner from './Spinner'

const variants = {
  primary:   'text-white font-medium transition-all hover:opacity-90 hover:-translate-y-px active:translate-y-0',
  secondary: 'font-medium transition-all hover:-translate-y-px active:translate-y-0',
  ghost:     'font-medium transition-all hover:-translate-y-px active:translate-y-0',
  danger:    'font-medium transition-all hover:-translate-y-px active:translate-y-0',
  icon:      'flex items-center justify-center transition-all hover:opacity-80 active:scale-95',
}

const sizes = {
  xs:   'px-3 py-1.5 text-xs rounded-lg',
  sm:   'px-4 py-2 text-sm rounded-lg',
  md:   'px-5 py-2.5 text-sm rounded-xl',
  lg:   'px-6 py-3 text-base rounded-xl',
  icon: 'w-9 h-9 rounded-xl',
}

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled = false, className = '', children, ...props },
  ref
) {
  const base = 'inline-flex items-center justify-center gap-2 font-body cursor-pointer border-none outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none'

  let style = {}
  if (variant === 'primary') {
    style = { background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 80%, var(--green)))', color: '#fff' }
  } else if (variant === 'secondary') {
    style = { background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t2)' }
  } else if (variant === 'ghost') {
    style = { background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }
  } else if (variant === 'danger') {
    style = { background: 'var(--red-dim)', border: '1px solid var(--red)', color: 'var(--red)' }
  } else if (variant === 'icon') {
    style = { background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--t2)' }
  }

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={style}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  )
})

export default Button

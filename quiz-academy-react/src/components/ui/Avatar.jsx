export default function Avatar({ src, name = 'User', size = 'md', className = '' }) {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' }
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${className}`}
        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
      />
    )
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-display font-bold flex-shrink-0 ${className}`}
      style={{ background: 'linear-gradient(135deg, var(--accent), var(--green))', color: '#fff' }}
    >
      {initials}
    </div>
  )
}

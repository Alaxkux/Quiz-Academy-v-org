/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      colors: {
        bg0:    'var(--bg0)',
        bg1:    'var(--bg1)',
        bg2:    'var(--bg2)',
        bg3:    'var(--bg3)',
        accent: 'var(--accent)',
        green:  'var(--green)',
        red:    'var(--red)',
        gold:   'var(--gold)',
        t1:     'var(--t1)',
        t2:     'var(--t2)',
        t3:     'var(--t3)',
      },
      animation: {
        'fade-up':   'fadeUp 0.3s ease',
        'fade-in':   'fadeIn 0.25s ease',
        'shimmer':   'shimmer 1.4s ease-in-out infinite',
        'pulse-soft':'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:    { '0%':{ opacity:0,transform:'translateY(10px)' }, '100%':{ opacity:1,transform:'translateY(0)' } },
        fadeIn:    { '0%':{ opacity:0 }, '100%':{ opacity:1 } },
        pulseSoft: { '0%,100%':{ opacity:1 }, '50%':{ opacity:0.6 } },
        shimmer:   { '0%':{ backgroundPosition:'-400px 0' }, '100%':{ backgroundPosition:'400px 0' } },
      },
    },
  },
  plugins: [],
}

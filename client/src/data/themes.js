export const THEMES = [
  { id: 'midnight', name: 'Midnight', dots: ['#07090E','#6C8EFF','#4DFFC3'], scheme: 'dark'  },
  { id: 'aurora',   name: 'Aurora',   dots: ['#060E0A','#3DFF9A','#7BFFD4'], scheme: 'dark'  },
  { id: 'sunset',   name: 'Sunset',   dots: ['#0E0806','#FF7A45','#56CFB2'], scheme: 'dark'  },
  { id: 'ocean',    name: 'Ocean',    dots: ['#060A10','#38BDF8','#4ADE80'], scheme: 'dark'  },
  { id: 'nebula',   name: 'Nebula',   dots: ['#08060E','#B57BFF','#4DFFC3'], scheme: 'dark'  },
  { id: 'snow',     name: 'Snow',     dots: ['#F4F6FA','#4F6EFF','#10B981'], scheme: 'light' },
  { id: 'paper',    name: 'Paper',    dots: ['#F5F0E8','#D4651A','#2D7A4F'], scheme: 'light' },
  { id: 'rose',     name: 'Rose',     dots: ['#FFF0F5','#E8417A','#10B981'], scheme: 'light' },
]

export function applyTheme(themeId) {
  document.documentElement.setAttribute('data-theme', themeId || 'midnight')
  localStorage.setItem('qa_theme', themeId || 'midnight')
}

export function getStoredTheme() {
  return localStorage.getItem('qa_theme') || 'midnight'
}

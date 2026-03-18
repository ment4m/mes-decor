/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        'tab': {'max': '900px'},
        'mob': {'max': '600px'},
      },
      colors: {
        gold:          '#A08650',
        'gold-light':  '#C4A87C',
        'gold-dark':   '#7A6335',
        dark:          '#3A2A10',
        'dark-deep':   '#1E1508',
        cream:         '#F2EDD8',
        ivory:         '#EDE8C0',
        peach:         '#EFE0B8',
        'off-white':   '#FDFBF5',
        'text-dark':   '#2C1F0A',
        'text-mid':    '#6B5230',
        'text-muted':  '#9B8260',
        'border-col':  '#DDD3B8',
      },
      fontFamily: {
        script: ['"Dancing Script"', 'cursive'],
      },
      borderRadius: {
        card: '16px',
        pill: '100px',
      },
    },
  },
  plugins: [],
}

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1c1917',
        paper: '#f7f5f0',
        alert: '#c2410c',
        crit: '#b91c1c',
        safe: '#15803d',
        line: '#d9d4c7'
      },
      fontFamily: {
        disp: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}

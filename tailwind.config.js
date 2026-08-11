export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        paper: '#f8fafc',
        alert: '#0ea5e9',
        crit: '#ef4444',
        safe: '#16a34a',
        line: '#dbe4ee'
      },
      fontFamily: {
        disp: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}

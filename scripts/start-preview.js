import { spawn } from 'node:child_process'

const port = process.env.PORT || 4173
const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['vite', 'preview', '--host', '0.0.0.0', '--port', String(port)],
  {
    stdio: 'inherit',
    env: process.env,
    shell: true
  }
)

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    process.exit(1)
  }

  process.exit(code ?? 1)
})

child.on('error', (error) => {
  console.error('No pude iniciar vite preview:', error)
  process.exit(1)
})

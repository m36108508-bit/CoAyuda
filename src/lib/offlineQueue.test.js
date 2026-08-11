import test from 'node:test'
import assert from 'node:assert/strict'
import { buildQueuedPersonaPayload } from './offlineQueue.js'

test('buildQueuedPersonaPayload keeps the original payload when there is no photo', () => {
  const payload = { nombre: 'Ana', ubicacion: 'Bogotá' }
  assert.deepEqual(buildQueuedPersonaPayload(payload, null), payload)
})

test('buildQueuedPersonaPayload keeps the data URL in the queued payload for later upload', () => {
  const payload = { nombre: 'Ana', ubicacion: 'Bogotá' }
  const dataUrl = 'data:image/png;base64,AAAA'
  const result = buildQueuedPersonaPayload(payload, dataUrl)

  assert.equal(result.foto_data_url, dataUrl)
  assert.equal(result.foto_url, null)
  assert.equal(result.nombre, 'Ana')
})

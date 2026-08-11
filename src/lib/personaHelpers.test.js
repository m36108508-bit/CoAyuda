import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPersonaPayload } from './personaHelpers.js'

test('buildPersonaPayload normaliza y limpia campos opcionales', () => {
  const payload = buildPersonaPayload({
    nombre: '  Ana María  ',
    cedula: ' 12345 ',
    estado: 'desaparecido',
    ubicacion: '  Bogotá  ',
    telefono: ' 555-123 ',
    foto_url: 'https://cdn.example.com/foto.jpg'
  })

  assert.deepEqual(payload, {
    nombre: 'Ana María',
    cedula: '12345',
    estado: 'desaparecido',
    ubicacion: 'Bogotá',
    telefono: '555-123',
    foto_url: 'https://cdn.example.com/foto.jpg'
  })
})

test('buildPersonaPayload deja nulos los campos vacíos', () => {
  const payload = buildPersonaPayload({
    nombre: 'Luis',
    cedula: '   ',
    estado: 'encontrado',
    ubicacion: 'Medellín',
    telefono: '',
    foto_url: ''
  })

  assert.deepEqual(payload, {
    nombre: 'Luis',
    cedula: null,
    estado: 'encontrado',
    ubicacion: 'Medellín',
    telefono: null,
    foto_url: null
  })
})

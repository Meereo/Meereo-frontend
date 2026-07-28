const assert = require('assert')
const { describe, it } = require('node:test')
const { generateInviteCode, isValidInviteCode } = require('../utils/inviteCode')

describe('INS-18 — invite code (8 letters + 1 digit)', () => {
  it('generates a 9-character code', () => {
    const code = generateInviteCode()
    assert.strictEqual(code.length, 9)
  })

  it('first 8 characters are uppercase letters', () => {
    const code = generateInviteCode()
    assert.ok(/^[A-Z]{8}/.test(code), `Expected 8 uppercase letters, got: ${code}`)
  })

  it('last character is a digit', () => {
    const code = generateInviteCode()
    assert.ok(/[0-9]$/.test(code), `Expected trailing digit, got: ${code}`)
  })

  it('validates correct codes', () => {
    assert.strictEqual(isValidInviteCode('ABCDEFGH4'), true)
    assert.strictEqual(isValidInviteCode('ZZZZZZZZ0'), true)
    assert.strictEqual(isValidInviteCode('TESTCODE9'), true)
  })

  it('rejects wrong formats', () => {
    assert.strictEqual(isValidInviteCode('1234567890'), false, '10 digits')
    assert.strictEqual(isValidInviteCode('ABCDEFG4'), false, 'too short')
    assert.strictEqual(isValidInviteCode('ABCDEFGHI'), false, '9 letters no digit')
    assert.strictEqual(isValidInviteCode('abcdefgh4'), false, 'lowercase')
    assert.strictEqual(isValidInviteCode('ABCDEFGH'), false, '8 chars missing digit')
    assert.strictEqual(isValidInviteCode('4ABCDEFGH'), false, 'digit first')
    assert.strictEqual(isValidInviteCode(''), false, 'empty')
    assert.strictEqual(isValidInviteCode(null), false, 'null')
    assert.strictEqual(isValidInviteCode(undefined), false, 'undefined')
  })

  it('generates unique codes', () => {
    const codes = new Set()
    for (let i = 0; i < 100; i++) codes.add(generateInviteCode())
    assert.ok(codes.size > 90, `Expected mostly unique codes from 100 generations, got ${codes.size}`)
  })

  it('all generated codes pass validation', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateInviteCode()
      assert.strictEqual(isValidInviteCode(code), true, `Generated code failed validation: ${code}`)
    }
  })
})

// INS-18 — Code d'invitation : 8 LETTRES MAJUSCULES + 1 CHIFFRE
// Format retenu le 28/07/2026. Ex. : ABCDEFGH4
// TODO INS-18 complet : invitation par e-mail, expiration, acceptation

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'
const CODE_RE = /^[A-Z]{8}[0-9]$/

function generateInviteCode() {
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += LETTERS[Math.floor(Math.random() * LETTERS.length)]
  }
  code += DIGITS[Math.floor(Math.random() * DIGITS.length)]
  return code
}

function isValidInviteCode(code) {
  return typeof code === 'string' && CODE_RE.test(code)
}

module.exports = { generateInviteCode, isValidInviteCode, INVITE_CODE_RE: CODE_RE }

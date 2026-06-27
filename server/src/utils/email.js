/**
 * Meereo — Email utility
 * En développement (SMTP_HOST absent) : log dans la console + retourne le token/lien.
 * En production : envoi réel via SMTP.
 */
const nodemailer = require('nodemailer')

function createTransporter() {
  if (!process.env.SMTP_HOST) return null
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

/**
 * Envoie un email (ou le logge en dev si pas de SMTP configuré).
 * @returns {{ success: boolean, dev?: boolean }}
 */
async function sendEmail({ to, subject, html, text }) {
  const transporter = createTransporter()

  if (!transporter) {
    // Mode développement — pas d'envoi réel
    console.log('\n[EMAIL DEV] ─────────────────────────────────')
    console.log('  To      :', to)
    console.log('  Subject :', subject)
    if (text) console.log('  Body    :', text.slice(0, 400))
    console.log('─────────────────────────────────────────────\n')
    return { success: true, dev: true }
  }

  await transporter.sendMail({
    from:    process.env.SMTP_FROM || 'Meereo <noreply@meereo.ci>',
    to,
    subject,
    html,
    text,
  })
  return { success: true }
}

/**
 * Email de réinitialisation de mot de passe.
 */
async function sendPasswordResetEmail({ to, resetLink, expiresMin = 60 }) {
  return sendEmail({
    to,
    subject: 'Réinitialisation de votre mot de passe Meereo',
    text: `Bonjour,\n\nVous avez demandé la réinitialisation de votre mot de passe.\n\nCliquez sur ce lien (valable ${expiresMin} minutes) :\n${resetLink}\n\nSi vous n'avez pas fait cette demande, ignorez cet email.\n\nMeereo`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff">
        <img src="https://meereo.ci/logo.png" alt="Meereo" style="height:36px;margin-bottom:24px" onerror="this.style.display='none'" />
        <h2 style="font-size:20px;font-weight:700;color:#111;margin:0 0 12px">Réinitialisation de mot de passe</h2>
        <p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 24px">
          Vous avez demandé la réinitialisation de votre mot de passe Meereo.<br>
          Ce lien est valable <strong>${expiresMin} minutes</strong>.
        </p>
        <a href="${resetLink}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600">
          Réinitialiser le mot de passe →
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px">
          Si vous n'avez pas fait cette demande, ignorez cet email.<br>
          Lien : <a href="${resetLink}" style="color:#888">${resetLink}</a>
        </p>
      </div>
    `,
  })
}

/**
 * Email de vérification d'adresse email.
 */
async function sendVerificationEmail({ to, verifyLink }) {
  return sendEmail({
    to,
    subject: 'Vérifiez votre adresse email Meereo',
    text: `Bonjour,\n\nCliquez sur ce lien pour vérifier votre adresse email :\n${verifyLink}\n\nMeereo`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff">
        <h2 style="font-size:20px;font-weight:700;color:#111;margin:0 0 12px">Vérifiez votre email</h2>
        <p style="color:#444;font-size:14px;line-height:1.6;margin:0 0 24px">
          Confirmez votre adresse email pour activer votre compte Meereo.
        </p>
        <a href="${verifyLink}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600">
          Vérifier mon email →
        </a>
      </div>
    `,
  })
}

module.exports = { sendEmail, sendPasswordResetEmail, sendVerificationEmail }

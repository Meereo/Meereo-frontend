/**
 * E-MAIL — aucun service n'est en place (réponse MEEREO du 27/07/2026).
 *
 * Cette implémentation JOURNALISE au lieu d'envoyer. Elle permet de développer
 * et de tester le parcours complet, y compris la porte de correction d'INS-09.
 *
 * 🔴 À REMPLACER AVANT MISE EN PRODUCTION. Sans envoi réel :
 *   • aucune adresse n'est jamais vérifiée ;
 *   • les notifications de suspension d'INS-20 n'arrivent pas ;
 *   • INS-09 ne peut pas être considéré comme fermé.
 * Le port MailPort est le seul fichier à écrire le jour où le service est choisi.
 * ⚠️ Prévoir SPF et DKIM : sans eux, les liens de vérification finissent en
 * indésirables, ce qui produit exactement le symptôme « je n'ai rien reçu ».
 */
import type { MailPort } from '../../core/ports.ts';

export interface SentMail { to: string; subject: string; text: string; at: Date }

export function createDevMailer(sink: SentMail[] = [], appUrl = 'http://localhost:3000'): MailPort & { sent: SentMail[] } {
  const send = (to: string, subject: string, text: string) => {
    const m = { to, subject, text, at: new Date() };
    sink.push(m);
    // eslint-disable-next-line no-console
    console.info(`[mail:dev] → ${to} · ${subject}\n${text}\n`);
  };
  return {
    sent: sink,
    async sendVerificationLink(to, token, expiresAt) {
      send(to, 'Confirmez votre adresse e-mail — MEEREO',
        `Bonjour,\n\nConfirmez votre adresse : ${appUrl}/verifier-email?token=${token}\n` +
        `Ce lien est valable jusqu'au ${expiresAt.toLocaleString('fr-FR')} et ne peut servir qu'une fois.\n\n` +
        `Si vous n'êtes pas à l'origine de cette inscription, ignorez ce message.\n\nL'équipe MEEREO`);
    },
    async sendSuspensionNotice(to, reason) {
      send(to, 'Votre compte MEEREO est temporairement suspendu',
        `Bonjour,\n\nVotre compte est suspendu. Motif : ${reason}\n\n` +
        `Vos projets et vos échanges sont conservés. Pour rétablir votre compte, ` +
        `transmettez vos justificatifs d'entreprise depuis ${appUrl}/aide/verification.\n\nL'équipe MEEREO`);
    },
  };
}

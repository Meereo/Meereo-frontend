import { useNavigate } from 'react-router-dom'
import MeereoLogo from '../components/shared/MeereoLogo'

export default function Confidentialite() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--tx)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/onboarding')}>
          <MeereoLogo size={24} />
          <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: 3 }}>MEEREO</span>
        </div>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 16px', fontSize: 12, fontWeight: 600, fontFamily: 'var(--f)', color: 'var(--tx)', cursor: 'pointer' }}>Retour</button>
      </nav>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-.5px', marginBottom: 8 }}>Politique de confidentialité</h1>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 32 }}>Dernière mise à jour : avril 2026</p>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>1. Données collectées</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>MEEREO collecte les données nécessaires à la création et la gestion de votre compte : nom, prénom, adresse email, numéro de téléphone, ville, type de profil (client, professionnel, fournisseur), ainsi que les données relatives à votre activité sur la plateforme (projets, documents, messages, commandes).</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>2. Utilisation des données</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>Vos données sont utilisées pour : fournir et améliorer les services de la plateforme, personnaliser votre expérience, faciliter la mise en relation entre acteurs, générer des statistiques anonymisées, et vous envoyer des notifications liées à votre activité.</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>3. Protection des données</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>MEEREO met en é“uvre des mesures techniques et organisationnelles appropriées pour protâger vos données contre tout accès non autorisé, perte ou altération. Les données sont stockées sur des serveurs sécurisés. L'accès aux données est strictement limité au personnel autorisé.</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>4. Partage des données</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>MEEREO ne vend pas vos données personnelles. Certaines informations peuvent être partagées avec des prestataires techniques (hébergement, paiement) dans le strict cadre de la fourniture du service. Les informations de votre profil professionnel ou fournisseur sont visibles par les autres utilisateurs de la plateforme selon les paramètres de visibilité que vous dûfinissez.</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>5. Vos droits</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>Conformément à la législation applicable, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Vous pouvez exercer ces droits en nous contactant à : contact@meereo.com. Vous pouvez également supprimer votre compte depuis les paramètres de votre espace.</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>6. Cookies</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>MEEREO utilise des cookies techniques nécessaires au fonctionnement de la plateforme. Aucun cookie publicitaire n'est utilisé. Les données de session sont stockées localement sur votre navigateur.</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>7. Contact</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>Pour toute question relative à la protection de vos données, vous pouvez nous contacter à : contact@meereo.com</p>
        </section>
      </div>
    </div>
  )
}


import { useNavigate } from 'react-router-dom'
import MeereoLogo from '../components/shared/MeereoLogo'

export default function Conditions() {
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
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.5px', marginBottom: 8 }}>Conditions d'utilisation</h1>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 32 }}>Dernière mise à jour : avril 2026</p>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>1. Objet</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>Les présentes conditions générales d'utilisation (CGU) régissent l'accès et l'utilisation de la plateforme MEEREO, éditée par MEEREO SAS, basée à Abidjan, Côte d'Ivoire. MEEREO est une plateforme digitale dédiée au secteur du BTP, de l'immobilier et de la construction, permettant la mise en relation de clients, professionnels et fournisseurs.</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>2. Accès à la plateforme</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>L'accès à MEEREO est réservé aux utilisateurs disposant d'un compte valide. L'inscription est gratuite. L'utilisateur s'engage à fournir des informations exactes et à les maintenir à jour. MEEREO se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes conditions.</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>3. Services proposés</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>MEEREO propose des outils de gestion de projets, de coordination entre acteurs du BTP, un marketplace de matériaux, un système d'appels d'offres, un suivi de chantier, une gestion documentaire et un assistant intelligent (KAI). Les fonctionnalités peuvent évoluer sans préavis.</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>4. Responsabilités</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>MEEREO met tout en Å“uvre pour assurer la disponibilité et la fiabilité de la plateforme. Toutefois, MEEREO ne saurait Ãªtre tenue responsable des interruptions, erreurs techniques ou pertes de données. L'utilisateur reste responsable de l'usage qu'il fait de la plateforme et des informations qu'il y publie.</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>5. Propriété intellectuelle</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>L'ensemble des contenus de la plateforme (textes, visuels, logos, logiciels, base de données) sont la propriété exclusive de MEEREO ou de ses partenaires. Toute reproduction ou utilisation non autorisée est interdite.</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>6. Contact</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>Pour toute question relative aux présentes conditions, vous pouvez nous contacter à l'adresse : contact@meereo.com</p>
        </section>
      </div>
    </div>
  )
}


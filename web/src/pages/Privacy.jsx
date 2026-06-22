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
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.5px', marginBottom: 8 }}>Politique de confidentialit�</h1>
        <p style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 32 }}>Derni�re mise � jour : avril 2026</p>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>1. Donn�es collect�es</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>MEEREO collecte les donn�es n�cessaires � la cr�ation et la gestion de votre compte : nom, pr�nom, adresse email, num�ro de t�l�phone, ville, type de profil (client, professionnel, fournisseur), ainsi que les donn�es relatives � votre activit� sur la plateforme (projets, documents, messages, commandes).</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>2. Utilisation des donn�es</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>Vos donn�es sont utilis�es pour : fournir et am�liorer les services de la plateforme, personnaliser votre exp�rience, faciliter la mise en relation entre acteurs, g�n�rer des statistiques anonymis�es, et vous envoyer des notifications li�es � votre activit�.</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>3. Protection des donn�es</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>MEEREO met en �“uvre des mesures techniques et organisationnelles appropri�es pour prot�ger vos donn�es contre tout acc�s non autoris�, perte ou alt�ration. Les donn�es sont stock�es sur des serveurs s�curis�s. L'acc�s aux donn�es est strictement limit� au personnel autoris�.</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>4. Partage des donn�es</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>MEEREO ne vend pas vos donn�es personnelles. Certaines informations peuvent être partag�es avec des prestataires techniques (h�bergement, paiement) dans le strict cadre de la fourniture du service. Les informations de votre profil professionnel ou fournisseur sont visibles par les autres utilisateurs de la plateforme selon les param�tres de visibilit� que vous d�finissez.</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>5. Vos droits</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>Conform�ment � la l�gislation applicable, vous disposez d'un droit d'acc�s, de rectification, de suppression et de portabilit� de vos donn�es. Vous pouvez exercer ces droits en nous contactant � : contact@meereo.com. Vous pouvez �galement supprimer votre compte depuis les param�tres de votre espace.</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>6. Cookies</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>MEEREO utilise des cookies techniques n�cessaires au fonctionnement de la plateforme. Aucun cookie publicitaire n'est utilis�. Les donn�es de session sont stock�es localement sur votre navigateur.</p>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>7. Contact</h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--t2)' }}>Pour toute question relative � la protection de vos donn�es, vous pouvez nous contacter � : contact@meereo.com</p>
        </section>
      </div>
    </div>
  )
}


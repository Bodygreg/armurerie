import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './MotDePasseOublie.css';

const REGEX_MOT_DE_PASSE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

const IconeOeil = ({ ouvert }) => (
  ouvert ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
);

function ReinitialiserMotDePasse() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [afficherConfirmation, setAfficherConfirmation] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  const gererReinitialisation = async (e) => {
    e.preventDefault();
    setErreur(null);

    if (nouveauMotDePasse !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!REGEX_MOT_DE_PASSE.test(nouveauMotDePasse)) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
      return;
    }

    setChargement(true);
    try {
      const reponse = await api.post('/auth/reinitialiser-mot-de-passe', { token, nouveauMotDePasse });
      login(reponse.data.token, reponse.data.utilisateur);
      navigate('/');
    } catch (err) {
      console.error(err);
      setErreur(err.response?.data?.message || 'Erreur lors de la réinitialisation.');
    } finally {
      setChargement(false);
    }
  };

  if (!token) {
    return (
      <div className="mdp-oublie">
        <p className="mdp-oublie-message">Lien invalide.</p>
        <Link to="/mot-de-passe-oublie">Demander un nouveau lien</Link>
      </div>
    );
  }

  return (
    <div className="mdp-oublie">
      <h1>Nouveau mot de passe</h1>
      <form onSubmit={gererReinitialisation} className="mdp-oublie-formulaire">
        <div className="mdp-oublie-champ-mdp">
          <input
            type={afficherMdp ? 'text' : 'password'}
            placeholder="Nouveau mot de passe"
            value={nouveauMotDePasse}
            onChange={(e) => setNouveauMotDePasse(e.target.value)}
            required
          />
          <button
            type="button"
            className="mdp-oublie-toggle-mdp"
            onClick={() => setAfficherMdp(!afficherMdp)}
            aria-label={afficherMdp ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <IconeOeil ouvert={afficherMdp} />
          </button>
        </div>
        <p className="mdp-oublie-aide">
          Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
        </p>

        <div className="mdp-oublie-champ-mdp">
          <input
            type={afficherConfirmation ? 'text' : 'password'}
            placeholder="Confirmez le mot de passe"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            required
          />
          <button
            type="button"
            className="mdp-oublie-toggle-mdp"
            onClick={() => setAfficherConfirmation(!afficherConfirmation)}
            aria-label={afficherConfirmation ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <IconeOeil ouvert={afficherConfirmation} />
          </button>
        </div>

        {erreur && <p className="mdp-oublie-erreur">{erreur}</p>}
        <button type="submit" disabled={chargement}>
          {chargement ? 'Enregistrement...' : 'Réinitialiser le mot de passe'}
        </button>
      </form>
    </div>
  );
}

export default ReinitialiserMotDePasse;
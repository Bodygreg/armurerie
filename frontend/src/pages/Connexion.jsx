import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Connexion.css';

function Connexion() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [erreur, setErreur] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const gererConnexion = async (e) => {
    e.preventDefault();
    setErreur(null);
    try {
      const reponse = await api.post('/auth/login', { email, motDePasse });
      login(reponse.data.token, reponse.data.utilisateur);
      navigate('/');
    } catch (err) {
      console.error(err);
      setErreur(err.response?.data?.message || 'Erreur de connexion.');
    }
  };

  return (
    <div className="connexion">
      <h1>Connexion</h1>
      <form onSubmit={gererConnexion} className="connexion-formulaire">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="connexion-champ-mdp">
          <input
            type={afficherMdp ? 'text' : 'password'}
            placeholder="Mot de passe"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />
          <button
            type="button"
            className="connexion-toggle-mdp"
            onClick={() => setAfficherMdp(!afficherMdp)}
            aria-label={afficherMdp ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {afficherMdp ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        {erreur && <p className="connexion-erreur">{erreur}</p>}
        <button type="submit">Se connecter</button>
      </form>
      <div className="connexion-liens">
        <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
        <Link to="/inscription">Créer un compte</Link>
      </div>
    </div>
  );
}

export default Connexion;
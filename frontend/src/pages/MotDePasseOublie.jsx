import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './MotDePasseOublie.css';

function MotDePasseOublie() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [chargement, setChargement] = useState(false);

  const gererEnvoi = async (e) => {
    e.preventDefault();
    setChargement(true);
    setMessage(null);
    try {
      const reponse = await api.post('/auth/mot-de-passe-oublie', { email });
      setMessage(reponse.data.message);
    } catch (err) {
      console.error(err);
      setMessage("Une erreur est survenue, réessayez plus tard.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="mdp-oublie">
      <h1>Mot de passe oublié</h1>
      <p className="mdp-oublie-texte">
        Entrez votre email, vous recevrez un lien pour choisir un nouveau mot de passe.
      </p>
      <form onSubmit={gererEnvoi} className="mdp-oublie-formulaire">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={chargement}>
          {chargement ? 'Envoi...' : 'Envoyer le lien'}
        </button>
      </form>
      {message && <p className="mdp-oublie-message">{message}</p>}
      <div className="mdp-oublie-liens">
        <Link to="/connexion">Retour à la connexion</Link>
      </div>
    </div>
  );
}

export default MotDePasseOublie;
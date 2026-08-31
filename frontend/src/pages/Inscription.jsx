import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Inscription.css';

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

function Inscription() {
  const [formulaire, setFormulaire] = useState({
    nom: '',
    prenom: '',
    email: '',
    adresse: '',
    telephone: '',
    motDePasse: '',
    confirmationMotDePasse: '',
  });
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [afficherConfirmMdp, setAfficherConfirmMdp] = useState(false);
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const gererChangement = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  const gererInscription = async (e) => {
    e.preventDefault();
    setErreur(null);

    if (formulaire.motDePasse !== formulaire.confirmationMotDePasse) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }

    if (!REGEX_MOT_DE_PASSE.test(formulaire.motDePasse)) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
      return;
    }

    setChargement(true);
    try {
      await api.post('/auth/register', {
        nom: formulaire.nom,
        prenom: formulaire.prenom,
        email: formulaire.email,
        adresse: formulaire.adresse,
        telephone: formulaire.telephone,
        motDePasse: formulaire.motDePasse,
      });

      const reponseLogin = await api.post('/auth/login', {
        email: formulaire.email,
        motDePasse: formulaire.motDePasse,
      });

      login(reponseLogin.data.token, reponseLogin.data.utilisateur);
      navigate('/');
    } catch (err) {
      console.error(err);
      setErreur(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="inscription">
      <h1>Créer un compte</h1>
      <form onSubmit={gererInscription} className="inscription-formulaire">
        <input
          type="text"
          name="nom"
          placeholder="Nom"
          value={formulaire.nom}
          onChange={gererChangement}
          required
        />
        <input
          type="text"
          name="prenom"
          placeholder="Prénom"
          value={formulaire.prenom}
          onChange={gererChangement}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formulaire.email}
          onChange={gererChangement}
          required
        />
        <input
          type="text"
          name="adresse"
          placeholder="Adresse"
          value={formulaire.adresse}
          onChange={gererChangement}
        />
        <input
          type="tel"
          name="telephone"
          placeholder="Téléphone"
          value={formulaire.telephone}
          onChange={gererChangement}
        />

        <div className="inscription-champ-mdp">
          <input
            type={afficherMdp ? 'text' : 'password'}
            name="motDePasse"
            placeholder="Mot de passe"
            value={formulaire.motDePasse}
            onChange={gererChangement}
            required
          />
          <button
            type="button"
            className="inscription-toggle-mdp"
            onClick={() => setAfficherMdp(!afficherMdp)}
            aria-label={afficherMdp ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <IconeOeil ouvert={afficherMdp} />
          </button>
        </div>

        <p className="inscription-aide-mdp">
          Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
        </p>

        <div className="inscription-champ-mdp">
          <input
            type={afficherConfirmMdp ? 'text' : 'password'}
            name="confirmationMotDePasse"
            placeholder="Retapez le mot de passe"
            value={formulaire.confirmationMotDePasse}
            onChange={gererChangement}
            required
          />
          <button
            type="button"
            className="inscription-toggle-mdp"
            onClick={() => setAfficherConfirmMdp(!afficherConfirmMdp)}
            aria-label={afficherConfirmMdp ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <IconeOeil ouvert={afficherConfirmMdp} />
          </button>
        </div>

        {erreur && <p className="inscription-erreur">{erreur}</p>}

        <button type="submit" disabled={chargement}>
          {chargement ? 'Création en cours...' : 'Créer mon compte'}
        </button>
      </form>

      <div className="inscription-liens">
        <Link to="/connexion">Déjà un compte ? Se connecter</Link>
      </div>
    </div>
  );
}

export default Inscription;
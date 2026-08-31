import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './MonEspace.css';

const LIBELLES_STATUT_EMPRUNT = {
  en_cours: 'En cours',
  en_retard: 'En retard',
  retourne: 'Rendu',
};

function MonEspace() {
  const { utilisateur, token, mettreAJourUtilisateur, logout } = useAuth();
  const navigate = useNavigate();

  const [onglet, setOnglet] = useState('profil');

  const [formulaire, setFormulaire] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    telephone: '',
  });
  const [messageProfil, setMessageProfil] = useState(null);
  const [chargementProfil, setChargementProfil] = useState(false);

  const [emprunts, setEmprunts] = useState([]);
  const [chargementEmprunts, setChargementEmprunts] = useState(true);

  // Protection de la route : redirige si pas connecté
  useEffect(() => {
    if (!utilisateur) {
      navigate('/connexion');
    }
  }, [utilisateur, navigate]);

  // Préremplit le formulaire dès que l'utilisateur est connu
  useEffect(() => {
    if (token) {
      const chargerProfilComplet = async () => {
        try {
          const reponse = await api.get('/utilisateurs/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFormulaire({
            nom: reponse.data.nom,
            prenom: reponse.data.prenom,
            adresse: reponse.data.adresse || '',
            telephone: reponse.data.telephone || '',
          });
        } catch (err) {
          console.error(err);
        }
      };
      chargerProfilComplet();
    }
  }, [token]);

  // Charge les emprunts uniquement quand l'onglet correspondant est actif
  useEffect(() => {
    if (onglet === 'emprunts' && token) {
      const chargerEmprunts = async () => {
        setChargementEmprunts(true);
        try {
          const reponse = await api.get('/emprunts/mes-emprunts', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setEmprunts(reponse.data);
        } catch (err) {
          console.error(err);
        } finally {
          setChargementEmprunts(false);
        }
      };
      chargerEmprunts();
    }
  }, [onglet, token]);

  const gererChangement = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  const gererModification = async (e) => {
    e.preventDefault();
    setMessageProfil(null);
    setChargementProfil(true);
    try {
      const reponse = await api.patch('/utilisateurs/me', formulaire, {
        headers: { Authorization: `Bearer ${token}` },
      });
      mettreAJourUtilisateur(reponse.data);
      setMessageProfil({ type: 'succes', texte: 'Profil mis à jour.' });
    } catch (err) {
      console.error(err);
      setMessageProfil({
        type: 'erreur',
        texte: err.response?.data?.message || 'Erreur lors de la modification.',
      });
    } finally {
      setChargementProfil(false);
    }
  };

  const gererSuppression = async () => {
    const confirmation = window.confirm(
      'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'
    );
    if (!confirmation) return;

    try {
      await api.delete('/utilisateurs/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
      navigate('/');
    } catch (err) {
      console.error(err);
      setMessageProfil({
        type: 'erreur',
        texte: err.response?.data?.message || 'Erreur lors de la suppression.',
      });
    }
  };

  if (!utilisateur) return null;

  return (
    <div className="mon-espace">
      <h1>Mon espace</h1>

      <div className="mon-espace-onglets">
        <button
          className={onglet === 'profil' ? 'actif' : ''}
          onClick={() => setOnglet('profil')}
        >
          Mes informations
        </button>
        <button
          className={onglet === 'emprunts' ? 'actif' : ''}
          onClick={() => setOnglet('emprunts')}
        >
          Mes emprunts
        </button>
      </div>

      {onglet === 'profil' && (
        <div className="mon-espace-contenu">
          <form onSubmit={gererModification} className="mon-espace-formulaire">
            <label>
              Nom
              <input type="text" name="nom" value={formulaire.nom} onChange={gererChangement} required />
            </label>
            <label>
              Prénom
              <input type="text" name="prenom" value={formulaire.prenom} onChange={gererChangement} required />
            </label>
            <label>
              Email
              <input type="email" value={utilisateur.email} disabled />
            </label>
            <label>
              Adresse
              <input type="text" name="adresse" value={formulaire.adresse} onChange={gererChangement} />
            </label>
            <label>
              Téléphone
              <input type="tel" name="telephone" value={formulaire.telephone} onChange={gererChangement} />
            </label>

            {messageProfil && (
              <p className={messageProfil.type === 'succes' ? 'mon-espace-succes' : 'mon-espace-erreur'}>
                {messageProfil.texte}
              </p>
            )}

            <button type="submit" disabled={chargementProfil}>
              {chargementProfil ? 'Enregistrement...' : 'Modifier'}
            </button>
          </form>

          <button className="mon-espace-supprimer" onClick={gererSuppression}>
            Supprimer mon compte
          </button>
        </div>
      )}

      {onglet === 'emprunts' && (
        <div className="mon-espace-contenu">
          {chargementEmprunts && <p>Chargement...</p>}
          {!chargementEmprunts && emprunts.length === 0 && (
            <p>Vous n'avez aucun emprunt pour le moment.</p>
          )}
          <ul className="mon-espace-liste-emprunts">
            {emprunts.map((emprunt) => (
              <li key={emprunt.id} className="mon-espace-emprunt">
                <div>
                  <p className="mon-espace-emprunt-titre">{emprunt.Livre.titre}</p>
                  <p className="mon-espace-emprunt-dates">
                    Emprunté le {new Date(emprunt.dateEmprunt).toLocaleDateString('fr-FR')}
                    {' — à rendre avant le '}
                    {new Date(emprunt.dateRetourPrevue).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className={`mon-espace-badge badge-${emprunt.statut}`}>
                  {LIBELLES_STATUT_EMPRUNT[emprunt.statut]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MonEspace;
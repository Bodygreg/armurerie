import { useState, useEffect } from 'react';
import api from '../../services/api';

function GestionGestionnaires({ token }) {
  const [formulaire, setFormulaire] = useState({
    nom: '', prenom: '', email: '', adresse: '', telephone: '',
  });
  const [resultat, setResultat] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [gestionnaires, setGestionnaires] = useState([]);

  const chargerGestionnaires = async () => {
    try {
      const reponse = await api.get('/admin/gestionnaires', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGestionnaires(reponse.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    chargerGestionnaires();
  }, []);

  const gererChangement = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  const gererCreation = async (e) => {
    e.preventDefault();
    setResultat(null);
    setChargement(true);
    try {
      const reponse = await api.post('/admin/gestionnaires', formulaire, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResultat({ type: 'succes', data: reponse.data });
      setFormulaire({ nom: '', prenom: '', email: '', adresse: '', telephone: '' });
      chargerGestionnaires();
    } catch (err) {
      console.error(err);
      setResultat({ type: 'erreur', message: err.response?.data?.message || 'Erreur lors de la création.' });
    } finally {
      setChargement(false);
    }
  };

  const gererSuppression = async (id, nomComplet) => {
    const confirmation = window.confirm(`Retirer les droits de gestionnaire à ${nomComplet} ?`);
    if (!confirmation) return;

    try {
      await api.delete(`/admin/gestionnaires/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      chargerGestionnaires();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <form onSubmit={gererCreation} className="admin-formulaire">
        <input type="text" name="nom" placeholder="Nom" value={formulaire.nom} onChange={gererChangement} required />
        <input type="text" name="prenom" placeholder="Prénom" value={formulaire.prenom} onChange={gererChangement} required />
        <input type="email" name="email" placeholder="Email" value={formulaire.email} onChange={gererChangement} required />
        <input type="text" name="adresse" placeholder="Adresse" value={formulaire.adresse} onChange={gererChangement} />
        <input type="tel" name="telephone" placeholder="Téléphone" value={formulaire.telephone} onChange={gererChangement} />

        <button type="submit" disabled={chargement}>
          {chargement ? 'Création...' : 'Créer le gestionnaire'}
        </button>
      </form>

      {resultat?.type === 'succes' && (
        <div className="admin-resultat-succes">
          <p>Gestionnaire créé avec succès.</p>
          <p className="admin-mdp-temporaire">
            Mot de passe temporaire : <strong>{resultat.data.motDePasseTemporaire}</strong>
          </p>
          <p className="admin-avertissement">
            Notez-le maintenant, il ne sera plus jamais affiché.
          </p>
        </div>
      )}
      {resultat?.type === 'erreur' && <p className="admin-erreur">{resultat.message}</p>}

      <h3 className="admin-sous-titre">Gestionnaires actuels</h3>
      <table className="gestionnaire-tableau">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {gestionnaires.map((g) => (
            <tr key={g.id}>
              <td>{g.prenom} {g.nom}</td>
              <td>{g.email}</td>
              <td>
                <button
                  className="gestionnaire-bouton-danger"
                  onClick={() => gererSuppression(g.id, `${g.prenom} ${g.nom}`)}
                >
                  Retirer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GestionGestionnaires;
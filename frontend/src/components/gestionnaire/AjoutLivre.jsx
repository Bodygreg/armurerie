import { useState } from 'react';
import api from '../../services/api';

function AjoutLivre({ token }) {
  const [formulaire, setFormulaire] = useState({
    titre: '',
    annee: '',
    resume: '',
    photoCouverture: '',
    auteur: '',
    theme: '',
  });
  const [message, setMessage] = useState(null);
  const [chargement, setChargement] = useState(false);

  const gererChangement = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  const gererAjout = async (e) => {
    e.preventDefault();
    setMessage(null);
    setChargement(true);
    try {
      await api.post('/livres', formulaire, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ type: 'succes', texte: 'Livre ajouté au catalogue.' });
      setFormulaire({ titre: '', annee: '', resume: '', photoCouverture: '', auteur: '', theme: '' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'erreur', texte: err.response?.data?.message || "Erreur lors de l'ajout." });
    } finally {
      setChargement(false);
    }
  };

  return (
    <form onSubmit={gererAjout} className="gestionnaire-formulaire">
      <input type="text" name="titre" placeholder="Titre" value={formulaire.titre} onChange={gererChangement} required />
      <input type="text" name="auteur" placeholder="Auteur" value={formulaire.auteur} onChange={gererChangement} required />
      <input type="text" name="theme" placeholder="Thème" value={formulaire.theme} onChange={gererChangement} required />
      <input type="number" name="annee" placeholder="Année" value={formulaire.annee} onChange={gererChangement} />
      <input type="text" name="photoCouverture" placeholder="URL de la couverture (optionnel)" value={formulaire.photoCouverture} onChange={gererChangement} />
      <textarea name="resume" placeholder="Résumé" value={formulaire.resume} onChange={gererChangement} rows={5} />

      {message && (
        <p className={message.type === 'succes' ? 'gestionnaire-succes' : 'gestionnaire-erreur'}>
          {message.texte}
        </p>
      )}

      <button type="submit" disabled={chargement}>
        {chargement ? 'Ajout...' : 'Ajouter au catalogue'}
      </button>
    </form>
  );
}

export default AjoutLivre;
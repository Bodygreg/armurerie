import { useState } from 'react';
import api from '../../services/api';

function AjoutLivre({ token }) {
  const [formulaire, setFormulaire] = useState({
    titre: '',
    annee: '',
    resume: '',
    auteur: '',
    theme: '',
  });
  const [photo, setPhoto] = useState(null);
  const [apercu, setApercu] = useState(null);
  const [message, setMessage] = useState(null);
  const [chargement, setChargement] = useState(false);

  const gererChangement = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  const gererChoixPhoto = (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;

    setPhoto(fichier);
    setApercu(URL.createObjectURL(fichier));
  };

  const gererAjout = async (e) => {
    e.preventDefault();
    setMessage(null);
    setChargement(true);

    const donnees = new FormData();
    donnees.append('titre', formulaire.titre);
    donnees.append('annee', formulaire.annee);
    donnees.append('resume', formulaire.resume);
    donnees.append('auteur', formulaire.auteur);
    donnees.append('theme', formulaire.theme);
    if (photo) {
      donnees.append('photo', photo);
    }

    try {
      await api.post('/livres', donnees, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ type: 'succes', texte: 'Livre ajouté au catalogue.' });
      setFormulaire({ titre: '', annee: '', resume: '', auteur: '', theme: '' });
      setPhoto(null);
      setApercu(null);
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
      <textarea name="resume" placeholder="Résumé" value={formulaire.resume} onChange={gererChangement} rows={5} />

      <label className="gestionnaire-champ-fichier">
        Photo de couverture (optionnel)
        <input type="file" accept="image/*" onChange={gererChoixPhoto} />
      </label>

      {apercu && (
        <img src={apercu} alt="Aperçu de la couverture" className="gestionnaire-apercu-photo" />
      )}

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
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

const LIBELLES_STATUT = {
  disponible: 'Disponible',
  reserve: 'Réservé',
  indisponible: 'Indisponible',
};

function GestionCatalogue({ token }) {
  const [livres, setLivres] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState(null);

  const [titre, setTitre] = useState('');
  const [auteur, setAuteur] = useState('');
  const [theme, setTheme] = useState('');

  const idLivreCible = useRef(null);
  const inputPhotoRef = useRef(null);

  const chargerLivres = async (params = {}, pageDemandee = 1) => {
    setChargement(true);
    try {
      const reponse = await api.get('/livres', {
        params: { ...params, page: pageDemandee, limite: 10 },
      });
      setLivres(reponse.data.livres);
      setPage(reponse.data.page);
      setTotalPages(reponse.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerLivres();
  }, []);

  const gererRecherche = (e) => {
    e.preventDefault();
    chargerLivres({ titre, auteur, theme }, 1);
  };

  const pagePrecedente = () => {
    if (page > 1) chargerLivres({ titre, auteur, theme }, page - 1);
  };

  const pageSuivante = () => {
    if (page < totalPages) chargerLivres({ titre, auteur, theme }, page + 1);
  };

  const gererArchivage = async (id, titreLivre) => {
    const confirmation = window.confirm(`Retirer "${titreLivre}" du catalogue ?`);
    if (!confirmation) return;

    try {
      await api.patch(`/livres/${id}/archiver`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(`"${titreLivre}" a été retiré du catalogue.`);
      chargerLivres({ titre, auteur, theme }, page);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Erreur lors de l'archivage.");
    }
  };

  const declencherChoixPhoto = (id) => {
    idLivreCible.current = id;
    inputPhotoRef.current.click();
  };

  const gererChangementPhoto = async (e) => {
    const fichier = e.target.files[0];
    if (!fichier || !idLivreCible.current) return;

    const donnees = new FormData();
    donnees.append('photo', fichier);

    try {
      await api.patch(`/livres/${idLivreCible.current}/photo`, donnees, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Photo mise à jour.');
      chargerLivres({ titre, auteur, theme }, page);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Erreur lors de la mise à jour de la photo.');
    } finally {
      e.target.value = '';
      idLivreCible.current = null;
    }
  };

  return (
    <div>
      <form onSubmit={gererRecherche} className="gestionnaire-formulaire-recherche">
        <input type="text" placeholder="Titre" value={titre} onChange={(e) => setTitre(e.target.value)} />
        <input type="text" placeholder="Auteur" value={auteur} onChange={(e) => setAuteur(e.target.value)} />
        <input type="text" placeholder="Thème" value={theme} onChange={(e) => setTheme(e.target.value)} />
        <button type="submit">Rechercher</button>
      </form>

      <input
        type="file"
        accept="image/*"
        ref={inputPhotoRef}
        onChange={gererChangementPhoto}
        style={{ display: 'none' }}
      />

      {message && <p className="gestionnaire-message">{message}</p>}
      {chargement && <p>Chargement...</p>}
      {!chargement && livres.length === 0 && <p>Aucun livre ne correspond à cette recherche.</p>}

      {!chargement && livres.length > 0 && (
        <table className="gestionnaire-tableau">
          <thead>
            <tr>
              <th></th>
              <th>Titre</th>
              <th>Auteur</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {livres.map((livre) => (
              <tr key={livre.id}>
                <td>
                  {livre.photoCouverture ? (
                    <img src={livre.photoCouverture} alt={livre.titre} className="gestionnaire-vignette" />
                  ) : (
                    <span className="gestionnaire-vignette-placeholder">📖</span>
                  )}
                </td>
                <td>{livre.titre}</td>
                <td>{livre.auteur}</td>
                <td>{LIBELLES_STATUT[livre.statut]}</td>
                <td className="gestionnaire-actions">
                  <button
                    className="gestionnaire-bouton-secondaire"
                    onClick={() => declencherChoixPhoto(livre.id)}
                  >
                    Photo
                  </button>
                  <button
                    className="gestionnaire-bouton-danger"
                    onClick={() => gererArchivage(livre.id, livre.titre)}
                  >
                    Retirer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!chargement && totalPages > 1 && (
        <div className="gestionnaire-pagination">
          <button onClick={pagePrecedente} disabled={page <= 1}>Précédent</button>
          <span>Page {page} / {totalPages}</span>
          <button onClick={pageSuivante} disabled={page >= totalPages}>Suivant</button>
        </div>
      )}
    </div>
  );
}

export default GestionCatalogue;
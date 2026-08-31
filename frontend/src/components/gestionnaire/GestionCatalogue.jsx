import { useState, useEffect } from 'react';
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

  return (
    <div>
      <form onSubmit={gererRecherche} className="gestionnaire-formulaire-recherche">
        <input type="text" placeholder="Titre" value={titre} onChange={(e) => setTitre(e.target.value)} />
        <input type="text" placeholder="Auteur" value={auteur} onChange={(e) => setAuteur(e.target.value)} />
        <input type="text" placeholder="Thème" value={theme} onChange={(e) => setTheme(e.target.value)} />
        <button type="submit">Rechercher</button>
      </form>

      {message && <p className="gestionnaire-message">{message}</p>}
      {chargement && <p>Chargement...</p>}
      {!chargement && livres.length === 0 && <p>Aucun livre ne correspond à cette recherche.</p>}

      {!chargement && livres.length > 0 && (
        <table className="gestionnaire-tableau">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Auteur</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {livres.map((livre) => (
              <tr key={livre.id}>
                <td>{livre.titre}</td>
                <td>{livre.auteur}</td>
                <td>{LIBELLES_STATUT[livre.statut]}</td>
                <td>
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
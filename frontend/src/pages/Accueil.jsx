import { useState, useEffect } from 'react';
import api from '../services/api';
import BookCard from '../components/BookCard';
import './Accueil.css';

function Accueil() {
  const [nouveautes, setNouveautes] = useState([]);
  const [resultats, setResultats] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [titre, setTitre] = useState('');
  const [auteur, setAuteur] = useState('');
  const [theme, setTheme] = useState('');

  const chargerResultats = async (params = {}, pageDemandee = 1) => {
    setChargement(true);
    setErreur(null);
    try {
      const reponse = await api.get('/livres', {
        params: { ...params, page: pageDemandee, limite: 12 },
      });
      setResultats(reponse.data.livres);
      setPage(reponse.data.page);
      setTotalPages(reponse.data.totalPages);
    } catch (err) {
      console.error(err);
      setErreur('Impossible de charger les livres pour le moment.');
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    const chargerDonneesInitiales = async () => {
      try {
        const reponseNouveautes = await api.get('/livres', {
          params: { tri: 'recent', limite: 3 },
        });
        setNouveautes(reponseNouveautes.data.livres);
      } catch (err) {
        console.error(err);
      }
      await chargerResultats();
    };

    chargerDonneesInitiales();
  }, []);

  const gererRecherche = (e) => {
    e.preventDefault();
    chargerResultats({ titre, auteur, theme }, 1);
  };

  const pagePrecedente = () => {
    if (page > 1) chargerResultats({ titre, auteur, theme }, page - 1);
  };

  const pageSuivante = () => {
    if (page < totalPages) chargerResultats({ titre, auteur, theme }, page + 1);
  };

  return (
    <div className="accueil">
      <section className="accueil-nouveautes">
        <h2>Nouveautés</h2>
        <div className="accueil-grille-nouveautes">
          {nouveautes.map((livre) => (
            <BookCard key={livre.id} livre={livre} />
          ))}
        </div>
      </section>

      <section className="accueil-recherche">
        <h2>Rechercher un ouvrage</h2>
        <form onSubmit={gererRecherche} className="accueil-formulaire-recherche">
          <input type="text" placeholder="Titre" value={titre} onChange={(e) => setTitre(e.target.value)} />
          <input type="text" placeholder="Auteur" value={auteur} onChange={(e) => setAuteur(e.target.value)} />
          <input type="text" placeholder="Thème" value={theme} onChange={(e) => setTheme(e.target.value)} />
          <button type="submit">Rechercher</button>
        </form>
      </section>

      <section className="accueil-resultats">
        <h2>Résultats</h2>
        {chargement && <p>Chargement...</p>}
        {erreur && <p className="accueil-erreur">{erreur}</p>}
        {!chargement && !erreur && resultats.length === 0 && (
          <p>Aucun livre ne correspond à votre recherche.</p>
        )}
        <div className="accueil-grille-resultats">
          {!chargement && resultats.map((livre) => (
            <BookCard key={livre.id} livre={livre} />
          ))}
        </div>

        {!chargement && totalPages > 1 && (
          <div className="accueil-pagination">
            <button onClick={pagePrecedente} disabled={page <= 1}>Précédent</button>
            <span>Page {page} / {totalPages}</span>
            <button onClick={pageSuivante} disabled={page >= totalPages}>Suivant</button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Accueil;
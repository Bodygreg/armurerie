import { useState } from 'react';
import api from '../../services/api';

function GestionAdherents({ token }) {
  const [nom, setNom] = useState('');
  const [resultats, setResultats] = useState([]);
  const [chargementRecherche, setChargementRecherche] = useState(false);
  const [email, setEmail] = useState('');
  const [fiche, setFiche] = useState(null);
  const [chargementFiche, setChargementFiche] = useState(false);

  const gererRecherche = async (e) => {
    e.preventDefault();
    setChargementRecherche(true);
    setFiche(null);
    try {
      const reponse = await api.get('/gestionnaire/adherents', {
        params: { nom, email },
        headers: { Authorization: `Bearer ${token}` },
      });
      setResultats(reponse.data);
    } catch (err) {
      console.error(err);
    } finally {
      setChargementRecherche(false);
    }
  };

  const gererClicAdherent = async (id) => {
    setChargementFiche(true);
    try {
      const reponse = await api.get(`/gestionnaire/adherents/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiche(reponse.data);
    } catch (err) {
      console.error(err);
    } finally {
      setChargementFiche(false);
    }
  };

  const gererConversion = async (idReservation) => {
    try {
      await api.patch(`/reservations/${idReservation}/convertir-en-emprunt`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      gererClicAdherent(fiche.adherent.id); // recharge la fiche pour refléter le changement
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Erreur lors de la conversion.');
    }
  };

  return (
    <div>
      <form onSubmit={gererRecherche} className="gestionnaire-formulaire-inline">
        <input
          type="text"
          placeholder="Nom ou prénom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={chargementRecherche}>
          {chargementRecherche ? 'Recherche...' : 'Rechercher'}
        </button>
      </form>

      <table className="gestionnaire-tableau">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {resultats.map((adherent) => (
            <tr key={adherent.id}>
              <td>{adherent.prenom} {adherent.nom}</td>
              <td>{adherent.email}</td>
              <td>
                <button
                  className="gestionnaire-bouton-secondaire"
                  onClick={() => gererClicAdherent(adherent.id)}
                >
                  Voir la fiche
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {chargementFiche && <p>Chargement de la fiche...</p>}

      {fiche && (
        <div className="gestionnaire-fiche">
          <h3>{fiche.adherent.prenom} {fiche.adherent.nom}</h3>
          <p className="gestionnaire-fiche-info">{fiche.adherent.email}</p>
          {fiche.adherent.telephone && <p className="gestionnaire-fiche-info">{fiche.adherent.telephone}</p>}
          {fiche.adherent.adresse && <p className="gestionnaire-fiche-info">{fiche.adherent.adresse}</p>}

          <h4>Emprunts</h4>
          {fiche.emprunts.length === 0 && <p>Aucun emprunt.</p>}
          <ul className="gestionnaire-fiche-liste">
            {fiche.emprunts.map((e) => (
              <li key={e.id}>
                {e.Livre.titre} — emprunté le {new Date(e.dateEmprunt).toLocaleDateString('fr-FR')} ({e.statut})
              </li>
            ))}
          </ul>

          <h4>Réservations</h4>
            {fiche.reservations.length === 0 && <p>Aucune réservation.</p>}
            <ul className="gestionnaire-fiche-liste">
              {fiche.reservations.map((r) => (
                <li key={r.id} className="gestionnaire-fiche-ligne">
                  <span>
                    {r.Livre.titre} — réservé le {new Date(r.dateReservation).toLocaleDateString('fr-FR')} ({r.statut})
                  </span>
                  {r.statut === 'en_attente' && (
                    <button className="gestionnaire-bouton-secondaire" onClick={() => gererConversion(r.id)}>
                      Marquer comme retiré
                    </button>
                  )}
                </li>
              ))}
            </ul>
        </div>
      )}
    </div>
  );
}

export default GestionAdherents;
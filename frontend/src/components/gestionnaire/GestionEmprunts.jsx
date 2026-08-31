import { useState, useEffect } from 'react';
import api from '../../services/api';

const LIBELLES_STATUT = {
  en_cours: 'En cours',
  en_retard: 'En retard',
};

function GestionEmprunts({ token }) {
  const [emprunts, setEmprunts] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [message, setMessage] = useState(null);

  const chargerEmprunts = async () => {
    setChargement(true);
    try {
      const reponse = await api.get('/emprunts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmprunts(reponse.data);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerEmprunts();
  }, []);

  const gererRetour = async (id, titre) => {
    const confirmation = window.confirm(`Confirmer le retour de "${titre}" ?`);
    if (!confirmation) return;

    try {
      await api.patch(`/emprunts/${id}/retour`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(`Retour de "${titre}" enregistré.`);
      chargerEmprunts();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Erreur lors de l'enregistrement du retour.");
    }
  };

  if (chargement) return <p>Chargement...</p>;

  return (
    <div>
      {message && <p className="gestionnaire-message">{message}</p>}
      {emprunts.length === 0 && <p>Aucun emprunt en cours actuellement.</p>}
      <table className="gestionnaire-tableau">
        <thead>
          <tr>
            <th>Livre</th>
            <th>Adhérent</th>
            <th>Retour prévu</th>
            <th>Statut</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {emprunts.map((emprunt) => (
            <tr key={emprunt.id}>
              <td>{emprunt.Livre.titre}</td>
              <td>{emprunt.Utilisateur.prenom} {emprunt.Utilisateur.nom}</td>
              <td>{new Date(emprunt.dateRetourPrevue).toLocaleDateString('fr-FR')}</td>
              <td>
                <span className={`gestionnaire-badge badge-${emprunt.statut}`}>
                  {LIBELLES_STATUT[emprunt.statut]}
                </span>
              </td>
              <td>
                <button
                  className="gestionnaire-bouton-secondaire"
                  onClick={() => gererRetour(emprunt.id, emprunt.Livre.titre)}
                >
                  Marquer comme rendu
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GestionEmprunts;
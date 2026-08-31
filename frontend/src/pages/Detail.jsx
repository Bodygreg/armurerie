import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Detail.css';

const LIBELLES_STATUT = {
  disponible: 'Disponible',
  reserve: 'Réservé',
  indisponible: 'Indisponible',
};

function Detail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [livre, setLivre] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [messageReservation, setMessageReservation] = useState(null);
  const [maReservation, setMaReservation] = useState(null);

  useEffect(() => {
    const chargerLivre = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const reponse = await api.get(`/livres/${id}`);
        setLivre(reponse.data);
      } catch (err) {
        console.error(err);
        setErreur('Ce livre est introuvable.');
      } finally {
        setChargement(false);
      }
    };

    chargerLivre();
  }, [id]);

  // Vérifie si l'utilisateur connecté a lui-même réservé CE livre
  useEffect(() => {
    if (!token) {
      setMaReservation(null);
      return;
    }

    const verifierMaReservation = async () => {
      try {
        const reponse = await api.get('/reservations/mes-reservations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const trouvee = reponse.data.find((r) => r.id_livre === Number(id));
        setMaReservation(trouvee || null);
      } catch (err) {
        console.error(err);
      }
    };

    verifierMaReservation();
  }, [id, token]);

  const gererReservation = async () => {
    if (!token) {
      setMessageReservation('Vous devez être connecté pour réserver un ouvrage.');
      return;
    }

    try {
      const reponse = await api.post(
        '/reservations',
        { id_livre: livre.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLivre({ ...livre, statut: 'reserve' });
      setMaReservation(reponse.data);
      setMessageReservation('Réservation confirmée !');
    } catch (err) {
      console.error(err);
      setMessageReservation(
        err.response?.data?.message || 'Erreur lors de la réservation.'
      );
    }
  };

  const gererAnnulation = async () => {
    try {
      await api.patch(
        `/reservations/${maReservation.id}/annuler`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLivre({ ...livre, statut: 'disponible' });
      setMaReservation(null);
      setMessageReservation('Réservation annulée.');
    } catch (err) {
      console.error(err);
      setMessageReservation(err.response?.data?.message || "Erreur lors de l'annulation.");
    }
  };

  const gererAlerte = async () => {
    if (!token) {
      setMessageReservation('Vous devez être connecté pour être prévenu.');
      return;
    }

    try {
      await api.post(
        '/alertes',
        { id_livre: livre.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessageReservation('Vous serez prévenu par email dès que ce livre sera disponible.');
    } catch (err) {
      console.error(err);
      setMessageReservation(err.response?.data?.message || "Erreur lors de l'inscription.");
    }
  };

  if (chargement) return <p className="detail-etat">Chargement...</p>;
  if (erreur) return <p className="detail-etat">{erreur}</p>;
  if (!livre) return null;

  return (
    <div className="detail">
      <div className="detail-haut">
        <div className="detail-cover">
          {livre.photoCouverture ? (
            <img src={livre.photoCouverture} alt={livre.titre} />
          ) : (
            <span className="detail-cover-placeholder">📖</span>
          )}
        </div>
        <div className="detail-infos">
          <h1>{livre.titre}</h1>
          <p className="detail-meta">{livre.auteur} — {livre.annee}</p>
          <p className="detail-meta">{livre.theme}</p>
          <span className={`detail-badge badge-${livre.statut}`}>
            {LIBELLES_STATUT[livre.statut]}
          </span>
        </div>
      </div>

      <div className="detail-resume">
        <h2>Résumé</h2>
        <p>{livre.resume}</p>
      </div>

      {maReservation ? (
        <button className="detail-bouton-reservation detail-bouton-danger" onClick={gererAnnulation}>
          Annuler ma réservation
        </button>
      ) : livre.statut === 'disponible' ? (
        <button className="detail-bouton-reservation" onClick={gererReservation}>
          Réserver cet ouvrage
        </button>
      ) : (
        <button className="detail-bouton-reservation detail-bouton-secondaire" onClick={gererAlerte}>
          Me prévenir quand disponible
        </button>
      )}

      {messageReservation && <p className="detail-message">{messageReservation}</p>}

      <div className="detail-conditions">
        <p>
          1) Les livres empruntés doivent être traités avec soin. Toute dégradation
          anormale pourra faire l'objet d'une demande de dédommagement. 2) Tout livre
          emprunté doit être retourné au bout de 3 semaines maximum. Vous pouvez
          demander une prolongation d'emprunt par <Link to="/contact">message</Link> ou
          par téléphone.
        </p>
      </div>
    </div>
  );
}

export default Detail;
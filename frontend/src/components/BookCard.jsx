import { Link } from 'react-router-dom';
import './BookCard.css';

const LIBELLES_STATUT = {
  disponible: 'Disponible',
  reserve: 'Réservé',
  indisponible: 'Indisponible',
};

function BookCard({ livre }) {
  return (
    <Link to={`/livres/${livre.id}`} className="book-card">
      <div className="book-card-cover">
        {livre.photoCouverture ? (
          <img src={livre.photoCouverture} alt={livre.titre} />
        ) : (
          <span className="book-card-cover-placeholder">📖</span>
        )}
      </div>
      <p className="book-card-titre">{livre.titre}</p>
      <span className={`book-card-badge badge-${livre.statut}`}>
        {LIBELLES_STATUT[livre.statut]}
      </span>
    </Link>
  );
}

export default BookCard;
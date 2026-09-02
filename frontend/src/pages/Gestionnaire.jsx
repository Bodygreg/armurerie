import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Gestionnaire.css';
import GestionCatalogue from '../components/gestionnaire/GestionCatalogue';
import AjoutLivre from '../components/gestionnaire/AjoutLivre';
import GestionEmprunts from '../components/gestionnaire/GestionEmprunts';
import GestionAdherents from '../components/gestionnaire/GestionAdherents';


function Gestionnaire() {
  const { utilisateur, token } = useAuth();
  const navigate = useNavigate();
  const [onglet, setOnglet] = useState('livres');

  // Protection par rôle, pas seulement par connexion
  useEffect(() => {
    if (utilisateur && !['gestionnaire', 'admin'].includes(utilisateur.role)) {
      navigate('/');
    } else if (!utilisateur) {
      navigate('/connexion');
    }
  }, [utilisateur, navigate]);

  if (!utilisateur || !['gestionnaire', 'admin'].includes(utilisateur.role)) {
    return null;
  }

  return (
    <div className="gestionnaire">
      <h1>Espace gestionnaire</h1>

      <div className="gestionnaire-onglets">
        <button className={onglet === 'livres' ? 'actif' : ''} onClick={() => setOnglet('livres')}>
          Catalogue
        </button>
        <button className={onglet === 'ajouter' ? 'actif' : ''} onClick={() => setOnglet('ajouter')}>
          Ajouter un livre
        </button>
        <button className={onglet === 'emprunts' ? 'actif' : ''} onClick={() => setOnglet('emprunts')}>
          Emprunts en cours
        </button>
        <button className={onglet === 'adherents' ? 'actif' : ''} onClick={() => setOnglet('adherents')}>
          Adhérents
        </button>
      </div>

      {onglet === 'livres' && <GestionCatalogue token={token} />}
      {onglet === 'ajouter' && <AjoutLivre token={token} />}
      {onglet === 'emprunts' && <GestionEmprunts token={token} />}
      {onglet === 'adherents' && <GestionAdherents token={token} />}
    </div>
  );
}

export default Gestionnaire;
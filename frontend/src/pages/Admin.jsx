import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GestionGestionnaires from '../components/admin/GestionGestionnaires';
import './Admin.css';
import Statistiques from '../components/admin/Statistiques';

function Admin() {
  const { utilisateur, token } = useAuth();
  const navigate = useNavigate();
  const [onglet, setOnglet] = useState('gestionnaires');

  useEffect(() => {
    if (utilisateur && utilisateur.role !== 'admin') {
      navigate('/');
    } else if (!utilisateur) {
      navigate('/connexion');
    }
  }, [utilisateur, navigate]);

  if (!utilisateur || utilisateur.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin">
      <h1>Espace administrateur</h1>

      <div className="admin-onglets">
        <button className={onglet === 'gestionnaires' ? 'actif' : ''} onClick={() => setOnglet('gestionnaires')}>
          Gestionnaires
        </button>
        <button className={onglet === 'statistiques' ? 'actif' : ''} onClick={() => setOnglet('statistiques')}>
          Statistiques
        </button>
      </div>

      {onglet === 'gestionnaires' && <GestionGestionnaires token={token} />}
      {onglet === 'statistiques' && <Statistiques token={token} />}
    </div>
  );
}

export default Admin;
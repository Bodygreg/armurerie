import { useState, useEffect } from 'react';
import api from '../../services/api';

function Statistiques({ token }) {
  const [periode, setPeriode] = useState('total');
  const [donnees, setDonnees] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const chargerStatistiques = async () => {
      setChargement(true);
      try {
        const params = periode === 'total' ? {} : { periode };
        const reponse = await api.get('/admin/statistiques', {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });
        setDonnees(reponse.data);
      } catch (err) {
        console.error(err);
      } finally {
        setChargement(false);
      }
    };

    chargerStatistiques();
  }, [periode, token]);

  return (
    <div>
      <div className="admin-filtres-periode">
        <button className={periode === 'mois' ? 'actif' : ''} onClick={() => setPeriode('mois')}>
          Ce mois
        </button>
        <button className={periode === 'annee' ? 'actif' : ''} onClick={() => setPeriode('annee')}>
          Cette année
        </button>
        <button className={periode === 'total' ? 'actif' : ''} onClick={() => setPeriode('total')}>
          Total
        </button>
      </div>

      {chargement && <p>Chargement...</p>}
      {!chargement && donnees.length === 0 && <p>Aucun emprunt sur cette période.</p>}

      {!chargement && donnees.length > 0 && (
        <table className="gestionnaire-tableau">
          <thead>
            <tr>
              <th>Livre</th>
              <th>Nombre d'emprunts</th>
            </tr>
          </thead>
          <tbody>
            {donnees.map((stat, index) => (
              <tr key={index}>
                <td>{stat.titre}</td>
                <td>{stat.nombreEmprunts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Statistiques;
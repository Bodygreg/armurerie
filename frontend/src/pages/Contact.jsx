import { useState } from 'react';
import api from '../services/api';
import './Contact.css';
import { useAuth } from '../context/AuthContext';

function Contact() {
  const { utilisateur } = useAuth();

  const [formulaire, setFormulaire] = useState({
    nom: utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : '',
    email: utilisateur ? utilisateur.email : '',
    message: '',
  });
  const [statut, setStatut] = useState(null); // 'succes' | 'erreur' | null
  const [messageRetour, setMessageRetour] = useState('');
  const [chargement, setChargement] = useState(false);

  const gererChangement = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  const gererEnvoi = async (e) => {
    e.preventDefault();
    setStatut(null);
    setChargement(true);

    try {
      const reponse = await api.post('/contact', formulaire);
      setStatut('succes');
      setMessageRetour(reponse.data.message);
      setFormulaire({ nom: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatut('erreur');
      setMessageRetour(err.response?.data?.message || "Erreur lors de l'envoi du message.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="contact">
      <h1>Contact</h1>
      <p className="contact-texte">
        Une question, une demande de prolongation ? Écrivez-nous.
      </p>

      <form onSubmit={gererEnvoi} className="contact-formulaire">
        <input
          type="text"
          name="nom"
          placeholder="Nom"
          value={formulaire.nom}
          onChange={gererChangement}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formulaire.email}
          onChange={gererChangement}
          required
        />
        <textarea
          name="message"
          placeholder="Votre message"
          value={formulaire.message}
          onChange={gererChangement}
          rows={6}
          required
        />

        {statut && (
          <p className={statut === 'succes' ? 'contact-succes' : 'contact-erreur'}>
            {messageRetour}
          </p>
        )}

        <button type="submit" disabled={chargement}>
          {chargement ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
}

export default Contact;
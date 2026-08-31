import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.svg';
import './Navbar.css';

function Navbar() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const { utilisateur, logout } = useAuth();
  const navigate = useNavigate();

  const gererDeconnexion = () => {
    logout();
    setMenuOuvert(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-gauche">
          <NavLink to="/" className="navbar-logo">
            <img src={logo} alt="L'Armurerie" className="navbar-logo-icone" />
            L'Armurerie
          </NavLink>
          {utilisateur && (
            <span className="navbar-bonjour">Bonjour {utilisateur.prenom}</span>
          )}
        </div>

        <button
          className="navbar-burger"
          onClick={() => setMenuOuvert(!menuOuvert)}
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>

        <nav className={`navbar-liens ${menuOuvert ? 'ouvert' : ''}`}>
          <NavLink to="/" onClick={() => setMenuOuvert(false)}>Accueil</NavLink>
          <NavLink to="/contact" onClick={() => setMenuOuvert(false)}>Contact</NavLink>

          {utilisateur ? (
            <>
              <NavLink to="/mon-espace" onClick={() => setMenuOuvert(false)}>Mon espace</NavLink>
              {['gestionnaire', 'admin'].includes(utilisateur.role) && (
                <NavLink to="/gestionnaire" onClick={() => setMenuOuvert(false)}>Gestion</NavLink>
              )}
              {utilisateur.role === 'admin' && (
                <NavLink to="/admin" onClick={() => setMenuOuvert(false)}>Admin</NavLink>
              )}
              <button className="navbar-deconnexion" onClick={gererDeconnexion}>
                Déconnexion
              </button>
            </>
          ) : (
            <NavLink to="/connexion" onClick={() => setMenuOuvert(false)}>Connexion</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
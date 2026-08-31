import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-bloc">
          <h3>Horaires</h3>
          <p>Lundi - Vendredi : 10h - 18h</p>
          <p>Samedi : 10h - 13h</p>
        </div>
        <div className="footer-bloc">
          <h3>Liens utiles</h3>
          <Link to="/">Accueil</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="footer-bloc">
          <h3>Contact</h3>
          <p>contact@armurerie.fr</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
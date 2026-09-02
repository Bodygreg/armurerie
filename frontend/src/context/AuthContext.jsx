import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [utilisateur, setUtilisateur] = useState(() => {
    const stocke = localStorage.getItem('utilisateur');
    return stocke ? JSON.parse(stocke) : null;
  });

  const login = (nouveauToken, nouvelUtilisateur) => {
    localStorage.setItem('token', nouveauToken);
    localStorage.setItem('utilisateur', JSON.stringify(nouvelUtilisateur));
    setToken(nouveauToken);
    setUtilisateur(nouvelUtilisateur);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    setToken(null);
    setUtilisateur(null);
  };

  const mettreAJourUtilisateur = (nouvelUtilisateur) => {
  localStorage.setItem('utilisateur', JSON.stringify(nouvelUtilisateur));
  setUtilisateur(nouvelUtilisateur);
};

  return (
    <AuthContext.Provider value={{ token, utilisateur, login, logout, mettreAJourUtilisateur }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook et provider intentionnellement dans le même fichier, contexte simple pour ce projet
export function useAuth() {
  return useContext(AuthContext);
}
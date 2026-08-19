const jwt = require('jsonwebtoken');

exports.verifierToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentification requise.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.utilisateur = decoded; // { id, role } disponible dans tous les contrôleurs suivants
    next(); // laisse passer la requête vers le contrôleur
  } catch (err) {
    return res.status(401).json({ message: 'Jeton invalide ou expiré.' });
  }
};

exports.verifierRole = (rolesAutorises) => {
  return (req, res, next) => {
    if (!rolesAutorises.includes(req.utilisateur.role)) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }
    next();
  };
};
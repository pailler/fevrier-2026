const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur:', err);

  // Erreurs de validation Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Données invalides',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Erreurs de base de données
  if (err.code === '23505') { // Violation de contrainte unique
    return res.status(409).json({
      error: 'Conflit de données',
      message: 'Une ressource avec ces données existe déjà'
    });
  }

  if (err.code === '23503') { // Violation de clé étrangère
    return res.status(400).json({
      error: 'Référence invalide',
      message: 'La ressource référencée n\'existe pas'
    });
  }

  // Erreurs d'authentification
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide',
      message: 'Le token d\'authentification est invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré',
      message: 'Le token d\'authentification a expiré'
    });
  }

  // Erreurs de fichiers
  if (err.code === 'ENOENT') {
    return res.status(404).json({
      error: 'Fichier non trouvé',
      message: 'Le fichier demandé n\'existe pas'
    });
  }

  // Erreurs de validation personnalisées
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation échouée',
      message: err.message
    });
  }

  // Erreurs d'autorisation
  if (err.name === 'AuthorizationError') {
    return res.status(403).json({
      error: 'Accès refusé',
      message: err.message
    });
  }

  // Erreurs de limite de taux
  if (err.name === 'RateLimitError') {
    return res.status(429).json({
      error: 'Limite de taux dépassée',
      message: 'Trop de requêtes, veuillez réessayer plus tard'
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';

  res.status(statusCode).json({
    error: 'Erreur serveur',
    message: process.env.NODE_ENV === 'production' ? 'Une erreur est survenue' : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = errorHandler;

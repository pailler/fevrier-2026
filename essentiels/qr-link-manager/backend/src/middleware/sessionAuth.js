const TempSession = require('../models/TempSession');

// Middleware pour valider une session temporaire
const validateTempSession = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.query.session_id;
    
    if (!sessionId) {
      return res.status(401).json({
        error: 'Session ID requis',
        message: 'Veuillez créer une session temporaire pour utiliser cette fonctionnalité'
      });
    }

    const isValid = await TempSession.validateSession(sessionId);
    
    if (!isValid) {
      return res.status(401).json({
        error: 'Session invalide ou expirée',
        message: 'Votre session a expiré. Veuillez créer une nouvelle session.'
      });
    }

    // Ajouter les informations de session à la requête
    const session = await TempSession.findBySessionId(sessionId);
    req.tempSession = session;
    req.sessionId = sessionId;
    
    next();
  } catch (error) {
    console.error('Erreur validation session:', error);
    res.status(500).json({
      error: 'Erreur lors de la validation de la session'
    });
  }
};

// Middleware optionnel pour les sessions
const optionalTempSession = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.query.session_id;
    
    if (sessionId) {
      const isValid = await TempSession.validateSession(sessionId);
      if (isValid) {
        const session = await TempSession.findBySessionId(sessionId);
        req.tempSession = session;
        req.sessionId = sessionId;
      }
    }
    
    next();
  } catch (error) {
    // En cas d'erreur, on continue sans session
    next();
  }
};

module.exports = {
  validateTempSession,
  optionalTempSession
};

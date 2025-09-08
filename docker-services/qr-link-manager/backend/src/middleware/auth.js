const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      const error = new Error('Token d\'authentification manquant');
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.userId);
    if (!user || !user.is_active) {
      const error = new Error('Utilisateur non trouvé ou désactivé');
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      error.statusCode = 401;
      error.message = 'Token invalide';
    } else if (error.name === 'TokenExpiredError') {
      error.statusCode = 401;
      error.message = 'Token expiré';
    }
    next(error);
  }
};

const authenticateAPIKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      const error = new Error('Clé API manquante');
      error.statusCode = 401;
      throw error;
    }

    // TODO: Implémenter la vérification de la clé API
    // Pour l'instant, on utilise une vérification simple
    const db = require('../config/database');
    const bcrypt = require('bcryptjs');
    
    const query = `
      SELECT ak.*, u.email, u.role 
      FROM api_keys ak
      JOIN users u ON ak.user_id = u.id
      WHERE ak.is_active = true
    `;
    
    const result = await db.query(query);
    let validKey = false;
    let apiKeyData = null;

    for (const key of result.rows) {
      if (await bcrypt.compare(apiKey, key.key_hash)) {
        validKey = true;
        apiKeyData = key;
        break;
      }
    }

    if (!validKey) {
      const error = new Error('Clé API invalide');
      error.statusCode = 401;
      throw error;
    }

    // Mettre à jour la dernière utilisation
    await db.query(
      'UPDATE api_keys SET last_used = NOW() WHERE id = $1',
      [apiKeyData.id]
    );

    req.apiKey = apiKeyData;
    next();
  } catch (error) {
    next(error);
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Authentification requise');
      error.statusCode = 401;
      return next(error);
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      const error = new Error('Permissions insuffisantes');
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};

const requireOwnership = (resourceModel) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userId = req.user.id;

      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        const error = new Error('Ressource non trouvée');
        error.statusCode = 404;
        throw error;
      }

      // Les admins peuvent accéder à toutes les ressources
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // Vérifier que l'utilisateur est propriétaire de la ressource
      if (resource.user_id !== userId) {
        const error = new Error('Accès refusé');
        error.statusCode = 403;
        throw error;
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.is_active) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans authentification
    next();
  }
};

module.exports = {
  authenticateToken,
  authenticateAPIKey,
  requireRole,
  requireOwnership,
  optionalAuth
};

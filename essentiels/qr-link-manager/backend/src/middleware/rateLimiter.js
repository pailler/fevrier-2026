const { RateLimiterRedis } = require('rate-limiter-flexible');
const redis = require('../config/redis');

// Limiteur pour les requêtes générales
const generalLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'general',
  points: 100, // Nombre de requêtes
  duration: 60, // Par minute
});

// Limiteur pour l'authentification
const authLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'auth',
  points: 5, // 5 tentatives
  duration: 300, // Par 5 minutes
});

// Limiteur pour la création de liens courts
const urlCreationLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'url_creation',
  points: 20, // 20 liens par heure
  duration: 3600, // Par heure
});

// Limiteur pour la génération de QR codes
const qrGenerationLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'qr_generation',
  points: 50, // 50 QR codes par heure
  duration: 3600, // Par heure
});

const rateLimiter = async (req, res, next) => {
  try {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Appliquer le limiteur général
    await generalLimiter.consume(key.toString());
    next();
  } catch (rejRes) {
    const error = new Error('Limite de taux dépassée');
    error.name = 'RateLimitError';
    error.statusCode = 429;
    error.retryAfter = Math.round(rejRes.msBeforeNext / 1000);
    next(error);
  }
};

// Middleware spécifique pour l'authentification
const authRateLimiter = async (req, res, next) => {
  try {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    await authLimiter.consume(key.toString());
    next();
  } catch (rejRes) {
    const error = new Error('Trop de tentatives de connexion');
    error.name = 'RateLimitError';
    error.statusCode = 429;
    error.retryAfter = Math.round(rejRes.msBeforeNext / 1000);
    next(error);
  }
};

// Middleware pour la création de liens courts
const urlCreationRateLimiter = async (req, res, next) => {
  try {
    const key = req.user ? req.user.id : (req.ip || req.connection.remoteAddress || 'unknown');
    await urlCreationLimiter.consume(key.toString());
    next();
  } catch (rejRes) {
    const error = new Error('Limite de création de liens dépassée');
    error.name = 'RateLimitError';
    error.statusCode = 429;
    error.retryAfter = Math.round(rejRes.msBeforeNext / 1000);
    next(error);
  }
};

// Middleware pour la génération de QR codes
const qrGenerationRateLimiter = async (req, res, next) => {
  try {
    const key = req.user ? req.user.id : (req.ip || req.connection.remoteAddress || 'unknown');
    await qrGenerationLimiter.consume(key.toString());
    next();
  } catch (rejRes) {
    const error = new Error('Limite de génération de QR codes dépassée');
    error.name = 'RateLimitError';
    error.statusCode = 429;
    error.retryAfter = Math.round(rejRes.msBeforeNext / 1000);
    next(error);
  }
};

module.exports = {
  rateLimiter,
  authRateLimiter,
  urlCreationRateLimiter,
  qrGenerationRateLimiter
};

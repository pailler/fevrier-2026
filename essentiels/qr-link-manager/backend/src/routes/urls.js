const express = require('express');
const Joi = require('joi');
const ShortUrl = require('../models/ShortUrl');
const { authenticateToken, requireOwnership } = require('../middleware/auth');
const { validateTempSession, optionalTempSession } = require('../middleware/sessionAuth');

const router = express.Router();

// Schéma de validation pour la création d'URL
const createUrlSchema = Joi.object({
  original_url: Joi.string().uri().required(),
  custom_alias: Joi.string().alphanum().min(3).max(50).optional(),
  title: Joi.string().max(255).optional(),
  description: Joi.string().max(500).optional(),
  expires_at: Joi.date().iso().optional(),
  max_clicks: Joi.number().integer().min(1).optional(),
  password: Joi.string().min(4).optional()
});

// Route publique pour lister les URLs (sans authentification)
router.get('/public', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    // Récupérer les URLs publiques (sans user_id ou avec un flag public)
    const shortUrls = await ShortUrl.findPublic({
      limit: parseInt(limit),
      offset: parseInt(offset),
      search
    });

    res.json({
      shortUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: shortUrls.length
      }
    });
  } catch (error) {
    next(error);
  }
});



// Route pour créer une URL courte (avec session temporaire ou authentification)
router.post('/', validateTempSession, async (req, res, next) => {
  try {
    const { error, value } = createUrlSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const shortUrl = await ShortUrl.create({
      ...value,
      user_id: req.user?.userId || null,
      session_id: req.sessionId || null
    });

    res.status(201).json({
      message: 'URL courte créée avec succès',
      shortUrl: {
        id: shortUrl.id,
        original_url: shortUrl.original_url,
        short_code: shortUrl.short_code,
        short_url: `${process.env.APP_URL}/${shortUrl.short_code}`,
        title: shortUrl.title,
        description: shortUrl.description,
        expires_at: shortUrl.expires_at,
        max_clicks: shortUrl.max_clicks,
        clicks: shortUrl.clicks,
        created_at: shortUrl.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour lister les URLs (publique par défaut)
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    // Récupérer les URLs publiques
    const shortUrls = await ShortUrl.findPublic({
      limit: parseInt(limit),
      offset: parseInt(offset),
      search
    });

    res.json({
      shortUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: shortUrls.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir une URL spécifique
router.get('/:id', authenticateToken, requireOwnership, async (req, res, next) => {
  try {
    const shortUrl = await ShortUrl.findById(req.params.id);
    if (!shortUrl) {
      return res.status(404).json({ error: 'URL courte non trouvée' });
    }

    res.json({
      shortUrl: {
        id: shortUrl.id,
        original_url: shortUrl.original_url,
        short_code: shortUrl.short_code,
        short_url: `${process.env.APP_URL}/${shortUrl.short_code}`,
        title: shortUrl.title,
        description: shortUrl.description,
        expires_at: shortUrl.expires_at,
        max_clicks: shortUrl.max_clicks,
        clicks: shortUrl.clicks,
        created_at: shortUrl.created_at,
        updated_at: shortUrl.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour mettre à jour une URL
router.put('/:id', authenticateToken, requireOwnership, async (req, res, next) => {
  try {
    const { error, value } = createUrlSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const shortUrl = await ShortUrl.update(req.params.id, value);
    if (!shortUrl) {
      return res.status(404).json({ error: 'URL courte non trouvée' });
    }

    res.json({
      message: 'URL courte mise à jour avec succès',
      shortUrl: {
        id: shortUrl.id,
        original_url: shortUrl.original_url,
        short_code: shortUrl.short_code,
        short_url: `${process.env.APP_URL}/${shortUrl.short_code}`,
        title: shortUrl.title,
        description: shortUrl.description,
        expires_at: shortUrl.expires_at,
        max_clicks: shortUrl.max_clicks,
        clicks: shortUrl.clicks,
        updated_at: shortUrl.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour supprimer une URL
router.delete('/:id', authenticateToken, requireOwnership, async (req, res, next) => {
  try {
    const deleted = await ShortUrl.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'URL courte non trouvée' });
    }

    res.json({ message: 'URL courte supprimée avec succès' });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir les statistiques d'une URL
router.get('/:id/stats', authenticateToken, requireOwnership, async (req, res, next) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    const stats = await ShortUrl.getStats(req.params.id, timeframe);
    const clicksByDate = await ShortUrl.getClicksByDate(req.params.id, timeframe);
    const clicksByCountry = await ShortUrl.getClicksByCountry(req.params.id, timeframe);
    const clicksByDevice = await ShortUrl.getClicksByDevice(req.params.id, timeframe);

    res.json({
      stats,
      clicksByDate,
      clicksByCountry,
      clicksByDevice
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

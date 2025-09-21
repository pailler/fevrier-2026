const express = require('express');
const Joi = require('joi');
const ShortUrl = require('../models/ShortUrl');
const QRCode = require('../models/QRCode');
const { authenticateAPIKey } = require('../middleware/auth');

const router = express.Router();

// Schéma de validation pour la création d'URL via API
const createUrlAPISchema = Joi.object({
  original_url: Joi.string().uri().required(),
  custom_alias: Joi.string().alphanum().min(3).max(50).optional(),
  title: Joi.string().max(255).optional(),
  description: Joi.string().max(500).optional(),
  expires_at: Joi.date().iso().optional(),
  max_clicks: Joi.number().integer().min(1).optional()
});

// Route pour créer une URL courte via API
router.post('/urls', authenticateAPIKey, async (req, res, next) => {
  try {
    const { error, value } = createUrlAPISchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const shortUrl = await ShortUrl.create({
      ...value,
      user_id: req.apiUser.user_id
    });

    res.status(201).json({
      success: true,
      data: {
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

// Route pour lister les URLs via API
router.get('/urls', authenticateAPIKey, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const shortUrls = await ShortUrl.findByUserId(req.apiUser.user_id, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        urls: shortUrls,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: shortUrls.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir une URL spécifique via API
router.get('/urls/:id', authenticateAPIKey, async (req, res, next) => {
  try {
    const shortUrl = await ShortUrl.findById(req.params.id);
    if (!shortUrl || shortUrl.user_id !== req.apiUser.user_id) {
      return res.status(404).json({ error: 'URL courte non trouvée' });
    }

    res.json({
      success: true,
      data: {
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

// Route pour créer un QR code via API
router.post('/qr', authenticateAPIKey, async (req, res, next) => {
  try {
    const { short_url_id, name, size = 300, foreground_color = '#000000', background_color = '#FFFFFF', file_format = 'png' } = req.body;

    // Vérifier que l'URL courte appartient à l'utilisateur
    const shortUrl = await ShortUrl.findById(short_url_id);
    if (!shortUrl || shortUrl.user_id !== req.apiUser.user_id) {
      return res.status(404).json({ error: 'URL courte non trouvée' });
    }

    const qrCode = await QRCode.create({
      short_url_id,
      name,
      size,
      foreground_color,
      background_color,
      file_format,
      user_id: req.apiUser.user_id
    });

    res.status(201).json({
      success: true,
      data: {
        id: qrCode.id,
        name: qrCode.name,
        short_url_id: qrCode.short_url_id,
        size: qrCode.size,
        foreground_color: qrCode.foreground_color,
        background_color: qrCode.background_color,
        file_format: qrCode.file_format,
        download_url: `/api/v1/qr/${qrCode.id}/download`,
        created_at: qrCode.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir les statistiques d'une URL via API
router.get('/urls/:id/stats', authenticateAPIKey, async (req, res, next) => {
  try {
    const shortUrl = await ShortUrl.findById(req.params.id);
    if (!shortUrl || shortUrl.user_id !== req.apiUser.user_id) {
      return res.status(404).json({ error: 'URL courte non trouvée' });
    }

    const { timeframe = '7d' } = req.query;
    
    const stats = await ShortUrl.getStats(req.params.id, timeframe);
    const clicksByDate = await ShortUrl.getClicksByDate(req.params.id, timeframe);
    const clicksByCountry = await ShortUrl.getClicksByCountry(req.params.id, timeframe);
    const clicksByDevice = await ShortUrl.getClicksByDevice(req.params.id, timeframe);

    res.json({
      success: true,
      data: {
        stats,
        clicksByDate,
        clicksByCountry,
        clicksByDevice,
        timeframe
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir les informations de l'API
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'QR Link Manager API',
      version: '1.0.0',
      endpoints: {
        urls: {
          create: 'POST /api/v1/urls',
          list: 'GET /api/v1/urls',
          get: 'GET /api/v1/urls/:id',
          stats: 'GET /api/v1/urls/:id/stats'
        },
        qr: {
          create: 'POST /api/v1/qr',
          download: 'GET /api/v1/qr/:id/download'
        }
      },
      documentation: '/api/docs'
    }
  });
});

module.exports = router;

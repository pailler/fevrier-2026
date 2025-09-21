const express = require('express');
const Joi = require('joi');
const QRCode = require('../models/QRCode');
const { authenticateToken, requireOwnership } = require('../middleware/auth');

const router = express.Router();

// Schéma de validation pour la création de QR code
const createQRSchema = Joi.object({
  short_url_id: Joi.string().uuid().required(),
  name: Joi.string().max(255).required(),
  size: Joi.number().integer().min(100).max(1000).default(300),
  foreground_color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#000000'),
  background_color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#FFFFFF'),
  file_format: Joi.string().valid('png', 'svg', 'pdf').default('png'),
  logo_url: Joi.string().uri().optional()
});

// Route pour créer un QR code
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { error, value } = createQRSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const qrCode = await QRCode.create({
      ...value,
      user_id: req.user.userId
    });

    res.status(201).json({
      message: 'QR code créé avec succès',
      qrCode: {
        id: qrCode.id,
        name: qrCode.name,
        short_url_id: qrCode.short_url_id,
        size: qrCode.size,
        foreground_color: qrCode.foreground_color,
        background_color: qrCode.background_color,
        file_format: qrCode.file_format,
        file_path: qrCode.file_path,
        download_url: `/api/qr/${qrCode.id}/download`,
        created_at: qrCode.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour lister les QR codes de l'utilisateur
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const qrCodes = await QRCode.findByUserId(req.user.userId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      qrCodes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: qrCodes.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir un QR code spécifique
router.get('/:id', authenticateToken, requireOwnership, async (req, res, next) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code non trouvé' });
    }

    res.json({
      qrCode: {
        id: qrCode.id,
        name: qrCode.name,
        short_url_id: qrCode.short_url_id,
        size: qrCode.size,
        foreground_color: qrCode.foreground_color,
        background_color: qrCode.background_color,
        file_format: qrCode.file_format,
        file_path: qrCode.file_path,
        download_url: `/api/qr/${qrCode.id}/download`,
        created_at: qrCode.created_at,
        updated_at: qrCode.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour mettre à jour un QR code
router.put('/:id', authenticateToken, requireOwnership, async (req, res, next) => {
  try {
    const { error, value } = createQRSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const qrCode = await QRCode.update(req.params.id, value);
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code non trouvé' });
    }

    res.json({
      message: 'QR code mis à jour avec succès',
      qrCode: {
        id: qrCode.id,
        name: qrCode.name,
        short_url_id: qrCode.short_url_id,
        size: qrCode.size,
        foreground_color: qrCode.foreground_color,
        background_color: qrCode.background_color,
        file_format: qrCode.file_format,
        file_path: qrCode.file_path,
        download_url: `/api/qr/${qrCode.id}/download`,
        updated_at: qrCode.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour supprimer un QR code
router.delete('/:id', authenticateToken, requireOwnership, async (req, res, next) => {
  try {
    const deleted = await QRCode.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'QR code non trouvé' });
    }

    res.json({ message: 'QR code supprimé avec succès' });
  } catch (error) {
    next(error);
  }
});

// Route pour télécharger un QR code
router.get('/:id/download', authenticateToken, requireOwnership, async (req, res, next) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code non trouvé' });
    }

    const filePath = qrCode.file_path;
    const fileName = `${qrCode.name}.${qrCode.file_format}`;

    res.download(filePath, fileName, (err) => {
      if (err) {
        return res.status(404).json({ error: 'Fichier QR code non trouvé' });
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir les statistiques d'un QR code
router.get('/:id/stats', authenticateToken, requireOwnership, async (req, res, next) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    const stats = await QRCode.getStats(req.params.id, timeframe);
    const scansByDate = await QRCode.getScansByDate(req.params.id, timeframe);
    const scansByCountry = await QRCode.getScansByCountry(req.params.id, timeframe);
    const scansByDevice = await QRCode.getScansByDevice(req.params.id, timeframe);

    res.json({
      stats,
      scansByDate,
      scansByCountry,
      scansByDevice
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

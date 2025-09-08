const express = require('express');
const Joi = require('joi');
const TempSession = require('../models/TempSession');

const router = express.Router();

// Schéma de validation pour la création de session
const createSessionSchema = Joi.object({
  duration_hours: Joi.number().integer().min(1).max(168).default(24) // Max 7 jours
});

// Route pour créer une session temporaire
router.post('/create', async (req, res, next) => {
  try {
    const { error, value } = createSessionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const session = await TempSession.create({
      user_agent: req.get('User-Agent'),
      ip_address: req.ip || req.connection.remoteAddress,
      duration_hours: value.duration_hours
    });

    res.status(201).json({
      message: 'Session temporaire créée avec succès',
      session: {
        session_id: session.session_id,
        expires_at: session.expires_at,
        duration_hours: value.duration_hours
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour valider une session
router.get('/validate/:session_id', async (req, res, next) => {
  try {
    const { session_id } = req.params;
    const isValid = await TempSession.validateSession(session_id);
    
    if (isValid) {
      const session = await TempSession.findBySessionId(session_id);
      res.json({
        valid: true,
        session: {
          session_id: session.session_id,
          expires_at: session.expires_at,
          created_at: session.created_at
        }
      });
    } else {
      res.status(404).json({
        valid: false,
        error: 'Session invalide ou expirée'
      });
    }
  } catch (error) {
    next(error);
  }
});

// Route pour supprimer une session
router.delete('/:session_id', async (req, res, next) => {
  try {
    const { session_id } = req.params;
    await TempSession.deactivateSession(session_id);
    
    res.json({
      message: 'Session supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
});

// Route pour nettoyer les sessions expirées
router.post('/cleanup', async (req, res, next) => {
  try {
    const deletedCount = await TempSession.cleanupExpired();
    
    res.json({
      message: `${deletedCount} sessions expirées supprimées`,
      deleted_count: deletedCount
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir les statistiques des sessions
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await TempSession.getSessionStats();
    
    res.json({
      stats
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

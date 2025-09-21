const express = require('express');
const Joi = require('joi');
const { authenticateToken } = require('../middleware/auth');
const { query } = require('../config/database');

const router = express.Router();

// Schéma de validation pour la création de projet
const projectSchema = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().max(500).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#3B82F6')
});

// Route pour créer un projet
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { error, value } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await query(
      'INSERT INTO projects (name, description, color, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [value.name, value.description, value.color, req.user.userId]
    );

    const project = result.rows[0];

    res.status(201).json({
      message: 'Projet créé avec succès',
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        color: project.color,
        created_at: project.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour lister les projets de l'utilisateur
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json({
      projects: result.rows.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        color: project.color,
        created_at: project.created_at,
        updated_at: project.updated_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir un projet spécifique
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    const project = result.rows[0];

    res.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        color: project.color,
        created_at: project.created_at,
        updated_at: project.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour mettre à jour un projet
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { error, value } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await query(
      'UPDATE projects SET name = $1, description = $2, color = $3, updated_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING *',
      [value.name, value.description, value.color, req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    const project = result.rows[0];

    res.json({
      message: 'Projet mis à jour avec succès',
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        color: project.color,
        updated_at: project.updated_at
      }
    });
  } catch (error) {
    next(error);
  }
});

// Route pour supprimer un projet
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    res.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

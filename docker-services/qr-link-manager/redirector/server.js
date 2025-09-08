require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
const geoip = require('geoip-lite');
const UserAgent = require('user-agents');

const app = express();
const PORT = process.env.PORT || 7002;

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Configuration Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

// Middleware pour parser les requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de redirection principale
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Récupérer l'URL originale depuis la base de données
    const result = await pool.query(
      'SELECT * FROM short_urls WHERE short_code = $1 AND (expires_at IS NULL OR expires_at > NOW()) AND (max_clicks IS NULL OR clicks < max_clicks)',
      [shortCode]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lien non trouvé ou expiré' });
    }

    const shortUrl = result.rows[0];

    // Enregistrer les statistiques
    const userAgent = new UserAgent(req.headers['user-agent']);
    const geo = geoip.lookup(req.ip);
    
    await pool.query(
      `INSERT INTO click_stats (short_url_id, ip_address, user_agent, country, city, device_type, browser, os, referrer, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        shortUrl.id,
        req.ip,
        req.headers['user-agent'],
        geo?.country || 'Unknown',
        geo?.city || 'Unknown',
        userAgent.deviceType || 'Unknown',
        userAgent.browser || 'Unknown',
        userAgent.os || 'Unknown',
        req.headers.referer || null
      ]
    );

    // Incrémenter le compteur de clics
    await pool.query(
      'UPDATE short_urls SET clicks = clicks + 1, updated_at = NOW() WHERE id = $1',
      [shortUrl.id]
    );

    // Rediriger vers l'URL originale
    res.redirect(301, shortUrl.original_url);

  } catch (error) {
    console.error('Erreur de redirection:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'QR Link Manager Redirector',
    timestamp: new Date().toISOString()
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Service de redirection démarré sur le port ${PORT}`);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  process.exit(1);
});

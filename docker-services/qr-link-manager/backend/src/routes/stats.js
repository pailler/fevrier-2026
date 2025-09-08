const express = require('express');
const ClickStats = require('../models/ClickStats');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Route pour obtenir les statistiques globales
router.get('/summary', authenticateToken, async (req, res, next) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    const summaryStats = await ClickStats.getSummaryStats(req.user.userId, timeframe);
    
    res.json({
      summary: summaryStats,
      timeframe
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir les statistiques par période
router.get('/by-date', authenticateToken, async (req, res, next) => {
  try {
    const { timeframe = '30d', group = 'day' } = req.query;
    
    const statsByDate = await ClickStats.getClicksByTimeframe(req.user.userId, timeframe, group);
    
    res.json({
      stats: statsByDate,
      timeframe,
      group
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir les statistiques par pays
router.get('/by-country', authenticateToken, async (req, res, next) => {
  try {
    const { timeframe = '30d', limit = 10 } = req.query;
    
    const topCountries = await ClickStats.getTopCountries(req.user.userId, timeframe, parseInt(limit));
    
    res.json({
      countries: topCountries,
      timeframe
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir les statistiques par appareil
router.get('/by-device', authenticateToken, async (req, res, next) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    const deviceStats = await ClickStats.getDeviceStats(req.user.userId, timeframe);
    const browserStats = await ClickStats.getBrowserStats(req.user.userId, timeframe);
    const osStats = await ClickStats.getOSStats(req.user.userId, timeframe);
    
    res.json({
      devices: deviceStats,
      browsers: browserStats,
      operatingSystems: osStats,
      timeframe
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir les statistiques en temps réel
router.get('/realtime', authenticateToken, async (req, res, next) => {
  try {
    const realTimeStats = await ClickStats.getRealTimeStats(req.user.userId);
    
    res.json({
      realtime: realTimeStats
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir la distribution horaire
router.get('/hourly', authenticateToken, async (req, res, next) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    const hourlyDistribution = await ClickStats.getHourlyDistribution(req.user.userId, timeframe);
    
    res.json({
      hourly: hourlyDistribution,
      timeframe
    });
  } catch (error) {
    next(error);
  }
});

// Route pour obtenir la distribution hebdomadaire
router.get('/weekly', authenticateToken, async (req, res, next) => {
  try {
    const { timeframe = '12w' } = req.query;
    
    const weeklyDistribution = await ClickStats.getWeeklyDistribution(req.user.userId, timeframe);
    
    res.json({
      weekly: weeklyDistribution,
      timeframe
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

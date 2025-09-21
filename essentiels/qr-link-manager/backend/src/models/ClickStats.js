const db = require('../config/database');
const geoip = require('geoip-lite');
const UserAgent = require('user-agents');

class ClickStats {
  static async create(clickData) {
    const {
      short_url_id,
      qr_code_id = null,
      ip_address,
      user_agent,
      referer = null
    } = clickData;

    // Analyser l'IP pour la géolocalisation
    const geo = geoip.lookup(ip_address);
    const country = geo ? geo.country : null;
    const city = geo ? geo.city : null;

    // Analyser le User-Agent
    const ua = new UserAgent(user_agent);
    const device_type = this.getDeviceType(ua);
    const browser = ua.browser.name || 'Unknown';
    const os = ua.os.name || 'Unknown';

    const query = `
      INSERT INTO click_stats (
        short_url_id, qr_code_id, ip_address, user_agent, referer,
        country, city, device_type, browser, os
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      short_url_id, qr_code_id, ip_address, user_agent, referer,
      country, city, device_type, browser, os
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByShortUrlId(short_url_id, limit = 100, offset = 0) {
    const query = `
      SELECT * FROM click_stats 
      WHERE short_url_id = $1
      ORDER BY clicked_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [short_url_id, limit, offset]);
    return result.rows;
  }

  static async findByQRCodeId(qr_code_id, limit = 100, offset = 0) {
    const query = `
      SELECT * FROM click_stats 
      WHERE qr_code_id = $1
      ORDER BY clicked_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [qr_code_id, limit, offset]);
    return result.rows;
  }

  static async getSummaryStats(short_url_id) {
    const query = `
      SELECT 
        COUNT(*) as total_clicks,
        COUNT(DISTINCT ip_address) as unique_visitors,
        COUNT(DISTINCT DATE(clicked_at)) as active_days,
        MIN(clicked_at) as first_click,
        MAX(clicked_at) as last_click,
        AVG(EXTRACT(EPOCH FROM (MAX(clicked_at) - MIN(clicked_at)))) / 86400 as avg_days_between
      FROM click_stats 
      WHERE short_url_id = $1
    `;
    const result = await db.query(query, [short_url_id]);
    return result.rows[0];
  }

  static async getClicksByTimeframe(short_url_id, timeframe = 'day', days = 30) {
    let groupBy, interval;
    
    switch (timeframe) {
      case 'hour':
        groupBy = 'DATE_TRUNC(\'hour\', clicked_at)';
        interval = '1 hour';
        break;
      case 'day':
        groupBy = 'DATE(clicked_at)';
        interval = '1 day';
        break;
      case 'week':
        groupBy = 'DATE_TRUNC(\'week\', clicked_at)';
        interval = '1 week';
        break;
      case 'month':
        groupBy = 'DATE_TRUNC(\'month\', clicked_at)';
        interval = '1 month';
        break;
      default:
        groupBy = 'DATE(clicked_at)';
        interval = '1 day';
    }

    const query = `
      SELECT 
        ${groupBy} as period,
        COUNT(*) as clicks,
        COUNT(DISTINCT ip_address) as unique_visitors
      FROM click_stats 
      WHERE short_url_id = $1 
        AND clicked_at >= NOW() - INTERVAL '${days} days'
      GROUP BY ${groupBy}
      ORDER BY period DESC
    `;
    const result = await db.query(query, [short_url_id]);
    return result.rows;
  }

  static async getTopCountries(short_url_id, limit = 10) {
    const query = `
      SELECT 
        country,
        COUNT(*) as clicks,
        COUNT(DISTINCT ip_address) as unique_visitors
      FROM click_stats 
      WHERE short_url_id = $1 AND country IS NOT NULL
      GROUP BY country
      ORDER BY clicks DESC
      LIMIT $2
    `;
    const result = await db.query(query, [short_url_id, limit]);
    return result.rows;
  }

  static async getTopCities(short_url_id, limit = 10) {
    const query = `
      SELECT 
        city,
        country,
        COUNT(*) as clicks,
        COUNT(DISTINCT ip_address) as unique_visitors
      FROM click_stats 
      WHERE short_url_id = $1 AND city IS NOT NULL
      GROUP BY city, country
      ORDER BY clicks DESC
      LIMIT $2
    `;
    const result = await db.query(query, [short_url_id, limit]);
    return result.rows;
  }

  static async getDeviceStats(short_url_id) {
    const query = `
      SELECT 
        device_type,
        COUNT(*) as clicks,
        COUNT(DISTINCT ip_address) as unique_visitors
      FROM click_stats 
      WHERE short_url_id = $1 AND device_type IS NOT NULL
      GROUP BY device_type
      ORDER BY clicks DESC
    `;
    const result = await db.query(query, [short_url_id]);
    return result.rows;
  }

  static async getBrowserStats(short_url_id) {
    const query = `
      SELECT 
        browser,
        COUNT(*) as clicks,
        COUNT(DISTINCT ip_address) as unique_visitors
      FROM click_stats 
      WHERE short_url_id = $1 AND browser IS NOT NULL
      GROUP BY browser
      ORDER BY clicks DESC
    `;
    const result = await db.query(query, [short_url_id]);
    return result.rows;
  }

  static async getOSStats(short_url_id) {
    const query = `
      SELECT 
        os,
        COUNT(*) as clicks,
        COUNT(DISTINCT ip_address) as unique_visitors
      FROM click_stats 
      WHERE short_url_id = $1 AND os IS NOT NULL
      GROUP BY os
      ORDER BY clicks DESC
    `;
    const result = await db.query(query, [short_url_id]);
    return result.rows;
  }

  static async getReferrerStats(short_url_id) {
    const query = `
      SELECT 
        CASE 
          WHEN referer IS NULL OR referer = '' THEN 'Direct'
          WHEN referer LIKE '%google%' THEN 'Google'
          WHEN referer LIKE '%facebook%' THEN 'Facebook'
          WHEN referer LIKE '%twitter%' THEN 'Twitter'
          WHEN referer LIKE '%linkedin%' THEN 'LinkedIn'
          WHEN referer LIKE '%instagram%' THEN 'Instagram'
          ELSE 'Other'
        END as referer_type,
        COUNT(*) as clicks,
        COUNT(DISTINCT ip_address) as unique_visitors
      FROM click_stats 
      WHERE short_url_id = $1
      GROUP BY referer_type
      ORDER BY clicks DESC
    `;
    const result = await db.query(query, [short_url_id]);
    return result.rows;
  }

  static async getHourlyDistribution(short_url_id, days = 30) {
    const query = `
      SELECT 
        EXTRACT(HOUR FROM clicked_at) as hour,
        COUNT(*) as clicks
      FROM click_stats 
      WHERE short_url_id = $1 
        AND clicked_at >= NOW() - INTERVAL '${days} days'
      GROUP BY EXTRACT(HOUR FROM clicked_at)
      ORDER BY hour
    `;
    const result = await db.query(query, [short_url_id]);
    return result.rows;
  }

  static async getWeeklyDistribution(short_url_id, days = 90) {
    const query = `
      SELECT 
        EXTRACT(DOW FROM clicked_at) as day_of_week,
        COUNT(*) as clicks
      FROM click_stats 
      WHERE short_url_id = $1 
        AND clicked_at >= NOW() - INTERVAL '${days} days'
      GROUP BY EXTRACT(DOW FROM clicked_at)
      ORDER BY day_of_week
    `;
    const result = await db.query(query, [short_url_id]);
    return result.rows;
  }

  static async getRealTimeStats(short_url_id, hours = 24) {
    const query = `
      SELECT 
        COUNT(*) as clicks_last_hour,
        COUNT(DISTINCT ip_address) as unique_visitors_last_hour
      FROM click_stats 
      WHERE short_url_id = $1 
        AND clicked_at >= NOW() - INTERVAL '${hours} hours'
    `;
    const result = await db.query(query, [short_url_id]);
    return result.rows[0];
  }

  static getDeviceType(userAgent) {
    if (userAgent.isMobile) {
      return 'Mobile';
    } else if (userAgent.isTablet) {
      return 'Tablet';
    } else {
      return 'Desktop';
    }
  }

  static async cleanupOldStats(days = 365) {
    const query = `
      DELETE FROM click_stats 
      WHERE clicked_at < NOW() - INTERVAL '${days} days'
    `;
    const result = await db.query(query);
    return result.rowCount;
  }
}

module.exports = ClickStats;

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class ShortUrl {
  static async create(urlData) {
    const {
      original_url,
      custom_alias,
      title,
      description,
      user_id,
      session_id,
      project_id,
      password_protected = false,
      password_hash = null,
      expires_at = null,
      max_clicks = null
    } = urlData;

    // Générer un code court unique
    const short_code = custom_alias || this.generateShortCode();
    
    const query = `
      INSERT INTO short_urls (
        original_url, short_code, custom_alias, title, description,
        user_id, session_id, project_id, password_protected, password_hash,
        expires_at, max_clicks
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const values = [
      original_url, short_code, custom_alias, title, description,
      user_id, session_id, project_id, password_protected, password_hash,
      expires_at, max_clicks
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByShortCode(short_code) {
    const query = `
      SELECT su.*, u.email as user_email, p.name as project_name
      FROM short_urls su
      LEFT JOIN users u ON su.user_id = u.id
      LEFT JOIN projects p ON su.project_id = p.id
      WHERE su.short_code = $1 AND su.is_active = true
    `;
    const result = await db.query(query, [short_code]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT su.*, u.email as user_email, p.name as project_name
      FROM short_urls su
      LEFT JOIN users u ON su.user_id = u.id
      LEFT JOIN projects p ON su.project_id = p.id
      WHERE su.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByUserId(user_id, options = {}) {
    const { limit = 50, offset = 0, search } = options;
    
    let query = `
      SELECT su.*, p.name as project_name,
             (SELECT COUNT(*) FROM click_stats cs WHERE cs.short_url_id = su.id) as total_clicks
      FROM short_urls su
      LEFT JOIN projects p ON su.project_id = p.id
      WHERE su.user_id = $1
    `;
    
    const values = [user_id];
    let paramIndex = 2;
    
    if (search) {
      query += ` AND (su.title ILIKE $${paramIndex} OR su.description ILIKE $${paramIndex} OR su.original_url ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY su.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);
    
    const result = await db.query(query, values);
    return result.rows;
  }

  static async findPublic(options = {}) {
    const { limit = 50, offset = 0, search } = options;
    
    let query = `
      SELECT su.*, p.name as project_name,
             (SELECT COUNT(*) FROM click_stats cs WHERE cs.short_url_id = su.id) as total_clicks
      FROM short_urls su
      LEFT JOIN projects p ON su.project_id = p.id
      WHERE su.is_active = true AND su.password_protected = false
    `;
    
    const values = [];
    let paramIndex = 1;
    
    if (search) {
      query += ` AND (su.title ILIKE $${paramIndex} OR su.description ILIKE $${paramIndex} OR su.original_url ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY su.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);
    
    const result = await db.query(query, values);
    return result.rows;
  }

  static async update(id, updateData) {
    const {
      title, description, project_id, password_protected,
      password_hash, expires_at, max_clicks, is_active
    } = updateData;
    
    const query = `
      UPDATE short_urls 
      SET title = COALESCE($2, title),
          description = COALESCE($3, description),
          project_id = COALESCE($4, project_id),
          password_protected = COALESCE($5, password_protected),
          password_hash = COALESCE($6, password_hash),
          expires_at = COALESCE($7, expires_at),
          max_clicks = COALESCE($8, max_clicks),
          is_active = COALESCE($9, is_active)
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [id, title, description, project_id, password_protected, 
                   password_hash, expires_at, max_clicks, is_active];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async incrementClicks(id) {
    const query = `
      UPDATE short_urls 
      SET current_clicks = current_clicks + 1
      WHERE id = $1
      RETURNING current_clicks
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM short_urls WHERE id = $1';
    await db.query(query, [id]);
    return true;
  }

  static async isExpired(id) {
    const query = 'SELECT expires_at FROM short_urls WHERE id = $1';
    const result = await db.query(query, [id]);
    const url = result.rows[0];
    
    if (!url || !url.expires_at) return false;
    return new Date() > new Date(url.expires_at);
  }

  static async hasReachedMaxClicks(id) {
    const query = 'SELECT max_clicks, current_clicks FROM short_urls WHERE id = $1';
    const result = await db.query(query, [id]);
    const url = result.rows[0];
    
    if (!url || !url.max_clicks) return false;
    return url.current_clicks >= url.max_clicks;
  }

  static generateShortCode() {
    // Générer un code de 6 caractères alphanumériques
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static async getStats(id) {
    const query = `
      SELECT 
        COUNT(*) as total_clicks,
        COUNT(DISTINCT ip_address) as unique_visitors,
        COUNT(DISTINCT DATE(clicked_at)) as active_days,
        MIN(clicked_at) as first_click,
        MAX(clicked_at) as last_click
      FROM click_stats 
      WHERE short_url_id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getClicksByDate(id, days = 30) {
    const query = `
      SELECT 
        DATE(clicked_at) as date,
        COUNT(*) as clicks,
        COUNT(DISTINCT ip_address) as unique_visitors
      FROM click_stats 
      WHERE short_url_id = $1 
        AND clicked_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(clicked_at)
      ORDER BY date DESC
    `;
    const result = await db.query(query, [id]);
    return result.rows;
  }

  static async getClicksByCountry(id) {
    const query = `
      SELECT 
        country,
        COUNT(*) as clicks
      FROM click_stats 
      WHERE short_url_id = $1 AND country IS NOT NULL
      GROUP BY country
      ORDER BY clicks DESC
    `;
    const result = await db.query(query, [id]);
    return result.rows;
  }

  static async getClicksByDevice(id) {
    const query = `
      SELECT 
        device_type,
        COUNT(*) as clicks
      FROM click_stats 
      WHERE short_url_id = $1 AND device_type IS NOT NULL
      GROUP BY device_type
      ORDER BY clicks DESC
    `;
    const result = await db.query(query, [id]);
    return result.rows;
  }
}

module.exports = ShortUrl;

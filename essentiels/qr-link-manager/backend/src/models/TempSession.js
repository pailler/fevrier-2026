const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class TempSession {
  static async create(sessionData) {
    const {
      user_agent,
      ip_address,
      duration_hours = 24
    } = sessionData;

    // Générer un ID de session unique
    const session_id = this.generateSessionId();
    
    // Calculer la date d'expiration
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + duration_hours);

    const query = `
      INSERT INTO temp_sessions (
        session_id, expires_at, user_agent, ip_address
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [session_id, expires_at, user_agent, ip_address];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findBySessionId(session_id) {
    const query = `
      SELECT * FROM temp_sessions 
      WHERE session_id = $1 AND is_active = true AND expires_at > CURRENT_TIMESTAMP
    `;
    const result = await db.query(query, [session_id]);
    return result.rows[0];
  }

  static async validateSession(session_id) {
    const session = await this.findBySessionId(session_id);
    return session !== null;
  }

  static async deactivateSession(session_id) {
    const query = `
      UPDATE temp_sessions 
      SET is_active = false 
      WHERE session_id = $1
    `;
    await db.query(query, [session_id]);
    return true;
  }

  static async cleanupExpired() {
    const query = `
      DELETE FROM temp_sessions 
      WHERE expires_at < CURRENT_TIMESTAMP OR is_active = false
    `;
    const result = await db.query(query);
    return result.rowCount;
  }

  static generateSessionId() {
    // Générer un ID de session de 16 caractères
    return uuidv4().replace(/-/g, '').substring(0, 16);
  }

  static async getSessionStats() {
    const query = `
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN expires_at > CURRENT_TIMESTAMP AND is_active = true THEN 1 END) as active_sessions,
        COUNT(CASE WHEN expires_at <= CURRENT_TIMESTAMP OR is_active = false THEN 1 END) as expired_sessions
      FROM temp_sessions
    `;
    const result = await db.query(query);
    return result.rows[0];
  }
}

module.exports = TempSession;

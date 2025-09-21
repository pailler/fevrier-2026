const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { email, password, first_name, last_name, role = 'user' } = userData;
    
    // Hash du mot de passe
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, role, created_at
    `;
    
    const values = [email, password_hash, first_name, last_name, role];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, email, first_name, last_name, role, is_active, created_at FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, updateData) {
    const { first_name, last_name, email } = updateData;
    const query = `
      UPDATE users 
      SET first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          email = COALESCE($4, email)
      WHERE id = $1
      RETURNING id, email, first_name, last_name, role, created_at
    `;
    const result = await db.query(query, [id, first_name, last_name, email]);
    return result.rows[0];
  }

  static async changePassword(id, newPassword) {
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    
    const query = 'UPDATE users SET password_hash = $2 WHERE id = $1';
    await db.query(query, [id, password_hash]);
    return true;
  }

  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  static async getAll(limit = 50, offset = 0) {
    const query = `
      SELECT id, email, first_name, last_name, role, is_active, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  }

  static async deactivate(id) {
    const query = 'UPDATE users SET is_active = false WHERE id = $1';
    await db.query(query, [id]);
    return true;
  }

  static async activate(id) {
    const query = 'UPDATE users SET is_active = true WHERE id = $1';
    await db.query(query, [id]);
    return true;
  }
}

module.exports = User;

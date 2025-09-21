const db = require('../config/database');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

class QRCodeModel {
  static async create(qrData) {
    const {
      short_url_id,
      name,
      description,
      size = 300,
      foreground_color = '#000000',
      background_color = '#FFFFFF',
      logo_path = null,
      logo_size = 50,
      file_format = 'png'
    } = qrData;

    // Générer les données QR
    const shortUrl = await require('./ShortUrl').findById(short_url_id);
    if (!shortUrl) {
      throw new Error('URL courte introuvable');
    }

    const qr_data = `${process.env.APP_URL || 'http://localhost:8080'}/${shortUrl.short_code}`;
    
    // Générer le QR code
    const qrBuffer = await this.generateQRCode(qr_data, {
      size,
      foreground_color,
      background_color,
      logo_path,
      logo_size,
      file_format
    });

    // Sauvegarder le fichier
    const fileName = `${short_url_id}_${Date.now()}.${file_format}`;
    const filePath = path.join(process.env.QR_STORAGE_PATH || './storage/qr-codes', fileName);
    
    // Créer le dossier s'il n'existe pas
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, qrBuffer);

    const query = `
      INSERT INTO qr_codes (
        short_url_id, name, description, qr_data, file_path,
        file_format, size, foreground_color, background_color,
        logo_path, logo_size
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const values = [
      short_url_id, name, description, qr_data, filePath,
      file_format, size, foreground_color, background_color,
      logo_path, logo_size
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT qc.*, su.short_code, su.original_url, su.title as url_title
      FROM qr_codes qc
      JOIN short_urls su ON qc.short_url_id = su.id
      WHERE qc.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByShortUrlId(short_url_id) {
    const query = `
      SELECT qc.*, su.short_code, su.original_url, su.title as url_title
      FROM qr_codes qc
      JOIN short_urls su ON qc.short_url_id = su.id
      WHERE qc.short_url_id = $1
      ORDER BY qc.created_at DESC
    `;
    const result = await db.query(query, [short_url_id]);
    return result.rows;
  }

  static async findByUserId(user_id, limit = 50, offset = 0) {
    const query = `
      SELECT qc.*, su.short_code, su.original_url, su.title as url_title,
             (SELECT COUNT(*) FROM click_stats cs WHERE cs.qr_code_id = qc.id) as qr_scans
      FROM qr_codes qc
      JOIN short_urls su ON qc.short_url_id = su.id
      WHERE su.user_id = $1
      ORDER BY qc.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(query, [user_id, limit, offset]);
    return result.rows;
  }

  static async update(id, updateData) {
    const {
      name, description, size, foreground_color, background_color,
      logo_path, logo_size, file_format
    } = updateData;

    // Récupérer les données actuelles
    const currentQR = await this.findById(id);
    if (!currentQR) {
      throw new Error('QR code introuvable');
    }

    // Régénérer le QR code si nécessaire
    let filePath = currentQR.file_path;
    if (size || foreground_color || background_color || logo_path || logo_size || file_format) {
      const qrBuffer = await this.generateQRCode(currentQR.qr_data, {
        size: size || currentQR.size,
        foreground_color: foreground_color || currentQR.foreground_color,
        background_color: background_color || currentQR.background_color,
        logo_path: logo_path || currentQR.logo_path,
        logo_size: logo_size || currentQR.logo_size,
        file_format: file_format || currentQR.file_format
      });

      // Supprimer l'ancien fichier
      try {
        await fs.unlink(currentQR.file_path);
      } catch (error) {
        console.warn('Impossible de supprimer l\'ancien fichier QR:', error.message);
      }

      // Créer le nouveau fichier
      const fileName = `${currentQR.short_url_id}_${Date.now()}.${file_format || currentQR.file_format}`;
      filePath = path.join(process.env.QR_STORAGE_PATH || './storage/qr-codes', fileName);
      await fs.writeFile(filePath, qrBuffer);
    }

    const query = `
      UPDATE qr_codes 
      SET name = COALESCE($2, name),
          description = COALESCE($3, description),
          file_path = $4,
          size = COALESCE($5, size),
          foreground_color = COALESCE($6, foreground_color),
          background_color = COALESCE($7, background_color),
          logo_path = COALESCE($8, logo_path),
          logo_size = COALESCE($9, logo_size),
          file_format = COALESCE($10, file_format)
      WHERE id = $1
      RETURNING *
    `;
    
    const values = [id, name, description, filePath, size, foreground_color, 
                   background_color, logo_path, logo_size, file_format];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const qrCode = await this.findById(id);
    if (!qrCode) {
      throw new Error('QR code introuvable');
    }

    // Supprimer le fichier
    try {
      await fs.unlink(qrCode.file_path);
    } catch (error) {
      console.warn('Impossible de supprimer le fichier QR:', error.message);
    }

    // Supprimer de la base de données
    const query = 'DELETE FROM qr_codes WHERE id = $1';
    await db.query(query, [id]);
    return true;
  }

  static async generateQRCode(data, options = {}) {
    const {
      size = 300,
      foreground_color = '#000000',
      background_color = '#FFFFFF',
      logo_path = null,
      logo_size = 50,
      file_format = 'png'
    } = options;

    const qrOptions = {
      width: size,
      margin: 2,
      color: {
        dark: foreground_color,
        light: background_color
      },
      errorCorrectionLevel: 'H' // Niveau de correction d'erreur élevé pour le logo
    };

    if (file_format === 'svg') {
      return await QRCode.toString(data, { ...qrOptions, type: 'svg' });
    } else {
      return await QRCode.toBuffer(data, qrOptions);
    }
  }

  static async getStats(id) {
    const query = `
      SELECT 
        COUNT(*) as total_scans,
        COUNT(DISTINCT ip_address) as unique_scanners,
        COUNT(DISTINCT DATE(clicked_at)) as active_days,
        MIN(clicked_at) as first_scan,
        MAX(clicked_at) as last_scan
      FROM click_stats 
      WHERE qr_code_id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getScansByDate(id, days = 30) {
    const query = `
      SELECT 
        DATE(clicked_at) as date,
        COUNT(*) as scans,
        COUNT(DISTINCT ip_address) as unique_scanners
      FROM click_stats 
      WHERE qr_code_id = $1 
        AND clicked_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(clicked_at)
      ORDER BY date DESC
    `;
    const result = await db.query(query, [id]);
    return result.rows;
  }

  static async getScansByCountry(id) {
    const query = `
      SELECT 
        country,
        COUNT(*) as scans
      FROM click_stats 
      WHERE qr_code_id = $1 AND country IS NOT NULL
      GROUP BY country
      ORDER BY scans DESC
    `;
    const result = await db.query(query, [id]);
    return result.rows;
  }

  static async getScansByDevice(id) {
    const query = `
      SELECT 
        device_type,
        COUNT(*) as scans
      FROM click_stats 
      WHERE qr_code_id = $1 AND device_type IS NOT NULL
      GROUP BY device_type
      ORDER BY scans DESC
    `;
    const result = await db.query(query, [id]);
    return result.rows;
  }
}

module.exports = QRCodeModel;

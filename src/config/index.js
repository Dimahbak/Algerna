require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  db: {
    connectionString: process.env.DATABASE_URL,
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'civismart',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'civismart',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_a_changer',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxBytes: (parseInt(process.env.MAX_PHOTO_MB || '5', 10)) * 1024 * 1024,
  },

  corsOrigin: process.env.CORS_ORIGIN || '*',

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'noreply@civismart.pylcom.app',
    enabled: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
  },

  sms: {
    provider: process.env.SMS_PROVIDER || '',
    apiKey: process.env.SMS_API_KEY || '',
    from: process.env.SMS_FROM || '',
    enabled: !!(process.env.SMS_PROVIDER && process.env.SMS_API_KEY),
  },
};

if (config.env === 'production' && config.jwt.secret === 'dev_secret_a_changer') {
  throw new Error('JWT_SECRET doit être défini en production.');
}

module.exports = config;

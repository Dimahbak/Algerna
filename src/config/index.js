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
};

if (config.env === 'production' && config.jwt.secret === 'dev_secret_a_changer') {
  throw new Error('JWT_SECRET doit être défini en production.');
}

module.exports = config;

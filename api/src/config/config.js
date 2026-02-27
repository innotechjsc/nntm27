/**
 * Cấu hình tập trung cho API NNTM.
 * Connection string và biến nhạy cảm đọc từ .env (không commit .env).
 */

require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  database: {
    // Đặt DATABASE_URL trong .env (xem env.example). VD:
    // postgresql://adfilm:***@42.118.102.108:20866/nntmdb
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expire: process.env.JWT_EXPIRE || '7d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3001', 'http://localhost:5173'],
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
  },
};

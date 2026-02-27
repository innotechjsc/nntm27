const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const handleValidation = (req, res, next) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const first = err.array()[0];
    return res.status(400).json({
      success: false,
      message: first.msg || 'Dữ liệu không hợp lệ',
      errors: err.array(),
    });
  }
  next();
};

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
    body('fullName').trim().notEmpty().withMessage('Họ tên không được để trống'),
  ],
  handleValidation,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
    body('password').notEmpty().withMessage('Vui lòng nhập mật khẩu'),
  ],
  handleValidation,
  login
);

router.get('/me', protect, getMe);

module.exports = router;


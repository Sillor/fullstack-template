const express = require('express');
const router = express.Router();
const { register } = require('./register');
const { login } = require('./login');
const { resetPasswordRequest, resetPassword } = require('./resetPassword');

router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPasswordRequest);
router.patch('/reset-password/', resetPassword);

module.exports = router;
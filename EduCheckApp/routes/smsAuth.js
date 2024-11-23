const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const User = require('../models/User');
const crypto = require('crypto');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// 发送验证码
router.post('/send-code', async (req, res) => {
  const { phone } = req.body;
  const code = crypto.randomBytes(3).toString('hex'); // 生成随机验证码

  try {
    await client.messages.create({
      body: `您的验证码是 ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    await User.updateOne({ phone }, { loginCode: code, codeExpiry: Date.now() + 10 * 60000 });
    res.json({ success: true });
  } catch (error) {
    console.error('发送验证码时出错', error);
    res.json({ success: false, message: '发送验证码失败' });
  }
});

// 验证验证码
router.post('/verify-code', async (req, res) => {
  const { phone, code } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (user && user.loginCode === code && user.codeExpiry > Date.now()) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: '验证码无效或已过期' });
    }
  } catch (error) {
    console.error('验证验证码时出错', error);
    res.json({ success: false, message: '验证验证码失败' });
  }
});

module.exports = router;

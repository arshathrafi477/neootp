const express = require("express");
const router = express.Router();
const pool = require("./db");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const otp = generateOTP();

    await pool.query(
      `INSERT INTO otp_verification(email, otp, expires_at)
       VALUES($1, $2, NOW() + INTERVAL '5 minutes')
       ON CONFLICT(email)
       DO UPDATE SET
         otp = $2,
         expires_at = NOW() + INTERVAL '5 minutes'`,
      [email, otp]
    );

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`
    });

    res.json({ success: true, message: "OTP sent" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const result = await pool.query(
      `SELECT * FROM otp_verification
       WHERE email = $1
         AND otp = $2
         AND expires_at > NOW()`,
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    await pool.query(
      "DELETE FROM otp_verification WHERE email = $1",
      [email]
    );

    res.json({ success: true, message: "OTP verified" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

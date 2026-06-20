CREATE TABLE IF NOT EXISTS otp_verification (
  email      TEXT        PRIMARY KEY,
  otp        TEXT        NOT NULL,
  expires_at TIMESTAMP   NOT NULL
);

-- Cloudflare D1 SQL Database Schema
-- Run this SQL in your Wrangler CLI or Cloudflare Dashboard to create the users table:
-- npx wrangler d1 execute <database-name> --file=./schema.sql

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    balance REAL DEFAULT 0.00,
    mobile TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payment_proofs table for ImgBB / Free Hosting screenshot submission
CREATE TABLE IF NOT EXISTS payment_proofs (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    screenshot_url TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Admin user (Optional)
INSERT OR IGNORE INTO users (id, name, email, role, balance) 
VALUES ('admin-init-id', 'System Admin', 'admin@sorat.live', 'admin', 50000.00);

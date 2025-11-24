import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Create database file in project root
const dbPath = path.join(process.cwd(), 'roomierules.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      role VARCHAR(20) DEFAULT 'roommate' CHECK (role IN ('host', 'roommate')),
      house_id INTEGER,
      bank_account VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (house_id) REFERENCES houses(id)
    )
  `);

  // Houses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS houses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      house_code VARCHAR(10) UNIQUE NOT NULL,
      host_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (host_id) REFERENCES users(id)
    )
  `);

  // Bills table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      amount DECIMAL(10,2) NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('housing', 'grocery', 'eat-out', 'other')),
      house_id INTEGER NOT NULL,
      created_by INTEGER NOT NULL,
      split_amount DECIMAL(10,2),
      due_date DATE,
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (house_id) REFERENCES houses(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Bill Payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bill_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      amount_owed DECIMAL(10,2) NOT NULL,
      receipt_url VARCHAR(500),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
      paid_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bill_id) REFERENCES bills(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // House Rules table (optional/minimal)
  db.exec(`
    CREATE TABLE IF NOT EXISTS house_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      house_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (house_id) REFERENCES houses(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_house_id ON users(house_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_houses_code ON houses(house_code);
    CREATE INDEX IF NOT EXISTS idx_bills_house_id ON bills(house_id);
    CREATE INDEX IF NOT EXISTS idx_bill_payments_bill_id ON bill_payments(bill_id);
    CREATE INDEX IF NOT EXISTS idx_bill_payments_user_id ON bill_payments(user_id);
  `);

  console.log('Database initialized successfully');
}

// Initialize database on import
initializeDatabase();

export default db;

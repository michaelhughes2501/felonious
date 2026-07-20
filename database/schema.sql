CREATE DATABASE IF NOT EXISTS `felonious`;
USE `felonious`;

-- Generic items table (used by items API)
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resident accounts (mirrors backend-node/models/Resident.js, which creates
-- this table itself on server start — declared here too so schema.sql stays
-- the single source of truth for the full DB shape).
CREATE TABLE IF NOT EXISTS residents (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  handle      VARCHAR(100) NOT NULL UNIQUE,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  location    VARCHAR(255),
  bio         TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resource records: housing, employment, wellness, legal, and general support by location
CREATE TABLE IF NOT EXISTS kits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category ENUM('housing', 'jobs', 'mental_health', 'legal', 'general') NOT NULL DEFAULT 'general',
  location VARCHAR(255),
  description TEXT,
  url VARCHAR(500),
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES residents(id) ON DELETE SET NULL
);

-- Peer connections: approved resident profiles for supervised connection
CREATE TABLE IF NOT EXISTS connects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  handle VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  released_date DATE,
  bio TEXT,
  contact VARCHAR(255),
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES residents(id) ON DELETE SET NULL
);

-- Safe to re-run against a pre-existing database that predates the
-- created_by ownership columns above (requires MySQL 8.0.29+).
ALTER TABLE kits ADD COLUMN IF NOT EXISTS created_by INT NULL,
  ADD CONSTRAINT IF NOT EXISTS fk_kits_created_by FOREIGN KEY (created_by) REFERENCES residents(id) ON DELETE SET NULL;
ALTER TABLE connects ADD COLUMN IF NOT EXISTS created_by INT NULL,
  ADD CONSTRAINT IF NOT EXISTS fk_connects_created_by FOREIGN KEY (created_by) REFERENCES residents(id) ON DELETE SET NULL;

-- Sample resources
INSERT INTO kits (title, category, location, description, url) VALUES
  ('Transitional Housing Guide - Chicago', 'housing', 'Chicago, IL', 'Transitional housing and shelter resources for program participants', 'https://example.org'),
  ('Reentry Employment Board - Texas', 'jobs', 'Texas', 'Employers and training programs open to residents with justice-system histories', 'https://example.org'),
  ('Wellness Support Line - National', 'mental_health', 'National', '24/7 crisis line and counseling resources for residents', 'https://example.org'),
  ('Ban the Box Employers - California', 'jobs', 'California', 'Companies that removed the box from job applications', 'https://example.org'),
  ('Legal Aid Society - New York', 'legal', 'New York, NY', 'Free legal help for expungement and record sealing', 'https://example.org');

-- Sample peer connections
INSERT INTO connects (handle, location, released_date, bio, contact) VALUES
  ('Resident_CHI', 'Chicago, IL', '2024-08-15', 'Focused on stable work, housing, and positive peer connection.', 'DM only'),
  ('ATX_Reentry', 'Austin, TX', '2024-06-01', 'Has housing and is looking for steady employment resources and peer support.', 'supervised contact preferred');

CREATE DATABASE IF NOT EXISTS `felonious`;
USE `felonious`;

-- Resource records: housing, employment, wellness, legal, and general support by location
CREATE TABLE IF NOT EXISTS kits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category ENUM('housing', 'jobs', 'mental_health', 'legal', 'general') NOT NULL DEFAULT 'general',
  location VARCHAR(255),
  description TEXT,
  url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Peer connections: approved resident profiles for supervised connection
CREATE TABLE IF NOT EXISTS connects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  handle VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  released_date DATE,
  bio TEXT,
  contact VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

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

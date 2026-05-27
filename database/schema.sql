CREATE DATABASE IF NOT EXISTS `felonious`;
USE `felonious`;

-- Resource kits: housing, jobs, mental health bundles by location
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

-- Connects: people looking to link up after release
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

-- Sample kits
INSERT INTO kits (title, category, location, description, url) VALUES
  ('Fresh Out Housing Guide - Chicago', 'housing', 'Chicago, IL', 'Halfway houses and transitional housing accepting formerly incarcerated', 'https://example.org'),
  ('ReEntry Jobs Board - Texas', 'jobs', 'Texas', 'Employers that hire with felony backgrounds in TX', 'https://example.org'),
  ('Mental Health Line - National', 'mental_health', 'National', '24/7 crisis line and counseling for people fresh out', 'https://example.org'),
  ('Ban the Box Employers - California', 'jobs', 'California', 'Companies that removed the box from job applications', 'https://example.org'),
  ('Legal Aid Society - New York', 'legal', 'New York, NY', 'Free legal help for expungement and record sealing', 'https://example.org');

-- Sample connects
INSERT INTO connects (handle, location, released_date, bio, contact) VALUES
  ('Fresh_Mike_CHI', 'Chicago, IL', '2024-08-15', 'Looking to link with people in the Chi. Trying to stay straight, need work.', 'DM only'),
  ('ATX_Reentry', 'Austin, TX', '2024-06-01', 'Out 6 months, got housing, need connects for steady work.', 'hit me up');

-- Create roles ENUM if needed (for PostgreSQL)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('patient', 'clinic', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- USERS TABLE (Generic)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role user_role NOT NULL,
  name VARCHAR(100),
  language VARCHAR(50),
  location VARCHAR(100),
  city VARCHAR(100),
  doctor_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SLOTS TABLE
CREATE TABLE IF NOT EXISTS slots (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  language VARCHAR(50),
  status VARCHAR(20) CHECK (status IN ('open', 'booked', 'cancelled', 'expired')) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  slot_id INTEGER REFERENCES slots(id) ON DELETE CASCADE,
  confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- STANDBY PREFERENCES
CREATE TABLE IF NOT EXISTS standby_preferences (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT FALSE,
  preferred_languages TEXT,
  preferred_days TEXT,
  preferred_times TEXT,
  max_notifications_per_day INTEGER DEFAULT 5
);

-- DND PREFERENCES
CREATE TABLE IF NOT EXISTS dnd_preferences (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  dnd_days TEXT,
  dnd_time_ranges TEXT,
  temporarily_paused BOOLEAN DEFAULT FALSE,
  pause_until TIMESTAMP
);

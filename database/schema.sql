CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- car, yacht, watch, med_device
  total_tokens INT,
  tokens_available INT,
  price_per_token DECIMAL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  asset_id INT REFERENCES assets(id),
  token_amount INT,
  total_paid DECIMAL,
  type VARCHAR(20), -- buy / sell
  tx_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ownerships (
  user_id INT REFERENCES users(id),
  asset_id INT REFERENCES assets(id),
  token_count INT,
  PRIMARY KEY (user_id, asset_id)
);

CREATE TABLE ownership_usage (
    user_id INT REFERENCES users(id),
    asset_id INT REFERENCES assets(id),
    total_fractions INT NOT NULL, -- e.g., total days user owns
    used_fractions INT DEFAULT 0, -- how many have been booked
    PRIMARY KEY (user_id, asset_id)
);

CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    asset_id INT REFERENCES assets(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    fraction_days INT NOT NULL, -- number of days booked
    created_at TIMESTAMP DEFAULT NOW()
);


-- Seed Users (replace with real bcrypt hashes)
INSERT INTO users (full_name, email, password_hash, role) VALUES
('Admin User', 'admin@elitefraction.com', '$2a$12$zL3ZGQK0lb9/vl0w/8aWKuZPVg/SXuduiEcjxaeOu3l1.n0a5NtgO', 'admin'),
('John Doe', 'john@example.com', '$2a$12$zL3ZGQK0lb9/vl0w/8aWKuZPVg/SXuduiEcjxaeOu3l1.n0a5NtgO', 'user');

-- Seed Assets
INSERT INTO assets (title, description, category, total_tokens, tokens_available, price_per_token, image_url) VALUES
('Lamborghini Huracan', 'High-performance sports car with V10 engine.', 'car', 1000, 1000, 500.00, 'https://example.com/lamborghini.jpg'),
('Sunseeker Yacht', 'Luxury motor yacht with premium amenities.', 'yacht', 500, 500, 1000.00, 'https://example.com/yacht.jpg'),
('MRI Scanner', 'Advanced imaging machine for clinics.', 'medical', 300, 300, 2000.00, 'https://example.com/mri.jpg');

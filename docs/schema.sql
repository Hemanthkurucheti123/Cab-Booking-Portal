-- ============================================
-- CAB BOOKING PORTAL — DATABASE SCHEMA
-- ============================================

-- COMPANY: corporate offices that request rides
CREATE TABLE company (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- VENDOR: cab operators who fulfill bookings
CREATE TABLE vendor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone VARCHAR(20),
  region VARCHAR(255),          -- used later for Open Market eligibility
  created_at TIMESTAMP DEFAULT NOW()
);

-- COMPANY_VENDOR_MAP: many-to-many link between companies and vendors
CREATE TABLE company_vendor_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendor(id) ON DELETE CASCADE,
  is_associated BOOLEAN DEFAULT TRUE,   -- "associated/whitelisted" for open market phase 1
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, vendor_id)
);

-- DRIVER: belongs to a vendor
CREATE TABLE driver (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendor(id) ON DELETE CASCADE,
  employee_id VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  date_of_joining DATE,
  vehicle_type VARCHAR(50),
  vehicle_number VARCHAR(50),
  pan_number VARCHAR(20),
  aadhar_number VARCHAR(20),
  license_number VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  salary NUMERIC(10,2),
  department VARCHAR(100),
  bank_account_number VARCHAR(50),
  bank_ifsc_code VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- VEHICLE: belongs to a vendor
CREATE TABLE vehicle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendor(id) ON DELETE CASCADE,
  vehicle_type VARCHAR(50),        -- Sedan, Hatchback, SUV, Luxury
  plate_number VARCHAR(50) UNIQUE NOT NULL,
  model VARCHAR(100),
  is_available BOOLEAN DEFAULT TRUE,
  condition_status VARCHAR(50),     -- e.g. 'good', 'needs service'
  insurance_expiry DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- BOOKING: the central entity
CREATE TABLE booking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES company(id),
  vendor_id UUID REFERENCES vendor(id),         -- null until a vendor accepts
  driver_id UUID REFERENCES driver(id),          -- assigned on accept
  vehicle_id UUID REFERENCES vehicle(id),        -- assigned on accept

  -- guest / trip details (from company's booking form)
  guest_name VARCHAR(255),
  guest_location TEXT,
  guest_contact VARCHAR(20),
  reference_name VARCHAR(255),
  trip_details TEXT,
  pickup_time TIMESTAMP,
  drop_time TIMESTAMP,
  location_link TEXT,

  -- status lifecycle
  status VARCHAR(30) DEFAULT 'pending',
  -- allowed values: pending, accepted, rejected, open_market, ongoing, completed, cancelled

  -- open market fields
  open_market_at TIMESTAMP,          -- when it was placed in open market
  open_market_expanded BOOLEAN DEFAULT FALSE,  -- true once 30-min escalation happens

  -- billing fields
  invoice_number VARCHAR(100),
  op_km NUMERIC(10,2),
  total_km NUMERIC(10,2),
  toll_and_parking NUMERIC(10,2),
  night_charge NUMERIC(10,2),
  total_amount NUMERIC(10,2),
  fuel_office NUMERIC(10,2),
  fuel_cash NUMERIC(10,2),
  road_tax NUMERIC(10,2),
  expenses NUMERIC(10,2),
  advance_office NUMERIC(10,2),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- INVOICE: submitted by vendor per booking
CREATE TABLE invoice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendor(id),
  amount NUMERIC(10,2),
  status VARCHAR(30) DEFAULT 'pending',   -- pending, paid
  submitted_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP
);
INSERT INTO company_vendor_map (company_id, vendor_id, is_associated)
VALUES (
  (SELECT id FROM company WHERE email = 'acme@company.com'),
  (SELECT id FROM vendor WHERE email = 'citycabs@vendor.com'),
  true
);
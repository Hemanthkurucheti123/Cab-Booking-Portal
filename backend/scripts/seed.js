const bcrypt = require("bcryptjs");
const pool = require("../db");
require("dotenv").config();

async function seed() {
  console.log("Seeding database...");

  const password_hash = await bcrypt.hash("test123", 10);

  try {
    // ---- COMPANIES ----
    const companiesRes = await pool.query(
      `INSERT INTO company (name, email, password_hash, phone, address)
       VALUES
        ('Acme Corp', 'acme@company.com', $1, '9800000001', 'MG Road, Bengaluru'),
        ('Globex Inc', 'globex@company.com', $1, '9800000002', 'Whitefield, Bengaluru')
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email`,
      [password_hash]
    );

    // fetch ids regardless of whether they were just inserted or already existed
    const companies = (
      await pool.query(`SELECT id, email FROM company WHERE email IN ('acme@company.com','globex@company.com')`)
    ).rows;

    // ---- VENDORS ----
    await pool.query(
      `INSERT INTO vendor (name, email, password_hash, phone, region)
       VALUES
        ('City Cabs', 'citycabs@vendor.com', $1, '9800000010', 'Bengaluru East'),
        ('Metro Rides', 'metrorides@vendor.com', $1, '9800000011', 'Bengaluru West'),
        ('Swift Travels', 'swifttravels@vendor.com', $1, '9800000012', 'Bengaluru East')
       ON CONFLICT (email) DO NOTHING`,
      [password_hash]
    );

    const vendors = (
      await pool.query(`SELECT id, email FROM vendor WHERE email IN ('citycabs@vendor.com','metrorides@vendor.com','swifttravels@vendor.com')`)
    ).rows;

    const acme = companies.find((c) => c.email === "acme@company.com");
    const globex = companies.find((c) => c.email === "globex@company.com");
    const cityCabs = vendors.find((v) => v.email === "citycabs@vendor.com");
    const metroRides = vendors.find((v) => v.email === "metrorides@vendor.com");
    const swiftTravels = vendors.find((v) => v.email === "swifttravels@vendor.com");

    // ---- COMPANY-VENDOR ASSOCIATIONS (many-to-many) ----
    await pool.query(
      `INSERT INTO company_vendor_map (company_id, vendor_id, is_associated)
       VALUES
        ($1, $2, true),
        ($1, $3, true),
        ($4, $3, true),
        ($4, $5, true)
       ON CONFLICT (company_id, vendor_id) DO NOTHING`,
      [acme.id, cityCabs.id, metroRides.id, globex.id, swiftTravels.id]
    );

    // ---- DRIVERS (for City Cabs) ----
    const driversRes = await pool.query(
      `INSERT INTO driver (vendor_id, employee_id, name, date_of_joining, vehicle_type, phone, license_number)
       VALUES
        ($1, 'EMP001', 'Ravi Kumar', '2023-01-15', 'Sedan', '9111100001', 'KA01L1234'),
        ($1, 'EMP002', 'Suresh Babu', '2023-03-20', 'SUV', '9111100002', 'KA01L5678')
       RETURNING id`,
      [cityCabs.id]
    );

    // ---- VEHICLES (for City Cabs) ----
    const vehiclesRes = await pool.query(
      `INSERT INTO vehicle (vendor_id, vehicle_type, plate_number, model, is_available, condition_status)
       VALUES
        ($1, 'Sedan', 'KA01AB1234', 'Honda City', true, 'good'),
        ($1, 'SUV', 'KA01CD5678', 'Toyota Innova', true, 'good')
       ON CONFLICT (plate_number) DO NOTHING
       RETURNING id`,
      [cityCabs.id]
    );

    const driverId = driversRes.rows[0]?.id || null;
    const vehicleId = vehiclesRes.rows[0]?.id || null;

    // ---- BOOKINGS (various statuses, so every dashboard tab has something) ----
    await pool.query(
      `INSERT INTO booking
        (company_id, vendor_id, driver_id, vehicle_id, guest_name, guest_location,
         guest_contact, trip_details, pickup_time, status)
       VALUES
        ($1, NULL, NULL, NULL, 'Pending Guest', 'Indiranagar', '9000000001', 'Airport drop', NOW() + INTERVAL '2 hours', 'pending'),
        ($1, $2, $3, $4, 'Accepted Guest', 'Koramangala', '9000000002', 'Office pickup', NOW() + INTERVAL '3 hours', 'accepted'),
        ($1, $2, $3, $4, 'Ongoing Guest', 'HSR Layout', '9000000003', 'Client meeting', NOW() - INTERVAL '1 hour', 'ongoing'),
        ($1, $2, $3, $4, 'Completed Guest', 'MG Road', '9000000004', 'Airport pickup', NOW() - INTERVAL '1 day', 'completed'),
        ($1, NULL, NULL, NULL, 'Cancelled Guest', 'Whitefield', '9000000005', 'Hotel drop', NOW() - INTERVAL '2 days', 'cancelled')`,
      [acme.id, cityCabs.id, driverId, vehicleId]
    );

    console.log("Seeding complete!");
    console.log("Test accounts (password for all: test123):");
    console.log("  Company: acme@company.com, globex@company.com");
    console.log("  Vendor: citycabs@vendor.com, metrorides@vendor.com, swifttravels@vendor.com");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await pool.end();
  }
}

seed();
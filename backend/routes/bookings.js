const express = require("express");
const router = express.Router();
const pool = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
const { publishNewBooking, publishStatusUpdate } = require("../queue/publisher");

// CREATE BOOKING — company only
router.post("/", requireAuth, requireRole("company"), async (req, res) => {
  const companyId = req.user.id;
  const {
    guest_name,
    guest_location,
    guest_contact,
    reference_name,
    trip_details,
    pickup_time,
    drop_time,
    location_link,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO booking
        (company_id, guest_name, guest_location, guest_contact, reference_name,
         trip_details, pickup_time, drop_time, location_link, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
       RETURNING *`,
      [companyId, guest_name, guest_location, guest_contact, reference_name,
       trip_details, pickup_time, drop_time, location_link]
    );

    publishNewBooking(result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// LIST BOOKINGS — company sees their own; vendor sees assigned + pending +
// open-market bookings they're eligible for
router.get("/", requireAuth, async (req, res) => {
  const { id, role } = req.user;

  try {
    let result;
    if (role === "company") {
      result = await pool.query(
        `SELECT * FROM booking WHERE company_id = $1 ORDER BY created_at DESC`,
        [id]
      );
    } else {
      result = await pool.query(
        `SELECT b.* FROM booking b
         WHERE
           b.vendor_id = $1

           OR (b.status = 'pending' AND b.company_id IN (
                 SELECT company_id FROM company_vendor_map
                 WHERE vendor_id = $1 AND is_associated = true
               ))

           OR (b.status = 'open_market'
               AND b.open_market_at > NOW() - INTERVAL '30 minutes'
               AND b.company_id IN (
                 SELECT company_id FROM company_vendor_map
                 WHERE vendor_id = $1 AND is_associated = true
               ))

           OR (b.status = 'open_market'
               AND b.open_market_at <= NOW() - INTERVAL '30 minutes'
               AND b.company_id IN (
                 SELECT company_id FROM company_vendor_map
                 WHERE vendor_id = $1
               ))
         ORDER BY b.created_at DESC`,
        [id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// ACCEPT BOOKING — vendor assigns driver + vehicle; works for pending OR open_market
router.patch("/:id/accept", requireAuth, requireRole("vendor"), async (req, res) => {
  const vendorId = req.user.id;
  const { id } = req.params;
  const { driver_id, vehicle_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE booking
       SET vendor_id = $1, driver_id = $2, vehicle_id = $3, status = 'accepted', updated_at = NOW()
       WHERE id = $4 AND status IN ('pending', 'open_market')
       RETURNING *`,
      [vendorId, driver_id, vehicle_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: "Booking not available to accept" });
    }

    publishStatusUpdate(result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to accept booking" });
  }
});

// REJECT BOOKING — vendor
router.patch("/:id/reject", requireAuth, requireRole("vendor"), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE booking SET status = 'rejected', updated_at = NOW()
       WHERE id = $1 AND status = 'pending' RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: "Booking not available to reject" });
    }

    publishStatusUpdate(result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject booking" });
  }
});

// PLACE IN OPEN MARKET — vendor can't fulfill, opens it up to others
router.patch("/:id/open-market", requireAuth, requireRole("vendor"), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE booking
       SET status = 'open_market', open_market_at = NOW(), open_market_expanded = false, updated_at = NOW()
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: "Booking not available to place in open market" });
    }

    publishStatusUpdate(result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to place booking in open market" });
  }
});

// START TRIP — dummy driver-triggered button
router.patch("/:id/start-trip", requireAuth, requireRole("vendor"), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE booking SET status = 'ongoing', updated_at = NOW()
       WHERE id = $1 AND status = 'accepted' RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: "Booking must be accepted before starting trip" });
    }

    publishStatusUpdate(result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start trip" });
  }
});

// END TRIP — dummy driver-triggered button
router.patch("/:id/end-trip", requireAuth, requireRole("vendor"), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE booking SET status = 'completed', updated_at = NOW()
       WHERE id = $1 AND status = 'ongoing' RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: "Booking must be ongoing before ending trip" });
    }

    publishStatusUpdate(result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to end trip" });
  }
});

module.exports = router;
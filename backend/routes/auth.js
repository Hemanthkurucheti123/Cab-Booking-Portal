const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const pool = require("../db");
const { signToken } = require("../utils/jwt");

// SIGNUP — role is "company" or "vendor"
router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!["company", "vendor"].includes(role)) {
    return res.status(400).json({ error: "role must be 'company' or 'vendor'" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const table = role; // "company" or "vendor" table

    const result = await pool.query(
      `INSERT INTO ${table} (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email`,
      [name, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = signToken({ id: user.id, role });

    res.status(201).json({ user, role, token });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error(err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// LOGIN — role is "company" or "vendor"
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  if (!["company", "vendor"].includes(role)) {
    return res.status(400).json({ error: "role must be 'company' or 'vendor'" });
  }

  try {
    const table = role;
    const result = await pool.query(`SELECT * FROM ${table} WHERE email = $1`, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken({ id: user.id, role });
    res.json({ user: { id: user.id, name: user.name, email: user.email }, role, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
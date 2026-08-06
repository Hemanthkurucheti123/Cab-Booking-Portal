# Database Schema — Plain English

- **company**: a corporate office that books cabs.
- **vendor**: a cab operator that fulfills bookings.
- **company_vendor_map**: the join table making company↔vendor many-to-many —
  one company can work with several vendors, and one vendor can serve several
  companies. `is_associated` marks vendors that are "whitelisted partners" for
  the Open Market's first-30-minutes rule.
- **driver**: employee of a vendor, with personal + banking details.
- **vehicle**: owned by a vendor, tracks availability and condition.
- **booking**: the core object. Starts with only `company_id` filled in;
  `vendor_id`, `driver_id`, `vehicle_id` get filled in once a vendor accepts.
  `status` drives the whole workflow — pending → accepted/rejected/open_market
  → ongoing → completed (or cancelled at any point after acceptance).
- **invoice**: a vendor's billing record tied to a completed booking.
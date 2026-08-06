const express = require('express');
const cors = require('cors');
const healthRoute = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', healthRoute);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
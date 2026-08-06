const express = require("express");
const cors = require("cors");
require("dotenv").config();

const healthRoutes = require("./routes/health");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/health", healthRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
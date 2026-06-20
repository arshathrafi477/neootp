require("dotenv").config();

const express = require("express");
const cors = require("cors");
const otpRoutes = require("./otpRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", otpRoutes);

app.get("/", (req, res) => {
  res.send("OTP API Running 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require("express");
const cors = require("cors");

const songRoutes = require("./routes/songs");
const albumRoutes = require("./routes/albums");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);

app.get("/", (req, res) => {
  res.send("TuneNest Backend Running");
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

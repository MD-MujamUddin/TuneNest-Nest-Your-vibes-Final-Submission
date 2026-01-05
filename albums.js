const express = require("express");
const router = express.Router();
const albums = require("../data/albums.json");

router.get("/", (req, res) => {
  res.json(albums);
});

module.exports = router;

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5500;

const PUBLIC_DIR = path.join(__dirname, "public");
const SONGS_DIR = path.join(__dirname, "songs");

app.use(express.static(PUBLIC_DIR));
app.use("/songs", express.static(SONGS_DIR));

app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.get("/api/songs", (req, res) => {
  try {
    const songs = fs
      .readdirSync(SONGS_DIR)
      .filter(f => /\.(mp3|wav|ogg)$/i.test(f));
    res.json(songs);
  } catch (e) {
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

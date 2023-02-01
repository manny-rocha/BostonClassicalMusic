const express = require("express");
const axios = require("axios");
const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  const url = 'https://www.classical-scene.com/?feed=gigpress';
  const response = await axios.get(url);
  const xmlText = response.data;

  res.send(xmlText);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
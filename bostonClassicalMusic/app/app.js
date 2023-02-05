const { next } = require('cheerio/lib/api/traversing');
const express = require('express');
const { createAndConnectDB, updateEvents } = require('./scripts')
const app = express();


let lastTableCreationTime;

app.get('/', (req, res) => {
  const currentTime = new Date().getTime();
  if (!lastTableCreationTime || currentTime - lastTableCreationTime > 24 * 60 * 60 * 1000) {
    // create a new table
    lastTableCreationTime = currentTime;
    createAndConnectDB(req, res, next, () => {
      updateEvents(req, res, next);
      req.db.all('SELECT * FROM events', (err, rows) => {
        if (err) {
          console.error(err.message);
          return res.sendStatus(500);
        }
        res.render('index', { events: rows });
      });
    });
  } else {
    // use the existing table
    req.db.all('SELECT * FROM events', (err, rows) => {
      if (err) {
        console.error(err.message);
        return res.sendStatus(500);
      }
      res.render('index', { events: rows });
    });
  }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
const sqlite3 = require('sqlite3').verbose();
const xml2js = require('xml2js');
const request = require('request');
const express = require('express');
const ejs = require('ejs');

const db = new sqlite3.Database('gigs.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the gigs database.');
});

db.run(`CREATE TABLE IF NOT EXISTS gigs (
  id INTEGER PRIMARY KEY,
  date DATE,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  link TEXT NOT NULL
)`, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Table created.');
});
request('https://www.classical-scene.com/?feed=gigpress', (err, response, body) => {
  if (err) {
    console.error(err);
    return;
  }

  xml2js.parseString(body, (err, result) => {
    if (err) {
      console.error(err);
      return;
    }

    const gigs = result.rss.channel[0].item;

    const insertGig = (gig) => {
      const { date, time, venue, city, state, country, link } = gig;
    
      db.run(`INSERT INTO gigs (date, time, venue, city, state, country, link)
        VALUES (?, ?, ?, ?, ?, ?, ?)`, [date, time, venue, city, state, country, link], (err) => {
        if (err) {
          console.error(err.message);
        }
      });
    };
    
    gigs.forEach(insertGig);
    
  });
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
  db.all("SELECT * FROM gigs", (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    const gigs = rows.map(row => {
      return {
        date: row.date,
        time: row.time,
        venue: row.venue,
        city: row.city,
        state: row.state,
        country: row.country,
        link: row.link
      };
    });
    res.render('index', { gigs: gigs });
  });
});



app.listen(3000, () => {
  console.log('Server started on port 3000');
});

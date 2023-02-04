const sqlite3 = require('sqlite3').verbose();
const cheerio = require('cheerio');
const express = require('express');
const path = require('path');
const fetch = require('isomorphic-unfetch')
const app = express();
const axios = require('axios');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};



const db = new sqlite3.Database('./events.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the events database.');
  }
});

const createTable = () => {
  const sql = `CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    city TEXT NOT NULL,
    add TEXT NOT NULL,
    presenter TEXT NOT NULL,
    performer TEXT NOT NULL,
    location TEXT NOT NULL,
    tickets TEXT NOT NULL,
    notes TEXT NOT NULL,
    details TEXT NOT NULL
  )`;

  db.run(sql, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Events table created successfully.');
    }
  });
};


const loadData = async () => {
  try {
    const response = await axios.get('https://www.classical-scene.com/calendar/');
    const html = response.data;
    const cheerio = require('cheerio');
    const $ = cheerio.load(html);

    const events = [];
    $('.event-1, .event0').each(function () {
        const date = $(this).find('.date').text();
        const time = $(this).find('.time').text();
        const city = $(this).find('.city').text();
        const venue = $(this).find('.add').text();
        const artist = $(this).find('.performer').text();
        const address = $(this).find('.gigpress-address').text();
        const tickets = $(this).find('li:nth-child(4)').text();
        const description = $(this).find('.notes').text();
        const hyperlink = $(this).find('p').text();

        events.push({ artist, date, time, city, venue, address, tickets, description, hyperlink });
    });
    console.log(events);
    return events;

  } catch (error) {
    console.error(error);
    return [];
  }
};


const insertData = (events) => {
  for (let i = 0; i < events.length; i++) {
    const gig = events[i];
    const sql = 'INSERT INTO events (artist, date, time, city, venue, address, tickets, description, hyperlink) VALUES (?,?,?,?,?,?,?,?,?)';
    db.run(sql, [gig.artist, gig.date, gig.time, gig.city, gig.venue, gig.address, gig.tickets, gig.description, gig.hyperlink], (err) => {
      if (err) {
      console.error(err.message);
      } else {
      console.log(`Gig data inserted successfully.`);
      }
    });
  }
};

const loadDataAndInsert = async () => {
  createTable();
  try {
    const events = await loadData();
    insertData(events);
  } catch (error) {
    console.error(error);
  }
};

loadDataAndInsert();

app.get('/', (req, res) => {
  db.all('SELECT * FROM events', (err, rows) => {
    if (err) {
      console.error(err.message);
    } else {
      res.render('index', { events: rows });
    }
  });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
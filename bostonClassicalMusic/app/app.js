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
    presenter TEXT NOT NULL,
    performer TEXT NOT NULL,
    location TEXT NOT NULL,
    tickets TEXT,
    notes TEXT NOT NULL,
    gcalendar TEXT NOT NULL
  )`;

  db.run(sql, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Events table created successfully.');
    }
  });
};


const scrapeData = async () => {
  try {
    const response = await fetch('https://www.classical-scene.com/calendar/');
    const html = await response.text();
    const $ = cheerio.load(html);
    const events = [];

    $('.event-1, .event0').each((i, el) => {
      const event = {};
      event.date = $(el).find('.date').text();
      event.time = $(el).find('.time').text();
      event.city = $(el).find('.city').text().replace('in ', '');
      event.location = $(el).find('.gigpress-address').text();
      event.performer = $(el).find('.performer').text();
      event.presenter = $(el).find('.presenter a').text();
      event.ticketLink = $(el).find('.right-c li:last-child').attr('href');
      event.notes = $(el).find('p').text();
      event.gCalendar = $(el).find('.add a:first-child').attr('href');

      events.push(event);
    });

    return events;
  } catch (error) {
    console.error(error);
    return [];
  }
};




const insertData = (events) => {
  for (let i = 0; i < events.length; i++) {
    const gig = events[i];
    const sql = 'INSERT INTO events (performer, presenter, date, time, city, location, tickets, notes, gcalendar) VALUES (?,?,?,?,?,?,?,?,?)';
    db.run(sql, [gig.performer, gig.presenter, gig.date, gig.time, gig.city, gig.location, gig.ticketLink, gig.notes, gig.gCalendar], (err) => {
      if (err) {
      console.error(err.message);
      } else {
      console.log(`Gig data inserted successfully.`);
      }
    });
  }
};

const scrapeDataAndInsert = async () => {
  createTable();
  try {
    const events = await scrapeData();
    insertData(events);
  } catch (error) {
    console.error(error);
  }
};

scrapeDataAndInsert();

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
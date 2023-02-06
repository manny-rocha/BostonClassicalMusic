const sqlite3 = require('sqlite3').verbose();
const cheerio = require('cheerio');
const express = require('express');
const path = require('path');
const fetch = require('isomorphic-unfetch')
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/', express.static('public'));

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
    performer TEXT NOT NULL,
    location TEXT NOT NULL,
    tickets TEXT,
    notes TEXT NOT NULL,
    gcalendar TEXT
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
      event.location = $(el).find('.gigpress-address').attr('href');
      event.performer = $(el).find('.performer').text();
      
      $(el).find("ul.right-c").each((j, li) => {
        const text = $(li).text();
        if (text.includes("Tickets:")) {
          event.ticketLink = $(li).find("a").attr("href");
        }
      });
      
      event.notes = $(el).find('p').text();
      event.gCalendar = $(el).find('.add').attr('href');
    
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
    const sql = 'INSERT INTO events (performer, date, time, city, location, tickets, notes, gcalendar) VALUES (?,?,?,?,?,?,?,?)';
    db.run(sql, [gig.performer, gig.date, gig.time, gig.city, gig.location, gig.ticketLink, gig.notes, gig.gCalendar], (err) => {
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
  const runDbOperations = () => {
    db.all('SELECT * FROM events', (err, rows) => {
      if (err) {
        console.error(err.message);
      } else {
        res.render('index', { events: rows });
      }
    });
  };
  runDbOperations();
});  


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
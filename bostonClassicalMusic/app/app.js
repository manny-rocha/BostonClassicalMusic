const sqlite3 = require('sqlite3').verbose();
const cheerio = require('cheerio');
const express = require('express');
const path = require('path');
const fetch = require('isomorphic-unfetch')
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');
const url = 'https://www.classical-scene.com/?feed=gigpress';
const dbFile = 'gigs.db';
const dbPath = path.join(__dirname, dbFile);
let db;

// const db = new sqlite3.Database('gigs.db');
function loadData() {
  // Connect to the database.
  db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(`Connected to the ${dbFile} database.`);
    }
  });
  

  // Create the gigs table if it does not exist.
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS gigs (
      id INTEGER PRIMARY KEY,
      artist TEXT,
      date TEXT,
      time TEXT,
      city TEXT,
      venue TEXT,
      address TEXT,
      tickets TEXT,
      description TEXT,
      gcalendar TEXT,
      hyperlink TEXT
    );
  `;
  db.run(createTableSQL, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(`Table created successfully.`);
    }
  });

  // Make a GET request to the URL.
  try {
    fetch(url)
      .then((response) => response.text())
      .then(text => {
        let cleaned = text.replace(/<!\[CDATA\[|\]\]>/g, '');
        return cleaned;
      })
      .then((xml) => {
        const $ = cheerio.load(xml, {
          xmlMode: true,
        })
        $('item').each((i, element) => {
          const ul = $(element).find('gigprress_ul');
          $(element).find('ul').each((i, ul) => {
            const columns = ['artist', 'date', 'time', 'city', 'venue', 'address', 'tickets', 'description', 'gcalendar', 'hyperlink']; // add the hyperlink to the columns array
            let j = 0;
            $(ul).find('li').each((i, li) => {
              const text = $(li).text();
              console.log(`ul: ${ul} li: ${text}`);
        
              if (j >= columns.length) {
                j = 0;
              }
        
              // Add the hyperlink information to the object being stored in the gigs array
              const hyperlink = $(li).find('a').attr('href');
        
              db.run(`INSERT INTO gigs (${columns[j]})
                      VALUES (?)`,
                [text],
                function (err) {
                  if (err) {
                    console.log(err);
                  }
                });
        
              j++;
            });
          });
        });
        
      }) 
  } 
      catch (err) {
        console.log(err);
      }
}

loadData();


app.get('/', (req, res) => {
  // Could change the LIMIT clause to be a variable with a dropdown box, or a load-as-you-scroll situation
  db.all("SELECT * FROM gigs LIMIT 100", (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    if (rows) {
      const gigs = rows.map(row => {
        return {
          artist: row.artist,
          date: row.date,
          time: row.time,
          city: row.city,
          venue: row.venue,
          address: row.address,
          tickets: row.tickets,
          description: row.description,
          gcalendar: row.gcalendar,
          hyperlink: row.hyperlink,
        };
      });
      res.render('index', { gigs: gigs });
    } else {
      console.error("No rows returned from the database");
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
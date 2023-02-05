const cheerio = require('cheerio');

const uuid = require('uuid');
const axios = require('axios');
const fetch = require('isomorphic-unfetch');

exports.createAndConnectDB = function(req, res, next) {
    let db;
    const sqlite3 = require('sqlite3');
    // const sessionID = req.sessionID || uuid.v4();
    // req.sessionID = sessionID;
    db = new sqlite3.Database(`./events.db`, (err) => {
        if (err) {
            console.error(`Error creating SQLite database: ${err.message}`);
            return next(err);
        }
        console.log(`Connected to the events database.`);
        const sql = `CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sessionID TEXT NOT NULL,
            artist TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            city TEXT NOT NULL,
            venue TEXT NOT NULL,
            address TEXT NOT NULL,
            addressLink TEXT NOT NULL,
            tickets TEXT NOT NULL,
            ticketsLink TEXT NOT NULL,
            description TEXT NOT NULL,
            hyperlink TEXT NOT NULL
        )`;
        db.run(sql, (err) => {
            if (err) {
            console.error(err.message);
            return res.sendStatus(500);
            } else {
            console.log(`Events table created successfully.`);
            }
        });
        })
        return db;
};    


exports.updateEvents = async function(req, res) {
    try {
        const response = await fetch('https://www.classical-scene.com/calendar/');
        const html = await response.text();
        const $ = cheerio.load(html);
        const events = [];
        $('#calendar .event-list-item').each((i, el) => {
            const artist = $(el).find('.event-list-item-artist').text();
            const date = $(el).find('.event-list-item-date').text();
            const time = $(el).find('.event-list-item-time').text();
            const city = $(el).find('.event-list-item-location-city').text();
            const venue = $(el).find('.event-list-item-location-venue').text();
            const address = $(el).find('.event-list-item-location-address').text();
            const addressLink = $(el).find('.event-list-item-location-address a').attr('href');
            const tickets = $(el).find('.event-list-item-tickets').text();
            const ticketsLink = $(el).find('.event-list-item-tickets a').attr('href');
            const description = $(el).find('.event-list-item-description').text();
            const hyperlink = $(el).find('.event-list-item-artist a').attr('href');
            events.push({
            artist,
            date,
            time,
            city,
            venue,
            address,
            addressLink,
            tickets,
            ticketsLink,
            description,
            hyperlink
            });
            });
            req.db.run('DELETE FROM events', (err) => {
              if (err) {
                console.error(err.message);
                return res.status(500).send({error: "Failed to delete events"});
              }
              events.forEach((event) => {
                req.db.run(`
                  INSERT INTO events (
                    artist,
                    date,
                    time,
                    city,
                    venue,
                    address,
                    addressLink,
                    tickets,
                    ticketsLink,
                    description,
                    hyperlink
                    ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
                    `,
                    [
                    event.artist,
                    event.date,
                    event.time,
                    event.city,
                    event.venue,
                    event.address,
                    event.addressLink,
                    event.tickets,
                    event.ticketsLink,
                    event.description,
                    event.hyperlink
                    ],
                    (err) => {
                    if (err) {
                    console.error(err.message);
                    return res.status(500).send({error: "Failed to insert event"});
                    }
                    }
                );
              });
              next();
            
        });
          } catch (error) {
            console.error(error);
            // return res.status(500).send({error: "Failed to fetch events"});
            }
};
        
      
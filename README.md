# Greater Boston Classical Music
#### Video Demo: https://youtu.be/MXIn3B4LSic
#### Description: This Node.js and Express.js app is a clone/remodel of this webpage (https://www.classical-scene.com/calendar/), a caledar of classical music events in the Greater Boston Area. 
#### Greater Boston Classical Music uses the cheerio web-scraper module to pull data from the source webpage. Then, it enters this data into a table in a SQLite3 database called 'events.db'. The table is then displayed to the user through an EJS template. 
#### Greater Boston Classical Music also features a keyword search function for the 'performer' and 'notes' columns.

### TODO:
#### - add filter options
#### - grab ticket links and google calendar links with cheerio

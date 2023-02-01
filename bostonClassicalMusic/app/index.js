const axios = require("axios");
const xml2js = require("xml2js");
const fs = require("fs");
const express = require('express');
const rssFeed = require('./rss-feeder')
const cron = require("node-cron");
const path = require('path');
const router = express.Router();
const app = express();


cron.schedule("0 0 * * *", function() {
  const url = "https://www.classical-scene.com/?feed=gigpress";
  const fileName = "rss.xml";

  async function main() {
    const response = await axios.get(url);
    const rss = response.data;
    const parser = new xml2js.Parser();
    parser.parseString(rss, (err, result) => {
      const xml = new xml2js.Builder().buildObject(result);
      fs.writeFileSync(fileName, xml, "utf-8");
    });
  }

  main();
});

router.get('/',function(req, res){
  res.sendFile(path.join(__dirname+'/index.html'));
});

// app.get('/', (req, res) => {
//   request('https://www.classical-scene.com/?feed=gigpress', (error, response, xml) => {
//     if (!error && response.statusCode === 200) {
//       xml2js.parseString(xml, (err, result) => {
//         if (!err) {
//           const html = convertXMLToHTML(result);
//           fs.writeFileSync('index.html', html);
//           res.sendFile('../pages/index.html');
//         } else {
//           console.error(err);
//           res.sendStatus(500);
//         }
//       });
//     } else {
//       console.error(error);
//       res.sendStatus(500);
//     }
//   });
// });

// function convertXMLToHTML(xml) {
//   let html = '<ul>';
//   xml2js.parseString(xml, (err, result) => {
//     if (err) {
//       console.error(err);
//       return;
//     }

//     result.rss.channel[0].item.forEach((item) => {
//       html += `<li><h3>${item.title[0]}</h3><p>${item.description[0]}</p></li>`;
//     });
//   });
//   html += '</ul>';
//   return html;
// }

// }

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

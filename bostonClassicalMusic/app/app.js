const axios = require("axios");
const xml2js = require("xml2js");
const fs = require("fs");
const express = require('express');
const cron = require("node-cron");
const path = require('path');
const request = require('request');
const router = express.Router();
const app = express();
// const libxslt = require('libxslt');

// cron.schedule("0 0 * * *", function() {
//   const url = "https://www.classical-scene.com/?feed=gigpress";
//   const fileName = "rss.xml";

//   async function main() {
//     const response = await axios.get(url);
//     const rss = response.data;
//     const parser = new xml2js.Parser();
//     parser.parseString(rss, (err, result) => {
//       const xml = new xml2js.Builder().buildObject(result);
//       fs.writeFileSync(fileName, xml, "utf-8");
//     });
//   }

//   main();
// });
// const xml = fs.readFileSync('./rss.xml', 'utf-8');
// const xsl = fs.readFileSync('../styles/stylesheet.xsl', 'utf-8');

// libxslt.parse(xsl, (err, stylesheet) => {
//   if (err) {
//     console.error(err);
//     return;
//   }

//   stylesheet.apply(xml, (err, result) => {
//     if (err) {
//       console.error(err);
//       return;
//     }

//     app.get('/', (req, res) => {
//       res.send(result);
//     });
//   });
// });

// const result = xslt.transform(xml, xsl, []);



// app.get('/', (req, res) => {
//   res.send(result);
// });
// Read the XML file from the file system
// fs.readFile('./rss.xml', 'utf-8', (err, xml) => {
//   if (err) {
//     console.error(err);
//     return;
//   }

//   // Parse the XML content
//   xml2js.parseString(xml, (err, result) => {
//     if (err) {
//       console.error(err);
//       return;
//     }

//     // Do something with the parsed XML content
//     console.log(result);
//   });
// });

const https = require('https');
const saxon = require('saxon-js');

const env = saxon.getPlatform();

const doc = env.parseXmlFromString(env.readFile('../styles/stylesheet.xslt'));
// hack: avoid error "Required cardinality of value of parameter $static-base-uri is exactly one; supplied value is empty"
doc._saxonBaseUri = "file:///";

const sef = saxon.compile(doc);

const resultStringXML = saxon.transform({
  stylesheetInternal: sef,
  sourceText: env.readFile('./rss.xml')
});


// const xslt = `<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="3.0">
//   <xsl:template match="/">
//     <html>
//       <body>
//         <h1>Upcoming concerts</h1>
//         <ul>
//           <xsl:for-each select="rss/channel/item">
//             <li>
//               <xsl:value-of select="title"/>
//             </li>
//             <li>
//               <xsl:value-of select="description"/>
//             </li>
//           </xsl:for-each>
//         </ul>
//       </body>
//     </html>
//   </xsl:template>
// </xsl:stylesheet>`;

// https.get('https://www.classical-scene.com/?feed=gigpress', (res) => {
//   let xml = '';

//   res.on('data', (chunk) => {
//     xml += chunk;
//   });

//   res.on('end', () => {
//     const html = saxon.transform({
//       stylesheet: xslt,
//       source: xml
//     });
//     console.log(html);
//   });
// });


// app.get('/', (req, res) => {

//   request('https://www.classical-scene.com/?feed=gigpress', (err, response, xml) => {
//     if (err) {
//       return res.send(err);
//     }

//     xml2js.parseString(xml, (err, result) => {
//       if (err) {
//         return res.send(err);
//       }

//       // Remove the CDATA strings
//       function removeCDATA(obj) {
//         for (let key in obj) {
//           if (typeof obj[key] === 'string') {
//             obj[key] = obj[key].replace('<![CDATA[', '').replace(']]>', '');
//           } else if (typeof obj[key] === 'object') {
//             removeCDATA(obj[key]);
//           }
//         }
//       }

//       removeCDATA(result);

//       // Construct the HTML code
//       let html = '<html><body>';
//       html += '<h1>XML to HTML</h1>';
//       html += '<table>';
//       html += '<tr><th>Title</th><th>Date</th><th>Time</th><th>Artist</th><th>Venue</th><th>Link</th></tr>';
//       result.rss.channel[0].item.forEach((item) => {
//         html += '<tr>';
//         html += '<td>' + item.title[0] + '</td>';
//         html += '<td>' + item.pubDate[0] + '</td>';
//         html += '<td>' + item['gigpress:time'][0] + '</td>';
//         html += '<td>' + item['gigpress:artist'][0] + '</td>';
//         html += '<td>' + item['gigpress:venue'][0] + '</td>';
//         html += '<td><a href="' + item.link[0] + '">Link</a></td>';
//         html += '</tr>';
//       });
//       html += '</table>';
//       html += '</body></html>';

//       res.send(html);
//     });
//   });
// });

app.listen(3000, () => {
  console.log('Server started on port 3000');
});

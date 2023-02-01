const axios = require("axios");
const xml2js = require("xml2js");
const fs = require("fs");

// module.exports = {
//     async function main() {
//     // Retrieve the RSS feed
//     const response = await axios.get("https://www.classical-scene.com/?feed=gigpress");
//     const xml = response.data;

//     // Convert the XML data to JSON
//     const parser = new xml2js.Parser();
//     const json = await parser.parseStringPromise(xml);

//     // Write the JSON data to an XML file
//     const builder = new xml2js.Builder();
//     const xmlData = builder.buildObject(json);
//     fs.writeFileSync("rss-feed.xml", xmlData);

//     console.log("RSS feed has been downloaded to rss-feed.xml");
//     }
// };
module.exports = {
    
    async main() {
        return axios.get(url)
          .then(response => {
            const rss = response.data;
            const parser = new xml2js.Parser();
            return new Promise((resolve, reject) => {
              parser.parseString(rss, (err, result) => {
                if (err) reject(err);
                const xml = new xml2js.Builder().buildObject(result);
                fs.writeFileSync(fileName, xml, "utf-8");
                resolve();
              });
            });
          });
      } 
};

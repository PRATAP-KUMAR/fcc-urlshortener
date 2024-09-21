require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const dns = require('dns');
const urlparser = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

const client = new MongoClient(process.env.DB_URL);
const db = client.db('shorturl');
const urls = db.collection("urls");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// solution
app.post('/api/shorturl', (req, res) => {
  console.log(req.body);
  const { url } = req.body
  const dnslookup = dns.lookup(urlparser.parse(url).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: "Invalid URL" });
    } else {
      const urlCount = await urls.countDocuments({});
      const urlDoc = {
        url,
        short_url: urlCount
      }
      const result = await urls.insertOne(urlDoc);
      console.log(result);
      res.json({
        original_url: url,
        short_url: urlCount
      })
    }
  })
})

app.get('/api/shorturl/:url', async (req, res) => {
  const {url} = req.params;
  const urlDoc = await urls.findOne({short_url: +url});
  res.redirect(urlDoc.url);
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

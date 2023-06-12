require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const dns = require('dns');
// Basic Configuration
const port = process.env.PORT || 3000;
const urlDatabase = {};
let nextShortUrlId = 1;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(bodyParser.urlencoded({extended: false}));

app.post('/api/shorturl', function(req, res){
  // console.log(req.body.url);
  // res.send('Success');
  const originalUrl = req.body.url;

  const valid = /^(ftp|http|https):\/\/[^ "]+$/;
  if(!valid.test(originalUrl)){
    return res.json({ error: 'invalid url' });
  }

  const urlParts = new URL(originalUrl);
  // console.log(urlParts);
  const hostName = urlParts.hostname;
  dns.lookup(hostName, function(err){
    if(err){
      return res.json({error: 'invalid url'});
    }
  })

  const shortUrl = nextShortUrlId;
  urlDatabase[shortUrl] = originalUrl;
  nextShortUrlId++;  

  res.json({original_url: originalUrl, short_url: shortUrl});
  
});

app.get('/api/shorturl/:short_url', function(req, res){
  const shortUrl = parseInt(req.params.short_url);

  if (!urlDatabase.hasOwnProperty(shortUrl)) {
    res.json({ error: 'invalid url' });
    return;
  }
  
  res.redirect(urlDatabase[shortUrl]);
})



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

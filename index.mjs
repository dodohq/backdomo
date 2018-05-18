import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'development') {
  dotenv.load();
}

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(process.env.PORT, err => {
  if (err) {
    throw err;
  }
  console.log(`UP AND RUNNING @ ${process.env.PORT}`); // eslint-disable-line no-console
});

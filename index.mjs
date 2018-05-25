import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import httpRouter from './routes/http';

if (process.env.NODE_ENV === 'development') {
  dotenv.load();
}

mongoose.connect(process.env.DATABASE, { auto_reconnect: true });

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', httpRouter);

const server = http.createServer(app);

server.listen(process.env.PORT, err => {
  if (err) {
    throw err;
  }
  console.log(`UP AND RUNNING @ ${process.env.PORT}`); // eslint-disable-line no-console
});

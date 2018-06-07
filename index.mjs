import dotenv from 'dotenv';
if (process.env.NODE_ENV === 'development') {
  dotenv.load();
}

import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import url from 'url';

import httpRouter from './routes/http';
import { robotWSS, userWSS } from './routes/ws';

mongoose.connect(process.env.DATABASE, { auto_reconnect: true });

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api', httpRouter);

const server = http.createServer(app);
server.on('upgrade', (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;

  if (pathname === '/robot') {
    robotWSS.handleUpgrade(request, socket, head, ws => {
      robotWSS.emit('connection', ws, request);
    });
  } else if (pathname === '/user') {
    userWSS.handleUpgrade(request, socket, head, ws => {
      userWSS.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(process.env.PORT, err => {
  if (err) {
    throw err;
  }
  console.log(`UP AND RUNNING @ ${process.env.PORT}`); // eslint-disable-line no-console
});

import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('client'));

wss.on('connection', (ws) => {
  console.log('Client connected');

  const filename = `video-${Date.now()}.webm`;
  const fileStream = fs.createWriteStream(
      path.join(__dirname, 'uploads', filename)
  );

  ws.on('message', (data) => {
    if (data instanceof Buffer) {
      fileStream.write(data);
      console.log('Received', data.length, 'bytes');
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    fileStream.end();
  });

  ws.on('error', (error: Error) => {
    console.error('WebSocket Error:', error);
    fileStream.end();
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

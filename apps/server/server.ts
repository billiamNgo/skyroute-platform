import express from 'express';
import { countReset } from 'node:console';

const app = express();
const PORT = process.env.PORT || 8080;

const core = require('cors');
const corsOptions = {
  origin: 'http://localhost:5173',
};
app.use(core(corsOptions));

app.get('/', (req, res) => {
  console.log('Received a request');
  res.send('All is well! Connected to the server!');
});

app.listen(PORT);
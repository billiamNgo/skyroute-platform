import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  console.log('Received a request');
  res.send('All is well!');
});

app.listen(PORT);
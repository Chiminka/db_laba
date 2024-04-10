import express from 'express';
import cors from 'cors';
import allRouts from './routes/routs.js';

const app = express();

// Middleware;
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
// http://localhost:3002/api/select
app.use('/api/select', allRouts);

async function start() {
  try {
    app.listen(3002, () => console.log(`Server started on port: ${3002}`));
  } catch (error) {
    console.log(error);
  }
}
start();

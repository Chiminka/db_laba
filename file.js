const { Client } = require('pg');

const center = new Client({
  host: 'localhost',
  user: 'nikaostroverkh',
  port: 2000,
  database: 'postgres',
});

const client2 = new Client({
  host: 'localhost',
  user: 'nikaostroverkh',
  port: 2002,
  database: 'postgres',
});

const client3 = new Client({
  host: 'localhost',
  user: 'nikaostroverkh',
  port: 3000,
  database: 'postgres',
});

center.connect();
client2.connect();
client3.connect();

async function connectAndQuery() {
  try {
    const repairsQuery = client3.query('SELECT * FROM repairs');
    const detailsQuery = client2.query('SELECT * FROM repairs');

    const [repairsResult, detailsResult] = await Promise.all([repairsQuery, detailsQuery]);
    const data = repairsResult.rows.concat(detailsResult.rows);

    console.log('Result: ', data);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await center.end();
  }
}

connectAndQuery();

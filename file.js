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

async function Select_1() {
  try {
    const repairsQuery1 = client2.query('SELECT sc_id FROM details_sc where dtsc_id = 1');
    const repairsQuery2 = client3.query('SELECT sc_id FROM details_sc where dtsc_id = 1');
    const [repairsResult, detailsResult] = await Promise.all([repairsQuery1, repairsQuery2]);

    const scIds1 = repairsResult.rows.map((row) => row.sc_id);
    const scIds2 = detailsResult.rows.map((row) => row.sc_id);

    const servises = center.query(
      `SELECT * FROM service_centers where sc_id = ${scIds1} OR sc_id = ${scIds2} `,
    );

    const [Result] = await Promise.all([servises]);

    console.log('Result: ', Result.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await center.end();
    await client2.end();
    await client3.end();
  }
}

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

Select_1();
// connectAndQuery();

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

//1)	Сервісні центри, де є в наявності конкретна деталь для ремонту
async function Select_1() {
  try {
    const repairsQuery1 = client2.query(
      `SELECT sc_id FROM details_sc where dtsc_id = ${1} and count > 0`,
    ); // dtsc_id IN (1, 2, 3, ...)
    const repairsQuery2 = client3.query(
      `SELECT sc_id FROM details_sc where dtsc_id = ${1} and count > 0`,
    );
    const [repairsResult, detailsResult] = await Promise.all([repairsQuery1, repairsQuery2]);

    const scIds1 = repairsResult.rows.map((row) => row.sc_id);
    const scIds2 = detailsResult.rows.map((row) => row.sc_id);

    const servises = center.query(
      `SELECT * FROM service_centers where sc_id = ${
        scIds1.length > 0 && scIds2.length > 0
          ? `${scIds1} OR sc_id = ${scIds2}`
          : scIds1.length > 0
          ? `${scIds1}`
          : `${scIds2}`
      }`,
    );

    const [Result] = await Promise.all([servises]);

    console.log('Service centers:', Result.rows);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

//2)	Усі ремонти за конкретним гарантійним талоном (ремонти можуть бути в різних сервісах)
async function Select_2() {
  try {
    const repairsQuery = client3.query(
      `SELECT repair_id, sc_id FROM repairs where talon_id = ${8}`,
    );
    const detailsQuery = client2.query(
      `SELECT repair_id, sc_id FROM repairs where talon_id = ${8}`,
    );

    const [repairsResult, detailsResult] = await Promise.all([repairsQuery, detailsQuery]);
    const data = repairsResult.rows.concat(detailsResult.rows);

    console.log('Repairs: ', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

//3)	Усі ремонти за товаром у всіх сервісах.
async function Select_3() {
  try {
    const repairsQuery = center.query(`SELECT talon_id FROM talons where product_id = ${5}`);

    const [repairsResult] = await Promise.all([repairsQuery]);
    const scIds1 = repairsResult.rows.map((row) => row.talon_id);

    const detailsQuery1 = client2.query(
      `SELECT repair_id, sc_id FROM repairs where talon_id = ${scIds1}`,
    );
    const detailsQuery2 = client3.query(
      `SELECT repair_id, sc_id FROM repairs where talon_id = ${scIds1}`,
    );
    const [Result1, Result2] = await Promise.all([detailsQuery1, detailsQuery2]);

    const data = Result1.rows.concat(Result2.rows);
    console.log('Repairs: ', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

//4)	Поточні ремонти у вибраних сервісах
async function Select_4() {
  try {
    const repairsQuery = client3.query(
      `SELECT repair_id, sc_id FROM repairs where isended = false`,
    );
    const detailsQuery = client2.query(
      `SELECT repair_id, sc_id FROM repairs where isended = false`,
    );

    const [repairsResult, detailsResult] = await Promise.all([repairsQuery, detailsQuery]);
    const data = repairsResult.rows.concat(detailsResult.rows);

    console.log('Result: ', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

const temp_request = {
  to_ser: 2,
  talon_id: 6,
  sc_id: 2,
  start_date: '2024-04-19T22:00:00.000Z',
  isended: true,
  summary: 'summary88',
  cur_sc_id: 2,
};

//5)	Додавання нового ремонту за гарантійним талоном, перевіривши, чи не використаний він наразі в ремонті в іншому вузлі
async function Select_5() {
  try {
    // если мы хотим добавить на 2 сервис по 6 талону
    // в to_ser нужно записать в какой сервер вносим запись
    const repairsQuery1 = client3.query(
      `SELECT repair_id FROM repairs where cur_sc_id = ${(temp_request.to_ser = 1
        ? 2
        : 1)} and talon_id = ${temp_request.talon_id}`,
    );
    const repairsQuery2 = client2.query(
      `SELECT repair_id FROM repairs where talon_id = ${temp_request.talon_id}`,
    );
    const check = client2.query(`SELECT repair_id FROM repairs`);

    const [repairsResult1, repairsResult2, get_id] = await Promise.all([
      repairsQuery1,
      repairsQuery2,
      check,
    ]);

    const maxRepairId = Math.max(...get_id.rows.map((row) => row.repair_id));

    if (repairsResult1.rows.length === 0 && repairsResult2.rows.length === 0) {
      client2.query(
        `INSERT INTO repairs (repair_id, talon_id, sc_id, start_date, isended, summary, cur_sc_id) VALUES
      ($1, $2, $3, $4, $5, $6, $7)`,
        [
          maxRepairId + 1,
          temp_request.talon_id,
          temp_request.sc_id,
          temp_request.start_date,
          temp_request.isended,
          temp_request.summary,
          temp_request.cur_sc_id,
        ],
      );
      console.log('created!');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Select_1();
// Select_2();
// Select_3();
// Select_4();
// Select_5();

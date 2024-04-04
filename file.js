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
  port: 2008,
  database: 'postgres',
});

const client3 = new Client({
  host: 'localhost',
  user: 'nikaostroverkh',
  port: 4000,
  database: 'postgres',
});

const front1 = {
  db: client3,
  front_port: 4090,
};

const front2 = {
  db: client2,
  front_port: 4100,
};

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

//3)	Усі ремонти за продуктом у всіх сервісах.
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

    console.log('Current Repairs: ', data);
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
    console.log('такий ремонт вже існує!');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

//6)	Передача ремонту в інший сервіс
async function Select_6() {
  try {
    // - есть бд с ремонтами
    // - редактируем поле cur_sc_id, записывая туда  серв. центр, куда надо среплицировать данные про ремонт
    // - отправляем запрос на репликацию в этот серв. центр
    const from_sc_id = 1;
    const to_sc_id = 2;

    const replica_id = 2;

    let repairsQuery1;
    let check;
    switch (from_sc_id) {
      case 1:
        repairsQuery1 = client3.query(
          `UPDATE repairs SET cur_sc_id = ${to_sc_id} where repair_id = ${replica_id} RETURNING *`,
        );
        check = client2.query(`SELECT * FROM repairs`);
        break;
      case 2:
        repairsQuery1 = client2.query(
          `UPDATE repairs SET cur_sc_id = ${to_sc_id} where repair_id = ${replica_id} RETURNING *`,
        );
        check = client3.query(`SELECT repair_id FROM repairs`);
        break;
    }

    const [repairsResult1, rep_id] = await Promise.all([repairsQuery1, check]);

    if (
      rep_id.rows
        .map((res) => {
          return { talon_id: res.talon_id, isended: res.isended };
        })
        .find(() => {
          return {
            talon_id: repairsResult1.rows[0].talon_id,
            isended: repairsResult1.rows[0].isended,
          };
        })
    ) {
      console.log('ремонт вже репліковано');
      return;
    }

    if (repairsResult1 && repairsResult1.rows && repairsResult1.rows.length > 0) {
      const updatedRow = repairsResult1.rows[0];

      const maxRepairId = Math.max(...rep_id.rows.map((row) => row.repair_id));

      switch (from_sc_id) {
        case 1:
          client2.query(
            `INSERT INTO repairs (repair_id, talon_id, sc_id, start_date, isended, summary, cur_sc_id) VALUES (${
              maxRepairId + 1
            }, ${updatedRow.talon_id}, ${updatedRow.sc_id}, '${updatedRow.start_date}', ${
              updatedRow.isended
            }, '${updatedRow.summary}', ${updatedRow.cur_sc_id})`,
          );
          break;
        case 2:
          client3.query(`INSERT INTO repairs (repair_id, talon_id, sc_id, start_date, isended, summary, cur_sc_id) VALUES
          (${maxRepairId + 1}, ${updatedRow.talon_id}, ${updatedRow.sc_id}, '${
            updatedRow.start_date
          }', ${updatedRow.isended}, '${updatedRow.summary}', ${updatedRow.cur_sc_id})`);
          break;
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

const temp_request_7 = {
  repair: {
    repair_id: 8,
    talon_id: 2,
    sc_id: 1,
    isended: true,
    summary: 'potato true',
    cur_sc_id: 1,
  },
  //4090 - client3
  front_port: 4090,
};

//7)	Редагування
async function Select_7() {
  try {
    // транзакція: перевірити чи не заблокований, заблокувати, змінити у конкретній, змінити у інших, зняти блокування (флаг редагування (блокування читання) для розробника)
    /* 
    Статуси для доступу до ремонтів
        0 - дозволено читання та редагування
        1 - дозволено читання, заборонено редагування
    */
    switch (temp_request_7.front_port) {
      //
      //client_port |   db    |      data
      //------------+---------+--------------
      //    4090    | client3 | repairsResult2
      //    4100    | client2 | repairsResult
      //
      case 4090: {
        const repairsQuery1 = client2.query(
          `SELECT repair_id, talon_id, isended FROM repairs WHERE talon_id = ${temp_request_7.repair.talon_id} and isended = ${temp_request_7.repair.isended};`,
        );
        const [repairsResult] = await Promise.all([repairsQuery1]);
        if (repairsResult.rows[0])
          client2.query(
            `UPDATE repairs SET summary = '${temp_request_7.repair.summary}' where repair_id = ${repairsResult.rows[0].repair_id};`,
          );
        client3.query(
          `UPDATE repairs SET summary = '${temp_request_7.repair.summary}' where repair_id = ${temp_request_7.repair.repair_id};`,
        );
        break;
      }
      case 4100: {
        const repairsQuery2 = client3.query(
          `SELECT repair_id, talon_id, isended FROM repairs WHERE talon_id = ${temp_request_7.repair.talon_id} and isended = ${temp_request_7.repair.isended};`,
        );
        const [repairsResult] = await Promise.all([repairsQuery2]);
        if (repairsResult.rows[0])
          client3.query(
            `UPDATE repairs SET summary = '${temp_request_7.repair.summary}' where repair_id = ${repairsResult.rows[0].repair_id};`,
          );
        client2.query(
          `UPDATE repairs SET summary = '${temp_request_7.repair.summary}' where repair_id = ${temp_request_7.repair.repair_id};`,
        );
        break;
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

//8)	Видалення
async function Select_8() {
  try {
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Select_1();
// Select_2();
// Select_3();
// Select_4();
// Select_5();
// Select_6();
Select_7();
// Select_8();

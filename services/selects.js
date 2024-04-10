import pkg from 'pg';
const { Client } = pkg;

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

// const front1 = {
//   db: client3,
//   front_port: 4090,
// };

// const front2 = {
//   db: client2,
//   front_port: 4100,
// };

center.connect();
client2.connect();
client3.connect();

export class AllSelectsService {
  //1)	Сервісні центри, де є в наявності конкретна деталь для ремонту
  async Select_1(req, res) {
    try {
      const detail_string_arr = req.body.detail_name;

      const repairsQuery = center.query(
        `SELECT detail_id FROM details where detail_name = '${detail_string_arr}'`,
      );
      const [detailNamesResult] = await Promise.all([repairsQuery]);

      const detailIdsString = detailNamesResult.rows.map((obj) => obj.detail_id).join(', ');

      const repairsQuery1 = client2.query(
        `SELECT sc_id FROM details_sc where dtsc_id = ${detailIdsString} and count > 0`,
      );
      const repairsQuery2 = client3.query(
        `SELECT sc_id FROM details_sc where dtsc_id = ${detailIdsString} and count > 0`,
      );
      const [repairsResult, detailsResult] = await Promise.all([repairsQuery1, repairsQuery2]);

      const scIds1 = repairsResult.rows.map((row) => row.sc_id);
      const scIds2 = detailsResult.rows.map((row) => row.sc_id);

      const servises = center.query(
        `SELECT * FROM service_centers WHERE sc_id IN (${scIds1.join(
          ',',
        )}) OR sc_id IN (${scIds2.join(',')})`,
      );
      const [Result] = await Promise.all([servises]);
      console.log(Result.rows);
      res.json(Result.rows);
    } catch (error) {
      console.error('Error:', error.message);
      res.json({ message: error.message });
    }
  }
  //2)	Усі ремонти за конкретним гарантійним талоном (ремонти можуть бути в різних сервісах)
  async Select_2(req, res) {
    try {
      const repairsQuery = client3.query(
        `SELECT repair_id, sc_id FROM repairs where talon_id = ${req.body.talon_id}`,
      );
      const detailsQuery = client2.query(
        `SELECT repair_id, sc_id FROM repairs where talon_id = ${req.body.talon_id}`,
      );

      const [repairsResult, detailsResult] = await Promise.all([repairsQuery, detailsQuery]);
      const data = repairsResult.rows.concat(detailsResult.rows);

      res.json(data);
    } catch (error) {
      console.error('Error:', error.message);
      res.json({ message: error.message });
    }
  }
  //3)	Усі ремонти за продуктом у всіх сервісах.
  async Select_3(req, res) {
    try {
      const repairsQuery = center.query(
        `SELECT talon_id FROM talons where product_id = ${req.body.product_id}`,
      );

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
      res.json(data);
    } catch (error) {
      console.error('Error:', error.message);
      res.json({ message: error.message });
    }
  }
  //4)	Поточні ремонти у вибраних сервісах
  async Select_4(req, res) {
    try {
      const repairsQuery = client3.query(
        `SELECT repair_id, sc_id FROM repairs where isended = false`,
      );
      const detailsQuery = client2.query(
        `SELECT repair_id, sc_id FROM repairs where isended = false`,
      );

      const [repairsResult, detailsResult] = await Promise.all([repairsQuery, detailsQuery]);
      const data = repairsResult.rows.concat(detailsResult.rows);

      res.json(data);
    } catch (error) {
      console.error('Error:', error.message);
      res.json({ message: error.message });
    }
  }
  //5)	Додавання нового ремонту за гарантійним талоном, перевіривши, чи не використаний він наразі в ремонті в іншому вузлі
  async Select_5(req, res) {
    try {
      console.log(req.body.talon_id);
      // если мы хотим добавить на 2 сервис по 6 талону
      // в to_ser нужно записать в какой сервер вносим запись
      const repairsQuery1 = client3.query(
        `SELECT repair_id FROM repairs where talon_id = ${req.body.talon_id} and isended = false`,
      );
      const repairsQuery2 = client2.query(
        `SELECT repair_id FROM repairs where talon_id = ${req.body.talon_id} and isended = false`,
      );

      const [repairsResult1, repairsResult2] = await Promise.all([repairsQuery1, repairsQuery2]);

      if (repairsResult1.rows.length === 0 && repairsResult2.rows.length === 0) {
        if (Number(req.body.to_ser) === 1) {
          const check = client3.query(`SELECT repair_id FROM repairs`);
          const [get_id] = await Promise.all([check]);
          const maxRepairId = Math.max(...get_id.rows.map((row) => row.repair_id));
          client3.query(
            `INSERT INTO repairs (repair_id, talon_id, sc_id, start_date, isended, summary, cur_sc_id, edit_flag) VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              maxRepairId + 1,
              req.body.talon_id,
              req.body.to_ser,
              req.body.start_date,
              false,
              req.body.summary,
              req.body.to_ser,
              0,
            ],
          );
        } else {
          const check = client2.query(`SELECT repair_id FROM repairs`);
          const [get_id] = await Promise.all([check]);
          const maxRepairId = Math.max(...get_id.rows.map((row) => row.repair_id));
          client2.query(
            `INSERT INTO repairs (repair_id, talon_id, sc_id, start_date, isended, summary, cur_sc_id, edit_flag) VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              maxRepairId + 1,
              req.body.talon_id,
              req.body.to_ser,
              req.body.start_date,
              false,
              req.body.summary,
              req.body.to_ser,
              0,
            ],
          );
        }
        res.json({ message: 'Created!' });
        return;
      }
      res.json({ message: 'Такий ремонт вже існує!' });
      return;
    } catch (error) {
      console.error('Error:', error.message);
      res.json({ message: error.message });
    }
  }
  //6)	Передача ремонту в інший сервіс
  async Select_6(req, res) {
    try {
      // - есть бд с ремонтами
      // - редактируем поле cur_sc_id, записывая туда  серв. центр, куда надо среплицировать данные про ремонт
      // - отправляем запрос на репликацию в этот серв. центр

      let repairsQuery1;
      let check;
      switch (Number(req.body.from_sc_id)) {
        case 1:
          repairsQuery1 = client3.query(
            `UPDATE repairs SET cur_sc_id = ${req.body.to_sc_id} where repair_id = ${req.body.replica_id} RETURNING *`,
          );
          check = client2.query(`SELECT * FROM repairs`);
          break;
        case 2:
          repairsQuery1 = client2.query(
            `UPDATE repairs SET cur_sc_id = ${req.body.to_sc_id} where repair_id = ${req.body.replica_id} RETURNING *`,
          );
          check = client3.query(`SELECT repair_id FROM repairs`);
          break;
      }

      const [repairsResult1, rep_id] = await Promise.all([repairsQuery1, check]);

      const part_arr = rep_id.rows.find(
        (record) => record.talon_id === repairsResult1.rows[0].talon_id,
      );

      if (part_arr?.isended === repairsResult1.rows[0].isended) {
        res.json({ message: 'Ремонт вже репліковано' });
      } else {
        if (repairsResult1 && repairsResult1.rows && repairsResult1.rows.length > 0) {
          const updatedRow = repairsResult1.rows[0];

          const maxRepairId = Math.max(...rep_id.rows.map((row) => row.repair_id));

          switch (Number(req.body.from_sc_id)) {
            case 1:
              client2.query(
                `INSERT INTO repairs (repair_id, talon_id, sc_id, start_date, isended, summary, cur_sc_id, edit_flag) VALUES (${
                  maxRepairId + 1
                }, ${updatedRow.talon_id}, ${updatedRow.sc_id}, '${updatedRow.start_date}', ${
                  updatedRow.isended
                }, '${updatedRow.summary}', ${updatedRow.cur_sc_id}, 0)`,
              );
              res.json({ message: 'Ремонт репліковано' });
              break;
            case 2:
              client3.query(`INSERT INTO repairs (repair_id, talon_id, sc_id, start_date, isended, summary, cur_sc_id, edit_flag) VALUES
              (${maxRepairId + 1}, ${updatedRow.talon_id}, ${updatedRow.sc_id}, '${
                updatedRow.start_date
              }', ${updatedRow.isended}, '${updatedRow.summary}', ${updatedRow.cur_sc_id}, 0)`);
              res.json({ message: 'Ремонт репліковано' });
              break;
          }
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      res.json({ message: error.message });
    }
  }
  //7)	Редагування
  async Select_7(req, res) {
    try {
      // транзакція: перевірити чи не заблокований, заблокувати, змінити у конкретній, змінити у інших, зняти блокування (флаг редагування (блокування читання) для розробника)
      /*
      Статуси для доступу до ремонтів
          0 - дозволено читання та редагування
          1 - дозволено читання, заборонено редагування
      */
      console.log(req.body);
      switch (Number(req.body.sc_id)) {
        //
        //client_port |   db    |      data
        //------------+---------+--------------
        //    4090    | client3 | repairsResult2
        //    4100    | client2 | repairsResult
        //
        case 1: {
          console.log('1');
          const repairsQuery1 = client3.query(
            `SELECT * FROM repairs WHERE repair_id = ${req.body.repair_id};`,
          );
          const [repairsResult] = await Promise.all([repairsQuery1]);

          const repairsQuery2 = client2.query(
            `SELECT * FROM repairs WHERE talon_id = ${repairsResult.rows[0].talon_id} and isended = ${repairsResult.rows[0].isended};`,
          );
          const [repairsResult2] = await Promise.all([repairsQuery2]);

          if (repairsResult.rows.length !== 0) {
            client3.query(
              `UPDATE repairs SET isended = '${req.body.isended}', summary = '${
                req.body.summary
              }', edit_flag = ${0} where repair_id = ${req.body.repair_id};`,
            );
          }
          if (repairsResult2.rows.length !== 0) {
            client2.query(
              `UPDATE repairs SET isended = '${req.body.isended}', summary = '${
                req.body.summary
              }', edit_flag = ${0} where repair_id = ${repairsResult2.rows[0].repair_id};`,
            );
          }
          res.json({ message: 'Запис змінено на всіх сервісах' });
          break;
        }
        case 2: {
          console.log('2');
          const repairsQuery2 = client2.query(
            `SELECT repair_id, talon_id, isended FROM repairs WHERE repair_id = ${req.body.repair_id}`,
          );
          const [repairsResult] = await Promise.all([repairsQuery2]);

          const repairsQuery = client3.query(
            `SELECT * FROM repairs WHERE talon_id = ${repairsResult.rows[0].talon_id} and isended = ${repairsResult.rows[0].isended}`,
          );
          const [repairsResult2] = await Promise.all([repairsQuery]);

          if (repairsResult.rows.length !== 0) {
            client2.query(
              `UPDATE repairs SET isended = '${req.body.isended}', summary = '${
                req.body.summary
              }', edit_flag = ${0} where repair_id = ${req.body.repair_id};`,
            );
          }
          if (repairsResult2.rows.length !== 0) {
            console.log(repairsResult.rows[0].repair_id);
            client3.query(
              `UPDATE repairs SET isended = '${req.body.isended}', summary = '${
                req.body.summary
              }', edit_flag = ${0} where repair_id = ${repairsResult2.rows[0].repair_id};`,
            );
          }
          res.json({ message: 'Запис змінено на всіх сервісах' });
          break;
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      res.json({ message: error.message });
    }
  }

  //8)	Видалення
  async Select_8(req, res) {
    try {
      // транзакція: перевірити чи не заблокований, заблокувати, змінити у конкретній, змінити у інших, зняти блокування (флаг редагування (блокування читання) для розробника)
      /*
      Статуси для доступу до ремонтів
          0 - дозволено читання та редагування
          1 - дозволено читання, заборонено редагування
      */
      switch (Number(req.body.sc_id)) {
        //
        //client_port |   db    |      data
        //------------+---------+--------------
        //    4090    | client3 | repairsResult2
        //    4100    | client2 | repairsResult
        //
        case 1: {
          console.log('1');
          const repairsQuery1 = client3.query(
            `SELECT * FROM repairs WHERE repair_id = ${req.body.repair_id};`,
          );
          const [repairsResult] = await Promise.all([repairsQuery1]);

          const repairsQuery2 = client2.query(
            `SELECT * FROM repairs WHERE talon_id = ${repairsResult.rows[0].talon_id} and isended = ${repairsResult.rows[0].isended};`,
          );
          const [repairsResult2] = await Promise.all([repairsQuery2]);

          if (repairsResult.rows.length !== 0) {
            client3.query(`DELETE FROM repairs WHERE repair_id = ${req.body.repair_id};`);
          }
          if (repairsResult2.rows.length !== 0) {
            client2.query(
              `DELETE FROM repairs WHERE repair_id = ${repairsResult2.rows[0].repair_id};`,
            );
          }
          res.json({ message: 'Запис видалено' });
          break;
        }
        case 2: {
          console.log('2');
          const repairsQuery2 = client2.query(
            `SELECT repair_id, talon_id, isended FROM repairs WHERE repair_id = ${req.body.repair_id}`,
          );
          const [repairsResult] = await Promise.all([repairsQuery2]);

          const repairsQuery = client3.query(
            `SELECT * FROM repairs WHERE talon_id = ${repairsResult.rows[0].talon_id} and isended = ${repairsResult.rows[0].isended}`,
          );
          const [repairsResult2] = await Promise.all([repairsQuery]);

          if (repairsResult.rows.length !== 0) {
            console.log('ji_1');
            client2.query(`DELETE FROM repairs WHERE repair_id = ${req.body.repair_id};`);
          }
          if (repairsResult2.rows.length !== 0) {
            console.log('ji_2');
            client3.query(
              `DELETE FROM repairs WHERE repair_id = ${repairsResult2.rows[0].repair_id};`,
            );
          }
          res.json({ message: 'Запис видалено' });
          break;
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      res.json({ message: error.message });
    }
  }

  async Select_8_1(req, res) {
    try {
      // транзакція: перевірити чи не заблокований, заблокувати, змінити у конкретній, змінити у інших, зняти блокування (флаг редагування (блокування читання) для розробника)
      /* 
      Статуси для доступу до ремонтів
          0 - дозволено читання та редагування
          1 - дозволено читання, заборонено редагування
      */
      switch (Number(req.body.sc_id)) {
        //
        //client_port |   db    |      data
        //------------+---------+--------------
        //    4090    | client3 | repairsResult2
        //    4100    | client2 | repairsResult
        //
        case 1: {
          const repairsQuery1 = client2.query(
            `SELECT repair_id, talon_id, isended FROM repairs WHERE talon_id = ${req.body.repair.talon_id} and isended = ${req.body.repair.isended};`,
          );
          const [repairsResult] = await Promise.all([repairsQuery1]);
          if (repairsResult.rows[0])
            client2.query(
              `DELETE FROM repairs WHERE repair_id = ${repairsResult.rows[0].repair_id};`,
            );
          client3.query(`DELETE FROM repairs WHERE repair_id = ${req.body.repair.repair_id};`);
          res.json({ message: 'Запис видалено' });
          break;
        }
        case 2: {
          const repairsQuery2 = client3.query(
            `SELECT repair_id, talon_id, isended FROM repairs WHERE talon_id = ${req.body.repair.talon_id} and isended = ${req.body.repair.isended};`,
          );
          const [repairsResult] = await Promise.all([repairsQuery2]);
          if (repairsResult.rows[0])
            client3.query(`DELETE FROM repairs WHERE repair_id = ${req.body.repair.repair_id};`);
          client2.query(
            `DELETE FROM repairs WHERE repair_id = ${repairsResult.rows[0].repair_id};`,
          );
          res.json({ message: 'Запис видалено' });
          break;
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      res.json({ message: error.message });
    }
  }

  //9)	Усі центральні вибірки
  async Select_9(req, res) {
    try {
      const talons = center.query(`SELECT * FROM talons`);

      const details = center.query(`SELECT * FROM details`);

      const products = center.query(`SELECT * FROM products`);

      const repairs =
        Number(req.body.sc_id) === 1
          ? client3.query(`SELECT * FROM repairs`)
          : client2.query(`SELECT * FROM repairs`);

      const [talonsResult, detailsResult, productsResult, repairsResult] = await Promise.all([
        talons,
        details,
        products,
        repairs,
      ]);

      const data = {
        talons: talonsResult.rows,
        details: detailsResult.rows,
        products: productsResult.rows,
        repairs: repairsResult.rows.map((row) => ({
          ...row,
          isended: String(row.isended), // Преобразование в строку
        })),
      };
      res.json(data);
    } catch (error) {
      console.error('Error:', error.message);
      res.json({ message: error.message });
    }
  }
}

// const temp_request_5 = {
//   to_ser: 2,
//   talon_id: 6,
//   sc_id: 2,
//   start_date: '2024-04-19T22:00:00.000Z',
//   isended: true,
//   summary: 'summary88',
//   cur_sc_id: 2,
// };

// const temp_request_7 = {
//   repair: {
//     repair_id: 8,
//     talon_id: 2,
//     sc_id: 1,
//     isended: true,
//     summary: 'potato true',
//     cur_sc_id: 1,
//   },
//   //4090 - client3
//   front_port: 4090,
// };

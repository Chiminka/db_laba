import pkg from 'pg';
const { Client } = pkg;

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

client2.connect();
client3.connect();

const block = async (req, res, next) => {
  switch (Number(req.body.sc_id)) {
    case 1: {
      const repairsQuery1 = client3.query(
        `SELECT * FROM repairs WHERE repair_id = ${req.body.repair_id}`,
      );
      const [repairsResult] = await Promise.all([repairsQuery1]);

      const repairsQuery2 = client2.query(
        `SELECT * FROM repairs WHERE talon_id = ${repairsResult.rows[0].talon_id} and isended = ${repairsResult.rows[0].isended}`,
      );

      const [repairsResult2] = await Promise.all([repairsQuery2]);

      if (repairsResult.rows[0]?.edit_flag === 0) {
        client3.query(`UPDATE repairs SET edit_flag = 1 where repair_id = ${req.body.repair_id};`);
        console.log('заблоковано 1');
      }
      if (repairsResult2.rows[0]?.edit_flag === 0) {
        client2.query(
          `UPDATE repairs SET edit_flag = 1 where repair_id = ${repairsResult2.rows[0].repair_id};`,
        );
        console.log('заблоковано 1');
      }
      next();
      break;
    }
    case 2: {
      const repairsQuery1 = client2.query(
        `SELECT * FROM repairs WHERE repair_id = ${req.body.repair_id}`,
      );
      const [repairsResult] = await Promise.all([repairsQuery1]);

      const repairsQuery2 = client3.query(
        `SELECT * FROM repairs WHERE talon_id = ${repairsResult.rows[0].talon_id} and isended = ${repairsResult.rows[0].isended}`,
      );

      const [repairsResult2] = await Promise.all([repairsQuery2]);

      console.log(repairsResult.rows[0], repairsResult2.rows);

      if (repairsResult.rows[0]?.edit_flag === 0) {
        client2.query(`UPDATE repairs SET edit_flag = 1 where repair_id = ${req.body.repair_id};`);
        console.log('заблоковано 2');
      }
      if (repairsResult2.rows[0]?.edit_flag === 0) {
        client3.query(
          `UPDATE repairs SET edit_flag = 1 where repair_id = ${repairsResult2.rows[0].repair_id};`,
        );
        console.log('заблоковано 2');
      }
      next();
      break;
    }
  }
};

export { block };

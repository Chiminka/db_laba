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
  switch (req.body.front_port) {
    case 4090: {
      const repairsQuery1 = client2.query(
        `SELECT * FROM repairs WHERE talon_id = ${req.body.repair.talon_id} and isended = ${req.body.repair.isended};`,
      );
      const [repairsResult] = await Promise.all([repairsQuery1]);

      if (repairsResult.rows[0].edit_flag === 0) {
        client2.query(
          `UPDATE repairs SET edit_flag = 1 where repair_id = ${repairsResult.rows[0].repair_id};`,
        );
        client3.query(
          `UPDATE repairs SET edit_flag = 1 where repair_id = ${req.body.repair.repair_id};`,
        );
        console.log('заблоковано');
      }
      next();
    }
    case 4100: {
      const repairsQuery1 = client3.query(
        `SELECT * FROM repairs WHERE talon_id = ${req.body.repair.talon_id} and isended = ${req.body.repair.isended};`,
      );
      const [repairsResult] = await Promise.all([repairsQuery1]);

      if (repairsResult.rows[0].edit_flag === 0) {
        client2.query(
          `UPDATE repairs SET edit_flag = 1 where repair_id = ${repairsResult.rows[0].repair_id};`,
        );
        client3.query(
          `UPDATE repairs SET edit_flag = 1 where repair_id = ${req.body.repair.repair_id};`,
        );
        console.log('заблоковано');
      }
      next();
    }
  }
};

export { block };

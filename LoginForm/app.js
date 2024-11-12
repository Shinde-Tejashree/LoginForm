const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const port = process.env.PORT || 6001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'contactForm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

(async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS forms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);
    console.log('Connected to MySQL and ensured the forms table exists');
  } catch (err) {
    console.error('Could not create table...', err);
  } finally {
    connection.release();
  }
})();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/', async (req, res) => {
  const { username, password } = req.body;

  try {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'INSERT INTO forms (username, password) VALUES (?, ?)',
        [username, password]
      );
      console.log('Insert result:', result);
      res.send('Form data saved successfully');
    } catch (innerErr) {
      console.error('Failed to execute query', innerErr);
      res.status(500).send('Failed to save form data');
    } finally {
      connection.release();
    }
  } catch (outerErr) {
    console.error('Failed to get connection', outerErr);
    res.status(500).send('Failed to save form data');
  }
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

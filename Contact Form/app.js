const express = require('express');
const mysql = require('mysql2/promise');
const port = process.env.PORT || 4000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'contactFormDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create the table if it doesn't exist
(async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS forms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        mobno VARCHAR(255) NOT NULL,
        message TEXT NOT NULL
      )
    `);
    console.log('Connected to MySQL and ensured the forms table exists');
  } catch (err) {
    console.error('Could not create table...', err);
  } finally {
    connection.release();
  }
})();

app.get('/form', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/form', async (req, res) => {
  const { name, email, mobno, message } = req.body;

  try {
    const connection = await pool.getConnection();
    try {
      await connection.query(
        'INSERT INTO forms (name, email, mobno, message) VALUES (?, ?, ?, ?)',
        [name, email, mobno, message]
      );
      res.send('Form data saved successfully');
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Failed to save form data', err);
    res.status(500).send('Failed to save form data');
  }
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

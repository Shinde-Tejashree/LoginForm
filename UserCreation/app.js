const express = require('express');
const mysql = require('mysql2');

const app = express();


const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root', 
    password: 'root',
    database: 'company'  
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});
app.get('/department', (req, res) => {
    const query = 'SELECT * FROM department';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

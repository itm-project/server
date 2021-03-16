let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mysql = require('mysql');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

// homepage route
app.get('/', (req, res) => {
    return res.send({
        error: false,
        message: 'Welcome',
        written_by: 'Parn',
        published_on: 'https://test.test'
    })
})

//connection to mysql database
let dbCon = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'itmproject'
})
dbCon.connect();

//retrieve all user
app.get('/users', (req,res) => {
    dbCon.query('SELECT * FROM user', (error, results, fields) => {
        if(error) throw error;

        let message = ""
        if(results === undefined || results.length == 0) {
            message = "user table is empty";
        }
        else{
            message = "Succrssfully retrieved all books";
        }
        return res.send({ error: false, data: results, message: message});
    })
})

app.listen(5001, () => {
    console.log('Node App run on port 5001');
})

module.exports = app;
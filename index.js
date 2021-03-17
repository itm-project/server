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

//add a new user
app.post('/user', (req, res) => {
    let name = req.body.name;
    let lastname = req.body.lastname;
    let phone = req.body.phone;
    let role = req.body.role;
    let address = req.body.address;
    let username = req.body.username;
    let password = req.body.password;

    //validation
    if (!name || !lastname || !phone || !role || !address || !username || !password){
        return res.status(400).send({ error: true, message: "Please provide information."});
    }
    else{
        dbCon.query('INSERT INTO user (name, lastname, phone, role, address, username, password) VALUES(?,?,?,?,?,?,?)',[name, lastname, phone, role, address, username, password],(error , results, fields) => {
            if(error) throw error;
            return res.send({error: false, data: results, message: "user Successfully added"})
        })
    }
})

//retrieve by username
app.get('/user/:username', (req, res) => {
    let username = req.params.username;

    if(!username){
        return res.status(400).send({error: true, message: "Please provide username"})
    }
    else{
        dbCon.query("SELECT * FROM user WHERE username = ?", username, (error, results, fields) => {
            if(error) throw error;

            let message = "";
            if(results === undefined || results.length == 0) {
                message = "username not found";
            }
            else{
                message = "Successfully retrieved user data";
            }
            return res.send({error: false, data: results[0], message: message})
        })
    }
})

//update user by username
app.put('/user', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if(!username || !password){
        return res.status(400).send({error: true, message: "Please provide username and password"})
    }
    else
    {
        dbCon.query('UPDATE user SET password = ? WHERE username = ?', [password,username], (error, results, fields) => {
            if(error) throw error;

            let message = "";
            if(results.changRows === 0) {
                message = "user not found or data same";
            }
            else
            {
                message = "user successfully updated";
            }

            return res.send({ error: false, data: results, message: message})
        })
    }
})

//DELETE user by username
app.delete('/user', (req, res) => {
    let username = req.body.username;

    
    if(!username){
        return res.status(400).send({error: true, message: "Please provide username"})
    }
    else
    {
        dbCon.query('DELETE FROM user WHERE username = ?', username, (error, results, fields) => {
            if(error) throw error;

            let message = "";
            if(results.affectedRows === 0) {
                message = "user not found";
            }
            else
            {
                message = "user successfully deleted";
            }

            return res.send({ error: false, data: results, message: message})
        })
    }

})

//register

app.post('/user/register', (req, res) => {
    let name = req.body.name;
    let lastname = req.body.lastname;
    let phone = req.body.phone;
    //let role = req.body.role;
    let address = req.body.address;
    let username = req.body.username;
    let password = req.body.password;

    if (!name || !lastname || !phone || !address || !username || !password){
        return res.status(400).send({ error: true, message: "Please provide information."});
    }
    else{
        dbCon.query('INSERT INTO user (name, lastname, phone, role, address, username, password) VALUES(?,?,?,?,?,?,?)',[name, lastname, phone, 0, address, username, password],(error , results, fields) => {
            if(error) throw error;
            return res.send({error: false, data: results, message: "user Successfully register"})
        })
    }

})


app.listen(5001, () => {
    console.log('Node App run on port 5001');
})

module.exports = app;